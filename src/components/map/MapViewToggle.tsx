'use client';

import { Map, List } from 'lucide-react';

interface MapViewToggleProps {
  showMap: boolean;
  onToggle: () => void;
}

export default function MapViewToggle({ showMap, onToggle }: MapViewToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 text-sm font-medium text-gray-700"
    >
      {showMap ? (
        <>
          <List className="h-4 w-4" />
          Vue liste
        </>
      ) : (
        <>
          <Map className="h-4 w-4" />
          Vue carte
        </>
      )}
    </button>
  );
}
