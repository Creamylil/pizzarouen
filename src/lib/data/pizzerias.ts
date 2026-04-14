import { createServerSupabaseClient } from '../supabase/server';
import { fetchCityConfig } from './city';
import type { Pizzeria } from '@/types/pizzeria';

function transformPizzeriaData(dbPizzeria: any): Pizzeria {
  const servicesInfo = dbPizzeria.services_info || {};
  const specialties = servicesInfo.specialties || [];
  const services = servicesInfo.services || [];
  const types = servicesInfo.types || [];
  const priceRange = servicesInfo.priceRange || '€';

  return {
    id: dbPizzeria.id,
    slug: dbPizzeria.slug || '',
    name: dbPizzeria.name,
    image: dbPizzeria.image_url || '',
    rating: parseFloat(dbPizzeria.rating) || 0,
    reviews: dbPizzeria.reviews_count || 0,
    priceRange,
    specialties,
    services,
    description: dbPizzeria.description || '',
    phone: dbPizzeria.phone || '',
    address: dbPizzeria.address || '',
    types,
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

export async function fetchPizzerias(): Promise<Pizzeria[]> {
  const cityConfig = await fetchCityConfig();
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('pizzerias')
    .select('*')
    .eq('city_id', cityConfig.id)
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching pizzerias:', error);
    throw error;
  }

  return data.map(transformPizzeriaData);
}

export async function fetchPizzeriaBySlug(slug: string): Promise<Pizzeria | null> {
  const cityConfig = await fetchCityConfig();
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('pizzerias')
    .select('*')
    .eq('city_id', cityConfig.id)
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return transformPizzeriaData(data);
}
