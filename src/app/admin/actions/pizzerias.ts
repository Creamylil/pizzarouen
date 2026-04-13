'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { PizzeriaFormData } from '../schemas/pizzeria';
import { formToRow } from '../schemas/pizzeria';

type ActionResult = { success: true } | { success: false; error: string };

export async function createPizzeria(data: PizzeriaFormData): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('pizzerias').insert(formToRow(data));
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/pizzerias');
  return { success: true };
}

export async function updatePizzeria(id: string, data: PizzeriaFormData): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('pizzerias').update(formToRow(data)).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/pizzerias');
  return { success: true };
}

export async function deletePizzeria(id: string): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('pizzerias').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/pizzerias');
  return { success: true };
}
