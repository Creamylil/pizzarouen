import type { Metadata } from 'next';
import { fetchPizzerias } from '@/lib/data/pizzerias';
import { fetchGeographicSectors } from '@/lib/data/sectors';
import CityPageClient from '@/components/pages/CityPageClient';
import { JsonLdScript, generateItemListSchema, generateBreadcrumbSchema } from '@/components/seo/JsonLd';
import { extractPostalCode } from '@/utils/postalCodeUtils';

export const metadata: Metadata = {
  title: 'Pizzerias Sotteville-l\u00e8s-Rouen - Ouvertes Maintenant | Livraison 24h/24',
  description: 'D\u00e9couvrez les meilleures pizzerias de Sotteville-l\u00e8s-Rouen. Pizza livraison, \u00e0 emporter et sur place.',
  alternates: { canonical: 'https://pizzarouen.fr/sotteville-les-rouen' },
};

export const revalidate = 3600;

export default async function SottevilleLesRouenPage() {
  const [pizzerias, sectors] = await Promise.all([fetchPizzerias(), fetchGeographicSectors()]);

  const cityPizzerias = pizzerias.filter(p => extractPostalCode(p.address) === '76300');
  const listPizzerias = cityPizzerias.length > 0 ? cityPizzerias : pizzerias.slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
      <JsonLdScript data={generateItemListSchema(listPizzerias, 'Pizzerias \u00e0 Sotteville-l\u00e8s-Rouen')} />
      <JsonLdScript data={generateBreadcrumbSchema([
        { name: 'Pizza Rouen', url: 'https://pizzarouen.fr' },
        { name: 'Pizza Sotteville-l\u00e8s-Rouen', url: 'https://pizzarouen.fr/sotteville-les-rouen' },
      ])} />

      <CityPageClient
        pizzerias={pizzerias}
        sectors={sectors}
        cityName="Sotteville-l\u00e8s-Rouen"
        cityPostalCode="76300"
        cityCoords={{ lat: 49.4081, lng: 1.0851 }}
      />
    </div>
  );
}
