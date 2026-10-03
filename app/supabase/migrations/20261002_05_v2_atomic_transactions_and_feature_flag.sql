-- ============================================================================
-- GrindLog Nutrition Engine v2.0 - Migration 5:
-- Real Database Concurrency, True Atomic Transactions & Feature Flag
-- File: supabase/migrations/20261002_05_v2_atomic_transactions_and_feature_flag.sql
-- ============================================================================

BEGIN;

-- 1. Feature Flag: Controlled Additive Rollout Column
ALTER TABLE public.fitness_os_profiles
    ADD COLUMN IF NOT EXISTS nutrition_engine_v2 BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.fitness_os_profiles.nutrition_engine_v2 IS 
    'Authoritative database feature flag controlling GrindLog Nutrition Engine v2.0 for this user profile.';

-- 1b. Additive Metadata Columns on planned_meals
ALTER TABLE public.planned_meals
    ADD COLUMN IF NOT EXISTS planner_version TEXT DEFAULT 'v2.0-deterministic',
    ADD COLUMN IF NOT EXISTS timezone_snapshot TEXT NULL;

-- 2. Query & Concurrency Indexes
CREATE INDEX IF NOT EXISTS idx_planned_meals_user_date_slot 
    ON public.planned_meals(user_id, local_date, meal_slot);

CREATE INDEX IF NOT EXISTS idx_planned_meals_user_date_status
    ON public.planned_meals(user_id, local_date, status);

CREATE INDEX IF NOT EXISTS idx_meal_plan_items_planned_meal
    ON public.meal_plan_items(planned_meal_id) WHERE planned_meal_id IS NOT NULL;

