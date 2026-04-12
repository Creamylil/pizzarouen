import type { Metadata } from 'next';
import { fetchPizzerias } from '@/lib/data/pizzerias';
import { fetchGeographicSectors } from '@/lib/data/sectors';
import CityPageClient from '@/components/pages/CityPageClient';

export const metadata: Metadata = {
  title: 'Pizzerias Déville-lès-Rouen - Ouvertes Maintenant | Livraison 24h/24',
  description: 'Découvrez les meilleures pizzerias de Déville-lès-Rouen. Pizza livraison, à emporter et sur place.',
  alternates: { canonical: 'https://pizzarouen.fr/deville-les-rouen' },
};

export const revalidate = 3600;

export default async function DevilleLesRouenPage() {
  const [pizzerias, sectors] = await Promise.all([fetchPizzerias(), fetchGeographicSectors()]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
      <CityPageClient
        pizzerias={pizzerias}
        sectors={sectors}
        cityName="Déville-lès-Rouen"
        cityPostalCode="76250"
        cityCoords={{ lat: 49.4667, lng: 1.0417 }}
      />
    </div>
  );
}
