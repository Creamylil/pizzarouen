import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchCityConfig } from '@/lib/data/city';
import { ArrowLeft } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const city = await fetchCityConfig();
  return {
    title: 'Mentions Légales',
    description: `Mentions légales du site ${city.domain}`,
    alternates: { canonical: `${city.siteUrl}/mentions-legales` },
    robots: { index: false },
  };
}

export default async function MentionsLegalesPage() {
  const city = await fetchCityConfig();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {city.displayName}
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-10">Mentions Légales</h1>

        <div className="space-y-10 text-gray-700 text-[15px] leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Éditeur du site</h2>
            <p className="mb-2">Le site <strong>{city.domain}</strong> est édité par :</p>
            <ul className="space-y-1 pl-0">
              <li><strong>Raison sociale :</strong> {city.editorName}</li>
              <li><strong>Forme juridique :</strong> Limited Liability Partnership (LLP) de droit britannique</li>
              <li><strong>Numéro d&apos;immatriculation :</strong> OC455142 (Companies House, Royaume-Uni)</li>
              <li><strong>Siège social :</strong> 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom</li>
              <li><strong>Email :</strong> {city.contactEmail}</li>
              <li><strong>TVA :</strong> Non assujetti</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Directeur de la publication</h2>
            <p>Le directeur de la publication est le gérant de {city.editorName}, en sa qualité de représentant légal de la société.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Hébergement</h2>
            <p className="mb-2">Le site est hébergé par :</p>
            <ul className="space-y-1 pl-0">
              <li><strong>Raison sociale :</strong> Vercel Inc.</li>
              <li><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
              <li><strong>Site web :</strong> vercel.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Prestataires de stockage des données</h2>
            <p className="mb-2">Conformément à la loi SREN du 21 mai 2024, les prestataires assurant le stockage des données traitées dans le cadre du site sont :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Vercel Inc.</strong> (hébergement du site et des données applicatives) — Covina, CA, États-Unis</li>
              <li><strong>Supabase Inc.</strong> (base de données) — San Francisco, CA, États-Unis</li>
              <li><strong>Google LLC</strong> (mesure d&apos;audience via Google Analytics) — Mountain View, CA, États-Unis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Propriété intellectuelle</h2>
            <p className="mb-2">L&apos;ensemble des éléments constituant le site {city.domain} (textes, images, graphismes, logo, structure, base de données) est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
            <p>Toute reproduction, représentation, modification ou extraction, totale ou partielle, du contenu du site, par quelque procédé que ce soit, sans autorisation préalable et écrite de {city.editorName}, est strictement interdite et constitue une contrefaçon.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Données personnelles et RGPD</h2>
            <p className="mb-3">Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, {city.editorName} s&apos;engage à protéger les données personnelles des utilisateurs du site.</p>

            <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">Données collectées</h3>
            <p className="mb-2">Le site ne nécessite aucune inscription et ne collecte aucune donnée personnelle directement. Les seules données traitées sont :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Données de navigation anonymisées (pages visitées, durée de visite) via Google Analytics, sous réserve de votre consentement</li>
              <li>Données techniques nécessaires au fonctionnement du site (adresse IP, type de navigateur)</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">Finalités</h3>
            <p>Ces données sont utilisées exclusivement à des fins de mesure d&apos;audience et d&apos;amélioration du site.</p>

            <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">Vos droits</h3>
            <p className="mb-2">Vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression, de limitation et de portabilité de vos données. Vous pouvez également vous opposer au traitement de vos données et introduire une réclamation auprès de la CNIL (Commission Nationale de l&apos;Informatique et des Libertés).</p>
            <p>Pour exercer vos droits, contactez-nous à : <strong>{city.contactEmail}</strong></p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Cookies</h2>
            <p className="mb-2">Le site {city.domain} utilise des cookies et traceurs :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Cookies fonctionnels :</strong> nécessaires au bon fonctionnement du site (aucun consentement requis)</li>
              <li><strong>Cookies analytiques (Google Analytics) :</strong> utilisés pour mesurer l&apos;audience du site. Ces cookies ne sont déposés qu&apos;avec votre consentement préalable.</li>
            </ul>
            <p className="mt-2">Vous pouvez à tout moment modifier vos préférences en matière de cookies via les paramètres de votre navigateur ou en nous contactant à {city.contactEmail}.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Liens hypertextes</h2>
            <p>Le site {city.domain} contient des liens vers des sites tiers (Google Maps, sites web des établissements référencés). {city.editorName} n&apos;exerce aucun contrôle sur le contenu de ces sites et décline toute responsabilité quant à leur contenu ou à leur disponibilité.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Droit applicable</h2>
            <p>Les présentes mentions légales sont régies par le droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux français seront seuls compétents.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Contact</h2>
            <p>Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à : <strong>{city.contactEmail}</strong></p>
          </section>

          <p className="text-sm text-gray-400 pt-8 border-t border-gray-100">Dernière mise à jour : avril 2026</p>
        </div>
      </div>
    </div>
  );
}
