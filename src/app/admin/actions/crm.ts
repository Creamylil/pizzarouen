'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { DealFormData, EventFormData } from '../schemas/deal';

type ActionResult = { success: true } | { success: false; error: string };
type PaymentLinkResult = { success: true; url: string } | { success: false; error: string };

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
  // Si paiement annuel, stocker le mensuel (÷12)
  const monthlyAmount = data.is_annual && data.monthly_amount
    ? Math.round((data.monthly_amount / 12) * 100) / 100
    : data.monthly_amount;

  const row = {
    pizzeria_id: pizzeriaId,
    status: data.status,
    assigned_to: data.assigned_to || null,
    pricing_plan_slug: data.pricing_plan_slug || null,
    monthly_amount: monthlyAmount,
    is_annual: data.is_annual,
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
  revalidatePath('/admin/crm/fiches');
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
  revalidatePath('/admin/crm/fiches');
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
  revalidatePath('/admin/crm/fiches');
  return { success: true };
}

export async function deleteDeal(dealId: string, pizzeriaId: string): Promise<ActionResult> {
  const supabase = createCrmClient();
  const { error } = await supabase.from('pizzeria_deals').delete().eq('id', dealId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/crm/${pizzeriaId}`);
  revalidatePath('/admin/crm');
  revalidatePath('/admin/crm/fiches');
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
  return (data as {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    active: boolean;
    created_at: string;
    user_id: string | null;
    can_see_all_deals: boolean;
    commission_month1_rate: number | null;
    commission_recurring_rate: number | null;
    commission_duration_months: number | null;
  }[] | null) ?? [];
}

export async function upsertCommercial(
  data: {
    name: string;
    email: string;
    phone: string;
    user_id: string;
    can_see_all_deals: boolean;
    commission_month1_rate: number | null;
    commission_recurring_rate: number | null;
    commission_duration_months: number | null;
  },
  existingId?: string
): Promise<ActionResult> {
  const crmClient = createCrmClient();
  const row = {
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    user_id: data.user_id || null,
    can_see_all_deals: data.can_see_all_deals,
    commission_month1_rate: data.commission_month1_rate,
    commission_recurring_rate: data.commission_recurring_rate,
    commission_duration_months: data.commission_duration_months,
  };

  if (existingId) {
    const { error } = await crmClient.from('commercials').update(row).eq('id', existingId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await crmClient.from('commercials').insert(row);
    if (error) return { success: false, error: error.message };
  }

  // Assign 'commercial' role in user_roles if user_id is provided
  if (data.user_id) {
    await crmClient.from('user_roles').upsert(
      { user_id: data.user_id, role: 'commercial' },
      { onConflict: 'user_id,role' }
    );
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

// Deal Notes
export async function addNote(
  dealId: string,
  pizzeriaId: string,
  content: string,
  noteDate: string
): Promise<ActionResult> {
  const supabase = createCrmClient();
  const { error } = await supabase.from('deal_notes').insert({
    deal_id: dealId,
    content,
    note_date: noteDate,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/crm/${pizzeriaId}`);
  return { success: true };
}

export async function getNotesForDeal(dealId: string) {
  const supabase = createCrmClient();
  const { data } = await supabase
    .from('deal_notes')
    .select('*')
    .eq('deal_id', dealId)
    .order('note_date', { ascending: false });
  return (data as { id: string; deal_id: string; content: string; note_date: string; created_at: string }[] | null) ?? [];
}

// Stripe Payment Link Generation
const PLAN_LABELS: Record<string, string> = {
  referencement: 'Référencement',
  priorite: 'Priorité',
  'coup-de-coeur': 'Coup de Cœur',
};

