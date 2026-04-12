interface ServiceBadgeProps {
  types: ('sur-place' | 'emporter' | 'livraison')[];
  hasPriorityBadge: boolean;
}

export default function ServiceBadge({ types, hasPriorityBadge }: ServiceBadgeProps) {
  const getServiceConfig = (type: string) => {
    switch (type) {
      case 'sur-place':
        return { label: 'Sur place', color: 'bg-blue-500 text-white' };
      case 'emporter':
        return { label: 'À emporter', color: 'bg-green-500 text-white' };
      case 'livraison':
        return { label: 'Livraison', color: 'bg-orange-500 text-white' };
      default:
        return { label: type, color: 'bg-gray-500 text-white' };
    }
  };

  if (types.length === 0) return null;

  return (
    <div className={`absolute ${hasPriorityBadge ? 'top-16' : 'top-4'} left-4 flex flex-wrap gap-1`}>
      {types.map((type, index) => {
        const config = getServiceConfig(type);
        return (
          <div
            key={index}
            className={`${config.color} rounded-full px-2 py-1 text-xs font-semibold shadow-md`}
          >
            {config.label}
          </div>
        );
      })}
    </div>
  );
}
