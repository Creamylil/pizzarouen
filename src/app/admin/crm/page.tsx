import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEAL_STATUSES } from '../schemas/deal';
import { getCommercials } from '../actions/crm';
import { ExternalLink, Phone } from 'lucide-react';
import PipelineFilters from './PipelineFilters';

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
  assigned_to: string | null;
  last_contact_at: string | null;
  updated_at: string;
}

interface Props {
  searchParams: Promise<{ city?: string; status?: string; commercial?: string }>;
}

export default async function CrmPage({ searchParams }: Props) {
  const filters = await searchParams;
  const crmClient = createCrmClient();
  const supabase = createAdminSupabaseClient();

  const [{ data: deals }, { data: pizzerias }, { data: cities }, commercials] = await Promise.all([
    crmClient.from('pizzeria_deals').select('*').order('updated_at', { ascending: false }),
    supabase.from('pizzerias').select('id, name, city_id'),
    supabase.from('cities').select('id, name').order('name'),
    getCommercials(),
  ]);

  const pizzeriaMap = new Map((pizzerias ?? []).map((p) => [p.id, p]));
  const cityMap = new Map((cities ?? []).map((c) => [c.id, c.name]));
  const commercialMap = new Map(commercials.map((c) => [c.id, c.name]));

  // Enrich deals
  type EnrichedDeal = DealRow & { pizzeria_name: string; city_name: string; city_id: string; commercial_name: string | null };
  const allDeals: EnrichedDeal[] = ((deals as DealRow[] | null) ?? []).map((deal) => {
    const pizzeria = pizzeriaMap.get(deal.pizzeria_id);
    return {
      ...deal,
      pizzeria_name: pizzeria?.name ?? 'Inconnue',
      city_name: pizzeria ? (cityMap.get(pizzeria.city_id) ?? '') : '',
      city_id: pizzeria?.city_id ?? '',
      commercial_name: deal.assigned_to ? (commercialMap.get(deal.assigned_to) ?? null) : null,
    };
  });

  // Apply filters
  let filteredDeals = allDeals;
  if (filters.city) {
    filteredDeals = filteredDeals.filter((d) => d.city_id === filters.city);
  }
  if (filters.status) {
    filteredDeals = filteredDeals.filter((d) => d.status === filters.status);
  }
  if (filters.commercial) {
    if (filters.commercial === 'unassigned') {
      filteredDeals = filteredDeals.filter((d) => !d.assigned_to);
    } else {
      filteredDeals = filteredDeals.filter((d) => d.assigned_to === filters.commercial);
    }
  }

  // Group deals by status
  const grouped = new Map<string, EnrichedDeal[]>();
  for (const status of DEAL_STATUSES) {
    grouped.set(status.value, []);
  }
  for (const deal of filteredDeals) {
    const list = grouped.get(deal.status);
    if (list) list.push(deal);
    else grouped.set(deal.status, [deal]);
  }

  const totalDeals = filteredDeals.length;
  const abonnes = grouped.get('abonne')?.length ?? 0;
  const mrr = filteredDeals
    .filter((d) => d.status === 'abonne' && d.monthly_amount)
    .reduce((sum, d) => sum + (d.monthly_amount ?? 0), 0);

  // Determine which statuses to show
  const statusesToShow = filters.status
    ? DEAL_STATUSES.filter((s) => s.value === filters.status)
    : DEAL_STATUSES;

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pipeline CRM</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalDeals} deal{totalDeals > 1 ? 's' : ''} &middot; {abonnes} abonné{abonnes > 1 ? 's' : ''} &middot; MRR : {mrr.toFixed(0)}&euro;
          </p>
        </div>

        <PipelineFilters
          cities={(cities ?? []).map((c) => ({ id: c.id, name: c.name }))}
          commercials={commercials}
        />
      </div>

      <div className="space-y-6">
        {statusesToShow.map((status) => {
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
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/admin/crm/${deal.pizzeria_id}`}
                              className="font-medium hover:underline"
                            >
                              {deal.pizzeria_name}
                            </Link>
                            <span className="text-sm text-gray-500">{deal.city_name}</span>
                            {deal.contact_name && (
                              <span className="text-sm text-gray-400">({deal.contact_name})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {deal.commercial_name && (
                              <span className="text-xs text-indigo-600">{deal.commercial_name}</span>
                            )}
                            {deal.last_contact_at && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {new Date(deal.last_contact_at).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-4">
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
