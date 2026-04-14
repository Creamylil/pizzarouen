import { z } from 'zod';

export const emailComposerSchema = z.object({
  to: z.string().email('Email invalide'),
  subject: z.string().min(1, 'Sujet requis'),
  body: z.string().min(1, 'Message requis'),
});

export type EmailComposerData = z.infer<typeof emailComposerSchema>;

// Webhook payload Resend
export const resendWebhookSchema = z.object({
  type: z.enum([
    'email.sent',
    'email.delivered',
    'email.delivered_delayed',
    'email.opened',
    'email.clicked',
    'email.bounced',
    'email.complained',
  ]),
  created_at: z.string(),
  data: z.object({
    email_id: z.string(),
    to: z.array(z.string()).optional(),
    subject: z.string().optional(),
    created_at: z.string(),
  }),
});

export type ResendWebhookPayload = z.infer<typeof resendWebhookSchema>;
