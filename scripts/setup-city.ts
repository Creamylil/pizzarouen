#!/usr/bin/env tsx
/**
 * Script de setup automatisé pour une nouvelle ville
 *
 * Usage :
 *   npx tsx --env-file=.env.local scripts/setup-city.ts --config scripts/caen.json
 *
 * Ce script :
 *   1. Crée la ligne dans la table `cities`
 *   2. Scrape les pizzerias via Google Maps Places API
 *   3. Télécharge les photos → Supabase Storage
 *   4. Crée les secteurs géographiques automatiquement
 */

import * as fs from 'fs';
import * as path from 'path';
import { createAdminClient } from './lib/supabase-admin';
import { searchPizzerias, priceLevelToRange } from './lib/google-places';
import { parseGoogleOpeningHours } from './lib/opening-hours-parser';
import { uploadPizzeriaImage } from './lib/image-uploader';
import { generateSeoFields } from './lib/seo-templates';
import { log } from './lib/logger';
import { generateAndUploadLogo } from './lib/logo-generator';
import type { CitySetupConfig, GooglePlaceResult, SetupStats } from './lib/types';

// ─── Parse CLI args ───────────────────────────────────────────

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
    console.error('Usage: npx tsx --env-file=.env.local scripts/setup-city.ts --config <path.json>');
    console.error('');
    console.error('Options:');
    console.error('  --config <path>   Chemin vers le fichier JSON de config ville');
    console.error('  --skip-images     Ne pas télécharger/uploader les images');
    console.error('  --dry-run         Affiche ce qui serait fait sans écrire en base');
    process.exit(1);
  }

  return { configPath, skipImages, dryRun };
}

// ─── Étape 1 : Créer la ville ─────────────────────────────────

async function createCity(config: CitySetupConfig, dryRun: boolean): Promise<string> {
  log.step(`Création de la ville "${config.name}"`);

  const supabase = createAdminClient();
  const seo = generateSeoFields(config);

  // Vérifier doublon
  const { data: existing } = await supabase
    .from('cities')
    .select('id, slug')
    .or(`slug.eq.${config.slug},domain.eq.${config.domain}`)
    .maybeSingle();

  if (existing) {
    log.warn(`Ville déjà existante (id: ${existing.id}, slug: ${existing.slug})`);
    log.info('Utilisation de la ville existante pour les pizzerias.');
    return existing.id;
  }

  const cityRow = {
    slug: config.slug,
    name: config.name,
    display_name: config.displayName,
    domain: config.domain,
    site_url: config.siteUrl,
    center_lat: config.centerLat,
    center_lng: config.centerLng,
    default_zoom: config.defaultZoom || 13,
    geo_region: config.geoRegion,
    geo_placename: config.geoPlacename,
    address_region: config.addressRegion,
    default_sector_slug: 'tout',
    main_postal_codes: config.mainPostalCodes,
    meta_title: seo.metaTitle,
    meta_title_template: seo.metaTitleTemplate,
    meta_description: seo.metaDescription,
    meta_keywords: seo.metaKeywords,
    og_site_name: seo.ogSiteName,
    contact_email: config.contactEmail,
    contact_whatsapp: config.contactWhatsapp || seo.contactWhatsapp,
    logo_url: config.logoUrl || null,
    hero_image_url: config.heroImageUrl || null,
    editor_name: config.editorName,
    google_analytics_id: config.googleAnalyticsId || null,
    seo_content: seo.seoContent,
  };

  if (dryRun) {
    log.info('[DRY RUN] Ville non insérée');
    log.detail(JSON.stringify(cityRow, null, 2));
    return 'dry-run-id';
  }

  const { data, error } = await supabase
    .from('cities')
    .insert(cityRow)
    .select('id')
    .single();

  if (error) {
    throw new Error(`Erreur insertion ville: ${error.message}`);
  }

  log.success(`Ville "${config.name}" créée (id: ${data.id})`);
  return data.id;
}

// ─── Étape 2 : Scraper les pizzerias ──────────────────────────

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

