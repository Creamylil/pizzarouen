import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions Légales',
  description: 'Mentions légales du site pizzarouen.fr',
  alternates: { canonical: 'https://pizzarouen.fr/mentions-legales' },
  robots: { index: false },
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Mentions Légales</h1>
        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Éditeur du site</h2>
          <p>JSD MEDIA LLP</p>
          <p>Site web : pizzarouen.fr</p>
          <p>Email : contact@pizzarouen.fr</p>

          <h2 className="text-2xl font-bold text-gray-900">Hébergement</h2>
          <p>Le site est hébergé par Vercel Inc.</p>

          <h2 className="text-2xl font-bold text-gray-900">Propriété intellectuelle</h2>
          <p>L&apos;ensemble du contenu de ce site est protégé par les lois relatives à la propriété intellectuelle.</p>

          <h2 className="text-2xl font-bold text-gray-900">Protection des données</h2>
          <p>Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de modification et de suppression des données vous concernant. Pour exercer ce droit, contactez-nous à contact@pizzarouen.fr.</p>
        </div>
      </div>
    </div>
  );
}
