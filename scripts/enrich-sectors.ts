#!/usr/bin/env tsx
/**
 * Enrichit les secteurs existants d'une ville en cherchant les pizzerias
 * manquantes dans chaque commune/secteur publié.
 *
 * Usage :
 *   npx tsx --env-file=.env.local scripts/enrich-sectors.ts --config scripts/caen.json
 *
 * Options :
 *   --config <path>   Chemin vers le fichier JSON de config ville
 *   --skip-images     Ne pas télécharger/uploader les images
 *   --dry-run         Affiche ce qui serait fait sans écrire en base
 */

import * as fs from 'fs';
import * as path from 'path';
import { createAdminClient } from './lib/supabase-admin';
import { searchPizzerias, priceLevelToRange } from './lib/google-places';
import { parseGoogleOpeningHours } from './lib/opening-hours-parser';
import { uploadPizzeriaImage } from './lib/image-uploader';
import { log } from './lib/logger';
import type { CitySetupConfig } from './lib/types';

// ─── Helpers ─────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractPostalCode(address: string): string | null {
  const match = address.match(/\b(\d{5})\b/);
  return match ? match[1] : null;
}

function haversineDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Types ───────────────────────────────────────────────────

interface SectorRow {
  id: string;
  name: string;
  slug: string;
  postal_code: string | null;
  center_lat: number;
  center_lng: number;
  radius: number;
  is_published: boolean;
}

interface EnrichStats {
  sectorsProcessed: number;
  sectorsSkipped: number;
  pizzeriasImported: number;
  pizzeriasSkipped: number;
  imageErrors: number;
}

// ─── Parse CLI args ──────────────────────────────────────────

function parseArgs(): { configPath: string; skipImages: boolean; dryRun: boolean } {
  const args = process.argv.slice(2);
  let configPath = '';
  let skipImages = false;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) {
      configPath = args[i + 1];
      i++;
    }
    if (args[i] === '--skip-images') skipImages = true;
    if (args[i] === '--dry-run') dryRun = true;
  }

  if (!configPath) {
    console.error('Usage: npx tsx --env-file=.env.local scripts/enrich-sectors.ts --config <path.json>');
    console.error('');
    console.error('Options:');
    console.error('  --config <path>   Chemin vers le fichier JSON de config ville');
    console.error('  --skip-images     Ne pas télécharger/uploader les images');
    console.error('  --dry-run         Affiche ce qui serait fait sans écrire en base');
    process.exit(1);
  }

  return { configPath, skipImages, dryRun };
}

// ─── Enrichissement d'un secteur ─────────────────────────────

