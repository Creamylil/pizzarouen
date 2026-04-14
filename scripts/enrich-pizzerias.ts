#!/usr/bin/env tsx
/**
 * Script d'enrichissement des pizzerias existantes
 *
 * Récupère les nouveaux champs Google Places API (editorialSummary, websiteUri,
 * outdoorSeating, paymentOptions, etc.) et met à jour les pizzerias en base.
 *
 * Usage :
 *   npx tsx --env-file=.env.local scripts/enrich-pizzerias.ts
 *   npx tsx --env-file=.env.local scripts/enrich-pizzerias.ts --city rouen
 *   npx tsx --env-file=.env.local scripts/enrich-pizzerias.ts --dry-run
 */

import { createAdminClient } from './lib/supabase-admin';
import { log } from './lib/logger';
import { priceLevelToRange } from './lib/google-places';

// ─── Config ──────────────────────────────────────────────────

const API_KEY = () => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY manquant dans .env.local');
  return key;
};

const BASE_URL = 'https://places.googleapis.com/v1/places';

// Champs enrichis à demander (même tier Enterprise+Atmosphere, pas de surcoût)
const DETAIL_FIELDS = [
  'id',
  'displayName',
  'websiteUri',
  'editorialSummary',
  'businessStatus',
  'rating',
  'userRatingCount',
  'priceLevel',
  'nationalPhoneNumber',
  'internationalPhoneNumber',
  'regularOpeningHours',
  // Services
  'dineIn',
  'takeout',
  'delivery',
  'curbsidePickup',
  // Cuisine
  'servesVegetarianFood',
  'servesBeer',
  'servesWine',
  'servesDessert',
  'servesLunch',
  'servesDinner',
  'servesBreakfast',
  // Ambiance
  'outdoorSeating',
  'liveMusic',
  'reservable',
  'goodForChildren',
  'menuForChildren',
  'goodForGroups',
  'allowsDogs',
  'restroom',
  // Options
  'accessibilityOptions',
  'parkingOptions',
  'paymentOptions',
].join(',');

// ─── Parse CLI args ──────────────────────────────────────────

function parseArgs(): { citySlug: string | null; dryRun: boolean } {
  const args = process.argv.slice(2);
  let citySlug: string | null = null;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--city' && args[i + 1]) {
      citySlug = args[i + 1];
      i++;
    }
    if (args[i] === '--dry-run') dryRun = true;
  }

  return { citySlug, dryRun };
}

// ─── Extraire le Place ID depuis l'URL Google Maps ───────────

function extractPlaceId(googleMapsLink: string): string | null {
  // Format: https://www.google.com/maps/place/.../data=...
  // ou: https://maps.google.com/?cid=...
  // Le plus fiable : chercher le place_id dans l'URL ou utiliser le champ place_id
  // Format Google Places New API : https://www.google.com/maps/place/?q=place_id:ChIJ...

  // Pattern 1: place_id: dans l'URL
  const placeIdMatch = googleMapsLink.match(/place_id[=:]([A-Za-z0-9_-]+)/);
  if (placeIdMatch) return placeIdMatch[1];

  // Pattern 2: /place/ suivi de coordonnées puis data contenant un ID hex
  // Les URLs Google Maps contiennent souvent le Place ID encodé
  // mais ce n'est pas fiable → on va chercher par nom + coordonnées
  return null;
}

// ─── Chercher une pizzeria par nom + coordonnées via Text Search ─

