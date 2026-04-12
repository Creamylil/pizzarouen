'use client';

import { useState } from 'react';
import { Check, Star, Crown, Zap } from 'lucide-react';

interface PartenairePageProps {
  cityDisplayName: string;
  contactEmail: string;
  contactWhatsapp: string | null;
}

export default function PartenairePage({ cityDisplayName, contactEmail, contactWhatsapp }: PartenairePageProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const discount = 0.15;

  const getPrice = (monthly: number) => {
    if (isAnnual) {
      return (monthly * (1 - discount)).toFixed(0);
    }
    return monthly.toString();
  };

  const plans = [
    {
      name: 'Pack Essentiel',
      price: 19,
      icon: <Star className="h-8 w-8 text-blue-500" />,
      color: 'blue',
      features: [
        'Fiche pizzeria complète',
        'Horaires et coordonnées',
        'Apparition dans les résultats',
        'Badge vérifié',
      ],
    },
    {
      name: 'Pack Boost',
      price: 49,
      icon: <Zap className="h-8 w-8 text-amber-500" />,
      color: 'amber',
      popular: true,
      features: [
        'Tout le Pack Essentiel',
        'Inclusion dans le TOP 10',
        'Badge Sélection Premium',
        'Mise en avant dans les résultats',
        'Priorité dans le tri',
      ],
    },
    {
      name: 'Pack Premium',
      price: 99,
      icon: <Crown className="h-8 w-8 text-purple-500" />,
      color: 'purple',
      features: [
        'Tout le Pack Boost',
        'Badge Coup de Coeur',
        'Position prioritaire absolue',
        'Inclusion TOP 10 garantie',
        'Design carte premium exclusif',
        'Support prioritaire',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Boostez la visibilité de votre pizzeria
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Rejoignez l&apos;annuaire {cityDisplayName} et touchez des milliers de clients potentiels chaque mois.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-md flex items-center gap-2">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!isAnnual ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600'}`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isAnnual ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600'}`}
            >
              Annuel (-15%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-lg p-8 relative ${plan.popular ? 'ring-2 ring-amber-400 shadow-xl' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Populaire
                </div>
              )}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  {plan.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{getPrice(plan.price)}€</span>
                  <span className="text-gray-500">/mois</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-green-600 mt-1">
                    Économisez {(plan.price * 12 * discount).toFixed(0)}€/an
                  </p>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`mailto:${contactEmail}`}
                className={`w-full block text-center py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Nous contacter
              </a>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-gray-600">
          <p>Des questions ? Contactez-nous à <strong>{contactEmail}</strong></p>
          {contactWhatsapp && (
            <p className="mt-2">ou par WhatsApp au <strong>{contactWhatsapp}</strong></p>
          )}
        </div>
      </div>
    </div>
  );
}
