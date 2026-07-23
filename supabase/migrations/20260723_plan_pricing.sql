-- ============================================
-- GrindLog — Plan Pricing Table Migration
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS public.plan_pricing (
  id TEXT PRIMARY KEY DEFAULT 'pricing_config',
  prices JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.plan_pricing ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Anyone can read plan_pricing" ON public.plan_pricing;

-- Public read access so /payment page can fetch live prices
CREATE POLICY "Anyone can read plan_pricing"
  ON public.plan_pricing FOR SELECT
  USING (true);

-- Insert default pricing if not already present
INSERT INTO public.plan_pricing (id, prices)
VALUES (
  'pricing_config',
  '{
    "monthly": {
      "core": { "price": 49, "originalPrice": 99 },
      "pro": { "price": 69, "originalPrice": 149 }
    },
    "six_months": {
      "core": { "price": 199, "originalPrice": 294 },
      "pro": { "price": 249, "originalPrice": 399 }
    },
    "lifetime": {
      "core": { "price": 599, "originalPrice": 999 },
      "pro": { "price": 799, "originalPrice": 1499 }
    }
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
