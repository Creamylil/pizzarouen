import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import DealCard from './DealCard';
import Timeline from './Timeline';
import AddEventButton from './AddEventButton';

function createCrmClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export default async function CrmPizzeriaPage({ params }: { params: Promise<{ pizzeriaId: string }> }) {
  const { pizzeriaId } = await params;
  const supabase = createAdminSupabaseClient();
  const crmClient = createCrmClient();

  const { data: pizzeria } = await supabase
    .from('pizzerias')
    .select('id, name, address, phone, city_id, cities(name)')
    .eq('id', pizzeriaId)
    .single();

  if (!pizzeria) notFound();

  const { data: deal } = await crmClient
    .from('pizzeria_deals')
    .select('*')
    .eq('pizzeria_id', pizzeriaId)
    .single();

  const { data: events } = deal
    ? await crmClient
        .from('deal_events')
        .select('*')
        .eq('deal_id', (deal as Record<string, unknown>).id)
        .order('created_at', { ascending: false })
    : { data: [] };

  const cityName = (pizzeria.cities as unknown as { name: string })?.name ?? '';

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{pizzeria.name}</h1>
        <p className="text-gray-500">{pizzeria.address} &middot; {cityName}</p>
        {pizzeria.phone && <p className="text-gray-500">{pizzeria.phone}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DealCard
            pizzeriaId={pizzeriaId}
            deal={deal as Record<string, unknown> | null}
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Historique</h2>
              {deal && (
                <AddEventButton
                  dealId={(deal as Record<string, unknown>).id as string}
                  pizzeriaId={pizzeriaId}
                />
              )}
            </div>
            <Timeline events={(events as Record<string, unknown>[] | null) ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
