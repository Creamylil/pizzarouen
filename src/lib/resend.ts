import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }
    resendInstance = new Resend(key);
  }
  return resendInstance;
}

export const FROM_EMAIL = 'PizzaRouen <contact@pizzarouen.fr>';
