import type { Metadata } from 'next';
import { fetchCityConfig } from '@/lib/data/city';
import PartenairePage from './PartenairePage';

export async function generateMetadata(): Promise<Metadata> {
  const city = await fetchCityConfig();
  return {
    title: 'Devenir Partenaire - Boostez votre visibilité',
    description: `Augmentez la visibilité de votre pizzeria sur ${city.domain}. Pack Essentiel, Boost et Premium disponibles.`,
    alternates: { canonical: `${city.siteUrl}/partenaire` },
  };
}

export default async function Page() {
  const city = await fetchCityConfig();
  return (
    <PartenairePage
      cityDisplayName={city.displayName}
      contactEmail={city.contactEmail}
      contactWhatsapp={city.contactWhatsapp}
    />
  );
}
