-- ============================================
-- Fitness AI OS — Database Migration Phase 5
-- Run this in Supabase SQL Editor
-- ============================================

-- ========== FITNESS OS NUTRITION PLANS ==========
CREATE TABLE IF NOT EXISTS fitness_os_nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES fitness_os_workout_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  daily_calories INTEGER,
  protein_grams INTEGER,
  meals_per_day INTEGER,
  guidance TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== FITNESS OS LIFESTYLE PLANS ==========
CREATE TABLE IF NOT EXISTS fitness_os_lifestyle_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES fitness_os_workout_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sleep_target_hours NUMERIC(4,2),
  water_target_liters NUMERIC(4,2),
  daily_steps_target INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== FITNESS OS AI SESSIONS (Isolated Limits) ==========
CREATE TABLE IF NOT EXISTS fitness_os_ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  prompt TEXT,
  response TEXT,
  model TEXT,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE fitness_os_nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_os_lifestyle_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_os_ai_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

CREATE POLICY "Users can manage own nutrition plans" 
  ON fitness_os_nutrition_plans FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own lifestyle plans" 
  ON fitness_os_lifestyle_plans FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own fitness ai sessions" 
  ON fitness_os_ai_sessions FOR SELECT 
  USING (auth.uid() = user_id);

-- Note: We only allow insertion from service role or via RPC, but for simplicity:
CREATE POLICY "Users can insert own fitness ai sessions" 
  ON fitness_os_ai_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_fitness_os_nutrition_plans_user_id ON fitness_os_nutrition_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_nutrition_plans_plan_id ON fitness_os_nutrition_plans(plan_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_lifestyle_plans_user_id ON fitness_os_lifestyle_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_lifestyle_plans_plan_id ON fitness_os_lifestyle_plans(plan_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_ai_sessions_user_id ON fitness_os_ai_sessions(user_id);

-- ============================================
-- ATOMIC PLAN CREATION RPC
-- ============================================

CREATE OR REPLACE FUNCTION create_fitness_os_plan_transaction(payload JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_id UUID;
  v_plan_id UUID;
  v_workout RECORD;
  v_workout_id UUID;
  v_exercise RECORD;
  v_exercise_id UUID;
  v_set_idx INTEGER;
BEGIN
  -- Validate auth
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Create Plan
  INSERT INTO fitness_os_workout_plans (user_id, name, description, goal, status)
  VALUES (
    v_user_id,
    payload->'plan'->>'name',
    payload->'plan'->>'description',
    payload->'plan'->>'goal',
    'active'
  ) RETURNING id INTO v_plan_id;

  -- 2. Create Nutrition Plan
  IF payload ? 'nutrition' AND payload->'nutrition' IS NOT NULL THEN
    INSERT INTO fitness_os_nutrition_plans (plan_id, user_id, daily_calories, protein_grams, meals_per_day, guidance)
    VALUES (
      v_plan_id,
      v_user_id,
      (payload->'nutrition'->>'daily_calories')::integer,
      (payload->'nutrition'->>'protein_grams')::integer,
      (payload->'nutrition'->>'meals_per_day')::integer,
      payload->'nutrition'->>'guidance'
    );
  END IF;

  -- 3. Create Lifestyle Plan
  IF payload ? 'lifestyle' AND payload->'lifestyle' IS NOT NULL THEN
    INSERT INTO fitness_os_lifestyle_plans (plan_id, user_id, sleep_target_hours, water_target_liters, daily_steps_target)
    VALUES (
      v_plan_id,
      v_user_id,
      (payload->'lifestyle'->>'sleep_target_hours')::numeric,
      (payload->'lifestyle'->>'water_target_liters')::numeric,
      (payload->'lifestyle'->>'daily_steps_target')::integer
    );
  END IF;

  -- 4. Create Workouts
  IF payload ? 'workouts' THEN
    FOR v_workout IN SELECT * FROM jsonb_array_elements(payload->'workouts')
    LOOP
      INSERT INTO fitness_os_workouts (user_id, plan_id, workout_date, name, status, duration_minutes)
      VALUES (
        v_user_id,
        v_plan_id,
        (v_workout.value->>'workout_date')::date,
        v_workout.value->>'title',
        'scheduled',
        (v_workout.value->>'duration_minutes')::integer
      ) RETURNING id INTO v_workout_id;

      -- 5. Create Exercises
      IF v_workout.value ? 'exercises' THEN
        FOR v_exercise IN SELECT * FROM jsonb_array_elements(v_workout.value->'exercises')
        LOOP
          INSERT INTO fitness_os_exercises (workout_id, name, exercise_order, target_sets, target_reps, rest_seconds, notes)
          VALUES (
            v_workout_id,
            v_exercise.value->>'name',
            (v_exercise.value->>'exercise_order')::integer,
            (v_exercise.value->>'sets')::integer,
            (v_exercise.value->>'target_reps_num')::integer,
            (v_exercise.value->>'rest_seconds')::integer,
            v_exercise.value->>'notes'
          ) RETURNING id INTO v_exercise_id;

          -- 6. Create Sets
          FOR v_set_idx IN 1..(v_exercise.value->>'sets')::integer
          LOOP
            INSERT INTO fitness_os_sets (exercise_id, set_number, target_reps, completed)
            VALUES (
              v_exercise_id,
              v_set_idx,
              (v_exercise.value->>'target_reps_num')::integer,
              false
            );
          END LOOP;
        END LOOP;
      END IF;
    END LOOP;
  END IF;

  RETURN v_plan_id;
END;
$$;
