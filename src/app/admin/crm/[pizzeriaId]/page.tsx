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
import { Phone, Mail, MapPin, ArrowLeft, ExternalLink, Globe } from 'lucide-react';
import Link from 'next/link';

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
      .select('id, name, slug, address, phone, city_id, cities(name, slug, site_url, main_postal_codes)')
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

  const cityData = pizzeria.cities as unknown as {
    name: string;
    slug: string;
    site_url: string;
    main_postal_codes: string[];
  } | null;
  const cityName = cityData?.name ?? '';
  const siteUrl = cityData?.site_url ?? '';

  // Construire le lien vers la page publique de la pizzeria
  // Simple heuristique : si la pizzeria a un slug et un site_url de ville
  let pizzeriaPublicUrl: string | null = null;
  if (pizzeria.slug && siteUrl) {
    // Pour les pizzerias du centre ville, l'URL est /{slug}
    // Pour les communes, c'est /{secteur}/{slug} — on utilise /{slug} par défaut (le plus courant)
    pizzeriaPublicUrl = `${siteUrl}/${pizzeria.slug}`;
  }

  const assignedCommercial = deal?.assigned_to
    ? commercials.find((c) => c.id === deal.assigned_to)
    : null;

  // Extraire infos contact pour la top bar
  const cName = (deal?.contact_name as string) || null;
  const cPhone = (deal?.contact_phone as string) || null;
  const cEmail = (deal?.contact_email as string) || null;

  // Infos résumé deal pour la top bar
  const plan = (deal?.pricing_plan_slug as string) || null;
  const amount = deal?.monthly_amount as number | null;
  const isAnnual = (deal?.is_annual as boolean) || false;

  return (
    <div className="max-w-6xl">
      {/* ── TOP BAR compacte ── */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin/crm" className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-xl font-bold truncate">{pizzeria.name}</h1>
              {deal && <EmailStatusBadge events={(events as Record<string, unknown>[] | null) ?? []} />}
            </div>

            {/* Ligne infos : ville, liens site/page, adresse, tél, commercial */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
              {/* Liens site ville + page pizzeria — toujours visibles */}
              {siteUrl && (
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <Globe className="h-3 w-3" />
                  {cityName}
                </a>
              )}
              {pizzeriaPublicUrl && (
                <a
                  href={pizzeriaPublicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                >
                  <ExternalLink className="h-3 w-3" />
                  Voir la fiche
                </a>
              )}
              {!siteUrl && cityName && (
                <span className="font-medium text-gray-600">{cityName}</span>
              )}

              <span className="flex items-center gap-1 text-gray-400">
                <MapPin className="h-3 w-3" />
                {pizzeria.address}
              </span>
              {pizzeria.phone && (
                <a href={`tel:${pizzeria.phone}`} className="flex items-center gap-1 hover:text-gray-700">
                  <Phone className="h-3 w-3" />
                  {pizzeria.phone}
                </a>
              )}
              {assignedCommercial && (
                <span className="text-indigo-600 font-medium">{assignedCommercial.name}</span>
              )}
              {deal && (deal.last_contact_at as string | null) && (
                <span className="text-gray-400 text-xs">
                  Dernier contact : {new Date(deal.last_contact_at as string).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>

            {/* Contact gérant — inline dans la top bar */}
            {(cName || cPhone || cEmail) && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm">
                {cName && <span className="font-medium text-gray-700">{cName}</span>}
                {cPhone && (
                  <a href={`tel:${cPhone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                    <Phone className="h-3 w-3" />{cPhone}
                  </a>
                )}
                {cEmail && (
                  <a href={`mailto:${cEmail}`} className="text-blue-600 hover:underline flex items-center gap-1">
                    <Mail className="h-3 w-3" />{cEmail}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Résumé deal — coin droit */}
          {deal && plan && plan !== 'none' && (
            <div className="shrink-0 text-right text-sm">
              <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium text-xs capitalize">
                {plan}
              </span>
              {amount != null && amount > 0 && (
                <p className="text-gray-600 mt-0.5 font-medium">
                  {amount}€/mois
                  {isAnnual && <span className="text-gray-400 text-xs ml-1">({Math.round(amount * 12)}€/an)</span>}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── DEUX COLONNES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* COLONNE GAUCHE — Formulaire + Actions */}
        <div className="lg:col-span-3 space-y-4">
          <DealCard
            pizzeriaId={pizzeriaId}
            deal={deal}
            commercials={commercials}
          />

          {/* Actions rapides — paiement + email sur une ligne */}
          {deal && (
            <div className="flex flex-wrap items-start gap-2">
              {(deal.monthly_amount as number) > 0 && (deal.pricing_plan_slug as string) && (deal.pricing_plan_slug as string) !== 'none' && (
                <GeneratePaymentButton
                  dealId={deal.id as string}
                  pizzeriaId={pizzeriaId}
                  monthlyAmount={deal.monthly_amount as number}
                  isAnnual={(deal.is_annual as boolean) ?? false}
                  pricingPlan={(deal.pricing_plan_slug as string) ?? ''}
                  lastPaymentLink={(deal.last_payment_link as string | null) ?? null}
                />
              )}
              {(deal.contact_email as string | null) && (
                <EmailComposer
                  dealId={deal.id as string}
                  pizzeriaId={pizzeriaId}
                  defaultTo={deal.contact_email as string}
                />
              )}
            </div>
          )}

          {/* Notes — compact */}
          {deal && (
            <NotesSection
              dealId={deal.id as string}
              pizzeriaId={pizzeriaId}
              notes={notes}
            />
          )}
        </div>

        {/* COLONNE DROITE — Timeline */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Historique</h2>
            <div className="flex items-center gap-1.5">
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
    </div>
  );
}
