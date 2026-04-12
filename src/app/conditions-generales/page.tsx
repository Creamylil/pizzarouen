import type { Metadata } from 'next';
import { fetchCityConfig } from '@/lib/data/city';

export async function generateMetadata(): Promise<Metadata> {
  const city = await fetchCityConfig();
  return {
    title: 'Conditions Générales',
    description: `Conditions générales d'utilisation du site ${city.domain}`,
    alternates: { canonical: `${city.siteUrl}/conditions-generales` },
  };
}

export default async function ConditionsGeneralesPage() {
  const city = await fetchCityConfig();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Conditions Générales d&apos;Utilisation</h1>
        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">1. Objet</h2>
          <p>Les présentes conditions générales régissent l&apos;utilisation du site {city.domain}, annuaire en ligne de pizzerias dans la région de {city.name}.</p>

          <h2 className="text-2xl font-bold text-gray-900">2. Accès au site</h2>
          <p>Le site est accessible gratuitement à tout utilisateur disposant d&apos;un accès à Internet. Les frais d&apos;accès et d&apos;utilisation du réseau sont à la charge de l&apos;utilisateur.</p>

          <h2 className="text-2xl font-bold text-gray-900">3. Services proposés</h2>
          <p>Le site propose un annuaire référençant les pizzerias de {city.name} et de sa région. Les informations (horaires, adresses, services) sont fournies à titre indicatif.</p>

          <h2 className="text-2xl font-bold text-gray-900">4. Responsabilité</h2>
          <p>{city.displayName} s&apos;efforce de fournir des informations exactes et à jour. Toutefois, nous ne pouvons garantir l&apos;exactitude ou l&apos;exhaustivité des informations affichées.</p>

          <h2 className="text-2xl font-bold text-gray-900">5. Propriété intellectuelle</h2>
          <p>L&apos;ensemble du contenu du site (textes, images, logos) est protégé par le droit de la propriété intellectuelle. Toute reproduction est interdite sans autorisation.</p>

          <h2 className="text-2xl font-bold text-gray-900">6. Données personnelles</h2>
          <p>Le site peut collecter des données de navigation à des fins statistiques. Ces données sont traitées conformément au RGPD.</p>

          <h2 className="text-2xl font-bold text-gray-900">7. Contact</h2>
          <p>Pour toute question concernant ces conditions, contactez-nous à {city.contactEmail}.</p>
        </div>
      </div>
    </div>
  );
}
