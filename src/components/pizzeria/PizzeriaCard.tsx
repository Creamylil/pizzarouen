'use client';

import { useState, useEffect } from 'react';
import { parseOpeningHours, isOpen, getTodayHours } from '@/utils/openingHours';
import type { Pizzeria } from '@/types/pizzeria';
import PriorityBadge from './PriorityBadge';
import ServiceBadge from './ServiceBadge';
import PizzeriaInfo from './PizzeriaInfo';
import PizzeriaActions from './PizzeriaActions';
import OptimizedPizzeriaImage from './OptimizedPizzeriaImage';
import { Star, MessageSquare } from 'lucide-react';

interface PizzeriaCardProps {
  pizzeria: Pizzeria;
}

export default function PizzeriaCard({ pizzeria }: PizzeriaCardProps) {
  const [isCurrentlyOpen, setIsCurrentlyOpen] = useState(false);
  const [todayHours, setTodayHours] = useState('');
  const [hasOpeningHours, setHasOpeningHours] = useState(false);

  useEffect(() => {
    if (pizzeria.openingHours) {
      const hours = parseOpeningHours(pizzeria.openingHours);
      setIsCurrentlyOpen(isOpen(hours));
      setTodayHours(getTodayHours(hours));
      setHasOpeningHours(true);
    } else {
      setHasOpeningHours(false);
    }
  }, [pizzeria.openingHours]);

  const hasPriorityBadge = pizzeria.priorityLevel === 'niveau_2' || pizzeria.priorityLevel === 'niveau_1';

  const getCardClassName = () => {
    const baseClasses = "rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden";
    if (pizzeria.priorityLevel === 'niveau_2') {
      return `${baseClasses} bg-gradient-to-br from-white via-purple-50 to-indigo-50 border-4 border-double border-purple-400 shadow-2xl hover:shadow-purple-300/60 ring-2 ring-purple-200`;
    }
    if (pizzeria.priorityLevel === 'niveau_1') {
      return `${baseClasses} bg-gradient-to-br from-white via-amber-50 to-yellow-50 border-2 border-amber-300 shadow-xl hover:shadow-amber-200/40`;
    }
    return `${baseClasses} bg-white`;
  };

  const getPriceRangeStyle = () => {
    if (pizzeria.priorityLevel === 'niveau_2') {
      return 'bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-400 text-purple-800 font-bold';
    }
    if (pizzeria.priorityLevel === 'niveau_1') {
      return 'bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-400 text-amber-800 font-bold';
    }
    return 'bg-white text-yellow-600';
  };

  return (
    <div className={getCardClassName()}>
      <div className="relative h-40 overflow-hidden bg-gray-200">
        <OptimizedPizzeriaImage
          imageUrl={pizzeria.image}
          name={pizzeria.name}
          className="w-full h-full object-cover"
        />
        <div className={`absolute top-3 right-3 rounded-full px-2 py-1 shadow-lg ${getPriceRangeStyle()}`}>
          <span className="font-bold text-sm">{pizzeria.priceRange}</span>
        </div>
        {pizzeria.halal && (
          <div className="absolute bottom-3 right-3 bg-black text-white rounded-lg px-3 py-1.5 shadow-xl border-2 border-white/20 backdrop-blur-sm">
            <span className="font-bold text-sm tracking-wide">HALAL</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-semibold">{pizzeria.rating}</span>
            <span className="text-white/80 text-xs">({pizzeria.reviews})</span>
          </div>
          {pizzeria.reviewsLink && (
            <button
              onClick={() => window.open(pizzeria.reviewsLink, '_blank')}
              className="bg-blue-600/80 backdrop-blur-sm hover:bg-blue-700/80 text-white rounded-lg px-2 py-1 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <MessageSquare className="h-3 w-3" />
              Avis
            </button>
          )}
        </div>
        <PriorityBadge priorityLevel={pizzeria.priorityLevel} pizzeriaName={pizzeria.name} />
        <ServiceBadge types={pizzeria.types} hasPriorityBadge={hasPriorityBadge} />
      </div>
      <div className="p-4">
        <PizzeriaInfo
          name={pizzeria.name}
          isCurrentlyOpen={isCurrentlyOpen}
          todayHours={todayHours}
          hasOpeningHours={hasOpeningHours}
          address={pizzeria.address}
          priorityLevel={pizzeria.priorityLevel}
        />
        <PizzeriaActions
          phone={pizzeria.phone}
          googleMapsLink={pizzeria.googleMapsLink}
          priorityLevel={pizzeria.priorityLevel}
          pizzeriaName={pizzeria.name}
        />
      </div>
    </div>
  );
}
