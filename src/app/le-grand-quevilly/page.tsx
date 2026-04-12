import type { Metadata } from 'next';
import { fetchPizzerias } from '@/lib/data/pizzerias';
import { fetchGeographicSectors } from '@/lib/data/sectors';
import CityPageClient from '@/components/pages/CityPageClient';
import { JsonLdScript, generateItemListSchema, generateBreadcrumbSchema } from '@/components/seo/JsonLd';
import { extractPostalCode } from '@/utils/postalCodeUtils';

export const metadata: Metadata = {
  title: 'Pizzerias Le Grand-Quevilly - Ouvertes Maintenant | Livraison 24h/24',
  description: 'D\u00e9couvrez les meilleures pizzerias du Grand-Quevilly. Pizza livraison, \u00e0 emporter et sur place.',
  alternates: { canonical: 'https://pizzarouen.fr/le-grand-quevilly' },
};

export const revalidate = 3600;

export default async function LeGrandQuevillyPage() {
  const [pizzerias, sectors] = await Promise.all([fetchPizzerias(), fetchGeographicSectors()]);

  const cityPizzerias = pizzerias.filter(p => extractPostalCode(p.address) === '76120');
  const listPizzerias = cityPizzerias.length > 0 ? cityPizzerias : pizzerias.slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
      <JsonLdScript data={generateItemListSchema(listPizzerias, 'Pizzerias au Grand-Quevilly')} />
      <JsonLdScript data={generateBreadcrumbSchema([
        { name: 'Pizza Rouen', url: 'https://pizzarouen.fr' },
        { name: 'Pizza Le Grand-Quevilly', url: 'https://pizzarouen.fr/le-grand-quevilly' },
      ])} />

      <CityPageClient
        pizzerias={pizzerias}
        sectors={sectors}
        cityName="Le Grand-Quevilly"
        cityPostalCode="76120"
        cityCoords={{ lat: 49.4167, lng: 1.0500 }}
      />
    </div>
  );
}
