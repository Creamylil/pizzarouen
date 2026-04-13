import Link from 'next/link';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Pizza, MapPin, ArrowRightLeft, CreditCard, ClipboardList } from 'lucide-react';
import { DEAL_STATUSES } from './schemas/deal';

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

export default async function AdminDashboardPage() {
  const supabase = createAdminSupabaseClient();
  const crmClient = createCrmClient();

  const [cities, pizzerias, sectors, redirects, dealsResult] = await Promise.all([
    supabase.from('cities').select('id', { count: 'exact', head: true }),
    supabase.from('pizzerias').select('id', { count: 'exact', head: true }),
    supabase.from('geographic_sectors').select('id', { count: 'exact', head: true }),
    supabase.from('city_redirects').select('id', { count: 'exact', head: true }),
    crmClient.from('pizzeria_deals').select('*').order('updated_at', { ascending: false }).limit(5),
  ]);

  const deals = (dealsResult.data as DealRow[] | null) ?? [];
  const pizzeriaIds = [...new Set(deals.map((d) => d.pizzeria_id))];
  const { data: pizzeriaNames } = pizzeriaIds.length > 0
    ? await supabase.from('pizzerias').select('id, name').in('id', pizzeriaIds)
    : { data: [] };
  const nameMap = new Map((pizzeriaNames ?? []).map((p) => [p.id, p.name]));

  const stats = [
    { title: 'Villes', count: cities.count ?? 0, href: '/admin/cities', icon: Building2, color: 'text-blue-600' },
    { title: 'Pizzerias', count: pizzerias.count ?? 0, href: '/admin/pizzerias', icon: Pizza, color: 'text-red-500' },
    { title: 'Secteurs', count: sectors.count ?? 0, href: '/admin/sectors', icon: MapPin, color: 'text-green-600' },
    { title: 'Redirects', count: redirects.count ?? 0, href: '/admin/redirects', icon: ArrowRightLeft, color: 'text-purple-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
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

      {deals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              Derniers deals CRM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {deals.map((deal) => {
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
                      {deal.contact_name && (
                        <span className="text-sm text-gray-400 ml-2">({deal.contact_name})</span>
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
    </div>
  );
}
