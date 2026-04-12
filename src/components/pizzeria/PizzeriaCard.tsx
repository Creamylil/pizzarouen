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

  const isPremium = pizzeria.priorityLevel === 'niveau_2';
  const isFeatured = pizzeria.priorityLevel === 'niveau_1';

  const getCardBorder = () => {
    if (isPremium) return 'ring-2 ring-purple-400/60';
    if (isFeatured) return 'ring-1 ring-amber-300/60';
    return '';
  };

  return (
    <div className={`bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300 ${getCardBorder()}`}>
      {/* Image section */}
      <div className="relative h-44 overflow-hidden bg-muted">
        <OptimizedPizzeriaImage
          imageUrl={pizzeria.image}
          name={pizzeria.name}
          className="w-full h-full object-cover"
        />

        {/* Price badge — top right */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-md px-2 py-0.5 shadow-sm">
          <span className="font-bold text-sm text-foreground">{pizzeria.priceRange}</span>
        </div>

        {/* Halal badge — bottom right */}
        {pizzeria.halal && (
          <div className="absolute bottom-3 right-3 bg-emerald-700 text-white rounded-md px-2.5 py-1 shadow-sm">
            <span className="font-bold text-xs tracking-wide uppercase">Halal</span>
          </div>
        )}

        {/* Rating — bottom left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <div className="bg-black/70 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-400 fill-current" />
            <span className="text-white text-xs font-semibold">{pizzeria.rating}</span>
            <span className="text-white/60 text-xs">({pizzeria.reviews})</span>
          </div>
          {pizzeria.reviewsLink && (
            <button
              onClick={() => window.open(pizzeria.reviewsLink, '_blank')}
              className="bg-black/70 backdrop-blur-sm hover:bg-black/80 text-white rounded-md px-2 py-1 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <MessageSquare className="h-3 w-3" />
              Avis
            </button>
          )}
        </div>

        {/* Priority badge — top left */}
        <PriorityBadge priorityLevel={pizzeria.priorityLevel} pizzeriaName={pizzeria.name} />

        {/* Service badges */}
        <ServiceBadge types={pizzeria.types} hasPriorityBadge={isPremium || isFeatured} />
      </div>

      {/* Content section */}
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
