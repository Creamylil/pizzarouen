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
      `Découvrez les meilleures pizzerias de ${city} et sa région. Pizza livraison, à emporter et sur place. Horaires, avis et commande en ligne.`,
    metaKeywords: config.metaKeywords || [
      'pizza',
      'pizzeria',
      cityLower,
      'livraison pizza',
      'pizza à emporter',
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
          title: 'Pizzerias à {city} : trouvez votre pizza maintenant',
          paragraphs: [
            "Envie d'une pizza à {city} ? Vous êtes au bon endroit. Que vous cherchiez une adresse ouverte maintenant, une pizzeria halal, ou simplement la meilleure pizza du coin, on vous aide à trouver ce qu'il vous faut sans perdre de temps.",
            "Parce qu'une envie de pizza, ça n'attend pas. Voici les pizzerias ouvertes en ce moment à {city}.",
            'Certaines adresses assurent même 24h/24 à emporter pour les couche-tard.',
          ],
        },
        {
          type: 'grid',
          title: 'Pizza à {city} : découvrez les quartiers',
          cards: [
            {
              icon: '🏘️',
              heading: 'Centre-ville',
              text: 'En plein centre-ville de {city}, les pizzerias jouent la carte de la rapidité sans compromis sur la qualité. Pâte croustillante, garnitures généreuses, cuisson au feu de bois pour certaines.',
              color: 'amber',
            },
            {
              icon: '🏠',
              heading: 'Quartiers nord',
              text: 'Côté nord de {city}, vous trouverez des adresses familiales avec des portions généreuses. Livraison disponible tard le soir pour la plupart, et des formules qui ne cassent pas le budget.',
              color: 'blue',
            },
            {
              icon: '🌳',
              heading: 'Quartiers sud',
              text: "Côté sud, l'offre est variée : des classiques napolitaines aux pizzas plus créatives. Plusieurs spots proposent à emporter et livraison avec des apps rapides.",
              color: 'green',
            },
          ],
        },
        {
          icon: '🕌',
          type: 'highlight',
          title: 'Pizza halal à {city} : les adresses à connaître',
          paragraphs: [
            "Oui, il existe plusieurs pizzerias halal à {city}. Et non, vous n'aurez pas à sacrifier le goût ou le choix.",
            "Plusieurs établissements proposent des cartes entièrement halal avec une vraie diversité : classiques margherita et regina, pizzas viande et merguez, options végétariennes... La pizza halal à {city}, c'est devenu une vraie offre structurée.",
          ],
        },
        {
          icon: 'ℹ️',
          type: 'info',
          title: 'Comment utiliser ce site ?',
          paragraphs: [
            'Pas de chichi : on référence les pizzerias de {city} en vérifiant leurs horaires, leurs options (halal, livraison, à emporter), et leur localisation précise.',
            'Utilisez les filtres en haut de page pour trouver exactement ce que vous cherchez : pizzeria ouverte à proximité, livraison disponible, options halal…',
          ],
        },
      ],
    },
  };
}
