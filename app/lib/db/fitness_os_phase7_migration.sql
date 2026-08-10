-- ============================================
-- Fitness AI OS — Database Migration Phase 7
-- ₹10 Starter + Pro Subscription & Feature Access
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS fitness_os_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro')),
  status TEXT NOT NULL CHECK (
    status IN ('created', 'active', 'paused', 'cancelled', 'expired')
  ),
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_order_id TEXT,
  provider_payment_id TEXT,
  provider_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE RLS
ALTER TABLE fitness_os_subscriptions ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Users can view own subscription" 
  ON fitness_os_subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- Only server-role can insert/update/delete (Service Role Key bypasses RLS)
-- No INSERT/UPDATE policies for authenticated users.

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_fitness_os_subscriptions_user_id ON fitness_os_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_subscriptions_status ON fitness_os_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_fitness_os_subscriptions_provider_sub_id ON fitness_os_subscriptions(provider_subscription_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_subscriptions_period_end ON fitness_os_subscriptions(current_period_end);

-- TRIGGER FOR UPDATED_AT
DROP TRIGGER IF EXISTS trg_fitness_os_subscriptions_updated_at ON fitness_os_subscriptions;
CREATE TRIGGER trg_fitness_os_subscriptions_updated_at
  BEFORE UPDATE ON fitness_os_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_fitness_os_updated_at();
