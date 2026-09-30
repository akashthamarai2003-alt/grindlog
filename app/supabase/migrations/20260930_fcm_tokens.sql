-- ========================================================
-- GrindLog OS: FCM Push Tokens Schema
-- Migration: 20260930_fcm_tokens.sql
-- ========================================================

CREATE TABLE IF NOT EXISTS public.fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for rapid lookup during cron push broadcasts
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON public.fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token ON public.fcm_tokens(token);

-- Enable Row Level Security
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own FCM tokens" ON public.fcm_tokens;
DROP POLICY IF EXISTS "Users can insert own FCM tokens" ON public.fcm_tokens;
DROP POLICY IF EXISTS "Users can update own FCM tokens" ON public.fcm_tokens;
DROP POLICY IF EXISTS "Users can delete own FCM tokens" ON public.fcm_tokens;
DROP POLICY IF EXISTS "Service role has full access to fcm_tokens" ON public.fcm_tokens;

-- RLS Policies
CREATE POLICY "Users can view own FCM tokens"
  ON public.fcm_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own FCM tokens"
  ON public.fcm_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own FCM tokens"
  ON public.fcm_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own FCM tokens"
  ON public.fcm_tokens FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to fcm_tokens"
  ON public.fcm_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant privileges
GRANT ALL ON TABLE public.fcm_tokens TO authenticated;
GRANT ALL ON TABLE public.fcm_tokens TO service_role;
