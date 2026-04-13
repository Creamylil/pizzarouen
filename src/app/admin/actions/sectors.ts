'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { SectorFormData } from '../schemas/sector';

type ActionResult = { success: true } | { success: false; error: string };

function formToRow(data: SectorFormData) {
  return {
    name: data.name,
    slug: data.slug,
    display_name: data.display_name || null,
    city_id: data.city_id,
    center_lat: data.center_lat,
    center_lng: data.center_lng,
    radius: data.radius,
    postal_code: data.postal_code || null,
    display_order: data.display_order,
  };
}

export async function createSector(data: SectorFormData): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('geographic_sectors').insert(formToRow(data));
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/sectors');
  return { success: true };
}

export async function updateSector(id: string, data: SectorFormData): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('geographic_sectors').update(formToRow(data)).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/sectors');
  return { success: true };
}

export async function deleteSector(id: string): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('geographic_sectors').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/sectors');
  return { success: true };
}
