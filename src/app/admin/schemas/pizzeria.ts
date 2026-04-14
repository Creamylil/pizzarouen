import { z } from 'zod';

export const pizzeriaFormSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  city_id: z.string().min(1, 'Ville requise'),
  address: z.string().min(1, 'Adresse requise'),
  short_address: z.string(),
  phone: z.string(),
  description: z.string(),
  category: z.string(),
  main_category: z.string(),
  subcategory: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  rating: z.number().nullable(),
  reviews_count: z.number().nullable(),
  reviews_link: z.string(),
  google_maps_link: z.string(),
  image_url: z.string(),
  halal: z.boolean(),
  priority_level: z.string(),
  // JSONB fields as structured objects
  opening_hours_lundi: z.string(),
  opening_hours_mardi: z.string(),
  opening_hours_mercredi: z.string(),
  opening_hours_jeudi: z.string(),
  opening_hours_vendredi: z.string(),
  opening_hours_samedi: z.string(),
  opening_hours_dimanche: z.string(),
  // services_info
  services_sur_place: z.boolean(),
  services_a_emporter: z.boolean(),
  services_livraison: z.boolean(),
  services_click_collect: z.boolean(),
});

export type PizzeriaFormData = z.infer<typeof pizzeriaFormSchema>;

function generateSlug(name: string): string {
  const accents: Record<string, string> = {
    'à': 'a', 'â': 'a', 'ä': 'a', 'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'ï': 'i', 'î': 'i', 'ô': 'o', 'ù': 'u', 'û': 'u', 'ü': 'u', 'ç': 'c',
    'À': 'A', 'Â': 'A', 'Ä': 'A', 'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
    'Ï': 'I', 'Î': 'I', 'Ô': 'O', 'Ù': 'U', 'Û': 'U', 'Ü': 'U', 'Ç': 'C',
  };
  return name
    .split('')
    .map(c => accents[c] || c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'pizzeria';
}

export function formToRow(data: PizzeriaFormData) {
  return {
    name: data.name,
    slug: generateSlug(data.name),
    city_id: data.city_id,
    address: data.address,
    short_address: data.short_address || null,
    phone: data.phone || null,
    description: data.description || null,
    category: data.category || null,
    main_category: data.main_category || null,
    subcategory: data.subcategory || null,
    latitude: data.latitude,
    longitude: data.longitude,
    rating: data.rating,
    reviews_count: data.reviews_count,
    reviews_link: data.reviews_link || null,
    google_maps_link: data.google_maps_link || null,
    image_url: data.image_url || null,
    halal: data.halal,
    priority_level: data.priority_level || null,
    opening_hours: {
      lundi: data.opening_hours_lundi || null,
      mardi: data.opening_hours_mardi || null,
      mercredi: data.opening_hours_mercredi || null,
      jeudi: data.opening_hours_jeudi || null,
      vendredi: data.opening_hours_vendredi || null,
      samedi: data.opening_hours_samedi || null,
      dimanche: data.opening_hours_dimanche || null,
    },
    services_info: {
      sur_place: data.services_sur_place,
      a_emporter: data.services_a_emporter,
      livraison: data.services_livraison,
      click_collect: data.services_click_collect,
    },
  };
}
