-- ========================================================
-- GrindLog OS: In-App Notifications Schema
-- Migration: 20260909_in_app_notifications.sql
-- ========================================================

CREATE TABLE IF NOT EXISTS public.in_app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'system',
  link TEXT DEFAULT '/',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for lightning fast queries and badge counts
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_id 
  ON public.in_app_notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_in_app_notifications_created_at 
  ON public.in_app_notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_in_app_notifications_unread 
  ON public.in_app_notifications(user_id, read) 
  WHERE read = false;

-- Enable Row Level Security
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own notifications" ON public.in_app_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.in_app_notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.in_app_notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.in_app_notifications;
DROP POLICY IF EXISTS "Service role has full access to notifications" ON public.in_app_notifications;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
  ON public.in_app_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.in_app_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.in_app_notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON public.in_app_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role has full access to notifications"
  ON public.in_app_notifications FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant privileges
GRANT ALL ON TABLE public.in_app_notifications TO authenticated;
GRANT ALL ON TABLE public.in_app_notifications TO service_role;
