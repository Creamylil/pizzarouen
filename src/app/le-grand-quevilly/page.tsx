import type { Metadata } from 'next';
import { fetchPizzerias } from '@/lib/data/pizzerias';
import { fetchGeographicSectors } from '@/lib/data/sectors';
import CityPageClient from '@/components/pages/CityPageClient';

export const metadata: Metadata = {
  title: 'Pizzerias Le Grand-Quevilly - Ouvertes Maintenant | Livraison 24h/24',
  description: 'Découvrez les meilleures pizzerias du Grand-Quevilly. Pizza livraison, à emporter et sur place.',
  alternates: { canonical: 'https://pizzarouen.fr/le-grand-quevilly' },
};

export const revalidate = 3600;

export default async function LeGrandQuevillyPage() {
  const [pizzerias, sectors] = await Promise.all([fetchPizzerias(), fetchGeographicSectors()]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
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
