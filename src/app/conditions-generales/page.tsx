import type { Metadata } from 'next';
import { fetchCityConfig } from '@/lib/data/city';

export async function generateMetadata(): Promise<Metadata> {
  const city = await fetchCityConfig();
  return {
    title: 'Conditions G\u00e9n\u00e9rales d\u2019Utilisation',
    description: `Conditions g\u00e9n\u00e9rales d'utilisation du site ${city.domain}`,
    alternates: { canonical: `${city.siteUrl}/conditions-generales` },
    robots: { index: false },
  };
}

export default async function ConditionsGeneralesPage() {
  const city = await fetchCityConfig();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Conditions G\u00e9n\u00e9rales d&apos;Utilisation</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">

          {/* 1. Objet */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">1. Objet</h2>
            <p>Les pr\u00e9sentes Conditions G\u00e9n\u00e9rales d&apos;Utilisation (ci-apr\u00e8s &laquo; CGU &raquo;) r\u00e9gissent l&apos;acc\u00e8s et l&apos;utilisation du site <strong>{city.domain}</strong>, \u00e9dit\u00e9 par {city.editorName}.</p>
            <p>L&apos;utilisation du site implique l&apos;acceptation pleine et enti\u00e8re des pr\u00e9sentes CGU. Si vous n&apos;\u00eates pas d&apos;accord avec tout ou partie de ces conditions, vous \u00eates invit\u00e9 \u00e0 ne pas utiliser le site.</p>
          </section>

          {/* 2. Accès au site */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">2. Acc\u00e8s au site</h2>
            <p>Le site {city.domain} est accessible gratuitement et sans inscription \u00e0 tout utilisateur disposant d&apos;un acc\u00e8s \u00e0 Internet. Les frais d&apos;acc\u00e8s au r\u00e9seau sont \u00e0 la charge de l&apos;utilisateur.</p>
            <p>{city.editorName} s&apos;efforce d&apos;assurer la disponibilit\u00e9 du site, mais ne peut garantir un acc\u00e8s ininterrompu. Le site peut \u00eatre temporairement indisponible pour des raisons de maintenance ou techniques.</p>
          </section>

          {/* 3. Description des services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">3. Description des services</h2>
            <p>Le site {city.domain} est un <strong>annuaire en ligne</strong> r\u00e9f\u00e9ren\u00e7ant les pizzerias de {city.name} et de sa r\u00e9gion. Il fournit des informations pratiques telles que les adresses, num\u00e9ros de t\u00e9l\u00e9phone, horaires d&apos;ouverture, avis et services propos\u00e9s par chaque \u00e9tablissement.</p>
            <p>Le site ne r\u00e9alise aucune vente, ne prend aucune commande et n&apos;intervient en aucun cas dans la relation commerciale entre l&apos;utilisateur et les \u00e9tablissements r\u00e9f\u00e9renc\u00e9s.</p>
          </section>

          {/* 4. Contenus sponsorisés */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">4. Contenus sponsoris\u00e9s et partenariats</h2>
            <p>Certains \u00e9tablissements r\u00e9f\u00e9renc\u00e9s sur le site peuvent b\u00e9n\u00e9ficier d&apos;une <strong>visibilit\u00e9 accrue</strong> dans le cadre d&apos;un partenariat commercial avec {city.editorName}. Ces \u00e9tablissements partenaires sont clairement identifi\u00e9s sur le site.</p>
            <p>L&apos;ordre d&apos;affichage des \u00e9tablissements peut \u00eatre influenc\u00e9 par l&apos;existence d&apos;un partenariat commercial, en plus de crit\u00e8res objectifs tels que la note, la distance g\u00e9ographique et les horaires d&apos;ouverture.</p>
            <p>Le r\u00e9f\u00e9rencement de base sur le site est gratuit et ne d\u00e9pend d&apos;aucune relation commerciale.</p>
          </section>

          {/* 5. Fiabilité des informations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">5. Fiabilit\u00e9 des informations</h2>
            <p>Les informations affich\u00e9es sur le site (horaires d&apos;ouverture, adresses, num\u00e9ros de t\u00e9l\u00e9phone, services propos\u00e9s) sont issues de <strong>sources publiques</strong>, notamment Google Maps, et ne sont <strong>pas mises \u00e0 jour en temps r\u00e9el</strong>.</p>
            <p>En cons\u00e9quence, ces informations peuvent contenir des erreurs, \u00eatre incompl\u00e8tes ou ne plus \u00eatre \u00e0 jour (fermeture d\u00e9finitive, changement d&apos;horaires, d\u00e9m\u00e9nagement, etc.). <strong>Nous recommandons aux utilisateurs de v\u00e9rifier directement aupr\u00e8s de l&apos;\u00e9tablissement concern\u00e9</strong> avant tout d\u00e9placement.</p>
            <p>Si vous constatez une erreur ou souhaitez signaler une information incorrecte, vous pouvez nous contacter \u00e0 tout moment \u00e0 l&apos;adresse <strong>{city.contactEmail}</strong>. Nous nous engageons \u00e0 traiter votre demande dans les meilleurs d\u00e9lais.</p>
          </section>

          {/* 6. Limitation de responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">6. Limitation de responsabilit\u00e9</h2>
            <p>{city.editorName} s&apos;efforce de fournir des informations exactes et \u00e0 jour. Toutefois, la soci\u00e9t\u00e9 ne saurait \u00eatre tenue responsable :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Des erreurs, omissions ou inexactitudes dans les informations publi\u00e9es sur le site</li>
              <li>De tout dommage direct ou indirect r\u00e9sultant de l&apos;utilisation des informations du site</li>
              <li>De l&apos;indisponibilit\u00e9 temporaire ou permanente du site</li>
              <li>Du contenu des sites tiers vers lesquels le site redirige (Google Maps, sites des \u00e9tablissements)</li>
              <li>De la qualit\u00e9 des produits ou services propos\u00e9s par les \u00e9tablissements r\u00e9f\u00e9renc\u00e9s</li>
            </ul>
          </section>

          {/* 7. Responsabilité de l'utilisateur */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">7. Responsabilit\u00e9 de l&apos;utilisateur</h2>
            <p>L&apos;utilisateur s&apos;engage \u00e0 utiliser le site de mani\u00e8re conforme \u00e0 sa destination et aux lois en vigueur. Il est notamment interdit :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>D&apos;extraire ou de r\u00e9utiliser de mani\u00e8re syst\u00e9matique le contenu du site (scraping, crawling automatis\u00e9)</li>
              <li>De tenter de porter atteinte au bon fonctionnement du site</li>
              <li>D&apos;utiliser le site \u00e0 des fins ill\u00e9gales ou non autoris\u00e9es</li>
            </ul>
          </section>

          {/* 8. Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">8. Propri\u00e9t\u00e9 intellectuelle</h2>
            <p>L&apos;ensemble du contenu du site (textes, images, logos, graphismes, structure, base de donn\u00e9es) est la propri\u00e9t\u00e9 de {city.editorName} ou de ses partenaires et est prot\u00e9g\u00e9 par les lois relatives \u00e0 la propri\u00e9t\u00e9 intellectuelle.</p>
            <p>Toute reproduction, repr\u00e9sentation ou redistribution, totale ou partielle, du contenu du site est interdite sans autorisation pr\u00e9alable \u00e9crite.</p>
          </section>

          {/* 9. Données personnelles */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">9. Donn\u00e9es personnelles</h2>
            <p>Pour toute information relative \u00e0 la collecte et au traitement des donn\u00e9es personnelles, veuillez consulter la section d\u00e9di\u00e9e dans nos <a href="/mentions-legales" className="text-blue-600 hover:underline">mentions l\u00e9gales</a>.</p>
          </section>

          {/* 10. Liens externes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">10. Liens externes</h2>
            <p>Le site contient des liens hypertextes vers des sites tiers, notamment Google Maps et les sites web des \u00e9tablissements r\u00e9f\u00e9renc\u00e9s. Ces liens sont fournis \u00e0 titre informatif. {city.editorName} n&apos;exerce aucun contr\u00f4le sur ces sites et d\u00e9cline toute responsabilit\u00e9 quant \u00e0 leur contenu, leur disponibilit\u00e9 ou leurs pratiques en mati\u00e8re de donn\u00e9es personnelles.</p>
          </section>

          {/* 11. Modification des CGU */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">11. Modification des CGU</h2>
            <p>{city.editorName} se r\u00e9serve le droit de modifier les pr\u00e9sentes CGU \u00e0 tout moment. Les modifications prennent effet d\u00e8s leur publication sur le site. L&apos;utilisation du site apr\u00e8s modification vaut acceptation des nouvelles conditions.</p>
          </section>

          {/* 12. Droit applicable */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">12. Droit applicable et litiges</h2>
            <p>Les pr\u00e9sentes CGU sont r\u00e9gies par le droit fran\u00e7ais. En cas de litige relatif \u00e0 l&apos;interpr\u00e9tation ou \u00e0 l&apos;ex\u00e9cution des pr\u00e9sentes, les parties s&apos;efforceront de trouver une solution amiable. \u00c0 d\u00e9faut, les tribunaux fran\u00e7ais seront seuls comp\u00e9tents.</p>
          </section>

          {/* 13. Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900">13. Contact</h2>
            <p>Pour toute question relative aux pr\u00e9sentes CGU ou au fonctionnement du site, vous pouvez nous contacter \u00e0 :</p>
            <p><strong>{city.contactEmail}</strong></p>
          </section>

          <p className="text-sm text-gray-400 mt-12">Derni\u00e8re mise \u00e0 jour : avril 2026</p>
        </div>
      </div>
    </div>
  );
}
