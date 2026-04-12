import type { Metadata } from 'next';
import { fetchPizzerias } from '@/lib/data/pizzerias';
import { fetchGeographicSectors } from '@/lib/data/sectors';
import CityPageClient from '@/components/pages/CityPageClient';

export const metadata: Metadata = {
  title: 'Pizzerias Le Petit-Quevilly - Ouvertes Maintenant | Livraison 24h/24',
  description: 'Découvrez les meilleures pizzerias du Petit-Quevilly. Pizza livraison, à emporter et sur place.',
  alternates: { canonical: 'https://pizzarouen.fr/le-petit-quevilly' },
};

export const revalidate = 3600;

export default async function LePetitQuevillyPage() {
  const [pizzerias, sectors] = await Promise.all([fetchPizzerias(), fetchGeographicSectors()]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
      <CityPageClient
        pizzerias={pizzerias}
        sectors={sectors}
        cityName="Le Petit-Quevilly"
        cityPostalCode="76140"
        cityCoords={{ lat: 49.4275, lng: 1.0642 }}
      />
    </div>
  );
}
