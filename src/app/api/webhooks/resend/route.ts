import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createCrmClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

const STATUS_MAP: Record<string, string> = {
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.delivered_delayed': 'delivered',
  'email.opened': 'opened',
  'email.bounced': 'bounced',
  'email.complained': 'bounced',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const webhookType = body?.type as string;
    const status = STATUS_MAP[webhookType];
    if (!status) {
      return NextResponse.json({ received: true });
    }

    const resendId = body?.data?.email_id as string;
    if (!resendId) {
      return NextResponse.json({ error: 'Missing email_id' }, { status: 400 });
    }

    const supabase = createCrmClient();

    // Trouver l'event par Resend ID
    const { data: events } = await supabase
      .from('deal_events')
      .select('id, email_metadata')
      .eq('event_type', 'email')
      .not('email_metadata', 'is', null);

    // Filtrer côté JS car le filtre JSONB nested ne fonctionne pas avec les tables non typées
    const event = (events || []).find((e) => {
      const meta = e.email_metadata as Record<string, unknown>;
      return meta?.resend_id === resendId;
    });

    if (!event) {
      return NextResponse.json({ received: true, note: 'event not found' });
    }

    // Mettre à jour le statut
    const currentMetadata = event.email_metadata as Record<string, unknown>;
    const updatedMetadata = {
      ...currentMetadata,
      status,
      [`${status}_at`]: body.created_at || new Date().toISOString(),
    };

    await supabase
      .from('deal_events')
      .update({ email_metadata: updatedMetadata })
      .eq('id', event.id);

    return NextResponse.json({ received: true, status });
  } catch (error) {
    console.error('Resend webhook error:', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
