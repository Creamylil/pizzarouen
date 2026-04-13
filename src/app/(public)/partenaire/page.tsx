import type { Metadata } from 'next';
import { fetchCityConfig } from '@/lib/data/city';
import { fetchPricingPlans } from '@/lib/data/pricing';
import PartenairePage from './PartenairePage';

export async function generateMetadata(): Promise<Metadata> {
  const city = await fetchCityConfig();
  return {
    title: 'Devenir Partenaire - Référencez votre pizzeria',
    description: `Référencez votre pizzeria sur ${city.domain}. Formules Référencement, Priorité et Coup de Coeur disponibles dès 19€/mois.`,
    alternates: { canonical: `${city.siteUrl}/partenaire` },
    robots: { index: false },
  };
}

export default async function Page() {
  const [city, plans] = await Promise.all([
    fetchCityConfig(),
    fetchPricingPlans(),
  ]);

  return (
    <PartenairePage
      cityName={city.name}
      cityDisplayName={city.displayName}
      contactEmail={city.contactEmail}
      contactWhatsapp={city.contactWhatsapp}
      plans={plans}
    />
  );
}
