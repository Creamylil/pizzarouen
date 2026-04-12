/**
 * Utilitaires pour l'extraction et la comparaison de codes postaux
 * Permet une détection précise des pizzerias locales
 */

/**
 * Extrait le code postal à 5 chiffres d'une adresse
 */
export function extractPostalCode(address: string): string | null {
  // Regex pour extraire un code postal français (5 chiffres)
  const postalCodeRegex = /\b(\d{5})\b/;
  const match = address.match(postalCodeRegex);
  return match ? match[1] : null;
}

/**
 * Vérifie si une pizzeria est locale en comparant les codes postaux
 */
export function isPizzeriaLocal(pizzeriaAddress: string, sectorPostalCode: string): boolean {
  const pizzeriaPostalCode = extractPostalCode(pizzeriaAddress);
  
  if (!pizzeriaPostalCode) {
    return false;
  }
  
  return pizzeriaPostalCode === sectorPostalCode;
}

/**
 * Compte les pizzerias locales ouvertes en utilisant les codes postaux
 */
export function countLocalOpenPizzerias(
  pizzerias: any[], 
  sectorPostalCode: string,
  isOpenFunction: (pizzeria: any) => boolean
): { localCount: number; localOpenCount: number } {
  const localPizzerias = pizzerias.filter(pizzeria => 
    isPizzeriaLocal(pizzeria.address, sectorPostalCode)
  );
  
  const localOpenPizzerias = localPizzerias.filter(pizzeria => 
    isOpenFunction(pizzeria)
  );
  
  return {
    localCount: localPizzerias.length,
    localOpenCount: localOpenPizzerias.length
  };
}

/**
 * Compte les pizzerias proches ouvertes (non locales mais dans la liste filtrée)
 */
export function countNearbyOpenPizzerias(
  allFilteredPizzerias: any[],
  sectorPostalCode: string,
  isOpenFunction: (pizzeria: any) => boolean
): number {
  return allFilteredPizzerias.filter(pizzeria => {
    // Exclure les pizzerias locales
    const isLocal = isPizzeriaLocal(pizzeria.address, sectorPostalCode);
    if (isLocal) return false;
    
    // Inclure uniquement celles qui sont ouvertes
    return isOpenFunction(pizzeria);
  }).length;
}