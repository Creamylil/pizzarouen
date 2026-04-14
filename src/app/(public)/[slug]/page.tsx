import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchCityConfig } from '@/lib/data/city';
import { fetchPizzerias, fetchPizzeriaBySlug } from '@/lib/data/pizzerias';
import { fetchGeographicSectors, fetchSectorBySlug } from '@/lib/data/sectors';
import SectorPageClient from '@/components/pages/SectorPageClient';
import PizzeriaDetailClient from '@/components/pages/PizzeriaDetailClient';
import SEOContent from '@/components/seo/SEOContent';
import {
  JsonLdScript,
  generateItemListSchema,
  generateBreadcrumbSchema,
  generateRestaurantSchema,
} from '@/components/seo/JsonLd';
import { extractPostalCode } from '@/utils/postalCodeUtils';
import { parseOpeningHours, isOpen } from '@/utils/openingHours';

export const revalidate = 1800;

interface SlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const [sectors, pizzerias, cityConfig] = await Promise.all([
    fetchGeographicSectors(),
    fetchPizzerias(),
    fetchCityConfig(),
  ]);

  // Secteurs publiés
  const sectorParams = sectors
    .filter(s => s.is_published !== false)
    .map(s => ({ slug: s.slug }));

  // Pizzerias du centre (mainPostalCodes) → /{pizzeriaSlug}
  const centerPizzeriaParams = pizzerias
    .filter(p => {
      if (!p.slug) return false;
      const pc = extractPostalCode(p.address);
      return pc ? cityConfig.mainPostalCodes.includes(pc) : false;
    })
    .map(p => ({ slug: p.slug }));

  return [...sectorParams, ...centerPizzeriaParams];
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;

  // 1. Essayer secteur
  const [sector, cityConfig] = await Promise.all([
    fetchSectorBySlug(slug),
    fetchCityConfig(),
  ]);

  if (sector && sector.is_published !== false) {
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

  // 2. Essayer pizzeria du centre
  const pizzeria = await fetchPizzeriaBySlug(slug);
  if (pizzeria) {
    const pc = extractPostalCode(pizzeria.address);
    if (pc && cityConfig.mainPostalCodes.includes(pc)) {
      const title = `${pizzeria.name} - ${cityConfig.name}`;
      const description = `Découvrez ${pizzeria.name}, pizzeria à ${cityConfig.name}. Note : ${pizzeria.rating}/5 (${pizzeria.reviews} avis). Horaires, carte et coordonnées.`;
      const canonicalUrl = `${cityConfig.siteUrl}/${pizzeria.slug}`;

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
  }

  return {};
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  const [sector, cityConfig, pizzerias, sectors] = await Promise.all([
    fetchSectorBySlug(slug),
    fetchCityConfig(),
    fetchPizzerias(),
    fetchGeographicSectors(),
  ]);

  // 1. Secteur publié → page secteur
  if (sector && sector.is_published !== false) {
    const displayName = sector.display_name || sector.name;
    const sectorUrl = `${cityConfig.siteUrl}/${sector.slug}`;

    const breadcrumbItems = [
      { name: 'Accueil', url: cityConfig.siteUrl },
      { name: `Pizzerias à ${cityConfig.name}`, url: cityConfig.siteUrl },
      { name: displayName, url: sectorUrl },
    ];

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

  // 2. Pizzeria du centre → fiche pizzeria
  const pizzeria = await fetchPizzeriaBySlug(slug);
  if (pizzeria) {
    const pc = extractPostalCode(pizzeria.address);
    if (pc && cityConfig.mainPostalCodes.includes(pc)) {
      const pizzeriaUrl = `${cityConfig.siteUrl}/${pizzeria.slug}`;

      // Breadcrumb : Accueil > Pizzerias à {Ville} > {Pizzeria}
      const breadcrumbItems = [
        { name: 'Accueil', url: cityConfig.siteUrl },
        { name: `Pizzerias à ${cityConfig.name}`, url: cityConfig.siteUrl },
        { name: pizzeria.name, url: pizzeriaUrl },
      ];

      // Top 10
      const top10Pizzerias = pizzerias
        .filter(p => {
          if (p.id === pizzeria.id) return false;
          const ppc = extractPostalCode(p.address);
          return cityConfig.mainPostalCodes.includes(ppc || '');
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

      // Use a "virtual" sector for PizzeriaDetailClient (the city itself)
      const virtualSector = {
        id: 'center',
        slug: '',
        name: cityConfig.name,
        display_name: cityConfig.name,
        postal_code: cityConfig.mainPostalCodes[0] || '',
        is_published: true,
        city_id: '',
      } as any;

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
          <JsonLdScript data={generateRestaurantSchema(pizzeria, pizzeriaUrl, cityConfig)} />
          <JsonLdScript data={generateBreadcrumbSchema(breadcrumbItems)} />

          <PizzeriaDetailClient
            pizzeria={pizzeria}
            sector={virtualSector}
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
  }

  notFound();
}
