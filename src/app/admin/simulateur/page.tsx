import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/auth/require-role';
import SimulateurAdmin from './SimulateurAdmin';
import SimulateurCommercial from './SimulateurCommercial';

function createCrmClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export default async function SimulateurPage() {
  const session = await requirePermission('simulateur');

  if (session.role === 'admin') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Simulateur de commissions</h1>
        <SimulateurAdmin />
      </div>
    );
  }

  // Commercial — fetch their active "abonne" deals
  const crmClient = createCrmClient();
  const { data: rawDeals } = await crmClient
    .from('pizzeria_deals')
    .select('id, monthly_amount, subscription_start, pizzeria_id')
    .eq('assigned_to', session.commercial.id)
    .eq('status', 'abonne');

  // Fetch pizzeria names for enrichment
  const deals = (rawDeals as Array<{
    id: string;
    monthly_amount: number | null;
    subscription_start: string | null;
    pizzeria_id: string;
  }>) ?? [];

  const pizzeriaIds = [...new Set(deals.map((d) => d.pizzeria_id))];

  let pizzeriaMap = new Map<string, string>();
  if (pizzeriaIds.length > 0) {
    const { createAdminSupabaseClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminSupabaseClient();
    const { data: pizzerias } = await supabase
      .from('pizzerias')
      .select('id, name')
      .in('id', pizzeriaIds);
    pizzeriaMap = new Map((pizzerias ?? []).map((p) => [p.id, p.name]));
  }

  const enrichedDeals = deals
    .filter((d) => d.monthly_amount && d.subscription_start)
    .map((d) => ({
      id: d.id,
      pizzeria_name: pizzeriaMap.get(d.pizzeria_id) ?? 'Inconnue',
      monthly_amount: d.monthly_amount!,
      subscription_start: d.subscription_start!,
    }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Simulateur de commissions</h1>
      <SimulateurCommercial
        commercial={{
          name: session.commercial.name,
          commission_month1_rate: session.commercial.commission_month1_rate,
          commission_recurring_rate: session.commercial.commission_recurring_rate,
          commission_duration_months: session.commercial.commission_duration_months,
        }}
        deals={enrichedDeals}
      />
    </div>
  );
}
