import { z } from 'zod';

export const pricingFormSchema = z.object({
  slug: z.string().min(1, 'Slug requis'),
  name: z.string().min(1, 'Nom requis'),
  tagline: z.string().min(1, 'Tagline requise'),
  price_monthly: z.number().min(0),
  price_annual: z.number().min(0),
  features: z.string(), // comma-separated, converted to array
  icon: z.string().min(1, 'Icône requise'),
  color: z.string().min(1, 'Couleur requise'),
  is_popular: z.boolean(),
  display_order: z.number().int().min(0),
});

export type PricingFormData = z.infer<typeof pricingFormSchema>;
