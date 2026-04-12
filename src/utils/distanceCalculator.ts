// Function to convert degrees to radians
function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

// Haversine formula to calculate distance between two coordinates
export function haversineDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
  const R = 6371; // Radius of the Earth in kilometers
  const lat1Rad = toRadians(coord1.lat);
  const lon1Rad = toRadians(coord1.lng);
  const lat2Rad = toRadians(coord2.lat);
  const lon2Rad = toRadians(coord2.lng);

  const lonDelta = lon2Rad - lon1Rad;
  const latDelta = lat2Rad - lat1Rad;

  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(lonDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
}

// Function to extract city name from address
function extractCity(address: string): string | null {
  const parts = address.split(',');
  if (parts.length > 1) {
    return parts[parts.length - 2].trim();
  }
  return null;
}

// Function to get coordinates from address using cityCoordinates
export function getCityCoordinatesFromAddress(address: string): { lat: number; lng: number } | null {
  const cityName = extractCity(address);
  if (cityName && cityCoordinates[cityName]) {
    return cityCoordinates[cityName];
  }
  return null;
}

// Coordonnées des villes principales
export const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
  "Rouen": { lat: 49.4432, lng: 1.0993 },
  "Sotteville-lès-Rouen": { lat: 49.4081, lng: 1.0851 },
  "Le Petit-Quevilly": { lat: 49.4275, lng: 1.0642 },
  "Déville-lès-Rouen": { lat: 49.4667, lng: 1.0417 },
  "Mont-Saint-Aignan": { lat: 49.4583, lng: 1.0833 },
  "Bois-Guillaume": { lat: 49.4667, lng: 1.1167 },
  "Maromme": { lat: 49.4833, lng: 1.0333 },
  "Notre-Dame-de-Bondeville": { lat: 49.4833, lng: 1.0500 },
  "Canteleu": { lat: 49.4417, lng: 1.0333 },
  "Saint-Étienne-du-Rouvray": { lat: 49.3917, lng: 1.0833 },
  "Grand-Quevilly": { lat: 49.4167, lng: 1.0500 },
  "Petit-Couronne": { lat: 49.3833, lng: 1.0167 },
  "Grand-Couronne": { lat: 49.3583, lng: 1.0083 },
  "Oissel": { lat: 49.3417, lng: 1.0917 },
  "Cléon": { lat: 49.3083, lng: 1.0333 },
  "Elbeuf": { lat: 49.2833, lng: 1.0167 },
  "Saint-Aubin-lès-Elbeuf": { lat: 49.3000, lng: 1.0167 },
  "Caudebec-lès-Elbeuf": { lat: 49.2833, lng: 1.0333 },
  "La Bouille": { lat: 49.3500, lng: 0.9333 },
  "Duclair": { lat: 49.4833, lng: 0.8833 },
  "Barentin": { lat: 49.5500, lng: 0.9500 },
  "Pavilly": { lat: 49.5667, lng: 0.9583 },
  "Yvetot": { lat: 49.6167, lng: 0.7500 },
  "Bolbec": { lat: 49.5667, lng: 0.4833 },
  "Lillebonne": { lat: 49.5167, lng: 0.5333 },
  "Le Havre": { lat: 49.4944, lng: 0.1079 },
  "Harfleur": { lat: 49.5083, lng: 0.2000 },
  "Gonfreville-l'Orcher": { lat: 49.4917, lng: 0.2333 },
  "Montivilliers": { lat: 49.5417, lng: 0.1917 }
};
