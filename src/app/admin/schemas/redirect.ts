import { z } from 'zod';

export const redirectFormSchema = z.object({
  city_id: z.string().min(1, 'Ville requise'),
  source_path: z.string().min(1, 'Chemin source requis'),
  destination_path: z.string().min(1, 'Chemin destination requis'),
  permanent: z.boolean(),
});

export type RedirectFormData = z.infer<typeof redirectFormSchema>;
