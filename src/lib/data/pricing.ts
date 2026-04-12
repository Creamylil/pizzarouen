import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { PricingPlan } from '@/types/pricing';

/**
 * Client Supabase sans types stricts pour les tables non générées (pricing_plans)
 */
function createUntypedSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface PricingPlanRow {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  icon: string;
  color: string;
  is_popular: boolean;
  display_order: number;
}

export const fetchPricingPlans = cache(async (): Promise<PricingPlan[]> => {
  const supabase = createUntypedSupabaseClient();
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching pricing plans:', error);
    throw error;
  }

  return ((data as PricingPlanRow[]) || []).map((plan) => ({
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    tagline: plan.tagline,
    priceMonthly: plan.price_monthly,
    priceAnnual: plan.price_annual,
    features: plan.features || [],
    icon: plan.icon as PricingPlan['icon'],
    color: plan.color as PricingPlan['color'],
    isPopular: plan.is_popular,
    displayOrder: plan.display_order,
  }));
});
