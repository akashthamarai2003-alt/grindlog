-- ==============================================================================
-- Migration: 20260923_phase4_security_hardening.sql
-- Phase 4 Production Security, RLS Hardening & Abuse Protection
-- ==============================================================================

-- 1. Fix public.in_app_notifications policy scope
-- Dropping the incorrectly scoped policy that defaulted to PUBLIC (open to all authenticated users)
DROP POLICY IF EXISTS "Service role has full access to notifications" ON public.in_app_notifications;

-- Re-create the policy strictly scoped TO service_role
CREATE POLICY "Service role has full access to notifications"
  ON public.in_app_notifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure authenticated users can ONLY access their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.in_app_notifications;
CREATE POLICY "Users can view own notifications"
  ON public.in_app_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.in_app_notifications;
CREATE POLICY "Users can update own notifications"
  ON public.in_app_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.in_app_notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.in_app_notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.in_app_notifications;
CREATE POLICY "Users can insert own notifications"
  ON public.in_app_notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
