import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEAL_STATUSES } from '../schemas/deal';
import { ExternalLink } from 'lucide-react';

function createCrmClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

interface DealRow {
  id: string;
  pizzeria_id: string;
  status: string;
  pricing_plan_slug: string | null;
  monthly_amount: number | null;
  contact_name: string | null;
  updated_at: string;
}

export default async function CrmPage() {
  const crmClient = createCrmClient();
  const supabase = createAdminSupabaseClient();

  const [{ data: deals }, { data: pizzerias }, { data: cities }] = await Promise.all([
    crmClient.from('pizzeria_deals').select('*').order('updated_at', { ascending: false }),
    supabase.from('pizzerias').select('id, name, city_id'),
    supabase.from('cities').select('id, name'),
  ]);

  const pizzeriaMap = new Map((pizzerias ?? []).map((p) => [p.id, p]));
  const cityMap = new Map((cities ?? []).map((c) => [c.id, c.name]));

  // Group deals by status
  const grouped = new Map<string, (DealRow & { pizzeria_name: string; city_name: string })[]>();
  for (const status of DEAL_STATUSES) {
    grouped.set(status.value, []);
  }
  for (const deal of (deals as DealRow[] | null) ?? []) {
    const pizzeria = pizzeriaMap.get(deal.pizzeria_id);
    const enriched = {
      ...deal,
      pizzeria_name: pizzeria?.name ?? 'Inconnue',
      city_name: pizzeria ? (cityMap.get(pizzeria.city_id) ?? '') : '',
    };
    const list = grouped.get(deal.status);
    if (list) list.push(enriched);
    else grouped.set(deal.status, [enriched]);
  }

  const totalDeals = (deals as DealRow[] | null)?.length ?? 0;
  const abonnes = grouped.get('abonne')?.length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pipeline CRM</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalDeals} deal{totalDeals > 1 ? 's' : ''} &middot; {abonnes} abonné{abonnes > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {DEAL_STATUSES.map((status) => {
          const items = grouped.get(status.value) ?? [];
          return (
            <Card key={status.value}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-sm text-gray-400 font-normal">{items.length}</span>
                </CardTitle>
              </CardHeader>
              {items.length > 0 && (
                <CardContent>
                  <div className="divide-y">
                    {items.map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                        <div>
                          <Link
                            href={`/admin/crm/${deal.pizzeria_id}`}
                            className="font-medium hover:underline"
                          >
                            {deal.pizzeria_name}
                          </Link>
                          <span className="text-sm text-gray-500 ml-2">{deal.city_name}</span>
                          {deal.contact_name && (
                            <span className="text-sm text-gray-400 ml-2">({deal.contact_name})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {deal.pricing_plan_slug && (
                            <Badge variant="outline">{deal.pricing_plan_slug}</Badge>
                          )}
                          {deal.monthly_amount != null && deal.monthly_amount > 0 && (
                            <span className="text-sm font-medium">{deal.monthly_amount}&euro;/mois</span>
                          )}
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/crm/${deal.pizzeria_id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
