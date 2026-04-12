import type { Pizzeria } from '@/types/pizzeria';
import type { CityConfig } from '@/types/city';

// --- Composant serveur pour rendre le JSON-LD ---

export function JsonLdScript({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// --- Mapping jours FR -> EN ---

const DAYS_FR_TO_EN: Record<string, string> = {
  lundi: 'Monday',
  mardi: 'Tuesday',
  mercredi: 'Wednesday',
  jeudi: 'Thursday',
  vendredi: 'Friday',
  samedi: 'Saturday',
  dimanche: 'Sunday',
};

// --- Conversion horaires d'ouverture ---

export function parseOpeningHoursToSchema(openingHours?: string): Record<string, unknown>[] | undefined {
  if (!openingHours) return undefined;

  try {
    const parsed = JSON.parse(openingHours) as Record<string, string>;
    const specs: Record<string, unknown>[] = [];

    for (const [dayFr, timeStr] of Object.entries(parsed)) {
      const dayEn = DAYS_FR_TO_EN[dayFr.toLowerCase()];
      if (!dayEn) continue;

      const lower = timeStr.toLowerCase().trim();
      if (lower === 'fermé' || lower === 'ferme') continue;

      if (lower.includes('24h')) {
        specs.push({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: dayEn,
          opens: '00:00',
          closes: '23:59',
        });
        continue;
      }

      const slots = timeStr.split(',');
      for (const slot of slots) {
        const parts = slot.trim().split('-');
        if (parts.length === 2) {
          specs.push({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: dayEn,
            opens: parts[0].trim(),
            closes: parts[1].trim(),
          });
        }
      }
    }

    return specs.length > 0 ? specs : undefined;
  } catch {
    return undefined;
  }
}

// --- Générateurs de schémas ---

export function generateWebSiteSchema(city: CityConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: city.displayName,
    url: city.siteUrl,
    description: city.metaDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${city.siteUrl}/?sector={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationSchema(city: CityConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: city.displayName,
    url: city.siteUrl,
    ...(city.logoUrl ? { logo: `${city.siteUrl}${city.logoUrl}` } : {}),
    sameAs: [],
  };
}

export function generateItemListSchema(pizzerias: Pizzeria[], listName: string, city: CityConfig) {
  const items = pizzerias.slice(0, 30);
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => {
      const item: Record<string, unknown> = {
        '@type': 'Restaurant',
        name: p.name,
        servesCuisine: 'Pizza',
        address: {
          '@type': 'PostalAddress',
          streetAddress: p.address,
          addressLocality: city.name,
          addressRegion: city.addressRegion,
          addressCountry: 'FR',
        },
      };

      if (p.image) item.image = p.image;
      if (p.phone) item.telephone = p.phone;
      if (p.priceRange) item.priceRange = p.priceRange;

      if (p.rating && p.reviews) {
        item.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: p.rating,
          reviewCount: p.reviews,
          bestRating: 5,
          worstRating: 1,
        };
      }

      if (p.latitude && p.longitude) {
        item.geo = {
          '@type': 'GeoCoordinates',
          latitude: p.latitude,
          longitude: p.longitude,
        };
      }

      return {
        '@type': 'ListItem',
        position: i + 1,
        item,
      };
    }),
  };
}

export function generateRestaurantSchema(pizzeria: Pizzeria, url: string, city: CityConfig) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: pizzeria.name,
    url,
    servesCuisine: 'Pizza',
    address: {
      '@type': 'PostalAddress',
      streetAddress: pizzeria.address,
      addressLocality: city.name,
      addressRegion: city.addressRegion,
      addressCountry: 'FR',
    },
  };

  if (pizzeria.image) schema.image = pizzeria.image;
  if (pizzeria.phone) schema.telephone = pizzeria.phone;
  if (pizzeria.priceRange) schema.priceRange = pizzeria.priceRange;

  if (pizzeria.latitude && pizzeria.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: pizzeria.latitude,
      longitude: pizzeria.longitude,
    };
  }

  if (pizzeria.rating && pizzeria.reviews) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: pizzeria.rating,
      reviewCount: pizzeria.reviews,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const hours = parseOpeningHoursToSchema(pizzeria.openingHours);
  if (hours) schema.openingHoursSpecification = hours;

  return schema;
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
