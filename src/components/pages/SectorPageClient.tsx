'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import PizzeriaCard from '@/components/pizzeria/PizzeriaCard';
import Header from '@/components/layout/Header';
import EmptyState from '@/components/states/EmptyState';
import { Map, X, ChevronRight } from 'lucide-react';
import type { Pizzeria, GeographicSector, Filters } from '@/types/pizzeria';
import type { ZoneDefinition } from '@/utils/geographicRanking';
import { parseOpeningHours, isOpen } from '@/utils/openingHours';
import { findZoneBySector, rankPizzeriasByGeography } from '@/utils/geographicRanking';
import { extractPostalCode } from '@/utils/postalCodeUtils';

const PizzeriaMap = dynamic(() => import('@/components/map/PizzeriaMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-muted rounded-xl animate-pulse" />,
});

interface SectorPageClientProps {
  pizzerias: Pizzeria[];
  sector: GeographicSector;
  sectors: GeographicSector[];
  mainPostalCodes: string[];
  cityName: string;
  heroImageUrl?: string | null;
  centerCoords: [number, number];
  siteUrl: string;
}

export default function SectorPageClient({
  pizzerias,
  sector,
  sectors,
  mainPostalCodes,
  cityName,
  heroImageUrl,
  centerCoords,
  siteUrl,
}: SectorPageClientProps) {
  const displayName = sector.display_name || sector.name;

  const [activeTab, setActiveTab] = useState<'sur-place' | 'emporter' | 'livraison' | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState<Filters>({
    priceRange: '',
    rating: 0,
    sector: sector.slug,
    halalOnly: false,
    showTop10: false,
  });

  const selectedZone = useMemo(() => findZoneBySector(sectors, sector.slug), [sectors, sector.slug]);

  const handleZoneSelect = (zone: ZoneDefinition | null) => {
    // Navigation is handled by ZoneSelector via router.push
    void zone;
  };

  const validServiceTypes: string[] = ['sur-place', 'emporter', 'livraison'];

  // Filter pizzerias by active tab and filters
  const filtered = useMemo(() => {
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
  }, [activeTab, filters, pizzerias]);

  // Sort helper
  const sortByPriorityAndRating = (list: Pizzeria[]) => {
    return [...list].sort((a, b) => {
      const priorityOrder: Record<string, number> = { niveau_2: 300, niveau_1: 200, normal: 100 };
      const diff = (priorityOrder[b.priorityLevel] || 100) - (priorityOrder[a.priorityLevel] || 100);
      return diff !== 0 ? diff : (b.rating || 0) - (a.rating || 0);
    });
  };

  // 4 blocs: local open, local closed, top 10 (deduplicated), others
  const { localOpen, localClosed, top10, others } = useMemo(() => {
    const sectorPostalCode = sector.postal_code;
    const isMainSector = mainPostalCodes.includes(sectorPostalCode || '');

    const isLocalPizzeria = (pizzeria: Pizzeria): boolean => {
      const pc = extractPostalCode(pizzeria.address);
      if (!pc || !sectorPostalCode) return false;
      return isMainSector
        ? mainPostalCodes.includes(pc)
        : pc === sectorPostalCode;
    };

    const localOpenList: Pizzeria[] = [];
    const localClosedList: Pizzeria[] = [];
    const localIds = new Set<string>();

    // Bloc 1 & 2: Local open + Local closed
    filtered.forEach(pizzeria => {
      if (isLocalPizzeria(pizzeria)) {
        localIds.add(pizzeria.id);
        const pizzeriaOpen = pizzeria.openingHours ? isOpen(parseOpeningHours(pizzeria.openingHours)) : false;
        if (pizzeriaOpen) {
          localOpenList.push(pizzeria);
        } else {
          localClosedList.push(pizzeria);
        }
      }
    });

    // Bloc 3: Top 10 (all pizzerias from city, dedup local)
    const mainPizzerias = pizzerias.filter(p => {
      const pc = extractPostalCode(p.address);
      return mainPostalCodes.includes(pc || '');
    });
    const sortedForTop10 = [...mainPizzerias].sort((a, b) => {
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
    const top10All = sortedForTop10.slice(0, 10);
    const top10Deduped = top10All.filter(p => !localIds.has(p.id));
    const top10Ids = new Set(top10All.map(p => p.id));

    // Bloc 4: Others (not local, not top10), sorted: open first → priority → rating
    const othersList = filtered
      .filter(p => !localIds.has(p.id) && !top10Ids.has(p.id));
    const othersSorted = [...othersList].sort((a, b) => {
      const aOpen = a.openingHours ? isOpen(parseOpeningHours(a.openingHours)) : false;
      const bOpen = b.openingHours ? isOpen(parseOpeningHours(b.openingHours)) : false;
      if (aOpen !== bOpen) return bOpen ? 1 : -1;
      const priorityOrder: Record<string, number> = { niveau_2: 300, niveau_1: 200, normal: 100 };
      const diff = (priorityOrder[b.priorityLevel] || 100) - (priorityOrder[a.priorityLevel] || 100);
      return diff !== 0 ? diff : (b.rating || 0) - (a.rating || 0);
    });

    return {
      localOpen: sortByPriorityAndRating(localOpenList),
      localClosed: sortByPriorityAndRating(localClosedList),
      top10: top10Deduped,
      others: othersSorted,
    };
  }, [filtered, sector, mainPostalCodes, pizzerias]);

  const mapPizzerias = useMemo(() => {
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
  }, [pizzerias, activeTab, filters]);

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
        cityName={displayName}
        heroImageUrl={heroImageUrl}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="mb-4" aria-label="Fil d'Ariane">
          <ol className="flex items-center gap-1.5 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-900 transition-colors">Accueil</Link>
            </li>
            <li><ChevronRight className="h-3.5 w-3.5" /></li>
            <li className="text-gray-900 font-medium">{displayName}</li>
          </ol>
        </nav>

        {/* Map toggle */}
        {viewMode === 'list' && mapPizzerias.length > 0 && (
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
              pizzerias={mapPizzerias}
              center={selectedZone ? [selectedZone.center.lat, selectedZone.center.lng] : centerCoords}
              zoom={selectedZone ? 14 : 13}
            />
          </div>
        )}

        {/* Bloc 1: Ouvertes sur ce secteur */}
        {localOpen.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              count={localOpen.length}
              title={`Pizzeria${localOpen.length > 1 ? 's' : ''} Ouverte${localOpen.length > 1 ? 's' : ''} à ${displayName}`}
              variant="green"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {localOpen.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </section>
        )}

        {/* Message quand aucune pizzeria n'est ouverte sur ce secteur */}
        {localOpen.length === 0 && localClosed.length > 0 && (
          <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm text-amber-800">
              Aucune pizzeria n&apos;est ouverte actuellement à {displayName}. Les horaires sont mis à jour régulièrement, les pizzerias ouvertes apparaîtront en haut de cette page.
            </p>
          </div>
        )}

        {/* Bloc 2: Fermées sur ce secteur */}
        {localClosed.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              count={localClosed.length}
              title={`Pizzeria${localClosed.length > 1 ? 's' : ''} Fermée${localClosed.length > 1 ? 's' : ''} à ${displayName}`}
              variant="gray"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-70">
              {localClosed.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </section>
        )}

        {/* Bloc 3: Top 10 (deduplicated) */}
        {top10.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              count={top10.length}
              title={`Meilleures pizzerias à ${displayName} et proximité`}
              variant="gold"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {top10.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </section>
        )}

        {/* Bloc 4: Autres pizzerias */}
        {others.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              count={others.length}
              title="Autres pizzerias à proximité"
              variant="blue"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {others.map(pizzeria => <PizzeriaCard key={pizzeria.id} pizzeria={pizzeria} />)}
            </div>
          </section>
        )}

        {localOpen.length === 0 && localClosed.length === 0 && top10.length === 0 && others.length === 0 && <EmptyState />}
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
