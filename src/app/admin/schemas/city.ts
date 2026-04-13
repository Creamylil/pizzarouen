import { z } from 'zod';

export const cityFormSchema = z.object({
  slug: z.string().min(1, 'Slug requis'),
  name: z.string().min(1, 'Nom requis'),
  display_name: z.string().min(1, 'Nom d\'affichage requis'),
  domain: z.string().min(1, 'Domaine requis'),
  site_url: z.string().url('URL invalide'),
  center_lat: z.number(),
  center_lng: z.number(),
  default_zoom: z.number().int().min(1).max(20),
  geo_region: z.string().min(1, 'Région requise'),
  geo_placename: z.string().min(1, 'Placename requis'),
  address_region: z.string().min(1, 'Région d\'adresse requise'),
  default_sector_slug: z.string().min(1),
  main_postal_codes: z.string().min(1, 'Au moins un code postal'),
  meta_title: z.string().min(1, 'Meta title requis'),
  meta_title_template: z.string().min(1, 'Template requis'),
  meta_description: z.string().min(1, 'Meta description requise'),
  meta_keywords: z.string(),
  og_site_name: z.string().min(1, 'OG site name requis'),
  google_analytics_id: z.string(),
  contact_email: z.string().email('Email invalide'),
  contact_whatsapp: z.string(),
  logo_url: z.string(),
  hero_image_url: z.string(),
  editor_name: z.string().min(1, 'Nom éditeur requis'),
});

export type CityFormData = z.infer<typeof cityFormSchema>;
