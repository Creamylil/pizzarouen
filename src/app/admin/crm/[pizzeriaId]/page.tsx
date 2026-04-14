import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import DealCard from './DealCard';
import NotesSection from './NotesSection';
import Timeline from './Timeline';
import AddEventButton from './AddEventButton';
import LogCallButton from './LogCallButton';
import GeneratePaymentButton from './GeneratePaymentButton';
import EmailComposer from './EmailComposer';
import EmailStatusBadge from './EmailStatusBadge';
import { getCommercials, getNotesForDeal } from '../../actions/crm';
import { sendWelcomeEmail } from '../../actions/email';

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

  const [pizzeriaResult, dealResult, commercials] = await Promise.all([
    supabase
      .from('pizzerias')
      .select('id, name, address, phone, city_id, cities(name)')
      .eq('id', pizzeriaId)
      .single(),
    crmClient
      .from('pizzeria_deals')
      .select('*')
      .eq('pizzeria_id', pizzeriaId)
      .single(),
    getCommercials(),
  ]);

  const pizzeria = pizzeriaResult.data;
  if (!pizzeria) notFound();

  const deal = dealResult.data as Record<string, unknown> | null;

  // Auto-send welcome email si contact_email renseigné
  if (deal) {
    const contactEmail = deal.contact_email as string | null;
    if (contactEmail) {
      sendWelcomeEmail(
        deal.id as string,
        pizzeriaId,
        pizzeria.name,
        contactEmail,
        (deal.contact_name as string) || '',
      ).catch(() => {
        // Silently fail — déjà envoyé ou erreur
      });
    }
  }

  // Fetch events and notes in parallel (only if deal exists)
  const [eventsResult, notes] = deal
    ? await Promise.all([
        crmClient
          .from('deal_events')
          .select('*')
          .eq('deal_id', deal.id)
          .order('created_at', { ascending: false }),
        getNotesForDeal(deal.id as string),
      ])
    : [{ data: [] }, []];

  const events = eventsResult.data;

  const cityName = (pizzeria.cities as unknown as { name: string })?.name ?? '';
  const assignedCommercial = deal?.assigned_to
    ? commercials.find((c) => c.id === deal.assigned_to)
    : null;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{pizzeria.name}</h1>
        <p className="text-gray-500">{pizzeria.address} &middot; {cityName}</p>
        {pizzeria.phone && <p className="text-gray-500">{pizzeria.phone}</p>}
        {assignedCommercial && (
          <p className="text-sm text-indigo-600 mt-1">
            Commercial : {assignedCommercial.name}
          </p>
        )}
        {deal && (deal.last_contact_at as string | null) && (
          <p className="text-xs text-gray-400 mt-1">
            Dernier contact : {new Date(deal.last_contact_at as string).toLocaleDateString('fr-FR')}
          </p>
        )}
        {deal && <EmailStatusBadge events={(events as Record<string, unknown>[] | null) ?? []} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DealCard
            pizzeriaId={pizzeriaId}
            deal={deal}
            commercials={commercials}
          />

          {/* Bloc Lien de paiement — entre DealCard et Notes */}
          {deal && (deal.monthly_amount as number) > 0 && (deal.pricing_plan_slug as string) && (deal.pricing_plan_slug as string) !== 'none' && (
            <GeneratePaymentButton
              dealId={deal.id as string}
              pizzeriaId={pizzeriaId}
              monthlyAmount={deal.monthly_amount as number}
              isAnnual={(deal.is_annual as boolean) ?? false}
              pricingPlan={(deal.pricing_plan_slug as string) ?? ''}
              lastPaymentLink={(deal.last_payment_link as string | null) ?? null}
            />
          )}

          {/* Notes section — only if deal exists */}
          {deal && (
            <NotesSection
              dealId={deal.id as string}
              pizzeriaId={pizzeriaId}
              notes={notes}
            />
          )}

          {/* Email composer — only if deal has contact email */}
          {deal && (deal.contact_email as string | null) && (
            <EmailComposer
              dealId={deal.id as string}
              pizzeriaId={pizzeriaId}
              defaultTo={deal.contact_email as string}
            />
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Historique</h2>
              <div className="flex items-center gap-2">
                {deal && (
                  <>
                    <LogCallButton
                      dealId={deal.id as string}
                      pizzeriaId={pizzeriaId}
                    />
                    <AddEventButton
                      dealId={deal.id as string}
                      pizzeriaId={pizzeriaId}
                    />
                  </>
                )}
              </div>
            </div>
            <Timeline events={(events as Record<string, unknown>[] | null) ?? []} />
          </div>
        </div>

        {/* Sidebar info */}
        {deal && (() => {
          const plan = deal.pricing_plan_slug as string | null;
          const amount = deal.monthly_amount as number | null;
          const isAnnual = deal.is_annual as boolean | null;
          const subStart = deal.subscription_start as string | null;
          const subEnd = deal.subscription_end as string | null;
          const payment = deal.payment_method as string | null;
          const cName = deal.contact_name as string | null;
          const cPhone = deal.contact_phone as string | null;
          const cEmail = deal.contact_email as string | null;

          return (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Résumé</h3>
                <dl className="space-y-2 text-sm">
                  {plan && (
                    <>
                      <dt className="text-gray-500">Formule</dt>
                      <dd className="font-medium">{plan}</dd>
                    </>
                  )}
                  {amount != null && amount > 0 && (
                    <>
                      <dt className="text-gray-500">Montant mensuel</dt>
                      <dd className="font-medium">
                        {amount}&euro;/mois
                        {isAnnual && (
                          <span className="text-xs text-gray-400 ml-1">
                            ({Math.round(amount * 12)}&euro;/an)
                          </span>
                        )}
                      </dd>
                    </>
                  )}
                  {subStart && (
                    <>
                      <dt className="text-gray-500">Début</dt>
                      <dd className="font-medium">
                        {new Date(subStart).toLocaleDateString('fr-FR')}
                      </dd>
                    </>
                  )}
                  {subEnd && (
                    <>
                      <dt className="text-gray-500">Fin</dt>
                      <dd className="font-medium">
                        {new Date(subEnd).toLocaleDateString('fr-FR')}
                      </dd>
                    </>
                  )}
                  {payment && payment !== 'none' && (
                    <>
                      <dt className="text-gray-500">Paiement</dt>
                      <dd className="font-medium">{payment}{isAnnual ? ' (annuel)' : ''}</dd>
                    </>
                  )}
                </dl>
              </div>

              {(cName || cPhone || cEmail) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Contact</h3>
                  <dl className="space-y-1 text-sm">
                    {cName && <dd className="font-medium">{cName}</dd>}
                    {cPhone && (
                      <dd>
                        <a href={`tel:${cPhone}`} className="text-blue-600 hover:underline">
                          {cPhone}
                        </a>
                      </dd>
                    )}
                    {cEmail && (
                      <dd>
                        <a href={`mailto:${cEmail}`} className="text-blue-600 hover:underline">
                          {cEmail}
                        </a>
                      </dd>
                    )}
                  </dl>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
