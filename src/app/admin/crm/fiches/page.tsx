import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEAL_STATUSES } from '../../schemas/deal';
import { getCommercials } from '../../actions/crm';
import { ExternalLink, Phone } from 'lucide-react';
import FichesFilters from './FichesFilters';
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
  assigned_to: string | null;
  monthly_amount: number | null;
  last_contact_at: string | null;
  pricing_plan_slug: string | null;
  contact_name: string | null;
  contact_phone: string | null;
}

interface Props {
  searchParams: Promise<{ city?: string; status?: string; commercial?: string; q?: string }>;
}

export default async function FichesCommercialesPage({ searchParams }: Props) {
  const session = await requireAuth();
  const filters = await searchParams;
  const supabase = createAdminSupabaseClient();
  const crmClient = createCrmClient();

  const [{ data: pizzerias }, { data: deals }, { data: cities }, commercials] = await Promise.all([
    supabase.from('pizzerias').select('id, name, address, phone, city_id, cities(name)').order('name'),
    crmClient.from('pizzeria_deals').select('*'),
    supabase.from('cities').select('id, name').order('name'),
    getCommercials(),
  ]);

  const dealMap = new Map(
    ((deals as DealRow[] | null) ?? []).map((d) => [d.pizzeria_id, d])
  );
  const commercialMap = new Map(commercials.map((c) => [c.id, c.name]));

  // Build enriched rows: each pizzeria + its deal data (or null)
  type FicheRow = {
    id: string;
    name: string;
    city_name: string;
    city_id: string;
    phone: string | null;
    deal_id: string | null;
    status: string | null;
    assigned_to: string | null;
    commercial_name: string | null;
    monthly_amount: number | null;
    last_contact_at: string | null;
    pricing_plan_slug: string | null;
    contact_name: string | null;
    contact_phone: string | null;
  };

  let rows: FicheRow[] = (pizzerias ?? []).map((p) => {
    const deal = dealMap.get(p.id) ?? null;
    return {
      id: p.id,
      name: p.name,
      city_name: (p.cities as unknown as { name: string })?.name ?? '',
      city_id: p.city_id,
      phone: p.phone,
      deal_id: deal?.id ?? null,
      status: deal?.status ?? null,
      assigned_to: deal?.assigned_to ?? null,
      commercial_name: deal?.assigned_to ? (commercialMap.get(deal.assigned_to) ?? null) : null,
      monthly_amount: deal?.monthly_amount ?? null,
      last_contact_at: deal?.last_contact_at ?? null,
      pricing_plan_slug: deal?.pricing_plan_slug ?? null,
      contact_name: deal?.contact_name ?? null,
      contact_phone: deal?.contact_phone ?? null,
    };
  });

  // Role-based visibility: restricted commercials only see their assigned deals
  const isRestrictedCommercial = session.role === 'commercial' && !session.commercial?.can_see_all_deals;
  if (isRestrictedCommercial) {
    rows = rows.filter((r) => r.assigned_to === session.commercial!.id);
  }

  // Apply filters
  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter((r) => r.name.toLowerCase().includes(q));
  }
  if (filters.city) {
    rows = rows.filter((r) => r.city_id === filters.city);
  }
  if (filters.status) {
    if (filters.status === 'no_deal') {
      rows = rows.filter((r) => !r.deal_id);
    } else {
      rows = rows.filter((r) => r.status === filters.status);
    }
  }
  if (filters.commercial) {
    if (filters.commercial === 'unassigned') {
      rows = rows.filter((r) => !r.assigned_to);
    } else {
      rows = rows.filter((r) => r.assigned_to === filters.commercial);
    }
  }

  // Sort: no deal first (new prospects), then oldest last_contact, then alphabetical
  rows.sort((a, b) => {
    // No deal = top priority
    if (!a.deal_id && b.deal_id) return -1;
    if (a.deal_id && !b.deal_id) return 1;
    // Then by last_contact_at (oldest first = needs attention)
    if (a.last_contact_at && b.last_contact_at) {
      return new Date(a.last_contact_at).getTime() - new Date(b.last_contact_at).getTime();
    }
    if (a.last_contact_at && !b.last_contact_at) return 1;
    if (!a.last_contact_at && b.last_contact_at) return -1;
    // Then alphabetical
    return a.name.localeCompare(b.name);
  });

  // Stats
  const totalPizzerias = rows.length;
  const withDeal = rows.filter((r) => r.deal_id).length;
  const abonnes = rows.filter((r) => r.status === 'abonne').length;

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Fiches commerciales</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalPizzerias} pizzeria{totalPizzerias > 1 ? 's' : ''} &middot; {withDeal} avec deal &middot; {abonnes} abonné{abonnes > 1 ? 's' : ''}
          </p>
        </div>
        <FichesFilters
          cities={(cities ?? []).map((c) => ({ id: c.id, name: c.name }))}
          commercials={commercials}
          isCommercial={isRestrictedCommercial}
        />
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pizzeria</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Commercial</TableHead>
              <TableHead>Dernier contact</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead className="w-16">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                  Aucune pizzeria trouvée.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const statusInfo = row.status
                  ? DEAL_STATUSES.find((s) => s.value === row.status)
                  : null;

                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/admin/crm/${row.id}`}
                          className="font-medium hover:underline"
                        >
                          {row.name}
                        </Link>
                        {row.contact_name && (
                          <p className="text-xs text-gray-400">{row.contact_name}</p>
                        )}
                        {row.contact_phone && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {row.contact_phone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">{row.city_name}</TableCell>
                    <TableCell>
                      {statusInfo ? (
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-400">Nouveau</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.commercial_name ? (
                        <span className="text-sm text-indigo-600">{row.commercial_name}</span>
                      ) : (
                        <span className="text-sm text-gray-300">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.last_contact_at ? (
                        <span className="text-sm text-gray-500">
                          {new Date(row.last_contact_at).toLocaleDateString('fr-FR')}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-300">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.monthly_amount != null && row.monthly_amount > 0 ? (
                        <span className="text-sm font-medium">{row.monthly_amount}&euro;/mois</span>
                      ) : (
                        <span className="text-sm text-gray-300">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/crm/${row.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
