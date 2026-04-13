'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { redirectFormSchema, type RedirectFormData } from '../schemas/redirect';
import { createRedirect, updateRedirect } from '../actions/redirects';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RedirectFormProps {
  redirect?: {
    id: string;
    city_id: string;
    source_path: string;
    destination_path: string;
    permanent: boolean;
  };
  cities: { id: string; name: string }[];
}

export default function RedirectForm({ redirect, cities }: RedirectFormProps) {
  const router = useRouter();
  const isEdit = !!redirect;

  const form = useForm<RedirectFormData>({
    resolver: zodResolver(redirectFormSchema),
    defaultValues: {
      city_id: redirect?.city_id ?? '',
      source_path: redirect?.source_path ?? '',
      destination_path: redirect?.destination_path ?? '',
      permanent: redirect?.permanent ?? true,
    },
  });

  async function onSubmit(data: RedirectFormData) {
    const result = isEdit
      ? await updateRedirect(redirect.id, data)
      : await createRedirect(data);
    if (result.success) {
      toast.success(isEdit ? 'Redirection mise à jour' : 'Redirection créée');
      router.push('/admin/redirects');
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
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
            <FormField control={form.control} name="source_path" render={({ field }) => (
              <FormItem>
                <FormLabel>Chemin source</FormLabel>
                <FormControl><Input placeholder="/ancien-chemin" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="destination_path" render={({ field }) => (
              <FormItem>
                <FormLabel>Chemin destination</FormLabel>
                <FormControl><Input placeholder="/nouveau-chemin" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="permanent" render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Redirection permanente (301)</FormLabel>
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/redirects')}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
