import type { Metadata } from 'next';
import PartenairePage from './PartenairePage';

export const metadata: Metadata = {
  title: 'Devenir Partenaire - Boostez votre visibilité',
  description: 'Augmentez la visibilité de votre pizzeria sur pizzarouen.fr. Pack Essentiel, Boost et Premium disponibles.',
  alternates: { canonical: 'https://pizzarouen.fr/partenaire' },
};

export default function Page() {
  return <PartenairePage />;
}
