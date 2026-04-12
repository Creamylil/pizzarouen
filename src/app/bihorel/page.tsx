import type { Metadata } from 'next';
import { fetchPizzerias } from '@/lib/data/pizzerias';
import { fetchGeographicSectors } from '@/lib/data/sectors';
import CityPageClient from '@/components/pages/CityPageClient';

export const metadata: Metadata = {
  title: 'Pizzerias Bihorel - Ouvertes Maintenant | Livraison 24h/24',
  description: 'Découvrez les meilleures pizzerias de Bihorel. Pizza livraison, à emporter et sur place. Horaires, avis et commande en ligne.',
  alternates: { canonical: 'https://pizzarouen.fr/bihorel' },
};

export const revalidate = 3600;

export default async function BihorelPage() {
  const [pizzerias, sectors] = await Promise.all([fetchPizzerias(), fetchGeographicSectors()]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
      <CityPageClient
        pizzerias={pizzerias}
        sectors={sectors}
        cityName="Bihorel"
        cityPostalCode="76420"
        cityCoords={{ lat: 49.4583, lng: 1.1167 }}
      />
    </div>
  );
}
