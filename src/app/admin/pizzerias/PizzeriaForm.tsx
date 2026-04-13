'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { pizzeriaFormSchema, type PizzeriaFormData } from '../schemas/pizzeria';
import { createPizzeria, updatePizzeria } from '../actions/pizzerias';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OpeningHours {
  lundi?: string | null;
  mardi?: string | null;
  mercredi?: string | null;
  jeudi?: string | null;
  vendredi?: string | null;
  samedi?: string | null;
  dimanche?: string | null;
}

interface ServicesInfo {
  sur_place?: boolean;
  a_emporter?: boolean;
  livraison?: boolean;
  click_collect?: boolean;
}

interface PizzeriaFormProps {
  pizzeria?: {
    id: string;
    name: string;
    city_id: string;
    address: string;
    short_address: string | null;
    phone: string | null;
    description: string | null;
    category: string | null;
    main_category: string | null;
    subcategory: string | null;
    latitude: number | null;
    longitude: number | null;
    rating: number | null;
    reviews_count: number | null;
    reviews_link: string | null;
    google_maps_link: string | null;
    image_url: string | null;
    halal: boolean | null;
    priority_level: string | null;
    opening_hours: unknown;
    services_info: unknown;
  };
  cities: { id: string; name: string }[];
}

const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
const DAY_LABELS: Record<string, string> = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
  samedi: 'Samedi',
  dimanche: 'Dimanche',
};

export default function PizzeriaForm({ pizzeria, cities }: PizzeriaFormProps) {
  const router = useRouter();
  const isEdit = !!pizzeria;

  const oh = (pizzeria?.opening_hours ?? {}) as OpeningHours;
  const si = (pizzeria?.services_info ?? {}) as ServicesInfo;

  const form = useForm<PizzeriaFormData>({
    resolver: zodResolver(pizzeriaFormSchema),
    defaultValues: {
      name: pizzeria?.name ?? '',
      city_id: pizzeria?.city_id ?? '',
      address: pizzeria?.address ?? '',
      short_address: pizzeria?.short_address ?? '',
      phone: pizzeria?.phone ?? '',
      description: pizzeria?.description ?? '',
      category: pizzeria?.category ?? '',
      main_category: pizzeria?.main_category ?? '',
      subcategory: pizzeria?.subcategory ?? '',
      latitude: pizzeria?.latitude ?? null,
      longitude: pizzeria?.longitude ?? null,
      rating: pizzeria?.rating ?? null,
      reviews_count: pizzeria?.reviews_count ?? null,
      reviews_link: pizzeria?.reviews_link ?? '',
      google_maps_link: pizzeria?.google_maps_link ?? '',
      image_url: pizzeria?.image_url ?? '',
      halal: pizzeria?.halal ?? false,
      priority_level: pizzeria?.priority_level ?? '',
      opening_hours_lundi: oh.lundi ?? '',
      opening_hours_mardi: oh.mardi ?? '',
      opening_hours_mercredi: oh.mercredi ?? '',
      opening_hours_jeudi: oh.jeudi ?? '',
      opening_hours_vendredi: oh.vendredi ?? '',
      opening_hours_samedi: oh.samedi ?? '',
      opening_hours_dimanche: oh.dimanche ?? '',
      services_sur_place: si.sur_place ?? false,
      services_a_emporter: si.a_emporter ?? false,
      services_livraison: si.livraison ?? false,
      services_click_collect: si.click_collect ?? false,
    },
  });

  async function onSubmit(data: PizzeriaFormData) {
    const result = isEdit
      ? await updatePizzeria(pizzeria.id, data)
      : await createPizzeria(data);
    if (result.success) {
      toast.success(isEdit ? 'Pizzeria mise à jour' : 'Pizzeria créée');
      router.push('/admin/pizzerias');
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        {/* General */}
        <Card>
          <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="city_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Ville</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une ville" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Adresse</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="short_address" render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse courte</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader><CardTitle>Catégories</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <FormControl><Input placeholder="Pizzeria" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="main_category" render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie principale</FormLabel>
                <FormControl><Input placeholder="pizza" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="subcategory" render={({ field }) => (
              <FormItem>
                <FormLabel>Sous-catégorie</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="priority_level" render={({ field }) => (
              <FormItem>
                <FormLabel>Niveau de priorité</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Aucun" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    <SelectItem value="referencement">Référencement</SelectItem>
                    <SelectItem value="priorite">Priorité</SelectItem>
                    <SelectItem value="coup-de-coeur">Coup de coeur</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="halal" render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0 pt-6">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Halal</FormLabel>
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader><CardTitle>Localisation</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="latitude" render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="longitude" render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="google_maps_link" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Lien Google Maps</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader><CardTitle>Avis</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="rating" render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="reviews_count" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre d&apos;avis</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="reviews_link" render={({ field }) => (
              <FormItem>
                <FormLabel>Lien avis</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="image_url" render={({ field }) => (
              <FormItem className="md:col-span-3">
                <FormLabel>URL de l&apos;image</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card>
          <CardHeader><CardTitle>Horaires d&apos;ouverture</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DAYS.map((day) => (
              <FormField
                key={day}
                control={form.control}
                name={`opening_hours_${day}` as keyof PizzeriaFormData}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{DAY_LABELS[day]}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="11:00-14:00, 18:00-22:00"
                        value={(field.value as string) ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader><CardTitle>Services</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="services_sur_place" render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Sur place</FormLabel>
              </FormItem>
            )} />
            <FormField control={form.control} name="services_a_emporter" render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">À emporter</FormLabel>
              </FormItem>
            )} />
            <FormField control={form.control} name="services_livraison" render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Livraison</FormLabel>
              </FormItem>
            )} />
            <FormField control={form.control} name="services_click_collect" render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Click & collect</FormLabel>
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/pizzerias')}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
