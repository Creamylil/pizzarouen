-- Ajouter poste + permissions granulaires aux membres d'équipe
-- Exécuter dans Supabase Dashboard SQL Editor

ALTER TABLE public.commercials
  ADD COLUMN IF NOT EXISTS poste TEXT DEFAULT 'Commercial',
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{"cities":false,"pizzerias":false,"sectors":false,"redirects":false,"pricing":false,"fiches":true,"pipeline":true,"team":false,"simulateur":true}'::jsonb;
