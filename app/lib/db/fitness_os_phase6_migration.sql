-- ============================================
-- Fitness AI OS — Database Migration Phase 6
-- AI Coach + Progress Analysis
-- Run this in Supabase SQL Editor
-- ============================================

-- ========== FITNESS OS COACH SESSIONS ==========
CREATE TABLE IF NOT EXISTS fitness_os_coach_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== FITNESS OS COACH MESSAGES ==========
CREATE TABLE IF NOT EXISTS fitness_os_coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES fitness_os_coach_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== FITNESS OS PROGRESS REVIEWS ==========
CREATE TABLE IF NOT EXISTS fitness_os_progress_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  workouts_completed INTEGER DEFAULT 0,
  workouts_planned INTEGER DEFAULT 0,
  sets_completed INTEGER DEFAULT 0,
  total_workout_minutes INTEGER DEFAULT 0,
  ai_summary TEXT,
  ai_highlights JSONB,
  ai_recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== FITNESS OS PLAN ADJUSTMENTS ==========
CREATE TABLE IF NOT EXISTS fitness_os_plan_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES fitness_os_workout_plans(id) ON DELETE CASCADE,
  adjustment_type TEXT,
  reason TEXT,
  proposed_changes JSONB NOT NULL,
  status TEXT CHECK (
    status IN ('pending','approved','rejected','applied')
  ),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE fitness_os_coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_os_coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_os_progress_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_os_plan_adjustments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- COACH SESSIONS
CREATE POLICY "Users can manage own coach sessions" 
  ON fitness_os_coach_sessions FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- COACH MESSAGES
CREATE POLICY "Users can manage own coach messages" 
  ON fitness_os_coach_messages FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM fitness_os_coach_sessions s
      WHERE s.id = fitness_os_coach_messages.session_id
      AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fitness_os_coach_sessions s
      WHERE s.id = fitness_os_coach_messages.session_id
      AND s.user_id = auth.uid()
    )
  );

-- PROGRESS REVIEWS
CREATE POLICY "Users can manage own progress reviews" 
  ON fitness_os_progress_reviews FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PLAN ADJUSTMENTS
CREATE POLICY "Users can manage own plan adjustments" 
  ON fitness_os_plan_adjustments FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_fitness_os_coach_sessions_user_id ON fitness_os_coach_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_coach_messages_session_id ON fitness_os_coach_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_coach_messages_user_id ON fitness_os_coach_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_progress_reviews_user_id ON fitness_os_progress_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_progress_reviews_dates ON fitness_os_progress_reviews(week_start, week_end);
CREATE INDEX IF NOT EXISTS idx_fitness_os_plan_adjustments_user_id ON fitness_os_plan_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_plan_adjustments_plan_id ON fitness_os_plan_adjustments(plan_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS trg_fitness_os_coach_sessions_updated_at ON fitness_os_coach_sessions;
CREATE TRIGGER trg_fitness_os_coach_sessions_updated_at
  BEFORE UPDATE ON fitness_os_coach_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_fitness_os_updated_at();
