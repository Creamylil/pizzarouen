import { z } from 'zod';

export const DEAL_STATUSES = [
  { value: 'prospect', label: 'Prospect', color: 'bg-gray-100 text-gray-700' },
  { value: 'contacte', label: 'Contacté', color: 'bg-blue-100 text-blue-700' },
  { value: 'interesse', label: 'Intéressé', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'negocie', label: 'Négocie', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'abonne', label: 'Abonné', color: 'bg-green-100 text-green-700' },
  { value: 'refuse', label: 'Refusé', color: 'bg-red-100 text-red-700' },
  { value: 'resilie', label: 'Résilié', color: 'bg-orange-100 text-orange-700' },
] as const;

export const EVENT_TYPES = [
  { value: 'appel', label: 'Appel', icon: 'phone' },
  { value: 'email', label: 'Email', icon: 'mail' },
  { value: 'visite', label: 'Visite', icon: 'map-pin' },
  { value: 'relance', label: 'Relance', icon: 'bell' },
  { value: 'paiement', label: 'Paiement', icon: 'credit-card' },
  { value: 'changement_statut', label: 'Changement statut', icon: 'refresh-cw' },
  { value: 'lien_paiement', label: 'Lien de paiement', icon: 'link' },
] as const;

export const dealFormSchema = z.object({
  status: z.string().min(1, 'Statut requis'),
  assigned_to: z.string(),
  pricing_plan_slug: z.string(),
  monthly_amount: z.number().nullable(),
  is_annual: z.boolean(),
  subscription_start: z.string(),
  subscription_end: z.string(),
  payment_method: z.string(),
  contact_name: z.string(),
  contact_phone: z.string(),
  contact_email: z.string(),
  notes: z.string(),
});

export type DealFormData = z.infer<typeof dealFormSchema>;

export const eventFormSchema = z.object({
  event_type: z.string().min(1, 'Type requis'),
  description: z.string().min(1, 'Description requise'),
});

export type EventFormData = z.infer<typeof eventFormSchema>;
