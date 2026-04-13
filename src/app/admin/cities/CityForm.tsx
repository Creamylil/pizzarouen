'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cityFormSchema, type CityFormData } from '../schemas/city';
import { createCity, updateCity } from '../actions/cities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CityFormProps {
  city?: {
    id: string;
    slug: string;
    name: string;
    display_name: string;
    domain: string;
    site_url: string;
    center_lat: number;
    center_lng: number;
    default_zoom: number;
    geo_region: string;
    geo_placename: string;
    address_region: string;
    default_sector_slug: string;
    main_postal_codes: string[];
    meta_title: string;
    meta_title_template: string;
    meta_description: string;
    meta_keywords: string[];
    og_site_name: string;
    google_analytics_id: string | null;
    contact_email: string;
    contact_whatsapp: string | null;
    logo_url: string | null;
    hero_image_url: string | null;
    editor_name: string;
  };
}

export default function CityForm({ city }: CityFormProps) {
  const router = useRouter();
  const isEdit = !!city;

  const form = useForm<CityFormData>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: city
      ? {
          ...city,
          main_postal_codes: city.main_postal_codes.join(', '),
          meta_keywords: city.meta_keywords.join(', '),
          google_analytics_id: city.google_analytics_id ?? '',
          contact_whatsapp: city.contact_whatsapp ?? '',
          logo_url: city.logo_url ?? '',
          hero_image_url: city.hero_image_url ?? '',
        }
      : {
          slug: '',
          name: '',
          display_name: '',
          domain: '',
          site_url: '',
          center_lat: 0,
          center_lng: 0,
          default_zoom: 13,
          geo_region: '',
          geo_placename: '',
          address_region: '',
          default_sector_slug: 'tout',
          main_postal_codes: '',
          meta_title: '',
          meta_title_template: '',
          meta_description: '',
          meta_keywords: '',
          og_site_name: '',
          google_analytics_id: '',
          contact_email: '',
          contact_whatsapp: '',
          logo_url: '',
          hero_image_url: '',
          editor_name: '',
        },
  });

  async function onSubmit(data: CityFormData) {
    const result = isEdit ? await updateCity(city.id, data) : await createCity(data);
    if (result.success) {
      toast.success(isEdit ? 'Ville mise à jour' : 'Ville créée');
      router.push('/admin/cities');
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl><Input placeholder="Rouen" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="display_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom d&apos;affichage</FormLabel>
                <FormControl><Input placeholder="Pizza Rouen" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl><Input placeholder="rouen" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="domain" render={({ field }) => (
              <FormItem>
                <FormLabel>Domaine</FormLabel>
                <FormControl><Input placeholder="pizzarouen.fr" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="site_url" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>URL du site</FormLabel>
                <FormControl><Input placeholder="https://pizzarouen.fr" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="editor_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Éditeur</FormLabel>
                <FormControl><Input placeholder="JSD MEDIA LLP" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Géographie</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="center_lat" render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl><Input type="number" step="any" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="center_lng" render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl><Input type="number" step="any" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="default_zoom" render={({ field }) => (
              <FormItem>
                <FormLabel>Zoom</FormLabel>
                <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 13)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="geo_region" render={({ field }) => (
              <FormItem>
                <FormLabel>Région géo</FormLabel>
                <FormControl><Input placeholder="FR-76" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="geo_placename" render={({ field }) => (
              <FormItem>
                <FormLabel>Placename</FormLabel>
                <FormControl><Input placeholder="Rouen" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="address_region" render={({ field }) => (
              <FormItem>
                <FormLabel>Région adresse</FormLabel>
                <FormControl><Input placeholder="Normandie" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="main_postal_codes" render={({ field }) => (
              <FormItem className="md:col-span-3">
                <FormLabel>Codes postaux (séparés par des virgules)</FormLabel>
                <FormControl><Input placeholder="76000, 76100" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <FormField control={form.control} name="meta_title" render={({ field }) => (
              <FormItem>
                <FormLabel>Meta title</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="meta_title_template" render={({ field }) => (
              <FormItem>
                <FormLabel>Title template</FormLabel>
                <FormControl><Input placeholder="%s | Pizza Rouen" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="meta_description" render={({ field }) => (
              <FormItem>
                <FormLabel>Meta description</FormLabel>
                <FormControl><Textarea rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="meta_keywords" render={({ field }) => (
              <FormItem>
                <FormLabel>Keywords (séparés par des virgules)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="og_site_name" render={({ field }) => (
              <FormItem>
                <FormLabel>OG Site Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & médias</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="contact_email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email de contact</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contact_whatsapp" render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="logo_url" render={({ field }) => (
              <FormItem>
                <FormLabel>URL du logo</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="hero_image_url" render={({ field }) => (
              <FormItem>
                <FormLabel>URL image hero</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="google_analytics_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Google Analytics ID</FormLabel>
                <FormControl><Input placeholder="G-XXXXXXXXXX" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="default_sector_slug" render={({ field }) => (
              <FormItem>
                <FormLabel>Secteur par défaut</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/cities')}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
