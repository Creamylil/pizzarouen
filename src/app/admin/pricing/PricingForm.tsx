'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { pricingFormSchema, type PricingFormData } from '../schemas/pricing';
import { createPricing, updatePricing } from '../actions/pricing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PricingFormProps {
  plan?: Record<string, unknown>;
}

export default function PricingForm({ plan }: PricingFormProps) {
  const router = useRouter();
  const isEdit = !!plan;

  const form = useForm<PricingFormData>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      slug: (plan?.slug as string) ?? '',
      name: (plan?.name as string) ?? '',
      tagline: (plan?.tagline as string) ?? '',
      price_monthly: (plan?.price_monthly as number) ?? 0,
      price_annual: (plan?.price_annual as number) ?? 0,
      features: Array.isArray(plan?.features) ? (plan.features as string[]).join(', ') : '',
      icon: (plan?.icon as string) ?? 'star',
      color: (plan?.color as string) ?? 'blue',
      is_popular: (plan?.is_popular as boolean) ?? false,
      display_order: (plan?.display_order as number) ?? 0,
    },
  });

  async function onSubmit(data: PricingFormData) {
    const result = isEdit
      ? await updatePricing(plan.id as string, data)
      : await createPricing(data);
    if (result.success) {
      toast.success(isEdit ? 'Formule mise à jour' : 'Formule créée');
      router.push('/admin/pricing');
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl><Input placeholder="Référencement" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl><Input placeholder="referencement" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="tagline" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Tagline</FormLabel>
                <FormControl><Input placeholder="Soyez visible sur la carte" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tarification</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="price_monthly" render={({ field }) => (
              <FormItem>
                <FormLabel>Prix mensuel (&euro;)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="price_annual" render={({ field }) => (
              <FormItem>
                <FormLabel>Prix annuel (&euro;)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Affichage</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="features" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Features (virgules)</FormLabel>
                <FormControl><Input placeholder="Pin sur la carte, Fiche basique, ..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="icon" render={({ field }) => (
              <FormItem>
                <FormLabel>Icône</FormLabel>
                <FormControl><Input placeholder="star" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="color" render={({ field }) => (
              <FormItem>
                <FormLabel>Couleur</FormLabel>
                <FormControl><Input placeholder="blue" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="display_order" render={({ field }) => (
              <FormItem>
                <FormLabel>Ordre d&apos;affichage</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="is_popular" render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0 pt-6">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Populaire</FormLabel>
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/pricing')}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