async function enrichSector(
  sector: SectorRow,
  cityId: string,
  citySlug: string,
  cityName: string,
  existingNames: Set<string>,
  skipImages: boolean,
  dryRun: boolean,
): Promise<{ imported: number; skipped: number; imageErrors: number }> {
  log.step(`Recherche "pizzeria à ${sector.name}"...`);

  const results = await searchPizzerias(
    `pizzeria à ${sector.name}`,
    sector.center_lat,
    sector.center_lng,
    5000,
  );

  log.info(`${results.length} résultats trouvés pour ${sector.name}`);

  if (results.length === 0) {
    return { imported: 0, skipped: 0, imageErrors: 0 };
  }

  const supabase = createAdminClient();
  let imported = 0;
  let skipped = 0;
  let imageErrors = 0;
  const batchInserts: any[] = [];

  for (let i = 0; i < results.length; i++) {
    const place = results[i];
    const name = place.displayName?.text || 'Sans nom';

    log.progress(i + 1, results.length, name.substring(0, 35));

    // Skip doublons (contre la BDD)
    if (existingNames.has(name.toLowerCase().trim())) {
      skipped++;
      continue;
    }

    // Données de base
    const lat = place.location?.latitude;
    const lng = place.location?.longitude;
    const address = place.formattedAddress || '';
    const phone = place.nationalPhoneNumber || place.internationalPhoneNumber || '';
    const rating = place.rating || 0;
    const reviewsCount = place.userRatingCount || 0;
    const googleMapsLink = place.googleMapsUri || '';
    const priceRange = priceLevelToRange(place.priceLevel);

    // Parser les horaires
    const openingHours = parseGoogleOpeningHours(
      place.regularOpeningHours?.periods,
    );

    // Image
    let imageUrl: string | null = null;
    if (!skipImages && place.photos && place.photos.length > 0) {
      const photoName = place.photos[0].name;
      imageUrl = await uploadPizzeriaImage(photoName, name, citySlug);
      if (!imageUrl) imageErrors++;

      await new Promise((r) => setTimeout(r, 800));
    }

    // Services info
    const serviceTypes: string[] = [];
    if (place.dineIn !== false) serviceTypes.push('sur-place');
    if (place.takeout !== false) serviceTypes.push('emporter');
    if (place.delivery !== false) serviceTypes.push('livraison');
    if (serviceTypes.length === 0) serviceTypes.push('sur-place', 'emporter', 'livraison');

    const servicesInfo = {
      types: serviceTypes,
      specialties: ['Pizza'],
      services: [] as string[],
      priceRange,
    };

    const row = {
      city_id: cityId,
      name,
      address,
      phone,
      rating,
      reviews_count: reviewsCount,
      google_maps_link: googleMapsLink,
      image_url: imageUrl,
      latitude: lat || null,
      longitude: lng || null,
      opening_hours: openingHours,
      services_info: servicesInfo,
      priority_level: 'normal',
      geocoding_status: lat && lng ? 'success' : 'pending',
      geocoded_at: lat && lng ? new Date().toISOString() : null,
      halal: false,
      description: `Pizzeria ${name} à ${cityName}. ${reviewsCount > 0 ? `Note : ${rating}/5 (${reviewsCount} avis).` : ''}`,
    };

    batchInserts.push(row);

    // Tracker le nom pour éviter les doublons dans les prochains secteurs
    existingNames.add(name.toLowerCase().trim());
  }

  log.progressDone();

  // Insert par batch
  if (batchInserts.length > 0 && !dryRun) {
    log.info(`Insertion de ${batchInserts.length} pizzerias...`);

    for (let i = 0; i < batchInserts.length; i += 20) {
      const batch = batchInserts.slice(i, i + 20);
      const { error } = await supabase.from('pizzerias').insert(batch);
      if (error) {
        log.error(`Erreur batch ${Math.floor(i / 20) + 1}: ${error.message}`);
      }
    }

    imported = batchInserts.length;
    log.success(`${batchInserts.length} pizzerias insérées pour ${sector.name}`);
  } else if (dryRun) {
    log.info(`[DRY RUN] ${batchInserts.length} pizzerias seraient insérées pour ${sector.name}`);
    imported = batchInserts.length;
  }

  return { imported, skipped, imageErrors };
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  const { configPath, skipImages, dryRun } = parseArgs();

  // Résoudre le chemin
  const fullPath = path.resolve(configPath);
  if (!fs.existsSync(fullPath)) {
    log.error(`Fichier non trouvé : ${fullPath}`);
    process.exit(1);
  }

  // Lire la config
  const configRaw = fs.readFileSync(fullPath, 'utf-8');
  const config: CitySetupConfig = JSON.parse(configRaw);

  log.banner(`Enrichissement des secteurs : ${config.name}`);
  if (dryRun) log.warn('Mode DRY RUN — aucune écriture en base');
  if (skipImages) log.warn('Mode SKIP IMAGES — pas de téléchargement de photos');

  log.divider();

  // Vérifier les variables d'environnement
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_MAPS_API_KEY',
  ];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      log.error(`Variable d'environnement manquante : ${envVar}`);
      process.exit(1);
    }
  }
  log.success('Variables d\'environnement OK');

  const supabase = createAdminClient();

  // ── 1. Récupérer la ville ──────────────────────────────────
  log.step(`Recherche de la ville "${config.slug}"...`);

  const { data: city, error: cityError } = await supabase
    .from('cities')
    .select('id, name')
    .eq('slug', config.slug)
    .single();

  if (cityError || !city) {
    log.error(`Ville "${config.slug}" non trouvée en base. Exécutez d'abord setup-city.ts.`);
    process.exit(1);
  }

  const cityId = city.id;
  log.success(`Ville trouvée : ${city.name} (id: ${cityId})`);

  // ── 2. Récupérer les secteurs publiés ──────────────────────
  log.step('Récupération des secteurs publiés...');

  const { data: sectors, error: sectorsError } = await supabase
    .from('geographic_sectors')
    .select('id, name, slug, postal_code, center_lat, center_lng, radius, is_published')
    .eq('city_id', cityId)
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (sectorsError) {
    log.error(`Erreur récupération secteurs: ${sectorsError.message}`);
    process.exit(1);
  }

  const publishedSectors = (sectors || []) as SectorRow[];
  log.info(`${publishedSectors.length} secteurs publiés trouvés`);

  if (publishedSectors.length === 0) {
    log.warn('Aucun secteur publié à enrichir.');
    process.exit(0);
  }

  // ── 3. Récupérer les pizzerias existantes (pour dédup) ─────
  log.step('Récupération des pizzerias existantes...');

  const { data: existingPizzerias } = await supabase
    .from('pizzerias')
    .select('name, latitude, longitude')
    .eq('city_id', cityId);

  const existingNames = new Set(
    (existingPizzerias || []).map((p) => (p.name as string).toLowerCase().trim()),
  );

  log.info(`${existingNames.size} pizzerias existantes en base`);

  // ── 4. Enrichir chaque secteur ─────────────────────────────
  log.divider();

  const stats: EnrichStats = {
    sectorsProcessed: 0,
    sectorsSkipped: 0,
    pizzeriasImported: 0,
    pizzeriasSkipped: 0,
    imageErrors: 0,
  };

  for (const sector of publishedSectors) {
    log.divider();

    // Compter les pizzerias locales (par proximité géographique)
    const localCount = (existingPizzerias || []).filter(p => {
      if (!p.latitude || !p.longitude) return false;
      const dist = haversineDistance(
        { lat: p.latitude as number, lng: p.longitude as number },
        { lat: sector.center_lat, lng: sector.center_lng },
      );
      return dist <= sector.radius;
    }).length;

    if (localCount >= 1) {
      log.skip(`${sector.name} — ${localCount} pizzeria(s) dans un rayon de ${sector.radius}km → skip`);
      stats.sectorsSkipped++;
      continue;
    }

    log.info(`${sector.name} — 0 pizzeria locale → recherche Google Places`);
    stats.sectorsProcessed++;

    const result = await enrichSector(
      sector,
      cityId,
      config.slug,
      config.name,
      existingNames,
      skipImages,
      dryRun,
    );

    stats.pizzeriasImported += result.imported;
    stats.pizzeriasSkipped += result.skipped;
    stats.imageErrors += result.imageErrors;

    // Pause entre les secteurs
    await new Promise((r) => setTimeout(r, 1500));
  }

  // ── 5. Résumé ──────────────────────────────────────────────
  log.divider();
  log.banner(`Enrichissement terminé : ${config.name}`);

  log.success(`${stats.sectorsProcessed} secteurs enrichis`);
  if (stats.sectorsSkipped > 0) {
    log.skip(`${stats.sectorsSkipped} secteurs déjà pourvus (skip)`);
  }
  log.success(`${stats.pizzeriasImported} pizzerias importées`);
  if (stats.pizzeriasSkipped > 0) {
    log.skip(`${stats.pizzeriasSkipped} pizzerias ignorées (doublons)`);
  }
  if (stats.imageErrors > 0) {
    log.warn(`${stats.imageErrors} erreurs de téléchargement d'images`);
  }

  console.log('');
}

main().catch((err) => {
  log.error(err.message);
  console.error(err);
  process.exit(1);
});
