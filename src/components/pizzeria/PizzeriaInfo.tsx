import { MapPin, Clock } from 'lucide-react';

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
  const getNameStyle = () => {
    if (priorityLevel === 'niveau_2') return 'text-purple-800 font-bold text-lg';
    if (priorityLevel === 'niveau_1') return 'text-amber-800 font-bold text-lg';
    return 'text-gray-800 font-semibold text-lg';
  };

  return (
    <div className="mb-3">
      <p className={`${getNameStyle()} mb-2 leading-tight`}>
        {name}
        {distance && (
          <span className="text-sm text-gray-500 ml-2">
            ({distance.toFixed(1)} km)
          </span>
        )}
      </p>

      {hasOpeningHours && (
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${isCurrentlyOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className={`text-sm font-medium ${isCurrentlyOpen ? 'text-green-700' : 'text-red-700'}`}>
              {isCurrentlyOpen ? 'Ouvert' : 'Fermé'}
            </span>
            {todayHours && (
              <span className="text-sm text-gray-600">
                • {todayHours}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-sm text-gray-600">
        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
        <span className="leading-relaxed">{address}</span>
      </div>
    </div>
  );
}
