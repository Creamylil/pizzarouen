import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PriorityBadgeProps {
  priorityLevel: 'normal' | 'niveau_1' | 'niveau_2';
  pizzeriaName: string;
}

export default function PriorityBadge({ priorityLevel, pizzeriaName }: PriorityBadgeProps) {
  if (priorityLevel === 'niveau_2') {
    return (
      <div className="absolute top-4 left-4 z-10">
        <Badge className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-3 py-1 text-xs font-bold shadow-xl border-2 border-purple-400 flex items-center gap-1">
          ❤️ Notre coup de cœur
        </Badge>
      </div>
    );
  }
  
  if (priorityLevel === 'niveau_1') {
    return (
      <div className="absolute top-4 left-4 z-10">
        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-3 py-1 text-xs font-bold shadow-lg border border-amber-400 flex items-center gap-1">
          <Crown className="h-3 w-3" />
          ⭐ Sélection premium
        </Badge>
      </div>
    );
  }
  
  return null;
}
