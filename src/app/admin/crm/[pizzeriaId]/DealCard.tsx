'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { dealFormSchema, type DealFormData, DEAL_STATUSES } from '../../schemas/deal';
import { upsertDeal, changeStatus } from '../../actions/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DealCardProps {
  pizzeriaId: string;
  deal: Record<string, unknown> | null;
}

export default function DealCard({ pizzeriaId, deal }: DealCardProps) {
  const router = useRouter();
  const isEdit = !!deal;

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      status: (deal?.status as string) ?? 'prospect',
      pricing_plan_slug: (deal?.pricing_plan_slug as string) ?? '',
      monthly_amount: (deal?.monthly_amount as number) ?? null,
      subscription_start: (deal?.subscription_start as string) ?? '',
      subscription_end: (deal?.subscription_end as string) ?? '',
      payment_method: (deal?.payment_method as string) ?? '',
      contact_name: (deal?.contact_name as string) ?? '',
      contact_phone: (deal?.contact_phone as string) ?? '',
      contact_email: (deal?.contact_email as string) ?? '',
      notes: (deal?.notes as string) ?? '',
    },
  });

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Informations commerciales</span>
              {isEdit && (
                <div className="flex gap-1">
                  {DEAL_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => handleStatusChange(s.value)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        s.color
                      } ${
                        (deal?.status as string) === s.value
                          ? 'ring-2 ring-offset-1 ring-gray-400'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isEdit && (
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
            <FormField control={form.control} name="pricing_plan_slug" render={({ field }) => (
              <FormItem>
                <FormLabel>Formule</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Aucune" />
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
            <FormField control={form.control} name="monthly_amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Montant mensuel (&euro;)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="subscription_start" render={({ field }) => (
              <FormItem>
                <FormLabel>Début abonnement</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="subscription_end" render={({ field }) => (
              <FormItem>
                <FormLabel>Fin abonnement</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="payment_method" render={({ field }) => (
              <FormItem>
                <FormLabel>Mode de paiement</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Non défini" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Non défini</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                    <SelectItem value="cb">Carte bancaire</SelectItem>
                    <SelectItem value="especes">Espèces</SelectItem>
                    <SelectItem value="cheque">Chèque</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <p className="text-sm font-medium mb-3 text-gray-700">Contact du gérant</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="contact_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contact_phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contact_email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Notes</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="md:col-span-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le deal'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
