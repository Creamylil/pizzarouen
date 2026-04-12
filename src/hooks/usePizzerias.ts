'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Pizzeria } from '@/types/pizzeria';

function transformPizzeriaData(dbPizzeria: any): Pizzeria {
  const servicesInfo = dbPizzeria.services_info || {};
  return {
    id: dbPizzeria.id,
    name: dbPizzeria.name,
    image: dbPizzeria.image_url || '',
    rating: parseFloat(dbPizzeria.rating) || 0,
    reviews: dbPizzeria.reviews_count || 0,
    priceRange: servicesInfo.priceRange || '€',
    specialties: servicesInfo.specialties || [],
    services: servicesInfo.services || [],
    description: dbPizzeria.description || '',
    phone: dbPizzeria.phone || '',
    address: dbPizzeria.address || '',
    types: servicesInfo.types || [],
    reviewsLink: dbPizzeria.reviews_link,
    googleMapsLink: dbPizzeria.google_maps_link,
    openingHours: dbPizzeria.opening_hours ? JSON.stringify(dbPizzeria.opening_hours) : undefined,
    priorityLevel: dbPizzeria.priority_level || 'normal',
    latitude: dbPizzeria.latitude ? parseFloat(dbPizzeria.latitude) : undefined,
    longitude: dbPizzeria.longitude ? parseFloat(dbPizzeria.longitude) : undefined,
    geocodedAt: dbPizzeria.geocoded_at,
    geocodingStatus: dbPizzeria.geocoding_status || 'pending',
    halal: dbPizzeria.halal || false,
  };
}

export function usePizzerias() {
  const [data, setData] = useState<Pizzeria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: rawData, error: fetchError } = await supabase
          .from('pizzerias')
          .select('*')
          .order('rating', { ascending: false });

        if (fetchError) throw fetchError;
        setData((rawData || []).map(transformPizzeriaData));
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
}
