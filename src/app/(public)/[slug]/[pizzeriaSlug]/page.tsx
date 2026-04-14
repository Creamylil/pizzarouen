import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchCityConfig } from '@/lib/data/city';
import { fetchPizzerias, fetchPizzeriaBySlug } from '@/lib/data/pizzerias';
import { fetchGeographicSectors, fetchSectorBySlug } from '@/lib/data/sectors';
import PizzeriaDetailClient from '@/components/pages/PizzeriaDetailClient';
import {
  JsonLdScript,
  generateRestaurantSchema,
  generateBreadcrumbSchema,
} from '@/components/seo/JsonLd';
import { extractPostalCode } from '@/utils/postalCodeUtils';
import { parseOpeningHours, isOpen } from '@/utils/openingHours';

export const revalidate = 1800;

interface PizzeriaPageProps {
  params: Promise<{ slug: string; pizzeriaSlug: string }>;
}

export async function generateStaticParams() {
  const [pizzerias, sectors, cityConfig] = await Promise.all([
    fetchPizzerias(),
    fetchGeographicSectors(),
    fetchCityConfig(),
  ]);

  const params: { slug: string; pizzeriaSlug: string }[] = [];

  for (const pizzeria of pizzerias) {
    if (!pizzeria.slug) continue;

    const pizzeriaPC = extractPostalCode(pizzeria.address);
    if (!pizzeriaPC) continue;

    const matchingSector = sectors.find(sector => {
      if (!sector.postal_code) return false;
      if (cityConfig.mainPostalCodes.includes(sector.postal_code)) {
        return cityConfig.mainPostalCodes.includes(pizzeriaPC);
      }
      return sector.postal_code === pizzeriaPC;
    });

    if (matchingSector) {
      params.push({
        slug: matchingSector.slug,
        pizzeriaSlug: pizzeria.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PizzeriaPageProps): Promise<Metadata> {
  const { slug, pizzeriaSlug } = await params;
  const [pizzeria, sector, cityConfig] = await Promise.all([
    fetchPizzeriaBySlug(pizzeriaSlug),
    fetchSectorBySlug(slug),
    fetchCityConfig(),
  ]);

  if (!pizzeria || !sector) return {};

  const sectorName = sector.display_name || sector.name;
  const title = `${pizzeria.name} - ${sectorName}`;
  const description = `Découvrez ${pizzeria.name}, pizzeria à ${sectorName}. Note : ${pizzeria.rating}/5 (${pizzeria.reviews} avis). Horaires, carte et coordonnées.`;
  const canonicalUrl = `${cityConfig.siteUrl}/${slug}/${pizzeriaSlug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: pizzeria.image
        ? [{ url: pizzeria.image }]
        : cityConfig.logoUrl
          ? [{ url: cityConfig.logoUrl }]
          : undefined,
    },
  };
}

export default async function PizzeriaPage({ params }: PizzeriaPageProps) {
  const { slug, pizzeriaSlug } = await params;

  const [sector, pizzeria, cityConfig, allPizzerias, sectors] = await Promise.all([
    fetchSectorBySlug(slug),
    fetchPizzeriaBySlug(pizzeriaSlug),
    fetchCityConfig(),
    fetchPizzerias(),
    fetchGeographicSectors(),
  ]);

  if (!sector || !pizzeria) notFound();

  const sectorName = sector.display_name || sector.name;
  const pizzeriaUrl = `${cityConfig.siteUrl}/${slug}/${pizzeriaSlug}`;

  // Breadcrumb
  const breadcrumbItems = [
    { name: 'Accueil', url: cityConfig.siteUrl },
    { name: sectorName, url: `${cityConfig.siteUrl}/${slug}` },
    { name: pizzeria.name, url: pizzeriaUrl },
  ];

  // Top 10 : pizzerias de la ville principale, exclure la pizzeria courante
  const top10Pizzerias = allPizzerias
    .filter(p => {
      if (p.id === pizzeria.id) return false;
      const pc = extractPostalCode(p.address);
      return cityConfig.mainPostalCodes.includes(pc || '');
    })
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { niveau_2: 300, niveau_1: 200, normal: 100 };
      const aPriority = priorityOrder[a.priorityLevel] || 100;
      const bPriority = priorityOrder[b.priorityLevel] || 100;
      if (aPriority >= 200 || bPriority >= 200) {
        if (aPriority !== bPriority) return bPriority - aPriority;
        return (b.rating || 0) - (a.rating || 0);
      }
      const aIsOpen = a.openingHours ? isOpen(parseOpeningHours(a.openingHours)) : false;
      const bIsOpen = b.openingHours ? isOpen(parseOpeningHours(b.openingHours)) : false;
      if (aIsOpen !== bIsOpen) return bIsOpen ? 1 : -1;
      return (b.rating || 0) - (a.rating || 0);
    })
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
      <JsonLdScript data={generateRestaurantSchema(pizzeria, pizzeriaUrl, cityConfig)} />
      <JsonLdScript data={generateBreadcrumbSchema(breadcrumbItems)} />

      <PizzeriaDetailClient
        pizzeria={pizzeria}
        sector={sector}
        sectors={sectors}
        cityName={cityConfig.name}
        siteUrl={cityConfig.siteUrl}
        mainPostalCodes={cityConfig.mainPostalCodes}
        top10Pizzerias={top10Pizzerias}
        centerCoords={[cityConfig.centerLat, cityConfig.centerLng]}
      />
    </div>
  );
}
