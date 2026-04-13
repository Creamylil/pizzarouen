-- CRM v2 Migration — Run in Supabase SQL Editor
-- Adds: commercials table + assigned_to on deals + last_contact_at

-- Table des commerciaux
CREATE TABLE IF NOT EXISTS commercials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nouvelles colonnes sur pizzeria_deals
ALTER TABLE pizzeria_deals ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES commercials(id);
ALTER TABLE pizzeria_deals ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ;

-- Index
CREATE INDEX IF NOT EXISTS idx_deals_assigned ON pizzeria_deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_last_contact ON pizzeria_deals(last_contact_at);
