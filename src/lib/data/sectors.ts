import { createServerSupabaseClient } from '../supabase/server';
import { fetchCityConfig } from './city';
import type { GeographicSector } from '@/types/pizzeria';

export async function fetchGeographicSectors(): Promise<GeographicSector[]> {
  const cityConfig = await fetchCityConfig();
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('geographic_sectors')
    .select('*')
    .eq('city_id', cityConfig.id)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching geographic sectors:', error);
    throw error;
  }

  return (data || []).map(sector => ({
    id: sector.id,
    name: sector.name,
    slug: sector.slug,
    center_lat: sector.center_lat,
    center_lng: sector.center_lng,
    radius: sector.radius,
    postal_code: sector.postal_code || undefined,
    display_name: sector.display_name || undefined,
    display_order: sector.display_order || undefined,
    created_at: sector.created_at,
    updated_at: sector.updated_at,
  }));
}
