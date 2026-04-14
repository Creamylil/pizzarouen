'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import type { ZoneDefinition } from '@/utils/geographicRanking';
import type { Pizzeria, GeographicSector } from '@/types/pizzeria';
import { sectorToZone, matchesSectorLogic } from '@/utils/geographicRanking';

interface ZoneSelectorProps {
  selectedZone: ZoneDefinition | null;
  onZoneSelect: (zone: ZoneDefinition | null) => void;
  sectors: GeographicSector[];
  pizzerias: Pizzeria[];
}

export default function ZoneSelector({ selectedZone, onZoneSelect, sectors, pizzerias }: ZoneSelectorProps) {
  const router = useRouter();

  const allZones = sectors.map(sector => sectorToZone(sector)).filter(zone => {
    return pizzerias.some(pizzeria => matchesSectorLogic(pizzeria.address, zone.id, sectors));
  });

  const handleZoneChange = (zoneId: string) => {
    if (zoneId === 'all') {
      onZoneSelect(null);
      router.push('/');
      return;
    }
    const zone = allZones.find(z => z.id === zoneId);
    if (zone) {
      router.push(`/${zone.id}`);
      onZoneSelect(zone);
    }
  };

  const currentValue = selectedZone?.id || 'all';

  const getZoneDisplayName = (zone: ZoneDefinition) => {
    const sector = sectors.find(s => s.slug === zone.id);
    return sector?.display_name || zone.name;
  };

  return (
    <div className="rounded-lg">
      <Select value={currentValue} onValueChange={handleZoneChange}>
        <SelectTrigger
          className="w-full h-11 bg-white/10 border-white/20 text-white hover:bg-white/15 focus:border-white/40 focus:ring-white/20 transition-colors rounded-lg"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-white/60 flex-shrink-0" />
            <SelectValue placeholder="Choisir une zone" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-xl max-h-60 overflow-y-auto z-50 rounded-lg">
          <SelectItem value="all" className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer px-3 py-2.5 font-medium text-gray-900">
            Toutes les zones
          </SelectItem>
          {allZones.map(zone => (
            <SelectItem key={zone.id} value={zone.id} className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer px-3 py-2.5 text-gray-700">
              {getZoneDisplayName(zone)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
