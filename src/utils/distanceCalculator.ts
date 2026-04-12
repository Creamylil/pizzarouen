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
