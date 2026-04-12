'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { GeographicSector } from '@/types/pizzeria';

export function useGeographicSectors() {
  const [data, setData] = useState<GeographicSector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: rawData, error: fetchError } = await supabase
          .from('geographic_sectors')
          .select('*')
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;
        setData((rawData || []).map(sector => ({
          id: sector.id,
          name: sector.name,
          slug: sector.slug,
          center_lat: sector.center_lat,
          center_lng: sector.center_lng,
          radius: sector.radius,
          postal_code: sector.postal_code || undefined,
          created_at: sector.created_at,
          updated_at: sector.updated_at,
        })));
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
