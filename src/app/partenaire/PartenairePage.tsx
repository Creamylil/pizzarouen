'use client';

import Link from 'next/link';
import { ArrowLeft, Check, Star, Zap, Crown, Phone, Mail, MessageCircle } from 'lucide-react';

interface PartenairePageProps {
  cityName: string;
  cityDisplayName: string;
  contactEmail: string;
  contactWhatsapp: string | null;
}

const plans = [
  {
    id: 'referencement',
    name: 'Référencement',
    tagline: 'Soyez visible',
    price: 19,
    annualPrice: 179,
    icon: Star,
    gradient: 'from-blue-500 to-blue-600',
    lightBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-200',
    checkColor: 'text-blue-500',
    features: [
      'Fiche pizzeria avec horaires et coordonnées',
      'Apparition dans les résultats de recherche',
      'Localisation sur la carte interactive',
      'Mise à jour des informations à tout moment',
    ],
  },
  {
    id: 'priorite',
    name: 'Priorité',
    tagline: 'Passez devant',
    price: 39,
    annualPrice: 349,
    icon: Zap,
    gradient: 'from-amber-500 to-orange-500',
    lightBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    borderColor: 'border-amber-300',
    checkColor: 'text-amber-500',
    popular: true,
    features: [
      'Tout le niveau Référencement',
      'Badge "Recommandé" sur votre fiche',
      'Classement prioritaire dans les résultats',
      'Inclusion dans le Top 10 de votre zone',
    ],
  },
  {
    id: 'coup-de-coeur',
    name: 'Coup de Coeur',
    tagline: 'Le meilleur classement',
    price: 79,
    annualPrice: 699,
    icon: Crown,
    gradient: 'from-purple-600 to-purple-700',
    lightBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-300',
    checkColor: 'text-purple-600',
    features: [
      'Tout le niveau Priorité',
      'Badge "Coup de Coeur" exclusif',
      'Position la plus haute dans les résultats',
      'Top 10 garanti sur votre zone',
      'Visibilité maximale en page d\'accueil',
      'Nombre de places limité par secteur',
    ],
  },
];

