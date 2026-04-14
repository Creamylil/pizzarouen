-- CRM v5: Resend Email Integration
-- Ajoute le tracking email aux événements du CRM
-- À exécuter dans Supabase Dashboard > SQL Editor

-- Colonne JSONB pour stocker les métadonnées email (resend_id, status, recipient, subject...)
ALTER TABLE deal_events ADD COLUMN IF NOT EXISTS email_metadata JSONB;

-- Index pour retrouver rapidement un event par son ID Resend (webhook lookup)
CREATE INDEX IF NOT EXISTS idx_events_resend_id
  ON deal_events((email_metadata->>'resend_id'))
  WHERE email_metadata IS NOT NULL;