async function scrapePizzerias(
  config: CitySetupConfig,
  cityId: string,
  skipImages: boolean,
  dryRun: boolean,
): Promise<{ stats: SetupStats; pizzeriasWithPostalCodes: { postalCode: string; lat: number; lng: number; name: string }[] }> {
  log.step(`Recherche des pizzerias à ${config.name}...`);

  const stats: SetupStats = {
    pizzeriasImported: 0,
    pizzeriasSkipped: 0,
    imageErrors: 0,
    sectorsCreated: 0,
  };

  // Recherche via Google Maps
  const results = await searchPizzerias(
    `pizzeria à ${config.name}`,
    config.centerLat,
    config.centerLng,
    15000,
  );

  log.info(`${results.length} résultats trouvés sur Google Maps`);

  if (results.length === 0) {
    log.warn('Aucune pizzeria trouvée. Vérifiez les coordonnées et le nom de la ville.');
    return { stats, pizzeriasWithPostalCodes: [] };
  }

  const supabase = createAdminClient();

  // Vérifier les noms existants pour éviter les doublons
  const { data: existingPizzerias } = await supabase
    .from('pizzerias')
    .select('name, address')
    .eq('city_id', cityId);

  const existingNames = new Set(
    (existingPizzerias || []).map((p) => p.name.toLowerCase().trim()),
  );

  const pizzeriasWithPostalCodes: { postalCode: string; lat: number; lng: number; name: string }[] = [];
  const batchInserts: any[] = [];

  for (let i = 0; i < results.length; i++) {
    const place = results[i];
    const name = place.displayName?.text || 'Sans nom';

    log.progress(i + 1, results.length, name.substring(0, 35));

    // Skip doublons
    if (existingNames.has(name.toLowerCase().trim())) {
      stats.pizzeriasSkipped++;
      continue;
    }

    // Données de base
    const lat = place.location?.latitude;
    const lng = place.location?.longitude;
    const address = place.formattedAddress || '';
    const postalCode = extractPostalCode(address);
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
      imageUrl = await uploadPizzeriaImage(photoName, name, config.slug);
      if (!imageUrl) stats.imageErrors++;

      // Pause entre chaque image pour éviter les coupures réseau
      await new Promise((r) => setTimeout(r, 800));
    }

    // Services info — types de service depuis Google Maps (dineIn, takeout, delivery)
    const serviceTypes: string[] = [];
    if (place.dineIn !== false) serviceTypes.push('sur-place');
    if (place.takeout !== false) serviceTypes.push('emporter');
    if (place.delivery !== false) serviceTypes.push('livraison');
    // Si Google ne renvoie aucune info (tous undefined), on met les 3 par défaut
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
      description: `Pizzeria ${name} à ${config.name}. ${reviewsCount > 0 ? `Note : ${rating}/5 (${reviewsCount} avis).` : ''}`,
    };

    batchInserts.push(row);

    // Tracker pour les secteurs
    if (postalCode && lat && lng) {
      pizzeriasWithPostalCodes.push({ postalCode, lat, lng, name });
    }

    existingNames.add(name.toLowerCase().trim());
  }

  log.progressDone();

  // Insert par batch
  if (batchInserts.length > 0 && !dryRun) {
    log.info(`Insertion de ${batchInserts.length} pizzerias...`);

    // Insérer par groupes de 20 pour éviter les timeouts
    for (let i = 0; i < batchInserts.length; i += 20) {
      const batch = batchInserts.slice(i, i + 20);
      const { error } = await supabase.from('pizzerias').insert(batch);
      if (error) {
        log.error(`Erreur batch ${Math.floor(i / 20) + 1}: ${error.message}`);
      }
    }

    stats.pizzeriasImported = batchInserts.length;
    log.success(`${batchInserts.length} pizzerias insérées`);
  } else if (dryRun) {
    log.info(`[DRY RUN] ${batchInserts.length} pizzerias seraient insérées`);
    stats.pizzeriasImported = batchInserts.length;
  }

  stats.pizzeriasSkipped = results.length - batchInserts.length;

  return { stats, pizzeriasWithPostalCodes };
}

// ─── Étape 3 : Créer les secteurs géographiques ───────────────

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

