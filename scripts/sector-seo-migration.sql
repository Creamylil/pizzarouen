-- Migration: Ajout des champs SEO et publication sur geographic_sectors
-- À exécuter manuellement dans le Supabase Dashboard SQL Editor

ALTER TABLE geographic_sectors
  ADD COLUMN IF NOT EXISTS meta_title       TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS og_title         TEXT,
  ADD COLUMN IF NOT EXISTS og_description   TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url     TEXT,
  ADD COLUMN IF NOT EXISTS seo_content      JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_published     BOOLEAN DEFAULT TRUE NOT NULL;
