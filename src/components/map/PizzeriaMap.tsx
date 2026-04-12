'use client';

import { useEffect, useState, useRef } from 'react';
import type { Pizzeria } from '@/types/pizzeria';
import { parseOpeningHours, isOpen } from '@/utils/openingHours';

interface PizzeriaMapProps {
  pizzerias: Pizzeria[];
  center?: [number, number];
  zoom?: number;
}

function isPizzeriaOpen(pizzeria: Pizzeria): boolean {
  if (!pizzeria.openingHours) return false;
  try {
    const hours = parseOpeningHours(pizzeria.openingHours);
    return isOpen(hours);
  } catch {
    return false;
  }
}

export default function PizzeriaMap({ pizzerias, center = [49.4432, 1.0993], zoom = 13 }: PizzeriaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || isLoaded) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      const map = L.map(mapRef.current!, {
        center: center,
        zoom: zoom,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // N'afficher que les pizzerias ouvertes
      pizzerias.forEach(pizzeria => {
        if (!pizzeria.latitude || !pizzeria.longitude) return;
        if (!isPizzeriaOpen(pizzeria)) return;

        const markerColor = pizzeria.priorityLevel === 'niveau_2' ? '#9333ea' :
          pizzeria.priorityLevel === 'niveau_1' ? '#d97706' : '#16a34a';

        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([pizzeria.latitude, pizzeria.longitude], { icon });
        marker.bindPopup(`
          <div style="min-width: 200px; padding: 8px;">
            <strong>${pizzeria.name}</strong><br/>
            <span style="color: #666;">${pizzeria.address}</span><br/>
            <span>⭐ ${pizzeria.rating} (${pizzeria.reviews} avis)</span><br/>
            <span>🟢 Ouvert</span>
          </div>
        `);
        marker.addTo(map);
      });

      setIsLoaded(true);
    };

    initMap();
  }, [pizzerias, center, zoom, isLoaded]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg"
      style={{ zIndex: 0 }}
    />
  );
}
