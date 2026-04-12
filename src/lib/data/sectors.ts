import { createServerSupabaseClient } from '../supabase/server';
import type { GeographicSector } from '@/types/pizzeria';

export async function fetchGeographicSectors(): Promise<GeographicSector[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('geographic_sectors')
    .select('*')
    .order('name', { ascending: true });

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
    created_at: sector.created_at,
    updated_at: sector.updated_at,
  }));
}
