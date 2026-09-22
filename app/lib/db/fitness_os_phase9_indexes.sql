-- ============================================
-- Fitness AI OS — Database Migration Phase 9 (Dashboard Performance Indexes)
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Composite index for dashboard workout lookups (today & current week)
-- Improves:
--   WHERE user_id = $1 AND workout_date = $2 (Today's workout)
--   WHERE user_id = $1 AND workout_date >= $2 AND workout_date <= $3 (Week's workouts)
CREATE INDEX IF NOT EXISTS idx_fitness_os_workouts_user_date 
  ON fitness_os_workouts(user_id, workout_date);

-- 2. Composite index for active plan lookup on dashboard startup
-- Improves:
--   WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1
CREATE INDEX IF NOT EXISTS idx_fitness_os_workout_plans_user_status 
  ON fitness_os_workout_plans(user_id, status, created_at DESC);
