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
