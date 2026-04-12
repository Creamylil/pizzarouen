import { Pizzeria } from '@/types/pizzeria';
import { GeographicSector } from '@/types/pizzeria';
import { haversineDistance } from './distanceCalculator';
import { parseOpeningHours, isOpen } from './openingHours';
import { extractPostalCode, isPizzeriaLocal } from './postalCodeUtils';

export interface ZoneDefinition {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  radius: number;
}

export function sectorToZone(sector: GeographicSector): ZoneDefinition {
  return {
    id: sector.slug,
    name: sector.name,
    center: { lat: sector.center_lat, lng: sector.center_lng },
    radius: sector.radius
  };
}

export function matchesSectorLogic(address: string, sectorSlug: string, sectors?: GeographicSector[]): boolean {
  if (!sectorSlug) return true;

  const addressLower = address.toLowerCase();

  if (sectors) {
    const sector = sectors.find(s => s.slug === sectorSlug || s.postal_code === sectorSlug);
    if (sector && sector.postal_code) {
      const sectorPostalCode = sector.postal_code;

      if (sectorPostalCode === '76000') {
        const hasCorrectPostalCode = isPizzeriaLocal(address, '76000');
        const isRouenButNot76100 = addressLower.includes('rouen') && !addressLower.includes('76100');
        return hasCorrectPostalCode || isRouenButNot76100;
      }

      if (sectorPostalCode === '76100') {
        return isPizzeriaLocal(address, '76100');
      }

      return isPizzeriaLocal(address, sectorPostalCode);
    }
  }

  if (sectorSlug === '76000') {
    return addressLower.includes('76000') ||
           (addressLower.includes('rouen') && !addressLower.includes('76100'));
  }

  if (sectorSlug === '76100') {
    return addressLower.includes('76100');
  }

  const sectorLower = sectorSlug.toLowerCase();
  return addressLower.includes(sectorLower);
}

export function isPizzeriaInZone(pizzeria: Pizzeria, zone: ZoneDefinition): boolean {
  if (!pizzeria.latitude || !pizzeria.longitude) {
    return false;
  }

  const pizzeriaCoords = { lat: pizzeria.latitude, lng: pizzeria.longitude };
  const distance = haversineDistance(pizzeriaCoords, zone.center);
  return distance <= zone.radius;
}

export function getDistanceToZone(pizzeria: Pizzeria, zone: ZoneDefinition): number {
  if (!pizzeria.latitude || !pizzeria.longitude) {
    return Infinity;
  }

  const pizzeriaCoords = { lat: pizzeria.latitude, lng: pizzeria.longitude };
  return haversineDistance(pizzeriaCoords, zone.center);
}

export function rankPizzeriasByGeography(
  pizzerias: Pizzeria[],
  selectedZone: ZoneDefinition | null,
  sectors?: GeographicSector[]
): Pizzeria[] {
  if (!selectedZone) {
    return pizzerias;
  }

  const selectedSectorOpen: Array<Pizzeria & { distance: number; isCurrentlyOpen: boolean }> = [];
  const selectedSectorClosed: Array<Pizzeria & { distance: number; isCurrentlyOpen: boolean }> = [];
  const otherSectorsOpen: Array<Pizzeria & { distance: number; isCurrentlyOpen: boolean }> = [];
  const otherSectorsClosed: Array<Pizzeria & { distance: number; isCurrentlyOpen: boolean }> = [];

  pizzerias.forEach(pizzeria => {
    const distance = getDistanceToZone(pizzeria, selectedZone);

    let isCurrentlyOpen = false;
    if (pizzeria.openingHours) {
      try {
        const hours = parseOpeningHours(pizzeria.openingHours);
        isCurrentlyOpen = isOpen(hours);
      } catch {
        isCurrentlyOpen = false;
      }
    }

    const pizzeriaWithData = { ...pizzeria, distance, isCurrentlyOpen };
    const isInSelectedSector = matchesSectorLogic(pizzeria.address, selectedZone.id, sectors);

    if (isInSelectedSector && isCurrentlyOpen) {
      selectedSectorOpen.push(pizzeriaWithData);
    } else if (isInSelectedSector && !isCurrentlyOpen) {
      selectedSectorClosed.push(pizzeriaWithData);
    } else if (!isInSelectedSector && isCurrentlyOpen) {
      otherSectorsOpen.push(pizzeriaWithData);
    } else {
      otherSectorsClosed.push(pizzeriaWithData);
    }
  });

  const sortSelectedSector = (a: Pizzeria & { distance: number; isCurrentlyOpen: boolean }, b: Pizzeria & { distance: number; isCurrentlyOpen: boolean }) => {
    const priorityOrder = { 'niveau_2': 3, 'niveau_1': 2, 'normal': 1 };
    const aPriority = priorityOrder[a.priorityLevel] || 1;
    const bPriority = priorityOrder[b.priorityLevel] || 1;

    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    return (b.rating || 0) - (a.rating || 0);
  };

  const sortOtherSectors = (a: Pizzeria & { distance: number; isCurrentlyOpen: boolean }, b: Pizzeria & { distance: number; isCurrentlyOpen: boolean }) => {
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }

    const priorityOrder = { 'niveau_2': 3, 'niveau_1': 2, 'normal': 1 };
    const aPriority = priorityOrder[a.priorityLevel] || 1;
    const bPriority = priorityOrder[b.priorityLevel] || 1;

    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    return (b.rating || 0) - (a.rating || 0);
  };

  selectedSectorOpen.sort(sortSelectedSector);
  selectedSectorClosed.sort(sortSelectedSector);
  otherSectorsOpen.sort(sortOtherSectors);
  otherSectorsClosed.sort(sortOtherSectors);

  const result = [
    ...selectedSectorOpen,
    ...selectedSectorClosed,
    ...otherSectorsOpen,
    ...otherSectorsClosed
  ].map(({ distance, isCurrentlyOpen, ...pizzeria }) => pizzeria);

  return result;
}

export function findZoneBySector(sectors: GeographicSector[], sectorSlug: string): ZoneDefinition | null {
  const sector = sectors.find(s => s.slug === sectorSlug);
  return sector ? sectorToZone(sector) : null;
}

export function findZoneByAddress(sectors: GeographicSector[], address: string): ZoneDefinition | null {
  for (const sector of sectors) {
    if (matchesSectorLogic(address, sector.slug, sectors)) {
      return sectorToZone(sector);
    }
  }

  return null;
}
