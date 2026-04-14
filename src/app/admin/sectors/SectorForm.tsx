'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { sectorFormSchema, type SectorFormData } from '../schemas/sector';
import { createSector, updateSector } from '../actions/sectors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SectorFormProps {
  sector?: {
    id: string;
    name: string;
    slug: string;
    display_name: string | null;
    city_id: string;
    center_lat: number;
    center_lng: number;
    radius: number;
    postal_code: string | null;
    display_order: number;
    meta_title: string | null;
    meta_description: string | null;
    og_title: string | null;
    og_description: string | null;
    og_image_url: string | null;
    seo_content: unknown;
    is_published: boolean;
  };
  cities: { id: string; name: string }[];
}

export default function SectorForm({ sector, cities }: SectorFormProps) {
  const router = useRouter();
  const isEdit = !!sector;

  const form = useForm<SectorFormData>({
    resolver: zodResolver(sectorFormSchema),
    defaultValues: {
      name: sector?.name ?? '',
      slug: sector?.slug ?? '',
      display_name: sector?.display_name ?? '',
      city_id: sector?.city_id ?? '',
      center_lat: sector?.center_lat ?? 0,
      center_lng: sector?.center_lng ?? 0,
      radius: sector?.radius ?? 5,
      postal_code: sector?.postal_code ?? '',
      display_order: sector?.display_order ?? 0,
      meta_title: sector?.meta_title ?? '',
      meta_description: sector?.meta_description ?? '',
      og_title: sector?.og_title ?? '',
      og_description: sector?.og_description ?? '',
      og_image_url: sector?.og_image_url ?? '',
      seo_content_raw: sector?.seo_content ? JSON.stringify(sector.seo_content, null, 2) : '',
      is_published: sector?.is_published ?? true,
    },
  });

  async function onSubmit(data: SectorFormData) {
    const result = isEdit
      ? await updateSector(sector.id, data)
      : await createSector(data);
    if (result.success) {
      toast.success(isEdit ? 'Secteur mis à jour' : 'Secteur créé');
      router.push('/admin/sectors');
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
                <FormControl><Input placeholder="Centre-ville" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl><Input placeholder="centre-ville" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="display_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom d&apos;affichage</FormLabel>
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
            <FormField control={form.control} name="postal_code" render={({ field }) => (
              <FormItem>
                <FormLabel>Code postal</FormLabel>
                <FormControl><Input placeholder="76000" {...field} /></FormControl>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Géographie</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="center_lat" render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="center_lng" render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="radius" render={({ field }) => (
              <FormItem>
                <FormLabel>Rayon (km)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <FormField control={form.control} name="is_published" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Publié</FormLabel>
                  <FormDescription>La page secteur est accessible publiquement</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="meta_title" render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Title</FormLabel>
                <FormControl>
                  <Input placeholder="Les Pizzerias ouvertes à ... | Livraison 24h/24" {...field} />
                </FormControl>
                <FormDescription>Laissez vide pour le template auto</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="meta_description" render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Découvrez les meilleures pizzerias de ..." rows={3} {...field} />
                </FormControl>
                <FormDescription>Laissez vide pour le template auto</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="og_title" render={({ field }) => (
                <FormItem>
                  <FormLabel>OG Title</FormLabel>
                  <FormControl><Input placeholder="Optionnel" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="og_description" render={({ field }) => (
                <FormItem>
                  <FormLabel>OG Description</FormLabel>
                  <FormControl><Input placeholder="Optionnel" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="og_image_url" render={({ field }) => (
              <FormItem>
                <FormLabel>OG Image URL</FormLabel>
                <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="seo_content_raw" render={({ field }) => (
              <FormItem>
                <FormLabel>Contenu SEO (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{"sections": [...]}'
                    rows={8}
                    className="font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Format SeoContentData (sections: intro, grid, highlight, info). Laissez vide si non nécessaire.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/sectors')}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
