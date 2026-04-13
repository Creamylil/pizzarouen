'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { PricingFormData } from '../schemas/pricing';

type ActionResult = { success: true } | { success: false; error: string };

// pricing_plans is not in generated types, use untyped client
function createPricingClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function formToRow(data: PricingFormData) {
  return {
    slug: data.slug,
    name: data.name,
    tagline: data.tagline,
    price_monthly: data.price_monthly,
    price_annual: data.price_annual,
    features: data.features ? data.features.split(',').map((s) => s.trim()).filter(Boolean) : [],
    icon: data.icon,
    color: data.color,
    is_popular: data.is_popular,
    display_order: data.display_order,
  };
}

export async function createPricing(data: PricingFormData): Promise<ActionResult> {
  const supabase = createPricingClient();
  const { error } = await supabase.from('pricing_plans').insert(formToRow(data));
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/pricing');
  return { success: true };
}

export async function updatePricing(id: string, data: PricingFormData): Promise<ActionResult> {
  const supabase = createPricingClient();
  const { error } = await supabase.from('pricing_plans').update(formToRow(data)).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/pricing');
  return { success: true };
}

export async function deletePricing(id: string): Promise<ActionResult> {
  const supabase = createPricingClient();
  const { error } = await supabase.from('pricing_plans').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/pricing');
  return { success: true };
}
