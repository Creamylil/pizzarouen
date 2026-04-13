'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { RedirectFormData } from '../schemas/redirect';

type ActionResult = { success: true } | { success: false; error: string };

export async function createRedirect(data: RedirectFormData): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('city_redirects').insert(data);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/redirects');
  return { success: true };
}

export async function updateRedirect(id: string, data: RedirectFormData): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('city_redirects').update(data).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/redirects');
  return { success: true };
}

export async function deleteRedirect(id: string): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('city_redirects').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/redirects');
  return { success: true };
}
