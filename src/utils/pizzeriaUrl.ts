import type { Pizzeria, GeographicSector } from '@/types/pizzeria';
import { extractPostalCode } from './postalCodeUtils';

/**
 * Calcule l'URL de la fiche individuelle d'une pizzeria
 * Format : /{sectorSlug}/{pizzeriaSlug}
 *
 * Logique de matching :
 * 1. Extraire le code postal de l'adresse de la pizzeria
 * 2. Trouver le secteur correspondant (par CP ou mainPostalCodes pour le secteur principal)
 * 3. Retourner l'URL ou null si pas de match
 */
export function getPizzeriaFicheUrl(
  pizzeria: Pizzeria,
  sectors: GeographicSector[],
  mainPostalCodes: string[],
): string | null {
  if (!pizzeria.slug) return null;

  const pizzeriaPC = extractPostalCode(pizzeria.address);
  if (!pizzeriaPC) return null;

  // Chercher un secteur dont le code postal correspond
  const matchingSector = sectors.find(sector => {
    if (!sector.postal_code) return false;

    // Pour le secteur principal (mainPostalCodes), matcher tous les CP principaux
    if (mainPostalCodes.includes(sector.postal_code)) {
      return mainPostalCodes.includes(pizzeriaPC);
    }

    // Pour les autres secteurs, matcher le CP exactement
    return sector.postal_code === pizzeriaPC;
  });

  if (!matchingSector) return null;

  return `/${matchingSector.slug}/${pizzeria.slug}`;
}
