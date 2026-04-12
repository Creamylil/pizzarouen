interface PriorityBadgeProps {
  priorityLevel: 'normal' | 'niveau_1' | 'niveau_2';
  pizzeriaName: string;
}

export default function PriorityBadge({ priorityLevel }: PriorityBadgeProps) {
  if (priorityLevel === 'niveau_2') {
    return (
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-purple-700 text-white px-2.5 py-1 text-[10px] font-bold rounded-md shadow-sm flex items-center gap-1 uppercase tracking-wide">
          ❤️ Coup de cœur
        </div>
      </div>
    );
  }

  if (priorityLevel === 'niveau_1') {
    return (
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-amber-600 text-white px-2.5 py-1 text-[10px] font-bold rounded-md shadow-sm flex items-center gap-1 uppercase tracking-wide">
          ⭐ Sélection premium
        </div>
      </div>
    );
  }

  return null;
}
