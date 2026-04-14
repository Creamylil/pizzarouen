import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Pizza, MapPin, ArrowRightLeft, ClipboardList, TrendingUp, Users } from 'lucide-react';
import { DEAL_STATUSES } from './schemas/deal';
import { getCommercials } from './actions/crm';
import { requireAuth } from '@/lib/auth/require-role';

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

export default async function AdminDashboardPage() {
  const session = await requireAuth();
  if (session.role === 'commercial') {
    redirect('/admin/crm');
  }

  const supabase = createAdminSupabaseClient();
  const crmClient = createCrmClient();

  const [cities, pizzerias, sectors, redirects, dealsResult, commercials] = await Promise.all([
    supabase.from('cities').select('id', { count: 'exact', head: true }),
    supabase.from('pizzerias').select('id', { count: 'exact', head: true }),
    supabase.from('geographic_sectors').select('id', { count: 'exact', head: true }),
    supabase.from('city_redirects').select('id', { count: 'exact', head: true }),
    crmClient.from('pizzeria_deals').select('*').order('updated_at', { ascending: false }),
    getCommercials(),
  ]);

  const deals = (dealsResult.data as DealRow[] | null) ?? [];
  const commercialMap = new Map(commercials.map((c) => [c.id, c.name]));

  // Pizzeria names for recent deals
  const pizzeriaIds = [...new Set(deals.map((d) => d.pizzeria_id))];
  const { data: pizzeriaNames } = pizzeriaIds.length > 0
    ? await supabase.from('pizzerias').select('id, name').in('id', pizzeriaIds)
    : { data: [] };
  const nameMap = new Map((pizzeriaNames ?? []).map((p) => [p.id, p.name]));

  // Stats CRM
  const totalDeals = deals.length;
  const abonnes = deals.filter((d) => d.status === 'abonne').length;
  const mrr = deals
    .filter((d) => d.status === 'abonne' && d.monthly_amount)
    .reduce((sum, d) => sum + (d.monthly_amount ?? 0), 0);
  const prospects = deals.filter((d) => d.status === 'prospect').length;
  const contacted = deals.filter((d) => ['contacte', 'interesse', 'negocie'].includes(d.status)).length;
  const conversionRate = totalDeals > 0 ? ((abonnes / totalDeals) * 100).toFixed(1) : '0';

  // Stats par commercial
  const commercialStats = commercials.map((c) => {
    const assigned = deals.filter((d) => d.assigned_to === c.id);
    const abonnesCount = assigned.filter((d) => d.status === 'abonne').length;
    const commercialMrr = assigned
      .filter((d) => d.status === 'abonne' && d.monthly_amount)
      .reduce((sum, d) => sum + (d.monthly_amount ?? 0), 0);
    return { ...c, total: assigned.length, abonnes: abonnesCount, mrr: commercialMrr };
  }).filter((c) => c.total > 0);

  const recentDeals = deals.slice(0, 5);

  const dataStats = [
    { title: 'Villes', count: cities.count ?? 0, href: '/admin/cities', icon: Building2, color: 'text-blue-600' },
    { title: 'Pizzerias', count: pizzerias.count ?? 0, href: '/admin/pizzerias', icon: Pizza, color: 'text-red-500' },
    { title: 'Secteurs', count: sectors.count ?? 0, href: '/admin/sectors', icon: MapPin, color: 'text-green-600' },
    { title: 'Redirects', count: redirects.count ?? 0, href: '/admin/redirects', icon: ArrowRightLeft, color: 'text-purple-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Data stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dataStats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.count}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* CRM stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/crm">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Deals CRM</CardTitle>
              <ClipboardList className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalDeals}</div>
              <p className="text-xs text-gray-500 mt-1">{prospects} prospects &middot; {contacted} en cours</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/crm?status=abonne">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Abonnés</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{abonnes}</div>
              <p className="text-xs text-gray-500 mt-1">Taux : {conversionRate}%</p>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">MRR</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mrr.toFixed(0)}&euro;</div>
            <p className="text-xs text-gray-500 mt-1">Revenu mensuel récurrent</p>
          </CardContent>
        </Card>
        <Link href="/admin/commercials">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Commerciaux</CardTitle>
              <Users className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{commercials.length}</div>
              <p className="text-xs text-gray-500 mt-1">{commercialStats.length} actif{commercialStats.length > 1 ? 's' : ''} avec deals</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent deals */}
        {recentDeals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                Derniers deals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {recentDeals.map((deal) => {
                  const statusInfo = DEAL_STATUSES.find((s) => s.value === deal.status);
                  return (
                    <div key={deal.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div>
                        <Link
                          href={`/admin/crm/${deal.pizzeria_id}`}
                          className="font-medium hover:underline"
                        >
                          {nameMap.get(deal.pizzeria_id) ?? 'Pizzeria inconnue'}
                        </Link>
                        {deal.assigned_to && (
                          <span className="text-xs text-indigo-600 ml-2">
                            {commercialMap.get(deal.assigned_to) ?? ''}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {statusInfo && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        )}
                        {deal.monthly_amount != null && deal.monthly_amount > 0 && (
                          <span className="text-sm font-medium">{deal.monthly_amount}&euro;/mois</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(deal.updated_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link href="/admin/crm" className="text-sm text-blue-600 hover:underline mt-3 inline-block">
                Voir le pipeline complet
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Commercial performance */}
        {commercialStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Performance commerciaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {commercialStats.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <span className="font-medium">{c.name}</span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {c.total} deal{c.total > 1 ? 's' : ''} &middot; {c.abonnes} abonné{c.abonnes > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-green-600">{c.mrr.toFixed(0)}&euro;</span>
                      <p className="text-xs text-gray-400">MRR</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/admin/commercials" className="text-sm text-blue-600 hover:underline mt-3 inline-block">
                Gérer les commerciaux
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
