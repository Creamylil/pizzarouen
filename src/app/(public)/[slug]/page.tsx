import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchCityConfig } from '@/lib/data/city';
import { fetchPizzerias } from '@/lib/data/pizzerias';
import { fetchGeographicSectors, fetchSectorBySlug } from '@/lib/data/sectors';
import SectorPageClient from '@/components/pages/SectorPageClient';
import SEOContent from '@/components/seo/SEOContent';
import {
  JsonLdScript,
  generateItemListSchema,
  generateBreadcrumbSchema,
} from '@/components/seo/JsonLd';
import { extractPostalCode } from '@/utils/postalCodeUtils';

export const revalidate = 1800;

interface SectorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const sectors = await fetchGeographicSectors();
  return sectors
    .filter(s => s.is_published !== false)
    .map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: SectorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [sector, cityConfig] = await Promise.all([
    fetchSectorBySlug(slug),
    fetchCityConfig(),
  ]);

  if (!sector) return {};

  const displayName = sector.display_name || sector.name;
  const title = sector.meta_title || `Les Pizzerias ouvertes à ${displayName} | Livraison 24h/24`;
  const description = sector.meta_description || `Découvrez les meilleures pizzerias de ${displayName}. Pizza livraison, à emporter et sur place. Horaires d'ouverture, avis clients et commande en ligne.`;
  const canonicalUrl = `${cityConfig.siteUrl}/${sector.slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: sector.og_title || title,
      description: sector.og_description || description,
      url: canonicalUrl,
      images: sector.og_image_url
        ? [{ url: sector.og_image_url }]
        : cityConfig.logoUrl
          ? [{ url: cityConfig.logoUrl }]
          : undefined,
    },
  };
}

export default async function SectorPage({ params }: SectorPageProps) {
  const { slug } = await params;
  const [sector, cityConfig, pizzerias, sectors] = await Promise.all([
    fetchSectorBySlug(slug),
    fetchCityConfig(),
    fetchPizzerias(),
    fetchGeographicSectors(),
  ]);

  if (!sector || sector.is_published === false) notFound();

  const displayName = sector.display_name || sector.name;
  const sectorUrl = `${cityConfig.siteUrl}/${sector.slug}`;

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Accueil', url: cityConfig.siteUrl },
    { name: `Pizzerias à ${cityConfig.name}`, url: cityConfig.siteUrl },
    { name: displayName, url: sectorUrl },
  ];

  // Filter local pizzerias for the ItemList schema (sector-specific)
  const sectorPostalCode = sector.postal_code;
  const localPizzerias = sectorPostalCode
    ? pizzerias.filter(p => extractPostalCode(p.address) === sectorPostalCode)
    : pizzerias;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
      <JsonLdScript data={generateBreadcrumbSchema(breadcrumbItems)} />
      <JsonLdScript data={generateItemListSchema(localPizzerias, `Pizzerias à ${displayName}`, cityConfig)} />

      <SectorPageClient
        pizzerias={pizzerias}
        sector={sector}
        sectors={sectors}
        mainPostalCodes={cityConfig.mainPostalCodes}
        cityName={cityConfig.name}
        heroImageUrl={cityConfig.heroImageUrl}
        centerCoords={[cityConfig.centerLat, cityConfig.centerLng]}
        siteUrl={cityConfig.siteUrl}
      />

      <SEOContent
        seoContent={sector.seo_content ?? null}
        cityName={displayName}
      />
    </div>
  );
}
