-- ============================================
-- Fitness AI OS — Database Migration Phase 4
-- Run this in Supabase SQL Editor AFTER the main migration
-- ============================================

-- ========== FITNESS OS WORKOUT PLANS ==========
CREATE TABLE IF NOT EXISTS fitness_os_workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== FITNESS OS WORKOUTS ==========
CREATE TABLE IF NOT EXISTS fitness_os_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NULL REFERENCES fitness_os_workout_plans(id) ON DELETE SET NULL,
  workout_date DATE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  started_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  duration_minutes INTEGER NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== FITNESS OS EXERCISES ==========
CREATE TABLE IF NOT EXISTS fitness_os_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES fitness_os_workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exercise_order INTEGER NOT NULL,
  target_sets INTEGER NOT NULL DEFAULT 3,
  target_reps INTEGER NULL,
  target_duration_seconds INTEGER NULL,
  rest_seconds INTEGER NOT NULL DEFAULT 60,
  notes TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== FITNESS OS SETS ==========
CREATE TABLE IF NOT EXISTS fitness_os_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES fitness_os_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  target_reps INTEGER NULL,
  actual_reps INTEGER NULL,
  weight_kg NUMERIC(7,2) NULL,
  duration_seconds INTEGER NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== FITNESS OS WORKOUT SESSIONS ==========
CREATE TABLE IF NOT EXISTS fitness_os_workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES fitness_os_workouts(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paused_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  duration_seconds INTEGER NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE fitness_os_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_os_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_os_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_os_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_os_workout_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- PLANS
CREATE POLICY "Users can manage own fitness plans" 
  ON fitness_os_workout_plans FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- WORKOUTS
CREATE POLICY "Users can manage own fitness workouts" 
  ON fitness_os_workouts FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SESSIONS
CREATE POLICY "Users can manage own fitness sessions" 
  ON fitness_os_workout_sessions FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- EXERCISES (Child of Workout)
CREATE POLICY "Users can manage own fitness exercises" 
  ON fitness_os_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM fitness_os_workouts w
      WHERE w.id = fitness_os_exercises.workout_id
      AND w.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fitness_os_workouts w
      WHERE w.id = fitness_os_exercises.workout_id
      AND w.user_id = auth.uid()
    )
  );

-- SETS (Child of Exercise -> Workout)
CREATE POLICY "Users can manage own fitness sets" 
  ON fitness_os_sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM fitness_os_exercises e
      JOIN fitness_os_workouts w ON e.workout_id = w.id
      WHERE e.id = fitness_os_sets.exercise_id
      AND w.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fitness_os_exercises e
      JOIN fitness_os_workouts w ON e.workout_id = w.id
      WHERE e.id = fitness_os_sets.exercise_id
      AND w.user_id = auth.uid()
    )
  );

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_fitness_os_workout_plans_user_id ON fitness_os_workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_workouts_user_id ON fitness_os_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_workouts_date ON fitness_os_workouts(workout_date);
CREATE INDEX IF NOT EXISTS idx_fitness_os_workouts_plan_id ON fitness_os_workouts(plan_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_exercises_workout_id ON fitness_os_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_sets_exercise_id ON fitness_os_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_sessions_user_id ON fitness_os_workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_sessions_workout_id ON fitness_os_workout_sessions(workout_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_fitness_os_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fitness_os_workout_plans_updated_at ON fitness_os_workout_plans;
CREATE TRIGGER trg_fitness_os_workout_plans_updated_at
  BEFORE UPDATE ON fitness_os_workout_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_fitness_os_updated_at();

DROP TRIGGER IF EXISTS trg_fitness_os_workouts_updated_at ON fitness_os_workouts;
CREATE TRIGGER trg_fitness_os_workouts_updated_at
  BEFORE UPDATE ON fitness_os_workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_fitness_os_updated_at();
