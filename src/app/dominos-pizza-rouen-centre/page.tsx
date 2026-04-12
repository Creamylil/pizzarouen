import type { Metadata } from 'next';
import { fetchPizzerias } from '@/lib/data/pizzerias';
import DominosPageClient from '@/components/pages/DominosPageClient';
import { JsonLdScript, generateRestaurantSchema, generateBreadcrumbSchema } from '@/components/seo/JsonLd';
import type { Pizzeria } from '@/types/pizzeria';

export const metadata: Metadata = {
  title: "Domino's Pizza Rouen Centre - Livraison & \u00c0 Emporter",
  description: "Domino's Pizza Rouen Centre : commandez en livraison ou \u00e0 emporter. Horaires d'ouverture, avis clients, menu et informations pratiques.",
  alternates: { canonical: 'https://pizzarouen.fr/dominos-pizza-rouen-centre' },
};

export const revalidate = 3600;

export default async function DominosPizzaRouenCentrePage() {
  const pizzerias = await fetchPizzerias();

  const dbDominos = pizzerias.find(p =>
    p.name.toLowerCase().includes("domino's") && p.name.toLowerCase().includes("rouen")
  );

  const dominosForSchema: Pizzeria = {
    id: dbDominos?.id || 'dominos-rouen-centre',
    name: dbDominos?.name || "Domino's Pizza Rouen Centre",
    image: dbDominos?.image || '',
    rating: dbDominos?.rating || 4.2,
    reviews: dbDominos?.reviews || 856,
    priceRange: dbDominos?.priceRange || '\u20ac\u20ac',
    specialties: dbDominos?.specialties || [],
    services: dbDominos?.services || [],
    description: dbDominos?.description || '',
    phone: dbDominos?.phone || '02 35 71 23 45',
    address: dbDominos?.address || '12 Rue de la R\u00e9publique, 76000 Rouen',
    types: dbDominos?.types || ['emporter', 'livraison'],
    openingHours: dbDominos?.openingHours || '{"lundi":"11:30-14:15,18:00-22:30","mardi":"11:30-14:15,18:00-22:30","mercredi":"11:30-14:15,18:00-22:30","jeudi":"11:30-14:15,18:00-22:30","vendredi":"11:30-14:15,18:00-23:00","samedi":"11:30-14:15,18:00-23:00","dimanche":"11:30-14:15,18:00-22:30"}',
    priorityLevel: dbDominos?.priorityLevel || 'normal',
    latitude: dbDominos?.latitude,
    longitude: dbDominos?.longitude,
    halal: dbDominos?.halal || false,
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLdScript data={generateRestaurantSchema(dominosForSchema, 'https://pizzarouen.fr/dominos-pizza-rouen-centre')} />
      <JsonLdScript data={generateBreadcrumbSchema([
        { name: 'Pizza Rouen', url: 'https://pizzarouen.fr' },
        { name: "Domino's Pizza Rouen Centre", url: 'https://pizzarouen.fr/dominos-pizza-rouen-centre' },
      ])} />

      <DominosPageClient allPizzerias={pizzerias} />
    </div>
  );
}