-- ============================================================================
-- 3. Atomic Plan Generation & Activation RPC
-- Authoritative concurrency protection using pg_advisory_xact_lock
-- Guarantees meal_plans, planned_meals, meal_plan_items all commit together or none commit.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.persist_v2_meal_plan_atomic(
    p_user_id UUID,
    p_plan_days JSONB,
    p_planned_meals JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_caller_uid UUID := auth.uid();
    v_caller_role TEXT := auth.role();
    v_dates DATE[];
    v_day JSONB;
    v_plan JSONB;
    v_item JSONB;
    v_meal JSONB;
    v_meal_item JSONB;
    v_plan_id UUID;
    v_planned_meal_id UUID;
    v_date_to_plan_id JSONB := '{}'::JSONB;
    v_day_date DATE;
    v_meals_count INT := 0;
    v_items_count INT := 0;
BEGIN
    -- 1. Security Check: Authenticated caller must match target user or have service_role
    IF v_caller_role IS DISTINCT FROM 'service_role' AND (v_caller_uid IS NULL OR v_caller_uid <> p_user_id) THEN
        RAISE EXCEPTION 'PERMISSION_DENIED: Cannot persist meal plan for another user.';
    END IF;

    IF jsonb_typeof(p_plan_days) IS DISTINCT FROM 'array' OR jsonb_array_length(p_plan_days) = 0 THEN
        RAISE EXCEPTION 'INVALID_PAYLOAD: p_plan_days must be a non-empty array.';
    END IF;

    -- 2. Authoritative PostgreSQL Advisory Transaction Lock
    -- Locks the user's plan generation pipeline for the duration of this transaction.
    -- Automatically released on COMMIT or ROLLBACK.
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));

    -- 3. Extract distinct dates
    SELECT array_agg(DISTINCT (d.val->>'date')::date)
    INTO v_dates
    FROM jsonb_array_elements(p_plan_days) AS d(val);

    -- 4. Supersede previous active READY plans for these exact dates
    UPDATE public.meal_plans
    SET status = 'SUPERSEDED', updated_at = NOW()
    WHERE user_id = p_user_id 
      AND date = ANY(v_dates) 
      AND status = 'READY';

    -- 5. Delete existing planned_meals for these dates (clean slate for new validated plan)
    DELETE FROM public.planned_meals
    WHERE user_id = p_user_id AND local_date = ANY(v_dates);

    -- 6. Insert meal_plans containers (one per day)
    FOR v_day IN SELECT val FROM jsonb_array_elements(p_plan_days) AS val
    LOOP
        v_day_date := (v_day->>'date')::date;
        v_plan := v_day->'plan';

        -- Remove any conflicting legacy row for this specific date
        DELETE FROM public.meal_plans WHERE user_id = p_user_id AND date = v_day_date;

        INSERT INTO public.meal_plans (
            user_id, date, meal_type, name, calories, protein, carbs, fat,
            estimated_cost, ai_generated, status
        ) VALUES (
            p_user_id,
            v_day_date,
            'daily',
            COALESCE(NULLIF(v_plan->>'name', ''), '7-Day Precision Nutrition Plan'),
            COALESCE((v_plan->>'calories')::integer, 2000),
            COALESCE((v_plan->>'protein')::numeric, 120),
            COALESCE((v_plan->>'carbs')::numeric, 200),
            COALESCE((v_plan->>'fat')::numeric, 50),
            COALESCE((v_plan->>'estimated_cost')::numeric, 0),
            false,
            'READY'
        ) RETURNING id INTO v_plan_id;

        -- Record date -> plan_id mapping
        v_date_to_plan_id := jsonb_set(v_date_to_plan_id, ARRAY[v_day_date::text], to_jsonb(v_plan_id::text));

        -- Insert backward-compatibility projection items if provided in plan_days
        IF jsonb_typeof(v_day->'items') = 'array' THEN
            FOR v_item IN SELECT it FROM jsonb_array_elements(v_day->'items') AS it
            LOOP
                INSERT INTO public.meal_plan_items (
                    meal_plan_id, food_id, quantity, serving_size
                ) VALUES (
                    v_plan_id,
                    (v_item->>'food_id')::uuid,
                    COALESCE((v_item->>'quantity')::numeric, 1),
                    v_item->>'serving_size'
                );
            END LOOP;
        END IF;
    END LOOP;

    -- 7. Insert authoritative planned_meals and detailed meal_plan_items
    IF jsonb_typeof(p_planned_meals) = 'array' THEN
        FOR v_meal IN SELECT m FROM jsonb_array_elements(p_planned_meals) AS m
        LOOP
            v_day_date := (v_meal->>'local_date')::date;
            v_plan_id := (v_date_to_plan_id->>(v_day_date::text))::uuid;

            INSERT INTO public.planned_meals (
                id, meal_plan_id, user_id, local_date, meal_slot, meal_sequence,
                scheduled_time, source_type, recipe_version_id, recipe_variant_id,
                meal_template_id, image_asset_id, image_storage_path_snapshot, image_url_snapshot,
                calories_snapshot, protein_snapshot, carbs_snapshot, fat_snapshot,
                cost_snapshot, status, planner_version, timezone_snapshot
            ) VALUES (
                COALESCE((v_meal->>'id')::uuid, gen_random_uuid()),
                v_plan_id,
                p_user_id,
                v_day_date,
                v_meal->>'meal_slot',
                COALESCE((v_meal->>'meal_sequence')::integer, 1),
                COALESCE((v_meal->>'scheduled_time')::time, '12:00:00'::time),
                v_meal->>'source_type',
                (v_meal->>'recipe_version_id')::uuid,
                (v_meal->>'recipe_variant_id')::uuid,
                (v_meal->>'meal_template_id')::uuid,
                (v_meal->>'image_asset_id')::uuid,
                v_meal->>'image_storage_path_snapshot',
                v_meal->>'image_url_snapshot',
                COALESCE((v_meal->>'calories_snapshot')::integer, 0),
                COALESCE((v_meal->>'protein_snapshot')::numeric, 0),
                COALESCE((v_meal->>'carbs_snapshot')::numeric, 0),
                COALESCE((v_meal->>'fat_snapshot')::numeric, 0),
                COALESCE((v_meal->>'cost_snapshot')::numeric, 0),
                COALESCE(v_meal->>'status', 'PLANNED'),
                COALESCE(v_meal->>'planner_version', 'v2.0-deterministic'),
                v_meal->>'timezone_snapshot'
            ) RETURNING id INTO v_planned_meal_id;

            v_meals_count := v_meals_count + 1;

            -- Insert detailed ingredient items linked via planned_meal_id
            IF jsonb_typeof(v_meal->'items') = 'array' THEN
                FOR v_meal_item IN SELECT it FROM jsonb_array_elements(v_meal->'items') AS it
                LOOP
                    INSERT INTO public.meal_plan_items (
                        meal_plan_id, planned_meal_id, food_id, quantity, serving_size,
                        portion_type, unit, ingredient_role, is_provided,
                        calories_snapshot, protein_snapshot, carbs_snapshot, fat_snapshot, cost_snapshot
                    ) VALUES (
                        v_plan_id,
                        v_planned_meal_id,
                        (v_meal_item->>'food_id')::uuid,
                        COALESCE((v_meal_item->>'quantity')::numeric, 1),
                        COALESCE(v_meal_item->>'serving_size', v_meal_item->>'food_name', '1 serving'),
                        v_meal_item->>'portion_type',
                        v_meal_item->>'unit',
                        v_meal_item->>'ingredient_role',
                        COALESCE((v_meal_item->>'is_provided')::boolean, false),
                        (v_meal_item->>'calories_snapshot')::integer,
                        (v_meal_item->>'protein_snapshot')::numeric,
                        (v_meal_item->>'carbs_snapshot')::numeric,
                        (v_meal_item->>'fat_snapshot')::numeric,
                        (v_meal_item->>'cost_snapshot')::numeric
                    );

                    v_items_count := v_items_count + 1;
                END LOOP;
            END IF;
        END LOOP;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'dates', v_dates,
        'days_persisted', jsonb_array_length(p_plan_days),
        'planned_meals_persisted', v_meals_count,
        'meal_items_persisted', v_items_count
    );
