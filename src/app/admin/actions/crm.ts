'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { DealFormData, EventFormData } from '../schemas/deal';

type ActionResult = { success: true } | { success: false; error: string };

// CRM tables are not in generated types
function createCrmClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function upsertDeal(
  pizzeriaId: string,
  data: DealFormData,
  existingDealId?: string
): Promise<ActionResult> {
  const supabase = createCrmClient();
  const row = {
    pizzeria_id: pizzeriaId,
    status: data.status,
    assigned_to: data.assigned_to || null,
    pricing_plan_slug: data.pricing_plan_slug || null,
    monthly_amount: data.monthly_amount,
    subscription_start: data.subscription_start || null,
    subscription_end: data.subscription_end || null,
    payment_method: data.payment_method || null,
    contact_name: data.contact_name || null,
    contact_phone: data.contact_phone || null,
    contact_email: data.contact_email || null,
    notes: data.notes || null,
    updated_at: new Date().toISOString(),
  };

  if (existingDealId) {
    const { error } = await supabase.from('pizzeria_deals').update(row).eq('id', existingDealId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from('pizzeria_deals').insert(row);
    if (error) return { success: false, error: error.message };
  }
  revalidatePath(`/admin/crm/${pizzeriaId}`);
  revalidatePath('/admin/crm');
  return { success: true };
}

export async function changeStatus(
  dealId: string,
  pizzeriaId: string,
  oldStatus: string,
  newStatus: string
): Promise<ActionResult> {
  const supabase = createCrmClient();

  const { error: updateError } = await supabase
    .from('pizzeria_deals')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', dealId);

  if (updateError) return { success: false, error: updateError.message };

  // Log the status change event
  const { error: eventError } = await supabase.from('deal_events').insert({
    deal_id: dealId,
    event_type: 'changement_statut',
    description: `Statut changé de "${oldStatus}" à "${newStatus}"`,
    old_status: oldStatus,
    new_status: newStatus,
  });

  if (eventError) return { success: false, error: eventError.message };

  revalidatePath(`/admin/crm/${pizzeriaId}`);
  revalidatePath('/admin/crm');
  return { success: true };
}

export async function addEvent(
  dealId: string,
  pizzeriaId: string,
  data: EventFormData
): Promise<ActionResult> {
  const supabase = createCrmClient();
  const { error } = await supabase.from('deal_events').insert({
    deal_id: dealId,
    event_type: data.event_type,
    description: data.description,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/crm/${pizzeriaId}`);
  return { success: true };
}

export async function logCall(
  dealId: string,
  pizzeriaId: string,
  note?: string
): Promise<ActionResult> {
  const supabase = createCrmClient();
  const now = new Date().toISOString();

  // Update last_contact_at
  const { error: updateError } = await supabase
    .from('pizzeria_deals')
    .update({ last_contact_at: now, updated_at: now })
    .eq('id', dealId);

  if (updateError) return { success: false, error: updateError.message };

  // Log the call event
  const { error: eventError } = await supabase.from('deal_events').insert({
    deal_id: dealId,
    event_type: 'appel',
    description: note || 'Appel passé',
  });

  if (eventError) return { success: false, error: eventError.message };

  revalidatePath(`/admin/crm/${pizzeriaId}`);
  revalidatePath('/admin/crm');
  return { success: true };
}

export async function deleteDeal(dealId: string, pizzeriaId: string): Promise<ActionResult> {
  const supabase = createCrmClient();
  const { error } = await supabase.from('pizzeria_deals').delete().eq('id', dealId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/crm/${pizzeriaId}`);
  revalidatePath('/admin/crm');
  return { success: true };
}

// Commercials CRUD
export async function getCommercials() {
  const supabase = createCrmClient();
  const { data } = await supabase
    .from('commercials')
    .select('*')
    .eq('active', true)
    .order('name');
  return (data as { id: string; name: string; email: string | null; phone: string | null }[] | null) ?? [];
}

export async function getAllCommercials() {
  const supabase = createCrmClient();
  const { data } = await supabase
    .from('commercials')
    .select('*')
    .order('name');
  return (data as { id: string; name: string; email: string | null; phone: string | null; active: boolean; created_at: string }[] | null) ?? [];
}

export async function upsertCommercial(
  data: { name: string; email: string; phone: string },
  existingId?: string
): Promise<ActionResult> {
  const supabase = createCrmClient();
  const row = {
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
  };

  if (existingId) {
    const { error } = await supabase.from('commercials').update(row).eq('id', existingId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from('commercials').insert(row);
    if (error) return { success: false, error: error.message };
  }
  revalidatePath('/admin/commercials');
  revalidatePath('/admin/crm');
  return { success: true };
}

export async function toggleCommercialActive(id: string, active: boolean): Promise<ActionResult> {
  const supabase = createCrmClient();
  const { error } = await supabase.from('commercials').update({ active }).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/commercials');
  revalidatePath('/admin/crm');
  return { success: true };
}
