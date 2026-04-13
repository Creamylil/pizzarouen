import { z } from 'zod';

export const sectorFormSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  slug: z.string().min(1, 'Slug requis'),
  display_name: z.string(),
  city_id: z.string().min(1, 'Ville requise'),
  center_lat: z.number(),
  center_lng: z.number(),
  radius: z.number().min(0),
  postal_code: z.string(),
  display_order: z.number().int().min(0),
});

export type SectorFormData = z.infer<typeof sectorFormSchema>;