export async function generatePaymentLink(
  dealId: string,
  pizzeriaId: string,
  paymentType: 'one_time' | 'recurring'
): Promise<PaymentLinkResult> {
  try {
    const crmClient = createCrmClient();
    const adminClient = createAdminSupabaseClient();

    // Fetch deal and pizzeria in parallel
    const [dealResult, pizzeriaResult] = await Promise.all([
      crmClient.from('pizzeria_deals').select('*').eq('id', dealId).single(),
      adminClient.from('pizzerias').select('id, name').eq('id', pizzeriaId).single(),
    ]);

    const deal = dealResult.data as Record<string, unknown> | null;
    const pizzeria = pizzeriaResult.data;

    if (!deal) return { success: false, error: 'Deal introuvable' };
    if (!pizzeria) return { success: false, error: 'Pizzeria introuvable' };

    const monthlyAmount = deal.monthly_amount as number | null;
    const isAnnual = deal.is_annual as boolean;
    const pricingPlan = deal.pricing_plan_slug as string | null;
    const contactEmail = deal.contact_email as string | null;
    const contactName = deal.contact_name as string | null;

    if (!monthlyAmount || monthlyAmount <= 0) {
      return { success: false, error: 'Montant non défini sur le deal' };
    }

    // Calculate amount in cents
    let amountInCents: number;
    let description: string;

    if (paymentType === 'one_time') {
      if (isAnnual) {
        amountInCents = Math.round(monthlyAmount * 12 * 100);
        description = `${(monthlyAmount * 12).toFixed(2)}€ (annuel)`;
      } else {
        amountInCents = Math.round(monthlyAmount * 100);
        description = `${monthlyAmount.toFixed(2)}€`;
      }
    } else {
      // Recurring: always monthly
      amountInCents = Math.round(monthlyAmount * 100);
      description = `${monthlyAmount.toFixed(2)}€/mois`;
    }

    const planLabel = PLAN_LABELS[pricingPlan ?? ''] ?? pricingPlan ?? 'Standard';
    const productName = `Formule ${planLabel} — ${pizzeria.name}`;

    const stripe = getStripe();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pizzarouen.fr';

    // Build Stripe Checkout Session params
    const sessionParams: Record<string, unknown> = {
      mode: paymentType === 'one_time' ? 'payment' : 'subscription',
      currency: 'eur',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: productName,
              metadata: {
                deal_id: dealId,
                pizzeria_id: pizzeriaId,
                pricing_plan_slug: pricingPlan ?? '',
              },
            },
            unit_amount: amountInCents,
            ...(paymentType === 'recurring'
              ? { recurring: { interval: 'month' as const } }
              : {}),
          },
          quantity: 1,
        },
      ],
      // Collecter l'adresse de facturation complète du client
      billing_address_collection: 'required',
      // Collecter le numéro de téléphone
      phone_number_collection: { enabled: true },
      // Champs personnalisés : nom de l'entreprise du client
      custom_fields: [
        {
          key: 'company_name',
          label: { type: 'custom', custom: 'Nom de l\'entreprise' },
          type: 'text',
          optional: true,
        },
        {
          key: 'siret',
          label: { type: 'custom', custom: 'SIRET (optionnel)' },
          type: 'text',
          optional: true,
        },
      ],
      // Moyens de paiement : gérés automatiquement par Stripe Dashboard
      // (pas de payment_method_types forcés — Stripe propose ceux activés dans le Dashboard)
      metadata: {
        deal_id: dealId,
        pizzeria_id: pizzeriaId,
        pricing_plan_slug: pricingPlan ?? '',
        payment_type: paymentType,
      },
      success_url: `${siteUrl}/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: siteUrl,
    };

    // Pre-fill customer email if available
    if (contactEmail) {
      sessionParams.customer_email = contactEmail;
    }

    // Enable invoice for one-time payments (subscriptions auto-generate invoices)
    if (paymentType === 'one_time') {
      sessionParams.invoice_creation = { enabled: true };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await stripe.checkout.sessions.create(sessionParams as any);

    if (!session.url) {
      return { success: false, error: 'Stripe n\'a pas retourné d\'URL' };
    }

    // Save the payment link on the deal
    await crmClient
      .from('pizzeria_deals')
      .update({
        last_payment_link: session.url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dealId);

    // Log event in timeline
    const eventDesc = `Lien de paiement généré : ${paymentType === 'one_time' ? 'Paiement unique' : 'Abonnement mensuel'} — ${description} — ${productName}${contactName ? ` (${contactName})` : ''}`;
    await crmClient.from('deal_events').insert({
      deal_id: dealId,
      event_type: 'lien_paiement',
      description: eventDesc,
    });

    revalidatePath(`/admin/crm/${pizzeriaId}`);
    revalidatePath('/admin/crm');
    revalidatePath('/admin/crm/fiches');

    return { success: true, url: session.url };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: `Erreur Stripe : ${message}` };
  }
}
