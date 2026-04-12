import { MapPin } from 'lucide-react';

interface PizzeriaInfoProps {
  name: string;
  reviewsLink?: string;
  isCurrentlyOpen: boolean;
  todayHours: string;
  hasOpeningHours: boolean;
  address: string;
  priorityLevel: 'normal' | 'niveau_1' | 'niveau_2';
  distance?: number;
}

export default function PizzeriaInfo({
  name,
  isCurrentlyOpen,
  todayHours,
  hasOpeningHours,
  address,
  priorityLevel,
  distance
}: PizzeriaInfoProps) {
  return (
    <div className="mb-3">
      <p className="text-base font-bold text-card-foreground mb-1.5 leading-snug" style={{ fontFamily: 'var(--font-body)' }}>
        {name}
        {distance && (
          <span className="text-sm text-muted-foreground font-normal ml-2">
            ({distance.toFixed(1)} km)
          </span>
        )}
      </p>

      {hasOpeningHours && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${isCurrentlyOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className={`text-xs font-semibold ${isCurrentlyOpen ? 'text-emerald-700' : 'text-red-600'}`}>
            {isCurrentlyOpen ? 'Ouvert' : 'Fermé'}
          </span>
          {todayHours && (
            <span className="text-xs text-muted-foreground">
              · {todayHours}
            </span>
          )}
        </div>
      )}

      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <span className="leading-relaxed">{address}</span>
      </div>
    </div>
  );
}
