-- CRM v4: Stripe payment link support
-- Stores the last generated Stripe Checkout URL on the deal

ALTER TABLE pizzeria_deals
  ADD COLUMN IF NOT EXISTS last_payment_link TEXT;
