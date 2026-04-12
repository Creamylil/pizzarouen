interface ServiceBadgeProps {
  types: ('sur-place' | 'emporter' | 'livraison')[];
  hasPriorityBadge: boolean;
}

export default function ServiceBadge({ types, hasPriorityBadge }: ServiceBadgeProps) {
  const getServiceConfig = (type: string) => {
    switch (type) {
      case 'sur-place':
        return { label: 'Sur place', color: 'bg-white/90 text-gray-800' };
      case 'emporter':
        return { label: 'À emporter', color: 'bg-white/90 text-gray-800' };
      case 'livraison':
        return { label: 'Livraison', color: 'bg-white/90 text-gray-800' };
      default:
        return { label: type, color: 'bg-white/90 text-gray-800' };
    }
  };

  if (types.length === 0) return null;

  return (
    <div className={`absolute ${hasPriorityBadge ? 'top-12' : 'top-3'} left-3 flex flex-wrap gap-1`}>
      {types.map((type, index) => {
        const config = getServiceConfig(type);
        return (
          <div
            key={index}
            className={`${config.color} backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[10px] font-semibold shadow-sm`}
          >
            {config.label}
          </div>
        );
      })}
    </div>
  );
}
