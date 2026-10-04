-- Phase 4.7: prevent the deployed persist RPC from deleting logged history.
-- Reviewed source: 20261002_05_v2_atomic_transactions_and_feature_flag.sql.
-- Apply only after read-only verification of the current body and migration state.
BEGIN;
DO $precheck$
DECLARE
    actual_hash TEXT;
BEGIN
    SELECT md5(btrim(regexp_replace(p.prosrc, '[[:space:]]+', ' ', 'g')))
      INTO actual_hash
      FROM pg_proc p
     WHERE p.oid = 'public.persist_v2_meal_plan_atomic(uuid,jsonb,jsonb)'::regprocedure;
    IF actual_hash IS NULL OR actual_hash NOT IN ('b8018a4bf66ca3bf6e76eab8c34d147c', '46e3693967bb49a76c33c32083f9eb2e') THEN
        RAISE EXCEPTION 'Unexpected deployed persist_v2_meal_plan_atomic body hash: %', actual_hash;
    END IF;
END;
$precheck$;

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
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 1));

    -- 3. Extract distinct dates
    SELECT array_agg(DISTINCT (d.val->>'date')::date)
    INTO v_dates
    FROM jsonb_array_elements(p_plan_days) AS d(val);

    -- This lock is shared with swap and planned-log RPCs. Reject replacement
    -- after either a logged status or linked food log exists.
    IF EXISTS (
        SELECT 1 FROM public.planned_meals pm
        WHERE pm.user_id = p_user_id
          AND pm.local_date = ANY(v_dates)
          AND (pm.status = 'LOGGED' OR EXISTS (
              SELECT 1 FROM public.food_logs fl
              WHERE fl.user_id = p_user_id AND fl.planned_meal_id = pm.id
          ))
    ) THEN
        RAISE EXCEPTION 'CANNOT_REGENERATE_LOGGED_MEAL: A meal in this date range has already been logged.';
    END IF;

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

REVOKE EXECUTE ON FUNCTION public.persist_v2_meal_plan_atomic(uuid,jsonb,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.persist_v2_meal_plan_atomic(uuid,jsonb,jsonb) TO authenticated, service_role;
COMMIT;
