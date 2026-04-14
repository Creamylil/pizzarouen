/**
 * Template email de bienvenue — envoyé automatiquement
 * quand un contact_email est ajouté à une fiche CRM
 */

import { renderQuickEmail } from './quick-email';

export function renderWelcomeEmail(pizzeriaName: string, contactName: string): string {
  const greeting = contactName ? `Bonjour ${contactName}` : 'Bonjour';

  const body = `${greeting},

Nous sommes ravis de référencer ${pizzeriaName} sur notre plateforme PizzaRouen.fr !

Notre annuaire aide les habitants à découvrir les meilleures pizzerias de leur ville. Votre établissement y figure déjà gratuitement.

Pour augmenter votre visibilité, nous proposons des formules de mise en avant :
- Référencement prioritaire dans les résultats
- Badge "Coup de Cœur" sur votre fiche
- Position privilégiée sur la page d'accueil

Je reste disponible pour en discuter avec vous.

Cordialement,
L'équipe PizzaRouen
contact@pizzarouen.fr`;

  return renderQuickEmail(body);
}

export const WELCOME_SUBJECT = 'Bienvenue sur PizzaRouen.fr';
