'use client';

import type { ZoneDefinition } from '@/utils/geographicRanking';
import type { Pizzeria, GeographicSector, Filters } from '@/types/pizzeria';
import FilterBar from '@/components/filters/FilterBar';
import ZoneSelector from '@/components/filters/ZoneSelector';

interface HeaderProps {
  activeTab: 'sur-place' | 'emporter' | 'livraison' | null;
  setActiveTab: (tab: 'sur-place' | 'emporter' | 'livraison') => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  selectedZone?: ZoneDefinition | null;
  onZoneSelect?: (zone: ZoneDefinition | null) => void;
  cityName?: string;
  sectors?: GeographicSector[];
  pizzerias?: Pizzeria[];
}

export default function Header({
  activeTab,
  setActiveTab,
  filters,
  setFilters,
  selectedZone = null,
  onZoneSelect,
  cityName = "Rouen",
  sectors = [],
  pizzerias = [],
}: HeaderProps) {
  const tabConfig = [
    { id: 'sur-place' as const, label: 'Pizza sur place', icon: '🍽️' },
    { id: 'emporter' as const, label: 'Pizza à emporter', icon: '📦' },
    { id: 'livraison' as const, label: 'Pizza livraison', icon: '🚚' },
  ];

  const handleLocalFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <header className="relative overflow-hidden" style={{ minHeight: '280px' }}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/lovable-uploads/2f182011-29ef-45c7-9902-164fe4326b49.png')",
          filter: 'brightness(0.85)',
          zIndex: 0,
        }}
        role="img"
        aria-label="Pizza background"
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" style={{ zIndex: 1 }}></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-3" style={{ zIndex: 2 }}>
        <div className="mb-4 pt-8">
          <h1 className="sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg text-center leading-tight mb-6 text-3xl">
            Pizzerias à {cityName} Ouvertes actuellement (24h/24)
          </h1>
          <div className="grid grid-cols-3 gap-1 xs:gap-2 sm:gap-3 max-w-3xl mx-auto">
            {tabConfig.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative p-3 sm:p-4 rounded-xl font-bold transition-all duration-300 shadow-lg ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-2xl scale-105 ring-4 ring-white/30'
                    : 'bg-white/95 text-gray-700 hover:bg-white border-2 border-transparent hover:border-red-300 backdrop-blur-sm'
                }`}
              >
                <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2 justify-center">
                  <div className="text-xl sm:text-2xl md:text-xl">{tab.icon}</div>
                  <div className="text-center md:text-left">
                    <h2 className="text-xs sm:text-base md:text-sm font-bold leading-tight">{tab.label}</h2>
                  </div>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-400 to-red-600 opacity-20 animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {onZoneSelect && (
          <div className="mb-4">
            <ZoneSelector
              selectedZone={selectedZone}
              onZoneSelect={onZoneSelect}
              sectors={sectors}
              pizzerias={pizzerias}
            />
          </div>
        )}

        <div className="mt-4">
          <FilterBar filters={filters} onLocalFiltersChange={handleLocalFiltersChange} />
        </div>
      </div>
    </header>
  );
}
