'use client';

import { useRouter } from 'next/navigation';
import { Phone, MapPin, Eye } from 'lucide-react';

interface PizzeriaActionsProps {
  phone: string;
  googleMapsLink?: string;
  priorityLevel: 'normal' | 'niveau_1' | 'niveau_2';
  pizzeriaName: string;
}

export default function PizzeriaActions({
  phone,
  googleMapsLink,
  priorityLevel,
  pizzeriaName
}: PizzeriaActionsProps) {
  const router = useRouter();

  const getButtonStyle = () => {
    if (priorityLevel === 'niveau_2') {
      return 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-purple-300/50';
    }
    if (priorityLevel === 'niveau_1') {
      return 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-lg hover:shadow-amber-300/50';
    }
    return 'bg-blue-600 hover:bg-blue-700 text-white';
  };

  const handleCall = () => {
    if (phone) window.open(`tel:${phone}`, '_self');
  };

  const handleDirections = () => {
    if (googleMapsLink) window.open(googleMapsLink, '_blank');
  };

  const handleViewDetails = () => {
    const nameLower = pizzeriaName.toLowerCase();
    
    if (nameLower.includes("domino's") && nameLower.includes("rouen") && !nameLower.includes("sotteville")) {
      router.push('/dominos-pizza-rouen-centre');
    } else if (nameLower.includes("papa pizz")) {
      router.push('/sotteville-les-rouen/papa-pizz');
    } else if (nameLower.includes("lp pizza")) {
      router.push('/sotteville-les-rouen/lp-pizza');
    } else if (nameLower.includes("domino's") && nameLower.includes("sotteville")) {
      router.push('/sotteville-les-rouen/dominos-pizza');
    } else if (nameLower.includes("shop pizza")) {
      router.push('/le-petit-quevilly/shop-pizza');
    } else if (nameLower.includes("06 pizza")) {
      router.push('/le-petit-quevilly/06-pizza');
    } else if (nameLower.includes("pizza max")) {
      router.push('/le-petit-quevilly/pizza-max');
    } else if (nameLower.includes("del arte")) {
      router.push('/le-grand-quevilly/del-arte');
    } else if (nameLower.includes("izakaya")) {
      router.push('/le-grand-quevilly/izakaya');
    } else if (nameLower.includes("bourg station")) {
      router.push('/le-grand-quevilly/bourg-station');
    } else if (nameLower.includes("le refuge")) {
      router.push('/le-grand-quevilly/le-refuge');
    } else if (nameLower.includes("3 brasseurs") || nameLower.includes("brasseurs")) {
      router.push('/le-grand-quevilly/3-brasseurs-rouen');
    } else if (nameLower.includes("flash pizza")) {
      router.push('/le-grand-quevilly/flash-pizza');
    } else if (nameLower.includes("le b76") || nameLower.includes("b76")) {
      router.push('/bihorel/le-b76');
    } else if (nameLower.includes("le bibi") || nameLower.includes("bibi")) {
      router.push('/bihorel/le-bibi');
    } else if (nameLower.includes("l'arrêt pizza") || nameLower.includes("arret pizza")) {
      router.push('/bihorel/larret-pizza');
    }
  };

  const hasDetailPage = () => {
    const nameLower = pizzeriaName.toLowerCase();
    return (
      (nameLower.includes("domino's") && nameLower.includes("rouen") && !nameLower.includes("sotteville")) ||
      nameLower.includes("papa pizz") ||
      nameLower.includes("lp pizza") ||
      (nameLower.includes("domino's") && nameLower.includes("sotteville")) ||
      nameLower.includes("shop pizza") ||
      nameLower.includes("06 pizza") ||
      nameLower.includes("pizza max") ||
      nameLower.includes("del arte") ||
      nameLower.includes("izakaya") ||
      nameLower.includes("bourg station") ||
      nameLower.includes("le refuge") ||
      nameLower.includes("3 brasseurs") ||
      nameLower.includes("brasseurs") ||
      nameLower.includes("flash pizza") ||
      nameLower.includes("le b76") ||
      nameLower.includes("b76") ||
      nameLower.includes("le bibi") ||
      nameLower.includes("bibi") ||
      nameLower.includes("l'arrêt pizza") ||
      nameLower.includes("arret pizza")
    );
  };

  return (
    <div className="flex gap-2">
      {phone && (
        <button
          onClick={handleCall}
          className={`flex-1 ${getButtonStyle()} px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1`}
        >
          <Phone className="h-4 w-4" />
          Appeler
        </button>
      )}
      {googleMapsLink && (
        <button
          onClick={handleDirections}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1"
        >
          <MapPin className="h-4 w-4" />
          Y aller
        </button>
      )}
      {hasDetailPage() && (
        <button
          onClick={handleViewDetails}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1"
        >
          <Eye className="h-4 w-4" />
          Voir
        </button>
      )}
    </div>
  );
}
