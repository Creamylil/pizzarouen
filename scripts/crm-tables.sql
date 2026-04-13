-- CRM Tables for Pizza Admin Dashboard
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pizzeria_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pizzeria_id UUID NOT NULL REFERENCES pizzerias(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'prospect',
  pricing_plan_slug TEXT,
  monthly_amount INTEGER,
  subscription_start DATE,
  subscription_end DATE,
  payment_method TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deal_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES pizzeria_deals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT,
  old_status TEXT,
  new_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_deals_pizzeria ON pizzeria_deals(pizzeria_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON pizzeria_deals(status);
CREATE INDEX IF NOT EXISTS idx_events_deal ON deal_events(deal_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON deal_events(created_at DESC);
