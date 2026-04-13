'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { CityFormData } from '../schemas/city';

type ActionResult = { success: true } | { success: false; error: string };

function formToRow(data: CityFormData) {
  return {
    slug: data.slug,
    name: data.name,
    display_name: data.display_name,
    domain: data.domain,
    site_url: data.site_url,
    center_lat: data.center_lat,
    center_lng: data.center_lng,
    default_zoom: data.default_zoom,
    geo_region: data.geo_region,
    geo_placename: data.geo_placename,
    address_region: data.address_region,
    default_sector_slug: data.default_sector_slug,
    main_postal_codes: data.main_postal_codes.split(',').map((s) => s.trim()),
    meta_title: data.meta_title,
    meta_title_template: data.meta_title_template,
    meta_description: data.meta_description,
    meta_keywords: data.meta_keywords ? data.meta_keywords.split(',').map((s) => s.trim()) : [],
    og_site_name: data.og_site_name,
    google_analytics_id: data.google_analytics_id || null,
    contact_email: data.contact_email,
    contact_whatsapp: data.contact_whatsapp || null,
    logo_url: data.logo_url || null,
    hero_image_url: data.hero_image_url || null,
    editor_name: data.editor_name,
  };
}

export async function createCity(data: CityFormData): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('cities').insert(formToRow(data));
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/cities');
  return { success: true };
}

export async function updateCity(id: string, data: CityFormData): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('cities').update(formToRow(data)).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/cities');
  return { success: true };
}

export async function deleteCity(id: string): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('cities').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/cities');
  return { success: true };
}
