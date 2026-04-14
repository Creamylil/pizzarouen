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
 * Dérive le code département depuis le premier code postal
 * Ex: "76000" → "76", "14000" → "14", "35000" → "35"
 */
function getDepartmentCode(mainPostalCodes: string[]): string {
  if (mainPostalCodes.length === 0) {
    throw new Error('mainPostalCodes est vide — impossible de dériver le département');
  }
  return mainPostalCodes[0].substring(0, 2);
}

interface NearbyCommune {
  name: string;
  population: number;
  centerLat: number;
  centerLng: number;
  postalCodes: string[];
  distanceKm: number;
}

/**
 * Récupère les communes proches via l'API geo.api.gouv.fr
 * Filtre par distance, population, et exclut la ville principale
 */
async function fetchNearbyCommunes(
  departmentCode: string,
  cityCenter: { lat: number; lng: number },
  mainPostalCodes: string[],
  maxDistanceKm = 15,
  minPopulation = 5000,
  maxResults = 10,
): Promise<NearbyCommune[]> {
  log.step(`Recherche des communes proches (dept ${departmentCode}, rayon ${maxDistanceKm}km, pop ≥ ${minPopulation.toLocaleString()})...`);

  const url = `https://geo.api.gouv.fr/departements/${departmentCode}/communes?fields=nom,code,population,centre,codesPostaux&format=json`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`API geo.gouv.fr erreur: ${res.status} ${res.statusText}`);
  }

  const allCommunes = await res.json() as {
    nom: string;
    code: string;
    population?: number;
    centre?: { type: string; coordinates: [number, number] };
    codesPostaux?: string[];
  }[];

  log.detail(`${allCommunes.length} communes dans le département ${departmentCode}`);

  const mainPostalSet = new Set(mainPostalCodes);
  const candidates: NearbyCommune[] = [];

  for (const commune of allCommunes) {
    // Skip sans données géo ou population
    if (!commune.centre?.coordinates || !commune.population || !commune.codesPostaux?.length) {
      continue;
    }

    // Skip la ville principale (tout code postal en commun avec mainPostalCodes)
    if (commune.codesPostaux.some(pc => mainPostalSet.has(pc))) {
      continue;
    }

    // Filtre population
    if (commune.population < minPopulation) {
      continue;
    }

    // API retourne [lng, lat] (GeoJSON)
    const [lng, lat] = commune.centre.coordinates;
    const distance = haversineDistance(cityCenter, { lat, lng });

    // Filtre distance
    if (distance > maxDistanceKm) {
      continue;
    }

    candidates.push({
      name: commune.nom,
      population: commune.population,
      centerLat: lat,
      centerLng: lng,
      postalCodes: commune.codesPostaux,
      distanceKm: distance,
    });
  }

  // Tri par population décroissante, puis distance
  candidates.sort((a, b) => {
    const popDiff = b.population - a.population;
    return popDiff !== 0 ? popDiff : a.distanceKm - b.distanceKm;
  });

  const top = candidates.slice(0, maxResults);

  log.success(`${top.length} communes retenues :`);
  for (const c of top) {
    log.detail(`  ${c.name} — ${c.population.toLocaleString()} hab, ${c.distanceKm.toFixed(1)}km, CP ${c.postalCodes.join(', ')}`);
  }

  return top;
}

/**
 * Résout un code postal en nom de commune via l'API geo.api.gouv.fr
 */
