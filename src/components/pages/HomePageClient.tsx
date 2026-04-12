'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import PizzeriaCard from '@/components/pizzeria/PizzeriaCard';
import Header from '@/components/layout/Header';
import EmptyState from '@/components/states/EmptyState';
import MapViewToggle from '@/components/map/MapViewToggle';
import { Button } from '@/components/ui/button';
import { X, ArrowRight } from 'lucide-react';
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
}

export default function HomePageClient({ pizzerias, sectors }: HomePageClientProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'sur-place' | 'emporter' | 'livraison' | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState<Filters>({
    priceRange: '',
    rating: 0,
    sector: '76000',
    halalOnly: false,
    showTop10: false,
  });
  const [selectedZone, setSelectedZone] = useState<ZoneDefinition | null>(null);

  const handleZoneSelect = (zone: ZoneDefinition | null) => {
    setSelectedZone(zone);
    if (!zone) {
      setFilters(prev => ({ ...prev, sector: '76000' }));
    }
  };

  useEffect(() => {
    const sectorFromUrl = searchParams.get('sector');
    if (!sectorFromUrl || sectorFromUrl === 'undefined' || sectorFromUrl.trim() === '') {
      setFilters(prev => ({ ...prev, sector: '76000' }));
      if (sectors.length > 0) {
        const defaultZone = findZoneBySector(sectors, '76000');
        setSelectedZone(defaultZone);
      }
      return;
    }
    if (sectorFromUrl && sectorFromUrl !== 'undefined' && sectorFromUrl.trim() !== '') {
      if (sectors.length > 0) {
        const sectorExists = sectors.some(sector => sector.slug === sectorFromUrl || sector.postal_code === sectorFromUrl);
        if (sectorExists) {
          setFilters(prev => ({ ...prev, sector: sectorFromUrl }));
          const correspondingZone = findZoneBySector(sectors, sectorFromUrl);
          setSelectedZone(correspondingZone);
        } else {
          setFilters(prev => ({ ...prev, sector: '76000' }));
        }
      } else {
        setFilters(prev => ({ ...prev, sector: sectorFromUrl }));
      }
    }
  }, [searchParams, sectors]);

  const { localOpenPizzerias, nearbyOpenPizzerias, closedPizzerias } = useMemo(() => {
    let filtered = pizzerias.filter(pizzeria => {
      if (activeTab && !pizzeria.types.includes(activeTab)) return false;
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
      const rouenPostalCodes = ['76000', '76100'];
      const isRouenSector = rouenPostalCodes.includes(sectorPostalCode);
      const isLocal = isRouenSector
        ? rouenPostalCodes.includes(pizzeriaPostalCode || '')
        : pizzeriaPostalCode === sectorPostalCode;
      const pizzeriaOpen = pizzeria.openingHours ? isOpen(parseOpeningHours(pizzeria.openingHours)) : false;

      if (isLocal && pizzeriaOpen) {
        localOpen.push(pizzeria);
      } else if (!isLocal && pizzeriaOpen) {
        nearbyOpen.push(pizzeria);
      } else {
        const shouldShowClosed = isRouenSector ? rouenPostalCodes.includes(pizzeriaPostalCode || '') : true;
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
  }, [activeTab, filters, pizzerias, sectors]);

  const top10Pizzerias = useMemo(() => {
    const rouenPostalCodes = ['76000', '76100'];
    const rouenPizzerias = pizzerias.filter(pizzeria => {
      const pc = extractPostalCode(pizzeria.address);
      return rouenPostalCodes.includes(pc || '');
    });
    const sorted = rouenPizzerias.sort((a, b) => {
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
  }, [pizzerias]);

  const mapFilteredPizzerias = useMemo(() => {
    if (filters.showTop10) return top10Pizzerias;
    return pizzerias.filter(pizzeria => {
      if (activeTab && !pizzeria.types.includes(activeTab)) return false;
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
      />

      <div className="max-w-7xl mx-auto py-0 px-0">
        {viewMode === 'map' && (
          <div className="mb-8">
            <div className="justify-end mb-2 pt-[3px] flex flex-col">
              <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className="bg-secondary text-primary text-lg">
                <X className="h-4 w-4 mr-1" />
                Fermer la carte
              </Button>
            </div>
            <PizzeriaMap
              pizzerias={mapFilteredPizzerias}
              center={selectedZone ? [selectedZone.center.lat, selectedZone.center.lng] : [49.4432, 1.0999]}
              zoom={selectedZone ? 14 : 13}
            />
          </div>
        )}

        {filters.halalOnly && !hasLocalOpenHalalPizzerias && (
          <div className="flex justify-center mb-6 py-4">
            <div className="bg-amber-100 border border-amber-300 text-amber-800 px-6 py-3 rounded-lg shadow-sm text-center">
              <p className="font-medium text-base">Aucune pizzeria Halal ouverte en ce moment</p>
              <p className="text-sm mt-1 text-amber-700">Les pizzerias Halal fermées sont affichées ci-dessous</p>
            </div>
          </div>
        )}

        {viewMode === 'list' && mapFilteredPizzerias.length > 0 && (
          <div className="flex justify-center mb-6 py-0 pt-[8px] pb-[3px] bg-inherit">
            <Button variant="outline" onClick={() => setViewMode('map')} className="flex items-center gap-2 bg-secondary-foreground text-primary-foreground text-lg">
              <ArrowRight className="h-4 w-4" />
              Afficher la carte
            </Button>
          </div>
        )}

        {filters.showTop10 && top10Pizzerias.length > 0 && (
          <div className="mb-12">
            <div className="py-6 rounded-xl mb-6 px-0">
              <div className="text-center flex items-center justify-center gap-2">
                <p className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 text-white font-bold shadow-md m-0 text-lg">
                  {top10Pizzerias.length}
                </p>
                <h2 className="md:text-xl font-bold m-0 text-xl text-primary">Meilleures Pizzerias à Rouen</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {top10Pizzerias.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </div>
        )}

        {localOpenPizzerias.length > 0 && (
          <div className="mb-12 px-[10px] bg-inherit">
            <div className="py-6 px-4 pt-[24px] bg-inherit">
              <div className="text-center flex items-center justify-center gap-2">
                <p className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold shadow-md m-0 bg-[#1cb60b] text-xl">
                  {localOpenPizzerias.length}
                </p>
                <h2 className="text-lg font-bold m-0 text-primary md:text-3xl">
                  Pizzeria{localOpenPizzerias.length > 1 ? 's' : ''} Ouverte{localOpenPizzerias.length > 1 ? 's' : ''} Actuellement
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localOpenPizzerias.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </div>
        )}

        {!filters.showTop10 && top10Pizzerias.length > 0 && (
          <div className="mb-12">
            <div className="py-6 rounded-xl mb-6 px-0">
              <div className="text-center flex items-center justify-center gap-2">
                <p className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 text-white font-bold text-base shadow-md m-0">
                  {top10Pizzerias.length}
                </p>
                <h2 className="md:text-xl font-bold m-0 text-primary text-xl">Meilleures Pizzerias à Rouen</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {top10Pizzerias.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </div>
        )}

        {nearbyOpenPizzerias.length > 0 && (
          <div className="mb-12">
            <div className="bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 py-6 px-4 mb-6 shadow-sm border-0 rounded-xl">
              <div className="text-center flex items-center justify-center gap-2">
                <p className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-base shadow-md m-0">
                  {nearbyOpenPizzerias.length}
                </p>
                <h2 className="text-lg md:text-xl font-bold text-blue-900 dark:text-blue-100 m-0">
                  Pizzeria{nearbyOpenPizzerias.length > 1 ? 's' : ''} Ouverte{nearbyOpenPizzerias.length > 1 ? 's' : ''} à Proximité
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyOpenPizzerias.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </div>
        )}

        {closedPizzerias.length > 0 && (
          <div className="mb-12">
            <div className="bg-gray-100 dark:bg-gray-900/30 border-2 border-gray-200 dark:border-gray-700 py-6 px-4 rounded-xl mb-6 shadow-sm">
              <div className="text-center flex items-center justify-center gap-2">
                <p className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 text-white font-bold text-base shadow-md m-0">
                  {closedPizzerias.length}
                </p>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 m-0">
                  Pizzeria{closedPizzerias.length > 1 ? 's' : ''} Fermée{closedPizzerias.length > 1 ? 's' : ''}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedPizzerias.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </div>
        )}

        {localOpenPizzerias.length === 0 && nearbyOpenPizzerias.length === 0 && closedPizzerias.length === 0 && <EmptyState />}
      </div>
    </>
  );
}
