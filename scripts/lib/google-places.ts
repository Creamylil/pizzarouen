/**
 * Wrapper API Google Maps Places (New)
 * Utilise Text Search + Place Details
 */

import type { GooglePlaceResult } from './types';
import { log } from './logger';

const API_KEY = () => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY manquant dans .env.local');
  return key;
};

const BASE_URL = 'https://places.googleapis.com/v1/places';

// Champs demandés à l'API
// Tier Enterprise+Atmosphere déjà payé (dineIn/takeout/delivery) → tous ces champs sont inclus
const SEARCH_FIELDS = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.shortFormattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.regularOpeningHours',
  'places.photos',
  'places.googleMapsUri',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.editorialSummary',
  'places.businessStatus',
  'places.primaryType',
  'places.types',
  // Services
  'places.dineIn',
  'places.takeout',
  'places.delivery',
  'places.curbsidePickup',
  // Cuisine
  'places.servesVegetarianFood',
  'places.servesBeer',
  'places.servesWine',
  'places.servesDessert',
  'places.servesLunch',
  'places.servesDinner',
  'places.servesBreakfast',
  // Ambiance
  'places.outdoorSeating',
  'places.liveMusic',
  'places.reservable',
  'places.goodForChildren',
  'places.menuForChildren',
  'places.goodForGroups',
  'places.allowsDogs',
  'places.restroom',
  // Options
  'places.accessibilityOptions',
  'places.parkingOptions',
  'places.paymentOptions',
  'nextPageToken',
].join(',');

/**
 * Text Search : cherche toutes les pizzerias autour d'un point
 * Retourne jusqu'à 60 résultats (3 pages de 20)
 */
export async function searchPizzerias(
  query: string,
  lat: number,
  lng: number,
  radiusMeters: number = 15000,
): Promise<GooglePlaceResult[]> {
  const allResults: GooglePlaceResult[] = [];
  let pageToken: string | undefined;
  let page = 1;

  do {
    log.detail(`Recherche page ${page}...`);

    const body: Record<string, unknown> = {
      textQuery: query,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radiusMeters,
        },
      },
      languageCode: 'fr',
      maxResultCount: 20,
    };

    if (pageToken) {
      body.pageToken = pageToken;
    }

    const res = await fetch(`${BASE_URL}:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY(),
        'X-Goog-FieldMask': SEARCH_FIELDS,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Places API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const places = (data.places || []) as GooglePlaceResult[];
    allResults.push(...places);

    log.detail(`  → ${places.length} résultats (total: ${allResults.length})`);

    pageToken = data.nextPageToken;
    page++;

    // Pause entre les pages (requis par Google)
    if (pageToken) {
      await sleep(2000);
    }
  } while (pageToken && page <= 3);

  return allResults;
}

/**
 * Construit l'URL de téléchargement d'une photo Google Places
 */
export function getPhotoUrl(photoName: string, maxWidthPx: number = 800): string {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${API_KEY()}`;
}

/**
 * Télécharge le contenu binaire d'une photo Google Places (avec retry)
 */
export async function downloadPhoto(photoName: string, maxWidthPx: number = 800): Promise<Buffer> {
  const url = getPhotoUrl(photoName, maxWidthPx);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Erreur téléchargement photo (${res.status}): ${photoName}`);
      }

      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      if (attempt === 3) throw err;
      await sleep(1000 * attempt);
    }
  }
  throw new Error('Unreachable');
}

/**
 * Convertit le priceLevel Google en symbole €
 */
export function priceLevelToRange(priceLevel?: string): string {
  switch (priceLevel) {
    case 'PRICE_LEVEL_FREE': return '€';
    case 'PRICE_LEVEL_INEXPENSIVE': return '€';
    case 'PRICE_LEVEL_MODERATE': return '€€';
    case 'PRICE_LEVEL_EXPENSIVE': return '€€€';
    case 'PRICE_LEVEL_VERY_EXPENSIVE': return '€€€€';
    default: return '€';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
