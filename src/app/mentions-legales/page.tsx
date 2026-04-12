import type { Metadata } from 'next';
import { fetchCityConfig } from '@/lib/data/city';

export async function generateMetadata(): Promise<Metadata> {
  const city = await fetchCityConfig();
  return {
    title: 'Mentions L\u00e9gales',
    description: `Mentions l\u00e9gales du site ${city.domain}`,
    alternates: { canonical: `${city.siteUrl}/mentions-legales` },
    robots: { index: false },
  };
}

export default async function MentionsLegalesPage() {
  const city = await fetchCityConfig();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Mentions L\u00e9gales</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">

          {/* 1. Éditeur */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">1. \u00c9diteur du site</h2>
            <p>Le site <strong>{city.domain}</strong> est \u00e9dit\u00e9 par :</p>
            <ul className="list-none pl-0 space-y-1">
              <li><strong>Raison sociale :</strong> {city.editorName}</li>
              <li><strong>Forme juridique :</strong> Limited Liability Partnership (LLP) de droit britannique</li>
              <li><strong>Num\u00e9ro d&apos;immatriculation :</strong> OC455142 (Companies House, Royaume-Uni)</li>
              <li><strong>Si\u00e8ge social :</strong> 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom</li>
              <li><strong>Email :</strong> {city.contactEmail}</li>
              <li><strong>TVA :</strong> Non assujetti</li>
            </ul>
          </section>

          {/* 2. Directeur de publication */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">2. Directeur de la publication</h2>
            <p>Le directeur de la publication est le g\u00e9rant de {city.editorName}, en sa qualit\u00e9 de repr\u00e9sentant l\u00e9gal de la soci\u00e9t\u00e9.</p>
          </section>

          {/* 3. Hébergement */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">3. H\u00e9bergement</h2>
            <p>Le site est h\u00e9berg\u00e9 par :</p>
            <ul className="list-none pl-0 space-y-1">
              <li><strong>Raison sociale :</strong> Vercel Inc.</li>
              <li><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, \u00c9tats-Unis</li>
              <li><strong>Site web :</strong> vercel.com</li>
            </ul>
          </section>

          {/* 4. Stockage des données */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">4. Prestataires de stockage des donn\u00e9es</h2>
            <p>Conform\u00e9ment \u00e0 la loi SREN du 21 mai 2024, les prestataires assurant le stockage des donn\u00e9es trait\u00e9es dans le cadre du site sont :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Vercel Inc.</strong> (h\u00e9bergement du site et des donn\u00e9es applicatives) &mdash; Covina, CA, \u00c9tats-Unis</li>
              <li><strong>Supabase Inc.</strong> (base de donn\u00e9es) &mdash; San Francisco, CA, \u00c9tats-Unis</li>
              <li><strong>Google LLC</strong> (mesure d&apos;audience via Google Analytics) &mdash; Mountain View, CA, \u00c9tats-Unis</li>
            </ul>
          </section>

          {/* 5. Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">5. Propri\u00e9t\u00e9 intellectuelle</h2>
            <p>L&apos;ensemble des \u00e9l\u00e9ments constituant le site {city.domain} (textes, images, graphismes, logo, structure, base de donn\u00e9es) est prot\u00e9g\u00e9 par les lois fran\u00e7aises et internationales relatives \u00e0 la propri\u00e9t\u00e9 intellectuelle.</p>
            <p>Toute reproduction, repr\u00e9sentation, modification ou extraction, totale ou partielle, du contenu du site, par quelque proc\u00e9d\u00e9 que ce soit, sans autorisation pr\u00e9alable et \u00e9crite de {city.editorName}, est strictement interdite et constitue une contrefa\u00e7on.</p>
          </section>

          {/* 6. Données personnelles & RGPD */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">6. Donn\u00e9es personnelles et RGPD</h2>
            <p>Conform\u00e9ment au R\u00e8glement G\u00e9n\u00e9ral sur la Protection des Donn\u00e9es (RGPD) et \u00e0 la loi Informatique et Libert\u00e9s, {city.editorName} s&apos;engage \u00e0 prot\u00e9ger les donn\u00e9es personnelles des utilisateurs du site.</p>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">Donn\u00e9es collect\u00e9es</h3>
            <p>Le site ne n\u00e9cessite aucune inscription et ne collecte aucune donn\u00e9e personnelle directement. Les seules donn\u00e9es trait\u00e9es sont :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Donn\u00e9es de navigation anonymis\u00e9es (pages visit\u00e9es, dur\u00e9e de visite) via Google Analytics, sous r\u00e9serve de votre consentement</li>
              <li>Donn\u00e9es techniques n\u00e9cessaires au fonctionnement du site (adresse IP, type de navigateur)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">Finalit\u00e9s</h3>
            <p>Ces donn\u00e9es sont utilis\u00e9es exclusivement \u00e0 des fins de mesure d&apos;audience et d&apos;am\u00e9lioration du site.</p>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">Vos droits</h3>
            <p>Vous disposez d&apos;un droit d&apos;acc\u00e8s, de rectification, de suppression, de limitation et de portabilit\u00e9 de vos donn\u00e9es. Vous pouvez \u00e9galement vous opposer au traitement de vos donn\u00e9es et introduire une r\u00e9clamation aupr\u00e8s de la CNIL (Commission Nationale de l&apos;Informatique et des Libert\u00e9s).</p>
            <p>Pour exercer vos droits, contactez-nous \u00e0 : <strong>{city.contactEmail}</strong></p>
          </section>

          {/* 7. Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">7. Cookies</h2>
            <p>Le site {city.domain} utilise des cookies et traceurs :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Cookies fonctionnels :</strong> n\u00e9cessaires au bon fonctionnement du site (aucun consentement requis)</li>
              <li><strong>Cookies analytiques (Google Analytics) :</strong> utilis\u00e9s pour mesurer l&apos;audience du site. Ces cookies ne sont d\u00e9pos\u00e9s qu&apos;avec votre consentement pr\u00e9alable.</li>
            </ul>
            <p>Vous pouvez \u00e0 tout moment modifier vos pr\u00e9f\u00e9rences en mati\u00e8re de cookies via les param\u00e8tres de votre navigateur ou en nous contactant \u00e0 {city.contactEmail}.</p>
          </section>

          {/* 8. Liens hypertextes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">8. Liens hypertextes</h2>
            <p>Le site {city.domain} contient des liens vers des sites tiers (Google Maps, sites web des \u00e9tablissements r\u00e9f\u00e9renc\u00e9s). {city.editorName} n&apos;exerce aucun contr\u00f4le sur le contenu de ces sites et d\u00e9cline toute responsabilit\u00e9 quant \u00e0 leur contenu ou \u00e0 leur disponibilit\u00e9.</p>
          </section>

          {/* 9. Droit applicable */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">9. Droit applicable</h2>
            <p>Les pr\u00e9sentes mentions l\u00e9gales sont r\u00e9gies par le droit fran\u00e7ais. En cas de litige, et apr\u00e8s tentative de r\u00e9solution amiable, les tribunaux fran\u00e7ais seront seuls comp\u00e9tents.</p>
          </section>

          {/* 10. Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">10. Contact</h2>
            <p>Pour toute question relative aux pr\u00e9sentes mentions l\u00e9gales, vous pouvez nous contacter \u00e0 :</p>
            <p><strong>{city.contactEmail}</strong></p>
          </section>

          <p className="text-sm text-gray-400 mt-12">Derni\u00e8re mise \u00e0 jour : avril 2026</p>
        </div>
      </div>
    </div>
  );
}
