'use client';

import { Phone, Navigation } from 'lucide-react';

interface PizzeriaActionsProps {
  phone: string;
  googleMapsLink?: string;
  priorityLevel: 'normal' | 'niveau_1' | 'niveau_2';
  pizzeriaName: string;
}

export default function PizzeriaActions({
  phone,
  googleMapsLink,
}: PizzeriaActionsProps) {
  const handleCall = () => {
    if (phone) window.open(`tel:${phone}`, '_self');
  };

  const handleDirections = () => {
    if (googleMapsLink) window.open(googleMapsLink, '_blank');
  };

  return (
    <div className="flex gap-2">
      {phone && (
        <button
          onClick={handleCall}
          className="flex-1 bg-foreground text-background px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 hover:opacity-90"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <Phone className="h-3.5 w-3.5" />
          Appeler
        </button>
      )}
      {googleMapsLink && (
        <button
          onClick={handleDirections}
          className="flex-1 bg-muted text-foreground px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 hover:bg-border"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <Navigation className="h-3.5 w-3.5" />
          Y aller
        </button>
      )}
    </div>
  );
}
