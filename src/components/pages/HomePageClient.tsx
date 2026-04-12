'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PizzeriaCard from '@/components/pizzeria/PizzeriaCard';
import Header from '@/components/layout/Header';
import EmptyState from '@/components/states/EmptyState';
import { Map, X } from 'lucide-react';
import type { Pizzeria, GeographicSector, Filters } from '@/types/pizzeria';
import type { ZoneDefinition } from '@/utils/geographicRanking';
import { parseOpeningHours, isOpen } from '@/utils/openingHours';
import { findZoneBySector, rankPizzeriasByGeography } from '@/utils/geographicRanking';
import { extractPostalCode } from '@/utils/postalCodeUtils';

const PizzeriaMap = dynamic(() => import('@/components/map/PizzeriaMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-muted rounded-xl animate-pulse" />,
});

interface HomePageClientProps {
  pizzerias: Pizzeria[];
  sectors: GeographicSector[];
  initialSector?: string | null;
  mainPostalCodes: string[];
  defaultSectorSlug: string;
  cityName: string;
  heroImageUrl?: string | null;
  centerCoords: [number, number];
}

export default function HomePageClient({
  pizzerias,
  sectors,
  initialSector,
  mainPostalCodes,
  defaultSectorSlug,
  cityName,
  heroImageUrl,
  centerCoords,
}: HomePageClientProps) {
  const [activeTab, setActiveTab] = useState<'sur-place' | 'emporter' | 'livraison' | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState<Filters>({
    priceRange: '',
    rating: 0,
    sector: defaultSectorSlug,
    halalOnly: false,
    showTop10: false,
  });
  const [selectedZone, setSelectedZone] = useState<ZoneDefinition | null>(null);

  const handleZoneSelect = (zone: ZoneDefinition | null) => {
    setSelectedZone(zone);
    if (!zone) {
      setFilters(prev => ({ ...prev, sector: defaultSectorSlug }));
    }
  };

  useEffect(() => {
    const sectorFromUrl = initialSector;
    if (!sectorFromUrl || sectorFromUrl === 'undefined' || sectorFromUrl.trim() === '') {
      setFilters(prev => ({ ...prev, sector: defaultSectorSlug }));
      if (sectors.length > 0) {
        const defaultZone = findZoneBySector(sectors, defaultSectorSlug);
        setSelectedZone(defaultZone);
      }
      return;
    }
    if (sectors.length > 0) {
      const sectorExists = sectors.some(sector => sector.slug === sectorFromUrl || sector.postal_code === sectorFromUrl);
      if (sectorExists) {
        setFilters(prev => ({ ...prev, sector: sectorFromUrl }));
        const correspondingZone = findZoneBySector(sectors, sectorFromUrl);
        setSelectedZone(correspondingZone);
      } else {
        setFilters(prev => ({ ...prev, sector: defaultSectorSlug }));
      }
    } else {
      setFilters(prev => ({ ...prev, sector: sectorFromUrl }));
    }
  }, [initialSector, sectors, defaultSectorSlug]);

  const validServiceTypes: string[] = ['sur-place', 'emporter', 'livraison'];

  const { localOpenPizzerias, nearbyOpenPizzerias, closedPizzerias } = useMemo(() => {
    let filtered = pizzerias.filter(pizzeria => {
      // Si un onglet est actif, ne filtrer que les pizzerias qui ont des types de service renseignés
      // Les pizzerias sans types de service valides (ex: importées par script) restent visibles
      if (activeTab) {
        const hasServiceInfo = pizzeria.types.some(t => validServiceTypes.includes(t));
        if (hasServiceInfo && !pizzeria.types.includes(activeTab)) return false;
      }
      if (filters.priceRange && pizzeria.priceRange !== filters.priceRange) return false;
      if (filters.rating && pizzeria.rating < filters.rating) return false;
      if (filters.halalOnly && !pizzeria.halal) return false;
      return true;
    });

    const selectedSector = sectors.find(s => s.slug === filters.sector || s.postal_code === filters.sector);
    const sectorPostalCode = selectedSector?.postal_code || filters.sector;

    const localOpen: Pizzeria[] = [];
    const nearbyOpen: Pizzeria[] = [];
    const closed: Pizzeria[] = [];

    filtered.forEach(pizzeria => {
      const pizzeriaPostalCode = extractPostalCode(pizzeria.address);
      const isMainSector = mainPostalCodes.includes(sectorPostalCode);
      const isLocal = isMainSector
        ? mainPostalCodes.includes(pizzeriaPostalCode || '')
        : pizzeriaPostalCode === sectorPostalCode;
      const pizzeriaOpen = pizzeria.openingHours ? isOpen(parseOpeningHours(pizzeria.openingHours)) : false;

      if (isLocal && pizzeriaOpen) {
        localOpen.push(pizzeria);
      } else if (!isLocal && pizzeriaOpen) {
        nearbyOpen.push(pizzeria);
      } else {
        const shouldShowClosed = isMainSector ? mainPostalCodes.includes(pizzeriaPostalCode || '') : true;
        if (shouldShowClosed) {
          closed.push(pizzeria);
        }
      }
    });

    const sortPizzerias = (list: Pizzeria[]) => {
      if (filters.sector && sectors.length > 0) {
        const zone = findZoneBySector(sectors, filters.sector);
        if (zone) return rankPizzeriasByGeography(list, zone, sectors);
      }
      return list.sort((a, b) => {
        const priorityOrder: Record<string, number> = { niveau_2: 300, niveau_1: 200, normal: 100 };
        const diff = (priorityOrder[b.priorityLevel] || 100) - (priorityOrder[a.priorityLevel] || 100);
        return diff !== 0 ? diff : (b.rating || 0) - (a.rating || 0);
      });
    };

    return {
      localOpenPizzerias: sortPizzerias([...localOpen]),
      nearbyOpenPizzerias: sortPizzerias([...nearbyOpen]),
      closedPizzerias: sortPizzerias([...closed]),
    };
  }, [activeTab, filters, pizzerias, sectors, mainPostalCodes]);

  const top10Pizzerias = useMemo(() => {
    const mainPizzerias = pizzerias.filter(pizzeria => {
      const pc = extractPostalCode(pizzeria.address);
      return mainPostalCodes.includes(pc || '');
    });
    const sorted = mainPizzerias.sort((a, b) => {
      const priorityOrder: Record<string, number> = { niveau_2: 300, niveau_1: 200, normal: 100 };
      const aPriority = priorityOrder[a.priorityLevel] || 100;
      const bPriority = priorityOrder[b.priorityLevel] || 100;
      if (aPriority >= 200 || bPriority >= 200) {
        if (aPriority !== bPriority) return bPriority - aPriority;
        return (b.rating || 0) - (a.rating || 0);
      }
      const aIsOpen = a.openingHours ? isOpen(parseOpeningHours(a.openingHours)) : false;
      const bIsOpen = b.openingHours ? isOpen(parseOpeningHours(b.openingHours)) : false;
      if (aIsOpen !== bIsOpen) return bIsOpen ? 1 : -1;
      return (b.rating || 0) - (a.rating || 0);
    });
    return sorted.slice(0, 10);
  }, [pizzerias, mainPostalCodes]);

  const mapFilteredPizzerias = useMemo(() => {
    if (filters.showTop10) return top10Pizzerias;
    return pizzerias.filter(pizzeria => {
      if (activeTab) {
        const hasServiceInfo = pizzeria.types.some(t => validServiceTypes.includes(t));
        if (hasServiceInfo && !pizzeria.types.includes(activeTab)) return false;
      }
      if (filters.priceRange && pizzeria.priceRange !== filters.priceRange) return false;
      if (filters.rating && pizzeria.rating < filters.rating) return false;
      if (filters.halalOnly && !pizzeria.halal) return false;
      return true;
    });
  }, [pizzerias, activeTab, filters, top10Pizzerias]);

  const hasLocalOpenHalalPizzerias = useMemo(() => {
    if (!filters.halalOnly) return true;
    return localOpenPizzerias.some(p => p.halal);
  }, [filters.halalOnly, localOpenPizzerias]);

  return (
    <>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filters={filters}
        setFilters={setFilters}
        selectedZone={selectedZone}
        onZoneSelect={handleZoneSelect}
        sectors={sectors}
        pizzerias={pizzerias}
        cityName={cityName}
        heroImageUrl={heroImageUrl}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Map toggle */}
        {viewMode === 'list' && mapFilteredPizzerias.length > 0 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setViewMode('map')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <Map className="h-4 w-4" />
              Voir sur la carte
            </button>
          </div>
        )}

        {/* Map view */}
        {viewMode === 'map' && (
          <div className="mb-8">
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setViewMode('list')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <X className="h-4 w-4" />
                Fermer la carte
              </button>
            </div>
            <PizzeriaMap
              pizzerias={mapFilteredPizzerias}
              center={selectedZone ? [selectedZone.center.lat, selectedZone.center.lng] : centerCoords}
              zoom={selectedZone ? 14 : 13}
            />
          </div>
        )}

        {/* Halal empty state */}
        {filters.halalOnly && !hasLocalOpenHalalPizzerias && (
          <div className="flex justify-center mb-8">
            <div className="bg-amber-50 border border-amber-200 text-amber-900 px-6 py-4 rounded-lg text-center max-w-md">
              <p className="font-semibold text-sm">Aucune pizzeria Halal ouverte en ce moment</p>
              <p className="text-xs mt-1 text-amber-700">Les pizzerias Halal fermées sont affichées ci-dessous</p>
            </div>
          </div>
        )}

        {/* Top 10 section — when filter active */}
        {filters.showTop10 && top10Pizzerias.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              count={top10Pizzerias.length}
              title={`Meilleures Pizzerias à ${cityName}`}
              variant="gold"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {top10Pizzerias.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </section>
        )}

        {/* Local open pizzerias */}
        {localOpenPizzerias.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              count={localOpenPizzerias.length}
              title={`Pizzeria${localOpenPizzerias.length > 1 ? 's' : ''} Ouverte${localOpenPizzerias.length > 1 ? 's' : ''} Actuellement`}
              variant="green"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {localOpenPizzerias.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </section>
        )}

        {/* Top 10 section — when filter NOT active */}
        {!filters.showTop10 && top10Pizzerias.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              count={top10Pizzerias.length}
              title={`Meilleures Pizzerias à ${cityName}`}
              variant="gold"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {top10Pizzerias.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </section>
        )}

        {/* Nearby open pizzerias */}
        {nearbyOpenPizzerias.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              count={nearbyOpenPizzerias.length}
              title={`Pizzeria${nearbyOpenPizzerias.length > 1 ? 's' : ''} Ouverte${nearbyOpenPizzerias.length > 1 ? 's' : ''} à Proximité`}
              variant="blue"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {nearbyOpenPizzerias.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </section>
        )}

        {/* Closed pizzerias */}
        {closedPizzerias.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              count={closedPizzerias.length}
              title={`Pizzeria${closedPizzerias.length > 1 ? 's' : ''} Fermée${closedPizzerias.length > 1 ? 's' : ''}`}
              variant="gray"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-70">
              {closedPizzerias.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </section>
        )}

        {localOpenPizzerias.length === 0 && nearbyOpenPizzerias.length === 0 && closedPizzerias.length === 0 && <EmptyState />}
      </div>
    </>
  );
}

/* ─── Section header component ─── */

interface SectionHeaderProps {
  count: number;
  title: string;
  variant: 'green' | 'gold' | 'blue' | 'gray';
}

function SectionHeader({ count, title, variant }: SectionHeaderProps) {
  const variantStyles = {
    green: {
      pill: 'bg-emerald-600 text-white',
      border: 'border-emerald-600',
    },
    gold: {
      pill: 'bg-amber-500 text-white',
      border: 'border-amber-500',
    },
    blue: {
      pill: 'bg-blue-600 text-white',
      border: 'border-blue-600',
    },
    gray: {
      pill: 'bg-gray-400 text-white',
      border: 'border-gray-400',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${style.pill}`}>
        {count}
      </span>
      <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
        {title}
      </h2>
    </div>
  );
}
