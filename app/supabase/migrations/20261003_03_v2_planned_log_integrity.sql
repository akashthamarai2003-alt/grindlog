-- Stage only. Compare the deployed RPC definition and migration ledger first.
-- This preserves the existing RPC signature while logging authoritative V2 snapshots.
BEGIN;

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
    v_meal RECORD;
    v_item_count INT;
    v_inserted_count INT;
    v_ingredients JSONB;
    v_recipe_name TEXT;
    v_timezone TEXT;
    v_logged_at TIMESTAMPTZ;
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role'
       AND (auth.uid() IS NULL OR auth.uid() <> p_user_id) THEN
        RAISE EXCEPTION 'PERMISSION_DENIED: Cannot log another user''s meal.';
    END IF;
    -- Keep the deployed signature. Counts must match, but ingredient identity and
    -- nutrient values come from the locked V2 plan rows, not caller JSON.
    IF jsonb_typeof(p_food_logs) IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'INVALID_PAYLOAD: p_food_logs must be an array.';
    END IF;

    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 1));

    -- STRICT rejects absent or ambiguous slots. Swap uses the same lock key and row lock.
    SELECT pm.id, pm.status, pm.recipe_version_id, pm.meal_template_id,
           pm.scheduled_time, pm.timezone_snapshot
      INTO STRICT v_meal
      FROM public.planned_meals pm
      JOIN public.meal_plans mp ON mp.id = pm.meal_plan_id
     WHERE pm.user_id = p_user_id AND pm.local_date = p_date
       AND pm.meal_slot = p_meal_slot AND mp.user_id = p_user_id
       AND mp.status = 'READY'
     FOR UPDATE OF pm;

    IF v_meal.status IS DISTINCT FROM 'PLANNED' THEN
        RAISE EXCEPTION 'PLANNED_MEAL_NOT_LOGGABLE: Status is %.', v_meal.status;
    END IF;

    SELECT count(*) INTO v_item_count
      FROM public.meal_plan_items i
     WHERE i.planned_meal_id = v_meal.id;
    IF v_item_count = 0 OR v_item_count <> jsonb_array_length(p_food_logs) THEN
        RAISE EXCEPTION 'PLANNED_MEAL_ITEMS_MISMATCH: Expected % detailed items.', v_item_count;
    END IF;
    IF EXISTS (
        SELECT 1 FROM public.meal_plan_items i
         WHERE i.planned_meal_id = v_meal.id
           AND (i.food_id IS NULL OR i.calories_snapshot IS NULL
                OR i.protein_snapshot IS NULL OR i.carbs_snapshot IS NULL
                OR i.fat_snapshot IS NULL)
    ) THEN
        RAISE EXCEPTION 'PLANNED_MEAL_INCOMPLETE: Missing food or macro snapshot.';
    END IF;
    IF EXISTS (SELECT 1 FROM public.food_logs WHERE planned_meal_id = v_meal.id) THEN
        RAISE EXCEPTION 'PLANNED_MEAL_ALREADY_LOGGED';
    END IF;

    v_timezone := COALESCE(NULLIF(v_meal.timezone_snapshot, ''), 'Asia/Kolkata');
    IF EXISTS (
        SELECT 1 FROM public.food_logs fl
         WHERE fl.user_id = p_user_id AND fl.meal_type = p_meal_slot
           AND (fl.logged_at AT TIME ZONE v_timezone)::date = p_date
    ) THEN
        RAISE EXCEPTION 'MEAL_SLOT_ALREADY_LOGGED';
    END IF;
    v_logged_at := CASE
        WHEN (NOW() AT TIME ZONE v_timezone)::date = p_date THEN NOW()
        ELSE (p_date + COALESCE(v_meal.scheduled_time, '12:00'::time)) AT TIME ZONE v_timezone
    END;

    SELECT COALESCE(rv.name, mt.name, 'Planned Meal')
      INTO v_recipe_name
      FROM (SELECT 1) anchor
      LEFT JOIN public.recipe_versions rv ON rv.id = v_meal.recipe_version_id
      LEFT JOIN public.meal_templates mt ON mt.id = v_meal.meal_template_id;

    SELECT jsonb_agg(jsonb_build_object(
               'food_id', i.food_id,
               'food_name', f.name,
               'quantity', i.quantity,
               'unit', i.unit,
               'portion_type', i.portion_type,
               'calories', i.calories_snapshot,
               'protein', i.protein_snapshot,
               'carbs', i.carbs_snapshot,
               'fat', i.fat_snapshot
           ) ORDER BY i.id)
      INTO v_ingredients
      FROM public.meal_plan_items i
      JOIN public.foods f ON f.id = i.food_id
     WHERE i.planned_meal_id = v_meal.id;

    INSERT INTO public.food_logs (
        user_id, meal_type, food_id, quantity, calories, protein, carbs, fat,
        estimated_cost, source, logged_at, planned_meal_id, recipe_version_id,
        recipe_name_snapshot, serving_snapshot, ingredients_snapshot
    )
    SELECT p_user_id, p_meal_slot, i.food_id,
           GREATEST(0.01, ROUND(CASE
               WHEN i.portion_type = 'CONTINUOUS' AND i.unit IN ('g', 'ml')
                   THEN i.quantity / NULLIF(COALESCE(f.serving_weight_g, 100), 0)
               ELSE i.quantity END, 2)),
           i.calories_snapshot, i.protein_snapshot, i.carbs_snapshot, i.fat_snapshot,
           COALESCE(i.cost_snapshot, 0), 'planned_v2', v_logged_at,
           v_meal.id, v_meal.recipe_version_id, v_recipe_name,
           i.serving_size, v_ingredients
      FROM public.meal_plan_items i
      JOIN public.foods f ON f.id = i.food_id
     WHERE i.planned_meal_id = v_meal.id;
    GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

    UPDATE public.planned_meals
       SET status = 'LOGGED', updated_at = NOW()
     WHERE id = v_meal.id;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'date', p_date,
        'meal_slot', p_meal_slot,
        'planned_meal_id', v_meal.id,
        'food_logs_count', v_inserted_count
    );
END;
$$;

REVOKE ALL ON FUNCTION public.log_v2_planned_meal_atomic(UUID, DATE, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_v2_planned_meal_atomic(UUID, DATE, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_v2_planned_meal_atomic(UUID, DATE, TEXT, JSONB) TO service_role;

COMMIT;
