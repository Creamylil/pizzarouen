import { createServerSupabaseClient } from '../supabase/server';
import { fetchCityConfig } from './city';
import type { GeographicSector } from '@/types/pizzeria';

function mapSector(sector: Record<string, unknown>): GeographicSector {
  return {
    id: sector.id as string,
    name: sector.name as string,
    slug: sector.slug as string,
    center_lat: sector.center_lat as number,
    center_lng: sector.center_lng as number,
    radius: sector.radius as number,
    postal_code: (sector.postal_code as string) || undefined,
    display_name: (sector.display_name as string) || undefined,
    display_order: (sector.display_order as number) || undefined,
    meta_title: (sector.meta_title as string) || undefined,
    meta_description: (sector.meta_description as string) || undefined,
    og_title: (sector.og_title as string) || undefined,
    og_description: (sector.og_description as string) || undefined,
    og_image_url: (sector.og_image_url as string) || undefined,
    seo_content: (sector.seo_content as GeographicSector['seo_content']) || undefined,
    is_published: sector.is_published as boolean ?? true,
    created_at: sector.created_at as string,
    updated_at: sector.updated_at as string,
  };
}

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

  return (data || []).map(mapSector);
}

export async function fetchSectorBySlug(slug: string): Promise<GeographicSector | null> {
  const cityConfig = await fetchCityConfig();
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('geographic_sectors')
    .select('*')
    .eq('city_id', cityConfig.id)
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  return mapSector(data);
}
