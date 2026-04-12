import { fetchPizzerias } from '@/lib/data/pizzerias';
import { fetchGeographicSectors } from '@/lib/data/sectors';
import HomePageClient from '@/components/pages/HomePageClient';
import SEOContent from '@/components/seo/SEOContent';
import {
  JsonLdScript,
  generateWebSiteSchema,
  generateOrganizationSchema,
  generateItemListSchema,
} from '@/components/seo/JsonLd';

export const revalidate = 1800;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>;
}) {
  const params = await searchParams;
  const [pizzerias, sectors] = await Promise.all([
    fetchPizzerias(),
    fetchGeographicSectors(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
      <JsonLdScript data={generateWebSiteSchema()} />
      <JsonLdScript data={generateOrganizationSchema()} />
      <JsonLdScript data={generateItemListSchema(pizzerias, 'Pizzerias \u00e0 Rouen')} />

      <HomePageClient
        pizzerias={pizzerias}
        sectors={sectors}
        initialSector={params.sector ?? null}
      />
      <SEOContent />
    </div>
  );
}
