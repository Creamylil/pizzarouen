'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import type { ZoneDefinition } from '@/utils/geographicRanking';
import type { Pizzeria, GeographicSector } from '@/types/pizzeria';
import { sectorToZone, matchesSectorLogic } from '@/utils/geographicRanking';
import { SECTOR_PAGE_MAPPING, SECTOR_TO_POSTAL_CODE } from '@/utils/sectorNavigation';

interface ZoneSelectorProps {
  selectedZone: ZoneDefinition | null;
  onZoneSelect: (zone: ZoneDefinition | null) => void;
  sectors: GeographicSector[];
  pizzerias: Pizzeria[];
}

export default function ZoneSelector({ selectedZone, onZoneSelect, sectors, pizzerias }: ZoneSelectorProps) {
  const router = useRouter();

  const priorityOrder = ['76000', '76100', 'le-petit-quevilly', 'le-grand-quevilly', 'deville-les-rouen', 'bihorel', 'sotteville-les-rouen'];

  const allZones = sectors.map(sector => sectorToZone(sector)).filter(zone => {
    return pizzerias.some(pizzeria => matchesSectorLogic(pizzeria.address, zone.id, sectors));
  });

  const sortedZones = allZones.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.id);
    const bIndex = priorityOrder.indexOf(b.id);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleZoneChange = (zoneId: string) => {
    if (zoneId === 'all') {
      onZoneSelect(null);
      router.push('/?sector=76000');
      return;
    }
    const zone = sortedZones.find(z => z.id === zoneId);
    if (zone) {
      const dedicatedPage = SECTOR_PAGE_MAPPING[zone.id];
      if (dedicatedPage) {
        router.push(dedicatedPage);
      } else {
        const postalCode = SECTOR_TO_POSTAL_CODE[zone.id] || zone.id;
        router.push(`/?sector=${postalCode}`);
      }
      onZoneSelect(zone);
    }
  };

  const currentValue = selectedZone?.id || 'all';

  const getZoneDisplayName = (zone: ZoneDefinition) => {
    if (zone.id === '76000') return 'Rouen Centre';
    if (zone.id === '76100') return 'Rouen Rive Gauche';
    return zone.name;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-gray-600" />
        <label className="text-sm font-medium text-gray-700">Zone géographique</label>
      </div>
      <Select value={currentValue} onValueChange={handleZoneChange}>
        <SelectTrigger className="w-full h-10 bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 transition-colors">
          <SelectValue placeholder="Choisir une zone" />
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-xl max-h-60 overflow-y-auto z-50 rounded-lg">
          <SelectItem value="all" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer px-3 py-2 font-medium">
            🏢 Toutes les zones
          </SelectItem>
          {sortedZones.map(zone => (
            <SelectItem key={zone.id} value={zone.id} className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer px-3 py-2">
              <span className="flex items-center gap-2">
                <span className="text-blue-600">📍</span>
                <span>{getZoneDisplayName(zone)}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