END;
$$;

REVOKE ALL ON FUNCTION public.persist_v2_meal_plan_atomic(UUID, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.persist_v2_meal_plan_atomic(UUID, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.persist_v2_meal_plan_atomic(UUID, JSONB, JSONB) TO service_role;

-- ============================================================================
-- 4. Atomic Meal Swap RPC with Real Row-Locking & Race Safety
-- Protects against concurrent Log vs Swap race conditions.
-- FOR UPDATE locks the planned meal row before checking LOGGED status.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.execute_v2_meal_swap_atomic(
    p_user_id UUID,
    p_date DATE,
    p_meal_slot TEXT,
    p_day_start TIMESTAMPTZ,
    p_day_end TIMESTAMPTZ,
    p_swap JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_caller_uid UUID := auth.uid();
    v_caller_role TEXT := auth.role();
    v_planned_meal_id UUID;
    v_meal_plan_id UUID;
    v_current_status TEXT;
    v_item JSONB;
    v_food_name TEXT;
    v_serving_text TEXT;
BEGIN
    -- Security Check
    IF v_caller_role IS DISTINCT FROM 'service_role' AND (v_caller_uid IS NULL OR v_caller_uid <> p_user_id) THEN
        RAISE EXCEPTION 'PERMISSION_DENIED: Cannot swap meal for another user.';
    END IF;

    -- 1. Authoritative PostgreSQL Advisory Lock for Swap/Log operations on this user
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 1));

    -- 2. Lock the planned meal row with FOR UPDATE
    SELECT id, meal_plan_id, status 
    INTO v_planned_meal_id, v_meal_plan_id, v_current_status
    FROM public.planned_meals
    WHERE user_id = p_user_id AND local_date = p_date AND meal_slot = p_meal_slot
    FOR UPDATE;

    -- 3. Invariant Protection: Check if meal has become LOGGED
    IF v_current_status = 'LOGGED' THEN
        RAISE EXCEPTION 'CANNOT_SWAP_LOGGED_MEAL: This meal has already been logged. Past and logged meals cannot be altered.';
    END IF;

    -- 4. Secondary Protection: Check if food logs already exist in this time boundary
    IF EXISTS (
        SELECT 1 FROM public.food_logs
        WHERE user_id = p_user_id 
          AND meal_type = p_meal_slot
          AND logged_at >= p_day_start 
          AND logged_at <= p_day_end
    ) THEN
        RAISE EXCEPTION 'CANNOT_SWAP_LOGGED_MEAL: This meal has already been logged. Past and logged meals cannot be altered.';
    END IF;

    -- 5. If no planned_meal row exists, find legacy meal_plans row
    IF v_meal_plan_id IS NULL THEN
        SELECT id INTO v_meal_plan_id
        FROM public.meal_plans
        WHERE user_id = p_user_id AND date = p_date;
    END IF;

    IF v_meal_plan_id IS NULL THEN
        RAISE EXCEPTION 'PLAN_NOT_FOUND: No active meal plan found for date %.', p_date;
    END IF;

    -- 6. Update planned_meals row if present
    IF v_planned_meal_id IS NOT NULL THEN
        UPDATE public.planned_meals SET
            recipe_version_id = (p_swap->>'recipe_version_id')::uuid,
            recipe_variant_id = (p_swap->>'recipe_variant_id')::uuid,
            source_type = 'RECIPE',
            meal_template_id = NULL,
            image_asset_id = (p_swap->>'image_asset_id')::uuid,
            image_storage_path_snapshot = p_swap->>'image_storage_path_snapshot',
            image_url_snapshot = p_swap->>'image_url_snapshot',
            calories_snapshot = COALESCE((p_swap->>'calories')::integer, 0),
            protein_snapshot = COALESCE((p_swap->>'protein')::numeric, 0),
            carbs_snapshot = COALESCE((p_swap->>'carbs')::numeric, 0),
            fat_snapshot = COALESCE((p_swap->>'fat')::numeric, 0),
            cost_snapshot = COALESCE((p_swap->>'estimated_cost')::numeric, 0),
            status = 'PLANNED',
            updated_at = NOW()
        WHERE id = v_planned_meal_id;

        -- Remove old items associated with this planned meal
        DELETE FROM public.meal_plan_items WHERE planned_meal_id = v_planned_meal_id;
    END IF;

    -- 7. Remove legacy projection items for this slot
    DELETE FROM public.meal_plan_items 
    WHERE meal_plan_id = v_meal_plan_id 
      AND serving_size LIKE (p_meal_slot || '::%');

    -- 8. Insert new replacement items
    IF jsonb_typeof(p_swap->'items') = 'array' THEN
        FOR v_item IN SELECT it FROM jsonb_array_elements(p_swap->'items') AS it
        LOOP
            v_food_name := COALESCE(v_item->>'name', v_item->>'food_name', 'Ingredient');
            v_serving_text := p_meal_slot || '::' || (p_swap->>'name') || '::' || COALESCE(v_item->>'serving_size', '1 serving');

            INSERT INTO public.meal_plan_items (
                meal_plan_id, planned_meal_id, food_id, quantity, serving_size,
                portion_type, unit, ingredient_role, is_provided,
                calories_snapshot, protein_snapshot, carbs_snapshot, fat_snapshot, cost_snapshot
            ) VALUES (
                v_meal_plan_id,
                v_planned_meal_id,
                (v_item->>'food_id')::uuid,
                COALESCE((v_item->>'quantity')::numeric, 1),
                v_serving_text,
                v_item->>'portion_type',
                v_item->>'unit',
                v_item->>'ingredient_role',
                COALESCE((v_item->>'is_provided')::boolean, false),
                (v_item->>'calories_snapshot')::integer,
                (v_item->>'protein_snapshot')::numeric,
                (v_item->>'carbs_snapshot')::numeric,
                (v_item->>'fat_snapshot')::numeric,
                (v_item->>'cost_snapshot')::numeric
            );
        END LOOP;
    END IF;

    -- 9. Recalculate day macro sums on the meal_plans container
    IF v_planned_meal_id IS NOT NULL THEN
        UPDATE public.meal_plans SET
            calories = (SELECT COALESCE(SUM(calories_snapshot), 0) FROM public.planned_meals WHERE user_id = p_user_id AND local_date = p_date),
            protein = (SELECT COALESCE(SUM(protein_snapshot), 0) FROM public.planned_meals WHERE user_id = p_user_id AND local_date = p_date),
            carbs = (SELECT COALESCE(SUM(carbs_snapshot), 0) FROM public.planned_meals WHERE user_id = p_user_id AND local_date = p_date),
            fat = (SELECT COALESCE(SUM(fat_snapshot), 0) FROM public.planned_meals WHERE user_id = p_user_id AND local_date = p_date),
            estimated_cost = (SELECT COALESCE(SUM(cost_snapshot), 0) FROM public.planned_meals WHERE user_id = p_user_id AND local_date = p_date),
            updated_at = NOW()
        WHERE id = v_meal_plan_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'date', p_date,
        'meal_slot', p_meal_slot,
        'swapped_meal_id', v_planned_meal_id,
        'recipe_name', p_swap->>'name'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.execute_v2_meal_swap_atomic(UUID, DATE, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_v2_meal_swap_atomic(UUID, DATE, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_v2_meal_swap_atomic(UUID, DATE, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, JSONB) TO service_role;

-- ============================================================================
-- 5. Atomic Meal Logging RPC with Invariant Row-Locking
-- ============================================================================
CREATE OR REPLACE FUNCTION public.log_v2_planned_meal_atomic(
    p_user_id UUID,
    p_date DATE,
    p_meal_slot TEXT,
    p_food_logs JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_caller_uid UUID := auth.uid();
    v_caller_role TEXT := auth.role();
    v_planned_meal_id UUID;
    v_log JSONB;
    v_inserted_count INT := 0;
BEGIN
    -- Security Check
    IF v_caller_role IS DISTINCT FROM 'service_role' AND (v_caller_uid IS NULL OR v_caller_uid <> p_user_id) THEN
        RAISE EXCEPTION 'PERMISSION_DENIED: Cannot log meal for another user.';
    END IF;

    -- 1. Authoritative PostgreSQL Advisory Lock
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 1));

    -- 2. Lock planned_meal row FOR UPDATE
    SELECT id INTO v_planned_meal_id
    FROM public.planned_meals
    WHERE user_id = p_user_id AND local_date = p_date AND meal_slot = p_meal_slot
    FOR UPDATE;

    -- 3. Insert food_logs
    IF jsonb_typeof(p_food_logs) = 'array' THEN
        FOR v_log IN SELECT it FROM jsonb_array_elements(p_food_logs) AS it
        LOOP
            INSERT INTO public.food_logs (
                user_id, meal_type, food_id, quantity,
                calories, protein, carbs, fat, logged_at
            ) VALUES (
                p_user_id,
                p_meal_slot,
                (v_log->>'food_id')::uuid,
                COALESCE((v_log->>'quantity')::numeric, 1),
                COALESCE((v_log->>'calories')::integer, 0),
                COALESCE((v_log->>'protein')::numeric, 0),
                COALESCE((v_log->>'carbs')::numeric, 0),
                COALESCE((v_log->>'fat')::numeric, 0),
                COALESCE((v_log->>'logged_at')::timestamptz, NOW())
            );
            v_inserted_count := v_inserted_count + 1;
        END LOOP;
    END IF;

    -- 4. Mark planned meal as LOGGED
    IF v_planned_meal_id IS NOT NULL THEN
        UPDATE public.planned_meals 
        SET status = 'LOGGED', updated_at = NOW() 
        WHERE id = v_planned_meal_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'date', p_date,
        'meal_slot', p_meal_slot,
        'planned_meal_id', v_planned_meal_id,
        'food_logs_count', v_inserted_count
    );
END;
$$;

REVOKE ALL ON FUNCTION public.log_v2_planned_meal_atomic(UUID, DATE, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_v2_planned_meal_atomic(UUID, DATE, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_v2_planned_meal_atomic(UUID, DATE, TEXT, JSONB) TO service_role;

COMMIT;
