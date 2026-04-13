import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchCityConfig } from '@/lib/data/city';
import { ArrowLeft } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const city = await fetchCityConfig();
  return {
    title: 'Conditions Générales d\'Utilisation',
    description: `Conditions générales d'utilisation du site ${city.domain}`,
    alternates: { canonical: `${city.siteUrl}/conditions-generales` },
    robots: { index: false },
  };
}

export default async function ConditionsGeneralesPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-10">Conditions Générales d&apos;Utilisation</h1>

        <div className="space-y-10 text-gray-700 text-[15px] leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Objet</h2>
            <p className="mb-2">Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU ») régissent l&apos;accès et l&apos;utilisation du site <strong>{city.domain}</strong>, édité par {city.editorName}.</p>
            <p>L&apos;utilisation du site implique l&apos;acceptation pleine et entière des présentes CGU. Si vous n&apos;êtes pas d&apos;accord avec tout ou partie de ces conditions, vous êtes invité à ne pas utiliser le site.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Accès au site</h2>
            <p className="mb-2">Le site {city.domain} est accessible gratuitement et sans inscription à tout utilisateur disposant d&apos;un accès à Internet. Les frais d&apos;accès au réseau sont à la charge de l&apos;utilisateur.</p>
            <p>{city.editorName} s&apos;efforce d&apos;assurer la disponibilité du site, mais ne peut garantir un accès ininterrompu. Le site peut être temporairement indisponible pour des raisons de maintenance ou techniques.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Description des services</h2>
            <p className="mb-2">Le site {city.domain} est un <strong>annuaire en ligne</strong> référençant les pizzerias de {city.name} et de sa région. Il fournit des informations pratiques telles que les adresses, numéros de téléphone, horaires d&apos;ouverture, avis et services proposés par chaque établissement.</p>
            <p>Le site ne réalise aucune vente, ne prend aucune commande et n&apos;intervient en aucun cas dans la relation commerciale entre l&apos;utilisateur et les établissements référencés.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Contenus sponsorisés et partenariats</h2>
            <p className="mb-2">Certains établissements référencés sur le site peuvent bénéficier d&apos;une <strong>visibilité accrue</strong> dans le cadre d&apos;un partenariat commercial avec {city.editorName}. Ces établissements partenaires sont clairement identifiés sur le site.</p>
            <p className="mb-2">L&apos;ordre d&apos;affichage des établissements peut être influencé par l&apos;existence d&apos;un partenariat commercial, en plus de critères objectifs tels que la note, la distance géographique et les horaires d&apos;ouverture.</p>
            <p>Le référencement de base sur le site est gratuit et ne dépend d&apos;aucune relation commerciale.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Fiabilité des informations</h2>
            <p className="mb-2">Les informations affichées sur le site (horaires d&apos;ouverture, adresses, numéros de téléphone, services proposés) sont issues de <strong>sources publiques</strong>, notamment Google Maps, et ne sont <strong>pas mises à jour en temps réel</strong>.</p>
            <p className="mb-2">En conséquence, ces informations peuvent contenir des erreurs, être incomplètes ou ne plus être à jour (fermeture définitive, changement d&apos;horaires, déménagement, etc.). <strong>Nous recommandons aux utilisateurs de vérifier directement auprès de l&apos;établissement concerné</strong> avant tout déplacement.</p>
            <p>Si vous constatez une erreur ou souhaitez signaler une information incorrecte, vous pouvez nous contacter à tout moment à l&apos;adresse <strong>{city.contactEmail}</strong>. Nous nous engageons à traiter votre demande dans les meilleurs délais.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Limitation de responsabilité</h2>
            <p className="mb-2">{city.editorName} s&apos;efforce de fournir des informations exactes et à jour. Toutefois, la société ne saurait être tenue responsable :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Des erreurs, omissions ou inexactitudes dans les informations publiées sur le site</li>
              <li>De tout dommage direct ou indirect résultant de l&apos;utilisation des informations du site</li>
              <li>De l&apos;indisponibilité temporaire ou permanente du site</li>
              <li>Du contenu des sites tiers vers lesquels le site redirige (Google Maps, sites des établissements)</li>
              <li>De la qualité des produits ou services proposés par les établissements référencés</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Responsabilité de l&apos;utilisateur</h2>
            <p className="mb-2">L&apos;utilisateur s&apos;engage à utiliser le site de manière conforme à sa destination et aux lois en vigueur. Il est notamment interdit :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>D&apos;extraire ou de réutiliser de manière systématique le contenu du site (scraping, crawling automatisé)</li>
              <li>De tenter de porter atteinte au bon fonctionnement du site</li>
              <li>D&apos;utiliser le site à des fins illégales ou non autorisées</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Propriété intellectuelle</h2>
            <p className="mb-2">L&apos;ensemble du contenu du site (textes, images, logos, graphismes, structure, base de données) est la propriété de {city.editorName} ou de ses partenaires et est protégé par les lois relatives à la propriété intellectuelle.</p>
            <p>Toute reproduction, représentation ou redistribution, totale ou partielle, du contenu du site est interdite sans autorisation préalable écrite.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Données personnelles</h2>
            <p>Pour toute information relative à la collecte et au traitement des données personnelles, veuillez consulter la section dédiée dans nos <Link href="/mentions-legales" className="text-blue-600 hover:underline">mentions légales</Link>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Liens externes</h2>
            <p>Le site contient des liens hypertextes vers des sites tiers, notamment Google Maps et les sites web des établissements référencés. Ces liens sont fournis à titre informatif. {city.editorName} n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu, leur disponibilité ou leurs pratiques en matière de données personnelles.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Modification des CGU</h2>
            <p>{city.editorName} se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prennent effet dès leur publication sur le site. L&apos;utilisation du site après modification vaut acceptation des nouvelles conditions.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">12. Droit applicable et litiges</h2>
            <p>Les présentes CGU sont régies par le droit français. En cas de litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes, les parties s&apos;efforceront de trouver une solution amiable. À défaut, les tribunaux français seront seuls compétents.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">13. Contact</h2>
            <p>Pour toute question relative aux présentes CGU ou au fonctionnement du site, vous pouvez nous contacter à : <strong>{city.contactEmail}</strong></p>
          </section>

          <p className="text-sm text-gray-400 pt-8 border-t border-gray-100">Dernière mise à jour : avril 2026</p>
        </div>
      </div>
    </div>
  );
}
