'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, MessageSquare, MapPin, Phone, Clock } from 'lucide-react';
import { parseOpeningHours, isOpen, getTodayHours } from '@/utils/openingHours';
import { getTimeUntilOpen } from '@/utils/timeUntilOpen';
import PizzeriaCard from '@/components/pizzeria/PizzeriaCard';
import type { Pizzeria } from '@/types/pizzeria';

interface DominosPageClientProps {
  allPizzerias: Pizzeria[];
}

export default function DominosPageClient({ allPizzerias }: DominosPageClientProps) {
  const router = useRouter();
  const [isCurrentlyOpen, setIsCurrentlyOpen] = useState(false);
  const [todayHours, setTodayHours] = useState('');
  const [timeUntilOpen, setTimeUntilOpen] = useState<string | null>(null);

  const pizzeria = {
    name: "Domino's Pizza Rouen Centre",
    rating: 4.2,
    reviews: 856,
    reviewsLink: "https://www.google.com/maps/place/Domino's+Pizza+Rouen+Centre",
    address: "12 Rue de la République, 76000 Rouen",
    phone: "02 35 71 23 45",
    googleMapsLink: "https://maps.google.com/?q=Domino's+Pizza+Rouen+Centre",
    priceRange: "€€",
    openingHours: '{"lundi":"11:30-14:15,18:00-22:30","mardi":"11:30-14:15,18:00-22:30","mercredi":"11:30-14:15,18:00-22:30","jeudi":"11:30-14:15,18:00-22:30","vendredi":"11:30-14:15,18:00-23:00","samedi":"11:30-14:15,18:00-23:00","dimanche":"11:30-14:15,18:00-22:30"}',
    specialties: ["Pizza pepperoni", "Pizza margherita", "Pizza 4 fromages", "Pizza texane"],
    services: ["Livraison", "À emporter", "Commande en ligne"],
  };

  const dbPizzeria = allPizzerias.find(p =>
    p.name.toLowerCase().includes("domino's") && p.name.toLowerCase().includes("rouen")
  );

  useEffect(() => {
    const hours = parseOpeningHours(pizzeria.openingHours);
    const currentlyOpen = isOpen(hours);
    setIsCurrentlyOpen(currentlyOpen);
    setTodayHours(getTodayHours(hours));
    if (!currentlyOpen) {
      setTimeUntilOpen(getTimeUntilOpen(pizzeria.openingHours));
    }
  }, []);

  const alternatives = allPizzerias
    .filter(p => !(p.name.toLowerCase().includes("domino's") && p.name.toLowerCase().includes("rouen")))
    .sort((a, b) => {
      const getP = (p: Pizzeria) => {
        const open = p.openingHours ? isOpen(parseOpeningHours(p.openingHours)) : false;
        const level = p.priorityLevel === 'niveau_2' ? 300 : p.priorityLevel === 'niveau_1' ? 200 : 100;
        return (open ? 1000 : 0) + level;
      };
      return getP(b) - getP(a);
    })
    .slice(0, 6);

  return (
    <>
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="lg:flex">
            <div className="lg:w-1/2">
              <img
                src={dbPizzeria?.image || "/lovable-uploads/6d184fab-0b61-4d6b-aefd-1e273823de65.png"}
                alt={pizzeria.name}
                className="w-full h-80 lg:h-96 object-cover"
              />
            </div>
            <div className="lg:w-1/2 p-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">{pizzeria.name}</h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-bold text-lg text-gray-900">{pizzeria.rating}</span>
                  <span className="text-gray-600">({pizzeria.reviews} avis)</span>
                </div>
                <button
                  onClick={() => window.open(pizzeria.reviewsLink, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-colors shadow-lg"
                >
                  <MessageSquare className="h-4 w-4" />
                  Voir les avis
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${isCurrentlyOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className={`font-bold text-lg ${isCurrentlyOpen ? 'text-green-700' : 'text-red-700'}`}>
                        {isCurrentlyOpen ? 'Ouvert maintenant' : 'Fermé'}
                      </span>
                    </div>
                    {todayHours && <span className="text-gray-600 font-medium">{todayHours}</span>}
                  </div>
                </div>
                {!isCurrentlyOpen && timeUntilOpen && (
                  <div className="text-blue-600 font-medium">{timeUntilOpen}</div>
                )}
              </div>

              <div className="flex items-start gap-3 mb-6">
                <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                <span className="text-gray-700 font-medium">{pizzeria.address}</span>
              </div>

              <div className="mb-8">
                <span className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 px-4 py-2 rounded-full text-sm font-bold border border-amber-200">
                  {pizzeria.priceRange}
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => window.open(`tel:${pizzeria.phone}`, '_self')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-colors shadow-lg font-medium"
                >
                  <Phone className="h-5 w-5" />
                  Appeler
                </button>
                <button
                  onClick={() => window.open(pizzeria.googleMapsLink, '_blank')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-colors shadow-lg font-medium"
                >
                  <MapPin className="h-5 w-5" />
                  Itinéraire
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Spécialités</h2>
            <div className="grid grid-cols-2 gap-3">
              {pizzeria.specialties.map((specialty, index) => (
                <div key={index} className="bg-emerald-50 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium border border-emerald-200 text-center">
                  {specialty}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Services</h2>
            <div className="space-y-3">
              {pizzeria.services.map((service, index) => (
                <div key={index} className="bg-sky-50 text-sky-800 px-4 py-3 rounded-xl text-sm font-medium border border-sky-200 flex items-center gap-3">
                  <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                  {service}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos de {pizzeria.name}</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            Domino&apos;s Pizza Rouen Centre est l&apos;une des enseignes de pizza les plus reconnues de la ville de Rouen.
            Située en plein centre-ville rouennais, cette pizzeria offre un service de qualité avec des pizzas fraîches
            préparées selon les standards internationaux de la marque. L&apos;établissement propose une large gamme de pizzas,
            des classiques margherita et pepperoni aux créations plus audacieuses, toutes réalisées avec des ingrédients sélectionnés.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Alternatives à {pizzeria.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alternatives.map(alternative => (
              <PizzeriaCard key={alternative.id} pizzeria={alternative} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
