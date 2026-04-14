'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { dealFormSchema, type DealFormData, DEAL_STATUSES } from '../../schemas/deal';
import { upsertDeal, changeStatus } from '../../actions/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Save } from 'lucide-react';

interface DealCardProps {
  pizzeriaId: string;
  deal: Record<string, unknown> | null;
  commercials: { id: string; name: string }[];
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export default function DealCard({ pizzeriaId, deal, commercials }: DealCardProps) {
  const router = useRouter();
  const isEdit = !!deal;
  const isAnnualFromDb = (deal?.is_annual as boolean) ?? false;
  const monthlyFromDb = (deal?.monthly_amount as number) ?? null;

  const displayAmount = isAnnualFromDb && monthlyFromDb
    ? Math.round(monthlyFromDb * 12 * 100) / 100
    : monthlyFromDb;

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      status: (deal?.status as string) ?? 'prospect',
      assigned_to: (deal?.assigned_to as string) ?? '',
      pricing_plan_slug: (deal?.pricing_plan_slug as string) ?? '',
      monthly_amount: displayAmount,
      is_annual: isAnnualFromDb,
      subscription_start: (deal?.subscription_start as string) ?? '',
      subscription_end: (deal?.subscription_end as string) ?? '',
      payment_method: (deal?.payment_method as string) ?? '',
      contact_name: (deal?.contact_name as string) ?? '',
      contact_phone: (deal?.contact_phone as string) ?? '',
      contact_email: (deal?.contact_email as string) ?? '',
      notes: (deal?.notes as string) ?? '',
    },
  });

  const watchIsAnnual = form.watch('is_annual');
  const watchAmount = form.watch('monthly_amount');

  async function onSubmit(data: DealFormData) {
    const result = await upsertDeal(
      pizzeriaId,
      data,
      deal?.id as string | undefined
    );
    if (result.success) {
      toast.success(isEdit ? 'Deal mis à jour' : 'Deal créé');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!deal) return;
    const oldStatus = deal.status as string;
    if (oldStatus === newStatus) return;
    const result = await changeStatus(deal.id as string, pizzeriaId, oldStatus, newStatus);
    if (result.success) {
      toast.success('Statut mis à jour');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function handleDuration(months: number) {
    let start = form.getValues('subscription_start');
    if (!start) {
      start = todayStr();
      form.setValue('subscription_start', start);
    }
    form.setValue('subscription_end', addMonths(start, months));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white border rounded-lg p-4">
        {/* Statut pills */}
        {isEdit && (
          <div className="flex flex-wrap gap-1 mb-4">
            {DEAL_STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => handleStatusChange(s.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  s.color
                } ${
                  (deal?.status as string) === s.value
                    ? 'ring-2 ring-offset-1 ring-gray-400 scale-105'
                    : 'opacity-40 hover:opacity-80'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Ligne 1 : Commercial / Formule */}
        <div className="grid grid-cols-3 gap-3">
          {!isEdit && (
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Statut</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DEAL_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          )}

          <FormField control={form.control} name="assigned_to" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Commercial</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Non assigné</SelectItem>
                  {commercials.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="pricing_plan_slug" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Formule</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  <SelectItem value="referencement">Référencement</SelectItem>
                  <SelectItem value="priorite">Priorité</SelectItem>
                  <SelectItem value="coup-de-coeur">Coup de coeur</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Ligne 2 : Montant + Annuel | Paiement | Début + raccourcis */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          {/* Montant + checkbox Annuel côte à côte */}
          <FormField control={form.control} name="monthly_amount" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">
                {watchIsAnnual ? 'Montant annuel (€)' : 'Montant mensuel (€)'}
              </FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </FormControl>
                <FormField control={form.control} name="is_annual" render={({ field: annualField }) => (
                  <FormItem className="flex items-center gap-1 shrink-0">
                    <FormControl>
                      <Checkbox
                        checked={annualField.value}
                        onCheckedChange={annualField.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 text-[11px] font-normal cursor-pointer whitespace-nowrap">
                      Annuel
                    </FormLabel>
                  </FormItem>
                )} />
              </div>
              {watchIsAnnual && watchAmount != null && watchAmount > 0 && (
                <p className="text-[11px] text-green-600">= {(watchAmount / 12).toFixed(2)}€/mois</p>
              )}
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="payment_method" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Paiement</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Non défini</SelectItem>
                  <SelectItem value="virement">Virement</SelectItem>
                  <SelectItem value="cb">Carte bancaire</SelectItem>
                  <SelectItem value="especes">Espèces</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="subscription_start" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Début</FormLabel>
              <div className="flex items-center gap-1">
                <FormControl><Input type="date" className="h-9" {...field} /></FormControl>
                <button
                  type="button"
                  onClick={() => handleDuration(6)}
                  className="shrink-0 text-[10px] text-gray-500 hover:text-gray-800 border rounded px-1.5 py-0.5"
                >
                  6m
                </button>
                <button
                  type="button"
                  onClick={() => handleDuration(12)}
                  className="shrink-0 text-[10px] text-gray-500 hover:text-gray-800 border rounded px-1.5 py-0.5"
                >
                  1a
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Ligne 3 : Fin abonnement | Contact gérant (3 champs) | Save */}
        <div className="flex items-end gap-3 mt-3">
          <FormField control={form.control} name="subscription_end" render={({ field }) => (
            <FormItem className="w-[140px] shrink-0">
              <FormLabel className="text-xs">Fin</FormLabel>
              <FormControl><Input type="date" className="h-9" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="contact_name" render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="text-xs">Nom contact</FormLabel>
              <FormControl><Input className="h-9" placeholder="Nom gérant" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="contact_phone" render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="text-xs">Tél contact</FormLabel>
              <FormControl><Input className="h-9" placeholder="06..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="contact_email" render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="text-xs">Email contact</FormLabel>
              <FormControl><Input type="email" className="h-9" placeholder="email@..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button
            type="submit"
            size="sm"
            disabled={form.formState.isSubmitting}
            className="shrink-0 h-9 px-4"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {form.formState.isSubmitting ? '...' : isEdit ? 'Sauver' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
