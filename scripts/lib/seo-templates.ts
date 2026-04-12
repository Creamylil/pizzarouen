/**
 * Auto-génère les champs SEO pour une nouvelle ville
 * Structure identique à celle de Rouen (référence)
 */

import type { CitySetupConfig } from './types';

export function generateSeoFields(config: CitySetupConfig) {
  const city = config.name;
  const cityLower = city.toLowerCase();
  const displayName = config.displayName;

  return {
    metaTitle: config.metaTitle || `Pizzerias ${city} - Ouvertes Maintenant | Livraison & Halal`,
    metaTitleTemplate: `%s | ${displayName}`,
    metaDescription:
      config.metaDescription ||
      `D\u00e9couvrez les meilleures pizzerias de ${city} et sa r\u00e9gion. Pizza livraison, \u00e0 emporter et sur place. Horaires, avis et commande en ligne.`,
    metaKeywords: config.metaKeywords || [
      'pizza',
      'pizzeria',
      cityLower,
      'livraison pizza',
      'pizza \u00e0 emporter',
      'restaurant italien',
      'pizza halal',
      'pizzeria ouverte',
    ],
    ogSiteName: displayName,
    contactWhatsapp: config.contactWhatsapp || '+33 7 67 02 81 61',
    seoContent: {
      sections: [
        {
          type: 'intro',
          title: `Pizzerias \u00e0 {city} : trouvez votre pizza maintenant`,
          paragraphs: [
            `Envie d'une pizza \u00e0 {city} ? Vous \u00eates au bon endroit. Que vous cherchiez une adresse ouverte maintenant, une pizzeria halal, ou simplement la meilleure pizza du coin, on vous aide \u00e0 trouver ce qu'il vous faut sans perdre de temps.`,
            `Parce qu'une envie de pizza, \u00e7a n'attend pas. Voici les pizzerias ouvertes en ce moment \u00e0 {city}.`,
            `Certaines adresses assurent m\u00eame 24h/24 \u00e0 emporter pour les couche-tard.`,
          ],
        },
        {
          type: 'grid',
          title: `Pizza \u00e0 {city} : d\u00e9couvrez les quartiers`,
          cards: [
            {
              icon: '\uD83C\uDFD8\uFE0F',
              heading: 'Centre-ville',
              text: `En plein centre-ville de {city}, les pizzerias jouent la carte de la rapidit\u00e9 sans compromis sur la qualit\u00e9. P\u00e2te croustillante, garnitures g\u00e9n\u00e9reuses, cuisson au feu de bois pour certaines.`,
              color: 'amber',
            },
            {
              icon: '\uD83C\uDFE0',
              heading: 'Quartiers nord',
              text: `C\u00f4t\u00e9 nord de {city}, vous trouverez des adresses familiales avec des portions g\u00e9n\u00e9reuses. Livraison disponible tard le soir pour la plupart, et des formules qui ne cassent pas le budget.`,
              color: 'blue',
            },
            {
              icon: '\uD83C\uDF33',
              heading: 'Quartiers sud',
              text: `C\u00f4t\u00e9 sud, l'offre est vari\u00e9e : des classiques napolitaines aux pizzas plus cr\u00e9atives. Plusieurs spots proposent \u00e0 emporter et livraison avec des apps rapides.`,
              color: 'green',
            },
          ],
        },
        {
          icon: '\uD83D\uDD4C',
          type: 'highlight',
          title: `Pizza halal \u00e0 {city} : les adresses \u00e0 conna\u00eetre`,
          paragraphs: [
            `Oui, il existe plusieurs pizzerias halal \u00e0 {city}. Et non, vous n'aurez pas \u00e0 sacrifier le go\u00fbt ou le choix.`,
            `Plusieurs \u00e9tablissements proposent des cartes enti\u00e8rement halal avec une vraie diversit\u00e9 : classiques margherita et regina, pizzas viande et merguez, options v\u00e9g\u00e9tariennes... La pizza halal \u00e0 {city}, c'est devenu une vraie offre structur\u00e9e.`,
          ],
        },
        {
          icon: '\u2139\uFE0F',
          type: 'info',
          title: `Comment utiliser ce site ?`,
          paragraphs: [
            `Pas de chichi : on r\u00e9f\u00e9rence les pizzerias de {city} en v\u00e9rifiant leurs horaires, leurs options (halal, livraison, \u00e0 emporter), et leur localisation pr\u00e9cise.`,
            `Utilisez les filtres en haut de page pour trouver exactement ce que vous cherchez : pizzeria ouverte \u00e0 proximit\u00e9, livraison disponible, options halal\u2026`,
          ],
        },
      ],
    },
  };
}
