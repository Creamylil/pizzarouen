import { Suspense } from 'react';
import { fetchPizzerias } from '@/lib/data/pizzerias';
import { fetchGeographicSectors } from '@/lib/data/sectors';
import HomePageClient from '@/components/pages/HomePageClient';
import SEOContent from '@/components/seo/SEOContent';
import LoadingState from '@/components/states/LoadingState';

export const revalidate = 1800;

export default async function HomePage() {
  const [pizzerias, sectors] = await Promise.all([
    fetchPizzerias(),
    fetchGeographicSectors(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
      <Suspense fallback={<LoadingState />}>
        <HomePageClient pizzerias={pizzerias} sectors={sectors} />
      </Suspense>
      <SEOContent />
    </div>
  );
}
