-- ============================================
-- Fitness AI OS — Database Migration Phase 6 (Grocery)
-- ============================================

CREATE TABLE IF NOT EXISTS fitness_grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES fitness_os_workout_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  monthly_quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  estimated_price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  is_optional BOOLEAN DEFAULT false,
  reason TEXT,
  purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fitness_grocery_items_user_id ON fitness_grocery_items(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_grocery_items_plan_id ON fitness_grocery_items(plan_id);

ALTER TABLE fitness_grocery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own grocery items" 
  ON fitness_grocery_items FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update the RPC to handle grocery list and meals
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
  v_grocery RECORD;
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

    -- Create Grocery Items
    IF payload->'nutrition' ? 'grocery_list' AND jsonb_typeof(payload->'nutrition'->'grocery_list') = 'array' THEN
      FOR v_grocery IN SELECT * FROM jsonb_array_elements(payload->'nutrition'->'grocery_list')
      LOOP
        INSERT INTO fitness_grocery_items (user_id, plan_id, name, monthly_quantity, unit, estimated_price, category, is_optional, reason)
        VALUES (
          v_user_id,
          v_plan_id,
          v_grocery.value->>'name',
          (v_grocery.value->>'monthly_quantity')::numeric,
          v_grocery.value->>'unit',
          (v_grocery.value->>'estimated_price')::numeric,
          v_grocery.value->>'category',
          (v_grocery.value->>'is_optional')::boolean,
          v_grocery.value->>'reason'
        );
      END LOOP;
    END IF;
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
