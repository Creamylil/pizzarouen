import type { Metadata } from 'next';
import { fetchPizzerias } from '@/lib/data/pizzerias';
import DominosPageClient from '@/components/pages/DominosPageClient';

export const metadata: Metadata = {
  title: "Domino's Pizza Rouen Centre - Livraison & À Emporter",
  description: "Domino's Pizza Rouen Centre : commandez en livraison ou à emporter. Horaires d'ouverture, avis clients, menu et informations pratiques.",
  alternates: { canonical: 'https://pizzarouen.fr/dominos-pizza-rouen-centre' },
};

export const revalidate = 3600;

export default async function DominosPizzaRouenCentrePage() {
  const pizzerias = await fetchPizzerias();
  return (
    <div className="min-h-screen bg-white">
      <DominosPageClient allPizzerias={pizzerias} />
    </div>
  );
}
