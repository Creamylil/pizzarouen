import type { Metadata } from 'next';
import { fetchPizzerias } from '@/lib/data/pizzerias';
import { fetchGeographicSectors } from '@/lib/data/sectors';
import CityPageClient from '@/components/pages/CityPageClient';

export const metadata: Metadata = {
  title: 'Pizzerias Sotteville-lès-Rouen - Ouvertes Maintenant | Livraison 24h/24',
  description: 'Découvrez les meilleures pizzerias de Sotteville-lès-Rouen. Pizza livraison, à emporter et sur place.',
  alternates: { canonical: 'https://pizzarouen.fr/sotteville-les-rouen' },
};

export const revalidate = 3600;

export default async function SottevilleLesRouenPage() {
  const [pizzerias, sectors] = await Promise.all([fetchPizzerias(), fetchGeographicSectors()]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
      <CityPageClient
        pizzerias={pizzerias}
        sectors={sectors}
        cityName="Sotteville-lès-Rouen"
        cityPostalCode="76300"
        cityCoords={{ lat: 49.4081, lng: 1.0851 }}
      />
    </div>
  );
}
