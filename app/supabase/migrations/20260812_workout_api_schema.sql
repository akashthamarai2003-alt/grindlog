-- ============================================
-- Workout API Enhancements
-- Adds AI Coach notes, usage logs mapping, and constraints
-- ============================================

-- ========== WORKOUT AI NOTES ==========
CREATE TABLE IF NOT EXISTS workout_ai_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES fitness_os_workouts(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workout_id, prompt_version)
);

-- ============================================
-- CONSTRAINTS & UNIQUENESS
-- ============================================

-- Enforce uniqueness on (exercise_id, set_number) to make completion idempotent
ALTER TABLE fitness_os_sets ADD CONSTRAINT uq_fitness_os_sets_exercise_set UNIQUE (exercise_id, set_number);

-- Ensure only one active session per workout
CREATE UNIQUE INDEX IF NOT EXISTS idx_uq_active_workout_session 
ON fitness_os_workout_sessions (workout_id)
WHERE status IN ('active', 'paused');

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE workout_ai_notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- AI NOTES
CREATE POLICY "Users can manage own workout AI notes" 
  ON workout_ai_notes FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_workout_ai_notes_user_id ON workout_ai_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_ai_notes_workout_id ON workout_ai_notes(workout_id);
