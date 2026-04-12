import type { Metadata } from 'next';
import { fetchPizzerias } from '@/lib/data/pizzerias';
import { fetchGeographicSectors } from '@/lib/data/sectors';
import CityPageClient from '@/components/pages/CityPageClient';
import { JsonLdScript, generateItemListSchema, generateBreadcrumbSchema } from '@/components/seo/JsonLd';
import { extractPostalCode } from '@/utils/postalCodeUtils';

export const metadata: Metadata = {
  title: 'Pizzerias D\u00e9ville-l\u00e8s-Rouen - Ouvertes Maintenant | Livraison 24h/24',
  description: 'D\u00e9couvrez les meilleures pizzerias de D\u00e9ville-l\u00e8s-Rouen. Pizza livraison, \u00e0 emporter et sur place.',
  alternates: { canonical: 'https://pizzarouen.fr/deville-les-rouen' },
};

export const revalidate = 3600;

export default async function DevilleLesRouenPage() {
  const [pizzerias, sectors] = await Promise.all([fetchPizzerias(), fetchGeographicSectors()]);

  const cityPizzerias = pizzerias.filter(p => extractPostalCode(p.address) === '76250');
  const listPizzerias = cityPizzerias.length > 0 ? cityPizzerias : pizzerias.slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
      <JsonLdScript data={generateItemListSchema(listPizzerias, 'Pizzerias \u00e0 D\u00e9ville-l\u00e8s-Rouen')} />
      <JsonLdScript data={generateBreadcrumbSchema([
        { name: 'Pizza Rouen', url: 'https://pizzarouen.fr' },
        { name: 'Pizza D\u00e9ville-l\u00e8s-Rouen', url: 'https://pizzarouen.fr/deville-les-rouen' },
      ])} />

      <CityPageClient
        pizzerias={pizzerias}
        sectors={sectors}
        cityName="D\u00e9ville-l\u00e8s-Rouen"
        cityPostalCode="76250"
        cityCoords={{ lat: 49.4667, lng: 1.0417 }}
      />
    </div>
  );
}
