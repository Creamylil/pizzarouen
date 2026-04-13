-- CRM v3 Migration — Run in Supabase SQL Editor
-- Adds: deal_notes table + is_annual on deals

-- Table des notes CRM avec date
CREATE TABLE IF NOT EXISTS deal_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES pizzeria_deals(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_notes_deal ON deal_notes(deal_id);

-- Paiement annuel
ALTER TABLE pizzeria_deals ADD COLUMN IF NOT EXISTS is_annual BOOLEAN DEFAULT false;
