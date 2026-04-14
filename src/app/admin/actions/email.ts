'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { getResend, FROM_EMAIL } from '@/lib/resend';
import { renderQuickEmail } from '@/lib/email-templates/quick-email';
import { renderWelcomeEmail, WELCOME_SUBJECT } from '@/lib/email-templates/welcome-email';
import type { EmailComposerData } from '../schemas/email';

type ActionResult = { success: true } | { success: false; error: string };

function createCrmClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Envoi d'un email rapide depuis la fiche CRM
 */
export async function sendQuickEmail(
  dealId: string,
  pizzeriaId: string,
  data: EmailComposerData
): Promise<ActionResult> {
  try {
    const resend = getResend();
    const html = renderQuickEmail(data.body);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: data.subject,
      html,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    // Log dans la timeline
    const supabase = createCrmClient();
    const { error: eventError } = await supabase.from('deal_events').insert({
      deal_id: dealId,
      event_type: 'email',
      description: `Email envoyé : "${data.subject}" → ${data.to}`,
      email_metadata: {
        resend_id: result.data?.id,
        status: 'sent',
        recipient: data.to,
        subject: data.subject,
        sent_at: new Date().toISOString(),
      },
    });

    if (eventError) {
      return { success: false, error: eventError.message };
    }

    revalidatePath(`/admin/crm/${pizzeriaId}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Envoi automatique du mail de bienvenue
 * Vérifie qu'aucun welcome n'a déjà été envoyé à CETTE adresse pour ce deal
 */
export async function sendWelcomeEmail(
  dealId: string,
  pizzeriaId: string,
  pizzeriaName: string,
  contactEmail: string,
  contactName: string
): Promise<ActionResult> {
  try {
    const supabase = createCrmClient();

    // Vérifier si un welcome a déjà été envoyé à cette adresse
    const { data: existingWelcomes } = await supabase
      .from('deal_events')
      .select('id, email_metadata')
      .eq('deal_id', dealId)
      .eq('event_type', 'email')
      .not('email_metadata', 'is', null);

    const alreadySent = (existingWelcomes || []).some((event) => {
      const meta = event.email_metadata as Record<string, unknown>;
      return meta?.is_welcome_email === true && meta?.recipient === contactEmail;
    });

    if (alreadySent) {
      return { success: false, error: 'Email de bienvenue déjà envoyé à cette adresse' };
    }

    const resend = getResend();
    const html = renderWelcomeEmail(pizzeriaName, contactName);
    const subject = `${WELCOME_SUBJECT} — ${pizzeriaName}`;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: contactEmail,
      subject,
      html,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    // Log dans la timeline avec flag welcome
    const { error: eventError } = await supabase.from('deal_events').insert({
      deal_id: dealId,
      event_type: 'email',
      description: `Email de bienvenue envoyé → ${contactEmail}`,
      email_metadata: {
        resend_id: result.data?.id,
        status: 'sent',
        recipient: contactEmail,
        subject,
        sent_at: new Date().toISOString(),
        is_welcome_email: true,
      },
    });

    if (eventError) {
      return { success: false, error: eventError.message };
    }

    revalidatePath(`/admin/crm/${pizzeriaId}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}
