-- ============================================================
-- RBAC Commerciaux + Commission
-- Exécuter dans Supabase Dashboard > SQL Editor
-- IMPORTANT : exécuter le ALTER TYPE seul en premier
-- ============================================================

-- 1. Ajouter 'commercial' à l'enum app_role
-- /!\ Exécuter cette ligne SEULE en premier (ne peut pas être dans une transaction)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'commercial';

-- 2. Nouvelles colonnes sur la table commercials
ALTER TABLE public.commercials
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) UNIQUE,
  ADD COLUMN IF NOT EXISTS can_see_all_deals BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS commission_month1_rate NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_recurring_rate NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_duration_months INTEGER NOT NULL DEFAULT 6;

-- 3. Index pour lookups rapides par user_id
CREATE INDEX IF NOT EXISTS idx_commercials_user_id ON public.commercials(user_id);