async function resolvePostalCodeToCommune(postalCode: string): Promise<string | null> {
  try {
    const res = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=nom&format=json`);
    if (!res.ok) return null;
    const communes = await res.json() as { nom: string }[];
    return communes.length > 0 ? communes[0].nom : null;
  } catch {
    return null;
  }
}

async function createSectors(
  config: CitySetupConfig,
  cityId: string,
  pizzeriasData: { postalCode: string; lat: number; lng: number; name: string }[],
  dryRun: boolean,
): Promise<number> {
  log.step('Création des secteurs géographiques (découverte proactive)...');

  const supabase = createAdminClient();

  // Vérifier secteurs existants
  const { data: existingSectors } = await supabase
    .from('geographic_sectors')
    .select('postal_code, slug')
    .eq('city_id', cityId);

  const existingPostalCodes = new Set(
    (existingSectors || []).flatMap(s => s.postal_code ? [s.postal_code] : []),
  );
  const existingSlugs = new Set(
    (existingSectors || []).map(s => s.slug),
  );

  // ── 1. Découvrir les communes proches via API gouv ────────────
  const departmentCode = getDepartmentCode(config.mainPostalCodes);
  const cityCenter = { lat: config.centerLat, lng: config.centerLng };
  const nearbyCommunes = await fetchNearbyCommunes(departmentCode, cityCenter, config.mainPostalCodes);

  // Compter les pizzerias par code postal
  const pizzeriaCountByPC = new Map<string, number>();
  for (const p of pizzeriasData) {
    pizzeriaCountByPC.set(p.postalCode, (pizzeriaCountByPC.get(p.postalCode) || 0) + 1);
  }

  const sectorInserts: any[] = [];
  let displayOrder = 1;

  // ── 2. Secteurs ville principale (is_published = false) ───────
  log.divider();
  log.info('Secteurs ville principale (non publiés) :');

  for (const postalCode of config.mainPostalCodes) {
    if (existingPostalCodes.has(postalCode)) {
      log.skip(`${postalCode} ${config.name} existe déjà`);
      continue;
    }

    const slug = slugify(config.name);
    const finalSlug = existingSlugs.has(slug) ? `${slug}-${postalCode}` : slug;
    existingSlugs.add(finalSlug);

    const count = pizzeriaCountByPC.get(postalCode) || 0;

    sectorInserts.push({
      city_id: cityId,
      name: config.name,
      slug: finalSlug,
      display_name: config.name,
      postal_code: postalCode,
      center_lat: config.centerLat,
      center_lng: config.centerLng,
      radius: 5.0,
      display_order: displayOrder++,
      is_published: false,
    });

    log.detail(`  ${postalCode} ${config.name} → ${count} pizzerias (homepage)`);
  }

  // ── 3. Secteurs communes proches (is_published = true) ────────
  log.divider();
  log.info('Secteurs communes proches (publiés) :');

  // Tracker tous les codes postaux couverts
  const coveredPostalCodes = new Set(config.mainPostalCodes);

  for (const commune of nearbyCommunes) {
    const primaryPC = commune.postalCodes[0];

    // Ajouter tous les CP de cette commune comme couverts
    for (const pc of commune.postalCodes) coveredPostalCodes.add(pc);

    if (existingPostalCodes.has(primaryPC)) {
      log.skip(`${primaryPC} ${commune.name} existe déjà`);
      continue;
    }

    const slug = slugify(commune.name);
    const finalSlug = existingSlugs.has(slug) ? `${slug}-${primaryPC}` : slug;
    existingSlugs.add(finalSlug);

    // Compter les pizzerias sur tous les CP de cette commune
    const count = commune.postalCodes.reduce(
      (sum, pc) => sum + (pizzeriaCountByPC.get(pc) || 0), 0,
    );

    sectorInserts.push({
      city_id: cityId,
      name: commune.name,
      slug: finalSlug,
      display_name: commune.name,
      postal_code: primaryPC,
      center_lat: parseFloat(commune.centerLat.toFixed(6)),
      center_lng: parseFloat(commune.centerLng.toFixed(6)),
      radius: 2.0,
      display_order: displayOrder++,
      is_published: true,
    });

    log.detail(`  ${primaryPC} ${commune.name} → ${count} pizzerias, ${commune.population.toLocaleString()} hab, ${commune.distanceKm.toFixed(1)}km`);
  }

  // ── 4. Fallback : codes postaux de pizzerias non couverts ─────
  const uncoveredPCs = [...pizzeriaCountByPC.keys()].filter(
    pc => !coveredPostalCodes.has(pc) && !existingPostalCodes.has(pc),
  );

  if (uncoveredPCs.length > 0) {
    log.divider();
    log.info(`Secteurs fallback (${uncoveredPCs.length} codes postaux non couverts) :`);

    for (const postalCode of uncoveredPCs) {
      const communeName = await resolvePostalCodeToCommune(postalCode);
      const name = communeName || postalCode;

      const slug = slugify(name);
      const finalSlug = existingSlugs.has(slug) ? `${slug}-${postalCode}` : slug;
      existingSlugs.add(finalSlug);

      // Centroïde depuis les pizzerias
      const pizzerias = pizzeriasData.filter(p => p.postalCode === postalCode);
      const centerLat = pizzerias.reduce((s, p) => s + p.lat, 0) / pizzerias.length;
      const centerLng = pizzerias.reduce((s, p) => s + p.lng, 0) / pizzerias.length;
      const center = { lat: centerLat, lng: centerLng };
      const maxDist = pizzerias.reduce(
        (max, p) => Math.max(max, haversineDistance(center, { lat: p.lat, lng: p.lng })), 0,
      );
      const radius = Math.max(maxDist * 1.2, 2);

      sectorInserts.push({
        city_id: cityId,
        name,
        slug: finalSlug,
        display_name: name,
        postal_code: postalCode,
        center_lat: parseFloat(centerLat.toFixed(6)),
        center_lng: parseFloat(centerLng.toFixed(6)),
        radius: parseFloat(radius.toFixed(2)),
        display_order: displayOrder++,
        is_published: true,
      });

      log.detail(`  ${postalCode} ${name} → ${pizzerias.length} pizzerias (fallback)`);
    }
  }

  // ── 5. Insérer en base ────────────────────────────────────────
  if (sectorInserts.length > 0 && !dryRun) {
    const { error } = await supabase.from('geographic_sectors').insert(sectorInserts);
    if (error) {
      log.error(`Erreur insertion secteurs: ${error.message}`);
      return 0;
    }
    log.success(`${sectorInserts.length} secteurs créés`);
  } else if (dryRun) {
    log.info(`[DRY RUN] ${sectorInserts.length} secteurs seraient créés`);
  }

  // Toujours mettre à jour default_sector_slug (même si aucun nouveau secteur)
  // Chercher d'abord dans les nouveaux inserts, sinon dans les existants
  if (!dryRun) {
    const mainSectorNew = sectorInserts.find(s => config.mainPostalCodes.includes(s.postal_code));
    let defaultSlug = mainSectorNew?.slug;

    if (!defaultSlug) {
      // Le secteur principal existait déjà → le chercher en base
      const existingMain = (existingSectors || []).find(s =>
        config.mainPostalCodes.includes(s.postal_code || ''),
      );
      defaultSlug = existingMain?.slug;
    }

    if (defaultSlug) {
      await supabase
        .from('cities')
        .update({ default_sector_slug: defaultSlug })
        .eq('id', cityId);
      log.success(`default_sector_slug → ${defaultSlug}`);
    }
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