async function findPlaceByNameAndLocation(
  name: string,
  lat: number,
  lng: number,
): Promise<any | null> {
  const body = {
    textQuery: name,
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 500, // 500m autour des coordonnées connues
      },
    },
    languageCode: 'fr',
    maxResultCount: 1,
  };

  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.websiteUri',
    'places.editorialSummary',
    'places.businessStatus',
    'places.rating',
    'places.userRatingCount',
    'places.priceLevel',
    'places.nationalPhoneNumber',
    'places.internationalPhoneNumber',
    'places.regularOpeningHours',
    'places.dineIn',
    'places.takeout',
    'places.delivery',
    'places.curbsidePickup',
    'places.servesVegetarianFood',
    'places.servesBeer',
    'places.servesWine',
    'places.servesDessert',
    'places.servesLunch',
    'places.servesDinner',
    'places.servesBreakfast',
    'places.outdoorSeating',
    'places.liveMusic',
    'places.reservable',
    'places.goodForChildren',
    'places.menuForChildren',
    'places.goodForGroups',
    'places.allowsDogs',
    'places.restroom',
    'places.accessibilityOptions',
    'places.parkingOptions',
    'places.paymentOptions',
  ].join(',');

  const res = await fetch(`${BASE_URL}:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY(),
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    log.error(`API error (${res.status}): ${errText}`);
    return null;
  }

  const data = await res.json();
  const places = data.places || [];
  return places.length > 0 ? places[0] : null;
}

// ─── Construire les données enrichies ────────────────────────

function buildEnrichedData(place: any, existingServicesInfo: any) {
  // Spécialités
  const specialties: string[] = ['Pizza'];
  if (place.servesVegetarianFood) specialties.push('Végétarien');
  if (place.servesDessert) specialties.push('Desserts');
  if (place.servesBeer) specialties.push('Bières');
  if (place.servesWine) specialties.push('Vins');

  // Types de service
  const serviceTypes: string[] = [];
  if (place.dineIn !== false) serviceTypes.push('sur-place');
  if (place.takeout !== false) serviceTypes.push('emporter');
  if (place.delivery !== false) serviceTypes.push('livraison');
  if (serviceTypes.length === 0) serviceTypes.push('sur-place', 'emporter', 'livraison');

  // Équipements / services
  const services: string[] = [];
  if (place.outdoorSeating) services.push('Terrasse');
  if (place.reservable) services.push('Réservation');
  if (place.goodForChildren) services.push('Adapté aux enfants');
  if (place.menuForChildren) services.push('Menu enfant');
  if (place.goodForGroups) services.push('Groupes bienvenus');
  if (place.allowsDogs) services.push('Chiens acceptés');
  if (place.liveMusic) services.push('Musique live');
  if (place.restroom) services.push('Toilettes');
  if (place.curbsidePickup) services.push('Retrait en bordure');
  // Accessibilité
  if (place.accessibilityOptions?.wheelchairAccessibleEntrance) services.push('Accès PMR');
  // Parking
  if (place.parkingOptions?.freeParkingLot || place.parkingOptions?.freeStreetParking || place.parkingOptions?.freeGarageParking) {
    services.push('Parking gratuit');
  } else if (place.parkingOptions?.paidParkingLot || place.parkingOptions?.paidStreetParking || place.parkingOptions?.paidGarageParking) {
    services.push('Parking');
  }
  // Paiement
  if (place.paymentOptions?.acceptsNfc) services.push('Sans contact');
  if (place.paymentOptions?.acceptsCreditCards || place.paymentOptions?.acceptsDebitCards) services.push('CB acceptée');

  const priceRange = place.priceLevel
    ? priceLevelToRange(place.priceLevel)
    : existingServicesInfo?.priceRange || '€';

  const servicesInfo = {
    types: serviceTypes,
    specialties,
    services,
    priceRange,
  };

  const description = place.editorialSummary?.text || '';
  const websiteUrl = place.websiteUri || null;

  return { servicesInfo, description, websiteUrl };
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  const { citySlug, dryRun } = parseArgs();

  log.banner('Enrichissement des pizzerias');
  if (dryRun) log.warn('Mode DRY RUN — aucune écriture en base');
  if (citySlug) log.info(`Ville ciblée : ${citySlug}`);

  const supabase = createAdminClient();

  // 1. Récupérer les pizzerias à enrichir
  let query = supabase
    .from('pizzerias')
    .select('id, name, latitude, longitude, google_maps_link, services_info, description, website_url, city_id');

  if (citySlug) {
    // Trouver l'ID de la ville
    const { data: city } = await supabase
      .from('cities')
      .select('id')
      .eq('slug', citySlug)
      .single();

    if (!city) {
      log.error(`Ville "${citySlug}" non trouvée`);
      process.exit(1);
    }

    query = query.eq('city_id', city.id);
  }

  const { data: pizzerias, error } = await query;

  if (error) {
    log.error(`Erreur lecture pizzerias: ${error.message}`);
    process.exit(1);
  }

  if (!pizzerias || pizzerias.length === 0) {
    log.warn('Aucune pizzeria à enrichir');
    return;
  }

  log.info(`${pizzerias.length} pizzerias à enrichir`);
  log.divider();

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < pizzerias.length; i++) {
    const pizzeria = pizzerias[i];
    const name = pizzeria.name || 'Sans nom';

    log.progress(i + 1, pizzerias.length, name.substring(0, 35));

    // Besoin de coordonnées pour chercher
    if (!pizzeria.latitude || !pizzeria.longitude) {
      skipped++;
      continue;
    }

    try {
      // Chercher la pizzeria sur Google Places
      const place = await findPlaceByNameAndLocation(
        name,
        parseFloat(pizzeria.latitude),
        parseFloat(pizzeria.longitude),
      );

      if (!place) {
        skipped++;
        continue;
      }

      // Construire les données enrichies
      const { servicesInfo, description, websiteUrl } = buildEnrichedData(
        place,
        pizzeria.services_info,
      );

      // Préparer l'update
      const updateData: Record<string, any> = {
        services_info: servicesInfo,
      };

      // Ne mettre à jour la description que si Google en fournit une
      if (description) {
        updateData.description = description;
      }

      // Website
      if (websiteUrl) {
        updateData.website_url = websiteUrl;
      }

      if (!dryRun) {
        const { error: updateError } = await supabase
          .from('pizzerias')
          .update(updateData)
          .eq('id', pizzeria.id);

        if (updateError) {
          log.error(`  Erreur update ${name}: ${updateError.message}`);
          errors++;
          continue;
        }
      }

      updated++;

      // Pause entre les appels API (rate limiting)
      await new Promise((r) => setTimeout(r, 300));
    } catch (err: any) {
      log.error(`  Erreur ${name}: ${err.message}`);
      errors++;
      // Pause plus longue en cas d'erreur
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  log.progressDone();
  log.divider();
  log.banner('Enrichissement terminé');
  log.success(`${updated} pizzerias enrichies`);
  if (skipped > 0) log.skip(`${skipped} pizzerias ignorées (pas de coordonnées ou non trouvées)`);
  if (errors > 0) log.warn(`${errors} erreurs`);
  if (dryRun) log.warn('Mode DRY RUN — rien n\'a été écrit en base');
}

main().catch((err) => {
  log.error(err.message);
  console.error(err);
  process.exit(1);
});
