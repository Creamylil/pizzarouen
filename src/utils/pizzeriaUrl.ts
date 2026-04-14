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

  // Pizzerias du centre (mainPostalCodes) → URL directe /{slug}
  if (mainPostalCodes.includes(pizzeriaPC)) {
    return `/${pizzeria.slug}`;
  }

  // Pizzerias des communes → /{secteur}/{slug}
  const matchingSector = sectors.find(sector => {
    if (!sector.postal_code) return false;
    if (sector.is_published === false) return false;
    return sector.postal_code === pizzeriaPC;
  });

  if (!matchingSector) return null;

  return `/${matchingSector.slug}/${pizzeria.slug}`;
}
