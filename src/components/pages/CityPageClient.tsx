'use client';

import { useState, useMemo } from 'react';
import PizzeriaCard from '@/components/pizzeria/PizzeriaCard';
import Header from '@/components/layout/Header';
import EmptyState from '@/components/states/EmptyState';
import BreadcrumbNavigation from '@/components/layout/BreadcrumbNavigation';
import type { Pizzeria, GeographicSector, Filters } from '@/types/pizzeria';
import type { ZoneDefinition } from '@/utils/geographicRanking';
import { parseOpeningHours, isOpen } from '@/utils/openingHours';
import { getCityCoordinatesFromAddress, haversineDistance } from '@/utils/distanceCalculator';
import { extractPostalCode } from '@/utils/postalCodeUtils';

interface CityPageClientProps {
  pizzerias: Pizzeria[];
  sectors: GeographicSector[];
  cityName: string;
  cityPostalCode: string;
  cityCoords: { lat: number; lng: number };
}

export default function CityPageClient({ pizzerias, sectors, cityName, cityPostalCode, cityCoords }: CityPageClientProps) {
  const [activeTab, setActiveTab] = useState<'sur-place' | 'emporter' | 'livraison' | null>(null);
  const [filters, setFilters] = useState<Filters>({
    priceRange: '',
    rating: 0,
    sector: cityPostalCode,
    halalOnly: false,
    showTop10: false,
  });

  const handleZoneSelect = (zone: ZoneDefinition | null) => {};

  const getSortPriority = (pizzeria: Pizzeria, distance: number) => {
    const hasHours = !!pizzeria.openingHours;
    const isCurrentlyOpen = hasHours ? isOpen(parseOpeningHours(pizzeria.openingHours!)) : false;
    const isInSameCity = pizzeria.address.toLowerCase().includes(cityName.toLowerCase());
    
    let locationPriority = isInSameCity ? 1000000 : Math.max(0, 10000 - Math.round(distance * 1000));
    const openPriority = isCurrentlyOpen ? 50000 : 0;
    
    let levelPriority = 100;
    if (pizzeria.priorityLevel === 'niveau_2') levelPriority = 300;
    else if (pizzeria.priorityLevel === 'niveau_1') levelPriority = 200;
    
    return locationPriority + openPriority + levelPriority;
  };

  const { localOpenPizzerias, nearbyOpenPizzerias, closedPizzerias } = useMemo(() => {
    let filtered = pizzerias.filter(pizzeria => {
      if (activeTab && !pizzeria.types.includes(activeTab)) return false;
      if (filters.priceRange && pizzeria.priceRange !== filters.priceRange) return false;
      if (filters.rating && pizzeria.rating < filters.rating) return false;
      if (filters.halalOnly && !pizzeria.halal) return false;
      return true;
    });

    const pizzeriasWithDistance = filtered.map(pizzeria => {
      const pizzeriaCoords = getCityCoordinatesFromAddress(pizzeria.address);
      const distance = pizzeriaCoords ? haversineDistance(cityCoords, pizzeriaCoords) : 999;
      return {
        ...pizzeria,
        distance,
        sortPriority: getSortPriority(pizzeria, distance),
      };
    });

    const sorted = [...pizzeriasWithDistance].sort((a, b) => b.sortPriority - a.sortPriority);

    const isPizzeriaOpen = (p: Pizzeria) => {
      if (!p.openingHours) return false;
      try { return isOpen(parseOpeningHours(p.openingHours)); }
      catch { return false; }
    };

    const localOpenList: Pizzeria[] = [];
    const nearbyOpenList: Pizzeria[] = [];
    const closedList: Pizzeria[] = [];

    sorted.forEach(pizzeria => {
      const pc = extractPostalCode(pizzeria.address);
      const isLocal = pc === cityPostalCode;
      const isOpenNow = isPizzeriaOpen(pizzeria);

      if (isLocal && isOpenNow) localOpenList.push(pizzeria);
      else if (!isLocal && isOpenNow) nearbyOpenList.push(pizzeria);
      else if (isLocal && !isOpenNow) closedList.push(pizzeria);
    });

    return {
      localOpenPizzerias: localOpenList,
      nearbyOpenPizzerias: nearbyOpenList,
      closedPizzerias: closedList,
    };
  }, [activeTab, filters, pizzerias, cityCoords, cityPostalCode, cityName]);

  return (
    <>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filters={filters}
        setFilters={setFilters}
        onZoneSelect={handleZoneSelect}
        cityName={cityName}
        sectors={sectors}
        pizzerias={pizzerias}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <BreadcrumbNavigation items={[{ label: `Pizza ${cityName}` }]} />

        {localOpenPizzerias.length > 0 && (
          <div className="mb-12">
            <div className="bg-green-100 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 py-6 px-4 rounded-xl mb-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold text-green-900 dark:text-green-100 text-center flex items-center justify-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold text-base shadow-md">
                  {localOpenPizzerias.length}
                </span>
                Pizzeria{localOpenPizzerias.length > 1 ? 's' : ''} Ouverte{localOpenPizzerias.length > 1 ? 's' : ''} Actuellement à {cityName}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localOpenPizzerias.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </div>
        )}

        {nearbyOpenPizzerias.length > 0 && (
          <div className="mb-12">
            <div className="bg-blue-100 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 py-6 px-4 rounded-xl mb-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold text-blue-900 dark:text-blue-100 text-center flex items-center justify-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-base shadow-md">
                  {nearbyOpenPizzerias.length}
                </span>
                Pizzeria{nearbyOpenPizzerias.length > 1 ? 's' : ''} Ouverte{nearbyOpenPizzerias.length > 1 ? 's' : ''} à Proximité
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyOpenPizzerias.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </div>
        )}

        {closedPizzerias.length > 0 && (
          <div className="mb-12">
            <div className="bg-gray-100 dark:bg-gray-900/30 border-2 border-gray-200 dark:border-gray-700 py-6 px-4 rounded-xl mb-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 text-center flex items-center justify-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 text-white font-bold text-base shadow-md">
                  {closedPizzerias.length}
                </span>
                Pizzeria{closedPizzerias.length > 1 ? 's' : ''} Fermée{closedPizzerias.length > 1 ? 's' : ''} à {cityName}
              </h2>
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