/**
 * Résout un code postal en nom de commune via l'API geo.api.gouv.fr
 */
async function resolvePostalCodeToCommune(postalCode: string): Promise<string | null> {
  try {
    const res = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=nom&format=json`);
    if (!res.ok) return null;
    const communes = await res.json() as { nom: string }[];
    // Retourner la première commune (la principale pour ce code postal)
    return communes.length > 0 ? communes[0].nom : null;
  } catch {
    return null;
  }
}

/**
 * Résout tous les codes postaux en noms de communes (batch)
 */
async function resolvePostalCodes(postalCodes: string[], mainPostalCodes: string[], cityName: string): Promise<Map<string, string>> {
  const mapping = new Map<string, string>();

  log.step('Résolution des noms de communes via API gouv.fr...');

  for (const pc of postalCodes) {
    // Les codes postaux principaux de la ville → nom de la ville directement
    if (mainPostalCodes.includes(pc)) {
      mapping.set(pc, cityName);
      log.detail(`${pc} → ${cityName} (ville principale)`);
      continue;
    }

    const communeName = await resolvePostalCodeToCommune(pc);
    if (communeName) {
      mapping.set(pc, communeName);
      log.detail(`${pc} → ${communeName}`);
    } else {
      // Fallback : utiliser le code postal comme nom
      mapping.set(pc, pc);
      log.warn(`${pc} → pas de commune trouvée, utilisation du code postal`);
    }
  }

  return mapping;
}

async function createSectors(
  config: CitySetupConfig,
  cityId: string,
  pizzeriasData: { postalCode: string; lat: number; lng: number; name: string }[],
  dryRun: boolean,
): Promise<number> {
  log.step('Création des secteurs géographiques...');

  if (pizzeriasData.length === 0) {
    log.warn('Aucune pizzeria géolocalisée → pas de secteurs créés');
    return 0;
  }

  // Grouper par code postal
  const byPostalCode = new Map<string, { lat: number; lng: number; name: string }[]>();
  for (const p of pizzeriasData) {
    const existing = byPostalCode.get(p.postalCode) || [];
    existing.push(p);
    byPostalCode.set(p.postalCode, existing);
  }

  const supabase = createAdminClient();

  // Vérifier secteurs existants
  const { data: existingSectors } = await supabase
    .from('geographic_sectors')
    .select('postal_code')
    .eq('city_id', cityId);

  const existingPostalCodes = new Set(
    (existingSectors || []).map((s) => s.postal_code),
  );

  // Résoudre les noms de communes pour les nouveaux codes postaux
  const newPostalCodes = [...byPostalCode.keys()].filter(pc => !existingPostalCodes.has(pc));
  const communeNames = await resolvePostalCodes(newPostalCodes, config.mainPostalCodes, config.name);

  const sectorInserts: any[] = [];
  let displayOrder = 1;

  // Trier par nombre de pizzerias décroissant
  const sorted = [...byPostalCode.entries()].sort((a, b) => b[1].length - a[1].length);

  for (const [postalCode, pizzerias] of sorted) {
    if (existingPostalCodes.has(postalCode)) {
      log.skip(`Secteur ${postalCode} existe déjà`);
      continue;
    }

    // Centroïde
    const centerLat = pizzerias.reduce((s, p) => s + p.lat, 0) / pizzerias.length;
    const centerLng = pizzerias.reduce((s, p) => s + p.lng, 0) / pizzerias.length;
    const center = { lat: centerLat, lng: centerLng };

    // Rayon = distance max × 1.2, minimum 2km
    const maxDist = pizzerias.reduce(
      (max, p) => Math.max(max, haversineDistance(center, { lat: p.lat, lng: p.lng })),
      0,
    );
    const radius = Math.max(maxDist * 1.2, 2);

    // Nom de commune résolu via API gouv.fr
    const sectorName = communeNames.get(postalCode) || postalCode;
    const isMainCity = config.mainPostalCodes.includes(postalCode);

    // Slug : nom de commune slugifié (ex: "herouville-saint-clair")
    const slug = slugify(sectorName);

    // is_published : false pour les secteurs de la ville principale (= homepage)
    const isPublished = !isMainCity;

    sectorInserts.push({
      city_id: cityId,
      name: sectorName,
      slug,
      display_name: sectorName,
      postal_code: postalCode,
      center_lat: parseFloat(centerLat.toFixed(6)),
      center_lng: parseFloat(centerLng.toFixed(6)),
      radius: parseFloat(radius.toFixed(2)),
      display_order: displayOrder++,
      is_published: isPublished,
    });

    log.detail(`${postalCode} ${sectorName} → ${pizzerias.length} pizzerias, rayon ${radius.toFixed(1)}km${!isPublished ? ' (homepage, non publié)' : ''}`);
  }

  if (sectorInserts.length > 0 && !dryRun) {
    const { error } = await supabase.from('geographic_sectors').insert(sectorInserts);
    if (error) {
      log.error(`Erreur insertion secteurs: ${error.message}`);
      return 0;
    }

    // Mettre à jour default_sector_slug avec le secteur principal
    const mainSector = sectorInserts.find(s => config.mainPostalCodes.includes(s.postal_code));
    const defaultSlug = mainSector ? mainSector.slug : sectorInserts[0].slug;
    await supabase
      .from('cities')
      .update({ default_sector_slug: defaultSlug })
      .eq('id', cityId);

    log.success(`${sectorInserts.length} secteurs créés (default: ${defaultSlug})`);
  } else if (dryRun) {
    log.info(`[DRY RUN] ${sectorInserts.length} secteurs seraient créés`);
  }

  return sectorInserts.length;
}

// ─── Main ─────────────────────────────────────────────────────

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

  log.banner(`Setup ville : ${config.name}`);
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

  // Étape 1 : Créer la ville
  const cityId = await createCity(config, dryRun);

  // Étape 1b : Générer le logo via DALL-E
  if (process.env.OPENAI_API_KEY) {
    log.step('Génération du logo via DALL-E 3...');
    const logoResult = await generateAndUploadLogo(config.slug, {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      openaiApiKey: process.env.OPENAI_API_KEY!,
      dryRun,
    });

    if (logoResult && !dryRun) {
      // Mettre à jour la ville avec l'URL du logo
      const supabase = createAdminClient();
      await supabase
        .from('cities')
        .update({ logo_url: logoResult.logoUrl })
        .eq('id', cityId);
      log.success(`Logo associé à la ville "${config.name}"`);
    }
  } else {
    log.warn('OPENAI_API_KEY non définie — génération du logo ignorée');
  }

  // Étape 2 : Scraper et insérer les pizzerias
  const { stats, pizzeriasWithPostalCodes } = await scrapePizzerias(
    config,
    cityId,
    skipImages,
    dryRun,
  );

  // Étape 3 : Créer les secteurs
  stats.sectorsCreated = await createSectors(config, cityId, pizzeriasWithPostalCodes, dryRun);

  // ─── Résumé final ──────────────────────────────────────────
  log.divider();
  log.banner(`Setup terminé : ${config.name}`);

  log.success(`Ville "${config.name}" ${dryRun ? '(dry run)' : `créée (id: ${cityId})`}`);
  log.success(`${stats.pizzeriasImported} pizzerias importées`);
  if (stats.pizzeriasSkipped > 0) {
    log.skip(`${stats.pizzeriasSkipped} pizzerias ignorées (doublons)`);
  }
  if (stats.imageErrors > 0) {
    log.warn(`${stats.imageErrors} erreurs de téléchargement d'images`);
  }
  log.success(`${stats.sectorsCreated} secteurs créés`);

  console.log('');
  log.info('Prochaines étapes :');
  log.detail(`1. Vérifier dans Supabase Dashboard (cities, pizzerias, geographic_sectors)`);
  log.detail(`2. Vercel : nouveau projet → même repo → CITY_SLUG=${config.slug} → domaine ${config.domain}`);
  log.detail(`3. CITY_SLUG=${config.slug} npm run build → vérifier la compilation`);
  console.log('');
}

main().catch((err) => {
  log.error(err.message);
  console.error(err);
  process.exit(1);
});
