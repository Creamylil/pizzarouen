import { Pizzeria } from '@/types/pizzeria';
import { GeographicSector } from '@/types/pizzeria';
import { haversineDistance } from './distanceCalculator';
import { parseOpeningHours, isOpen } from './openingHours';
import { isPizzeriaLocal } from './postalCodeUtils';

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

  if (sectors) {
    const sector = sectors.find(s => s.slug === sectorSlug || s.postal_code === sectorSlug);
    if (sector && sector.postal_code) {
      return isPizzeriaLocal(address, sector.postal_code);
    }
  }

  const addressLower = address.toLowerCase();
  const sectorLower = sectorSlug.toLowerCase();
  return addressLower.includes(sectorLower);
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