export default function PartenairePage({ cityName, cityDisplayName, contactEmail, contactWhatsapp }: PartenairePageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {cityDisplayName}
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.1),transparent_60%)]" />

        <div className="relative max-w-4xl mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white/80 mb-8 border border-white/10">
            <span className="text-amber-400">🍕</span>
            Référencement professionnel pour pizzerias
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Faites découvrir votre pizzeria
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              à tout {cityName}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            Rejoignez l&apos;annuaire n°1 de {cityName} et apparaissez devant des milliers de clients qui cherchent une pizzeria chaque mois.
          </p>

          <a
            href="#formules"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Voir les formules
          </a>
        </div>
      </section>

      {/* Pricing cards */}
      <section id="formules" className="py-16 sm:py-20 scroll-mt-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Choisissez votre formule
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
              Un abonnement simple, sans engagement. Résiliable à tout moment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border-2 ${plan.popular ? 'border-amber-400 shadow-xl shadow-amber-100/50' : 'border-gray-100 shadow-lg'} p-8 flex flex-col`}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                        Le plus populaire
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                    <div className={`inline-flex items-center justify-center w-14 h-14 ${plan.lightBg} rounded-xl mb-4`}>
                      <Icon className={`w-7 h-7 ${plan.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                        {plan.price}€
                      </span>
                      <span className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                        /mois
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2" style={{ fontFamily: 'var(--font-body)' }}>
                      ou {plan.annualPrice}€/an (2 mois offerts)
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3.5 mb-8 flex-1" style={{ fontFamily: 'var(--font-body)' }}>
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full ${plan.lightBg} flex items-center justify-center`}>
                          <Check className={`w-3 h-3 ${plan.checkColor}`} strokeWidth={3} />
                        </div>
                        <span className="text-sm text-gray-700 leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a
                    href={contactWhatsapp ? `https://wa.me/${contactWhatsapp.replace(/\s+/g, '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé par la formule ${plan.name} pour ma pizzeria sur ${cityDisplayName}.`)}` : `mailto:${contactEmail}?subject=${encodeURIComponent(`Formule ${plan.name} - ${cityDisplayName}`)}&body=${encodeURIComponent(`Bonjour,\n\nJe suis intéressé par la formule ${plan.name} pour ma pizzeria.\n\nCordialement`)}`}
                    className={`block w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-200/50'
                        : plan.id === 'coup-de-coeur'
                          ? 'bg-purple-700 text-white hover:bg-purple-800 shadow-md shadow-purple-200/50'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Choisir {plan.name}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12" style={{ fontFamily: 'var(--font-display)' }}>
            Comment ça marche ?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Contactez-nous',
                desc: `Envoyez-nous un message pour nous parler de votre pizzeria et choisir votre formule.`,
              },
              {
                step: '2',
                title: 'On crée votre fiche',
                desc: 'Nous configurons votre fiche avec vos horaires, votre adresse, votre numéro et votre photo.',
              },
              {
                step: '3',
                title: 'Vous êtes en ligne',
                desc: `Votre pizzeria apparaît sur ${cityDisplayName} et commence à recevoir des visites.`,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-900 text-white text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12" style={{ fontFamily: 'var(--font-display)' }}>
            Questions fréquentes
          </h2>

          <div className="space-y-6" style={{ fontFamily: 'var(--font-body)' }}>
            {[
              {
                q: 'Puis-je changer de formule à tout moment ?',
                a: 'Oui, vous pouvez passer à une formule supérieure ou inférieure à tout moment. Le changement prend effet immédiatement.',
              },
              {
                q: 'Y a-t-il un engagement ?',
                a: 'Non, toutes nos formules sont sans engagement. Vous pouvez résilier à tout moment, sans frais.',
              },
              {
                q: 'Comment fonctionne le classement ?',
                a: 'Le classement dépend de votre formule. Les formules Priorité et Coup de Coeur bénéficient d\'un positionnement plus élevé dans les résultats de recherche et sur la carte.',
              },
              {
                q: 'Qu\'est-ce que le Top 10 ?',
                a: `Le Top 10 est la section la plus visible du site. Elle met en avant les meilleures pizzerias de ${cityName}. Les formules Priorité et Coup de Coeur y sont incluses.`,
              },
              {
                q: 'Combien de pizzerias Coup de Coeur par secteur ?',
                a: 'Le nombre de places Coup de Coeur est limité à 3 par secteur géographique, pour garantir une visibilité maximale à chaque partenaire.',
              },
            ].map((faq) => (
              <details key={faq.q} className="group border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                  <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 sm:py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Prêt à booster votre visibilité ?
          </h2>
          <p className="text-white/60 text-lg mb-10" style={{ fontFamily: 'var(--font-body)' }}>
            Contactez-nous dès maintenant et commencez à recevoir de nouveaux clients.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {contactWhatsapp && (
              <a
                href={`https://wa.me/${contactWhatsapp.replace(/\s+/g, '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé par un référencement sur ${cityDisplayName} pour ma pizzeria.`)}`}
                className="inline-flex items-center gap-3 bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-600 transition-all shadow-lg"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <MessageCircle className="w-5 h-5" />
                Nous écrire sur WhatsApp
              </a>
            )}
            <a
              href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Partenariat - ${cityDisplayName}`)}&body=${encodeURIComponent(`Bonjour,\n\nJe souhaite référencer ma pizzeria sur ${cityDisplayName}.\n\nCordialement`)}`}
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <Mail className="w-5 h-5" />
              {contactEmail}
            </a>
          </div>

          {!contactWhatsapp && (
            <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              <Phone className="w-4 h-4" />
              <span>Réponse sous 24h</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
