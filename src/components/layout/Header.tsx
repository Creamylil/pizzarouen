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
  heroImageUrl?: string | null;
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
  cityName = "",
  heroImageUrl,
  sectors = [],
  pizzerias = [],
}: HeaderProps) {
  const tabConfig = [
    { id: 'sur-place' as const, label: 'Sur place', icon: '🍽️' },
    { id: 'emporter' as const, label: 'À emporter', icon: '📦' },
    { id: 'livraison' as const, label: 'Livraison', icon: '🚚' },
  ];

  const handleLocalFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <header className="relative overflow-hidden bg-[#1a1a1a]" style={{ minHeight: '260px' }}>
      {/* Background: image if available, subtle pattern fallback */}
      {heroImageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url('${heroImageUrl}')` }}
          role="img"
          aria-label="Pizza background"
        />
      ) : (
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white text-center leading-tight tracking-tight">
            Pizzerias à {cityName}
            <span className="block text-base sm:text-lg font-medium text-white/60 mt-1 tracking-normal" style={{ fontFamily: 'var(--font-body)' }}>
              Ouvertes actuellement · 24h/24
            </span>
          </h1>
        </div>

        {/* Service tabs — clean pill style */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
          {tabConfig.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-sm font-semibold
                transition-all duration-200 border
                ${activeTab === tab.id
                  ? 'bg-white text-[#1a1a1a] border-white shadow-lg'
                  : 'bg-transparent text-white/80 border-white/20 hover:border-white/50 hover:text-white'
                }
              `}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <span className="text-base sm:text-lg leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Zone selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl mx-auto">
          {onZoneSelect && (
            <div className="flex-1">
              <ZoneSelector
                selectedZone={selectedZone}
                onZoneSelect={onZoneSelect}
                sectors={sectors}
                pizzerias={pizzerias}
              />
            </div>
          )}
        </div>

        <FilterBar filters={filters} onLocalFiltersChange={handleLocalFiltersChange} />
      </div>
    </header>
  );
}
