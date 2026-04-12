-- =====================================================
-- MIGRATION : Template Multi-Villes Pizza
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)
-- =====================================================

-- 1. Créer la table cities
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  site_url TEXT NOT NULL,
  center_lat NUMERIC NOT NULL,
  center_lng NUMERIC NOT NULL,
  default_zoom INTEGER DEFAULT 13,
  geo_region TEXT NOT NULL,
  geo_placename TEXT NOT NULL,
  address_region TEXT NOT NULL,
  default_sector_slug TEXT NOT NULL,
  main_postal_codes TEXT[] NOT NULL,
  meta_title TEXT NOT NULL,
  meta_title_template TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT[] NOT NULL,
  og_site_name TEXT NOT NULL,
  google_analytics_id TEXT,
  contact_email TEXT NOT NULL,
  contact_whatsapp TEXT,
  logo_url TEXT,
  hero_image_url TEXT,
  editor_name TEXT NOT NULL,
  seo_content JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Ajouter city_id sur pizzerias
ALTER TABLE pizzerias ADD COLUMN city_id UUID REFERENCES cities(id);
CREATE INDEX idx_pizzerias_city_id ON pizzerias(city_id);

-- 3. Ajouter city_id, display_name, display_order sur geographic_sectors
ALTER TABLE geographic_sectors
  ADD COLUMN city_id UUID REFERENCES cities(id),
  ADD COLUMN display_name TEXT,
  ADD COLUMN display_order INTEGER DEFAULT 999;
CREATE INDEX idx_sectors_city_id ON geographic_sectors(city_id);

-- 4. Créer la table city_redirects
CREATE TABLE city_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) NOT NULL,
  source_path TEXT NOT NULL,
  destination_path TEXT NOT NULL,
  permanent BOOLEAN DEFAULT true
);

-- 5. Activer RLS et ajouter les policies de lecture publique
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Allow public read on city_redirects" ON city_redirects FOR SELECT USING (true);

-- 6. Insérer la config Rouen
INSERT INTO cities (
  slug, name, display_name, domain, site_url,
  center_lat, center_lng, default_zoom,
  geo_region, geo_placename, address_region,
  default_sector_slug, main_postal_codes,
  meta_title, meta_title_template, meta_description,
  meta_keywords, og_site_name,
  google_analytics_id,
  contact_email, contact_whatsapp,
  logo_url, hero_image_url,
  editor_name,
  seo_content
) VALUES (
  'rouen',
  'Rouen',
  'Pizza Rouen',
  'pizzarouen.fr',
  'https://pizzarouen.fr',
  49.4432, 1.0993, 13,
  'FR-76', 'Rouen', 'Normandie',
  '76000',
  ARRAY['76000', '76100'],
  'Pizzerias Rouen - Ouvertes Maintenant | Livraison & Halal',
  '%s | Pizza Rouen',
  'Découvrez les meilleures pizzerias de Rouen et sa région. Pizza livraison, à emporter et sur place. Horaires, avis et commande en ligne.',
  ARRAY['pizza', 'pizzeria', 'rouen', 'livraison pizza', 'pizza à emporter', 'restaurant italien', 'pizza halal', 'pizzeria ouverte', 'bihorel', 'petit-quevilly', 'grand-quevilly', 'sotteville'],
  'Pizza Rouen',
  'G-S7LT5QBQMV',
  'contact@pizzarouen.fr',
  '+33 7 67 02 81 61',
  '/lovable-uploads/6d184fab-0b61-4d6b-aefd-1e273823de65.png',
  '/lovable-uploads/2f182011-29ef-45c7-9902-164fe4326b49.png',
  'JSD MEDIA LLP',
  '{
    "sections": [
      {
        "type": "intro",
        "title": "Pizzerias à {city} : trouvez votre pizza maintenant",
        "paragraphs": [
          "Envie d''une pizza à {city} ? Vous êtes au bon endroit. Que vous cherchiez une adresse ouverte maintenant, une pizzeria halal, ou simplement la meilleure pizza du coin, on vous aide à trouver ce qu''il vous faut sans perdre de temps.",
          "Parce qu''une envie de pizza, ça n''attend pas. Voici les pizzerias ouvertes en ce moment à {city}.",
          "Certaines adresses assurent même 24h/24 à emporter pour les couche-tard."
        ]
      },
      {
        "type": "grid",
        "title": "Pizza à {city} : découvrez les quartiers",
        "cards": [
          {"icon": "🏘️", "heading": "Rive droite", "text": "Du côté de la rive droite, vous avez plusieurs adresses qui font le job. Entre les classiques napolitaines et les pizzas plus généreuses, le choix ne manque pas. Certaines proposent la livraison jusqu''à tard le soir.", "color": "blue"},
          {"icon": "🏛️", "heading": "Centre-ville", "text": "En plein centre-ville de {city}, entre deux pavés et une balade au bord de la Seine, les pizzerias jouent la carte de la rapidité sans compromis sur la qualité. Pâte croustillante, garnitures généreuses, cuisson au feu de bois pour certaines.", "color": "amber"},
          {"icon": "🌳", "heading": "Rive gauche", "text": "Côté rive gauche, l''offre est tout aussi riche. Vous avez les adresses familiales où le patron vous reconnaît à la troisième commande, et les spots plus modernes avec leurs apps de livraison ultra-rapides.", "color": "green"}
        ]
      },
      {
        "type": "highlight",
        "title": "Pizza halal à {city} : les adresses à connaître",
        "icon": "🕌",
        "paragraphs": [
          "Oui, il existe plusieurs pizzerias halal à {city}. Et non, vous n''aurez pas à sacrifier le goût ou le choix.",
          "Plusieurs établissements proposent des cartes entièrement halal avec une vraie diversité : classiques margherita et regina, pizzas viande et merguez, options végétariennes... La pizza halal à {city}, c''est devenu une vraie offre structurée."
        ]
      },
      {
        "type": "info",
        "title": "Comment utiliser ce site ?",
        "icon": "ℹ️",
        "paragraphs": [
          "Pas de chichi : on référence les pizzerias de {city} en vérifiant leurs horaires, leurs options (halal, livraison, à emporter), et leur localisation précise.",
          "Utilisez les filtres en haut de page pour trouver exactement ce que vous cherchez : pizzeria ouverte à proximité, livraison disponible, options halal…"
        ]
      }
    ]
  }'::jsonb
);

-- 7. Backfill : associer toutes les pizzerias existantes à Rouen
UPDATE pizzerias SET city_id = (SELECT id FROM cities WHERE slug = 'rouen');

-- 8. Backfill : associer tous les sectors existants à Rouen + display_name + display_order
UPDATE geographic_sectors SET city_id = (SELECT id FROM cities WHERE slug = 'rouen');
UPDATE geographic_sectors SET display_name = 'Rouen Centre', display_order = 1 WHERE slug = '76000';
UPDATE geographic_sectors SET display_name = 'Rouen Rive Gauche', display_order = 2 WHERE slug = '76100';
UPDATE geographic_sectors SET display_order = 3 WHERE slug = 'le-petit-quevilly';
UPDATE geographic_sectors SET display_order = 4 WHERE slug = 'le-grand-quevilly';
UPDATE geographic_sectors SET display_order = 5 WHERE slug = 'deville-les-rouen';
UPDATE geographic_sectors SET display_order = 6 WHERE slug = 'bihorel';
UPDATE geographic_sectors SET display_order = 7 WHERE slug = 'sotteville-les-rouen';

-- 9. Rendre city_id NOT NULL après backfill
ALTER TABLE pizzerias ALTER COLUMN city_id SET NOT NULL;
ALTER TABLE geographic_sectors ALTER COLUMN city_id SET NOT NULL;

-- 10. Insérer les redirections 301 pour Rouen
INSERT INTO city_redirects (city_id, source_path, destination_path) VALUES
  ((SELECT id FROM cities WHERE slug = 'rouen'), '/bihorel', '/?sector=bihorel'),
  ((SELECT id FROM cities WHERE slug = 'rouen'), '/sotteville-les-rouen', '/?sector=sotteville-les-rouen'),
  ((SELECT id FROM cities WHERE slug = 'rouen'), '/le-petit-quevilly', '/?sector=le-petit-quevilly'),
  ((SELECT id FROM cities WHERE slug = 'rouen'), '/le-grand-quevilly', '/?sector=le-grand-quevilly'),
  ((SELECT id FROM cities WHERE slug = 'rouen'), '/deville-les-rouen', '/?sector=deville-les-rouen'),
  ((SELECT id FROM cities WHERE slug = 'rouen'), '/larret-pizza', '/?sector=bihorel');
