-- Replace all seven daily plans and their foods in one transaction.
-- The caller's auth identity and existing RLS policies continue to apply.
ALTER TABLE public.fitness_os_profiles
    ADD COLUMN IF NOT EXISTS nutrition_medical_conditions text[];

CREATE OR REPLACE FUNCTION public.replace_weekly_meal_plans(p_days jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
    v_dates date[];
    v_distinct_count integer;
    v_span integer;
    v_day jsonb;
    v_plan jsonb;
    v_item jsonb;
    v_plan_id uuid;
    v_food_id uuid;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication is required to save a meal plan.';
    END IF;
    IF jsonb_typeof(p_days) IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'A seven-day plan is required.';
    END IF;
    IF jsonb_array_length(p_days) <> 7 THEN
        RAISE EXCEPTION 'A seven-day plan is required.';
    END IF;

    SELECT array_agg((entry.value->>'date')::date)
    INTO v_dates
    FROM jsonb_array_elements(p_days) AS entry(value);
    SELECT COUNT(DISTINCT dates.day_date), MAX(dates.day_date) - MIN(dates.day_date)
    INTO v_distinct_count, v_span
    FROM unnest(v_dates) AS dates(day_date);
    IF array_position(v_dates, NULL) IS NOT NULL OR v_distinct_count <> 7 OR v_span <> 6 THEN
        RAISE EXCEPTION 'The plan must contain seven consecutive dates.';
    END IF;

    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user_id::text, 0));

    -- An error anywhere below rolls this deletion back with the inserts.
    DELETE FROM public.meal_plans
    WHERE user_id = v_user_id AND date = ANY(v_dates);

    FOR v_day IN SELECT entry.value FROM jsonb_array_elements(p_days) AS entry(value)
    LOOP
        v_plan := v_day->'plan';
        IF jsonb_typeof(v_plan) IS DISTINCT FROM 'object' OR
           jsonb_typeof(v_day->'items') IS DISTINCT FROM 'array' THEN
            RAISE EXCEPTION 'A daily plan or its foods are missing.';
        END IF;
        IF jsonb_array_length(v_day->'items') = 0 THEN
            RAISE EXCEPTION 'Every day must have planned foods.';
        END IF;

        INSERT INTO public.meal_plans (
            user_id, date, meal_type, name, calories, protein, carbs, fat,
            estimated_cost, ai_generated
        ) VALUES (
            v_user_id,
            (v_day->>'date')::date,
            'daily',
            COALESCE(NULLIF(v_plan->>'name', ''), 'Daily Nutrition Plan'),
            (v_plan->>'calories')::integer,
            (v_plan->>'protein')::numeric,
            (v_plan->>'carbs')::numeric,
            (v_plan->>'fat')::numeric,
            (v_plan->>'estimated_cost')::numeric,
            true
        ) RETURNING id INTO v_plan_id;

        FOR v_item IN SELECT item.value FROM jsonb_array_elements(v_day->'items') AS item(value)
        LOOP
            v_food_id := (v_item->>'food_id')::uuid;
            IF NOT EXISTS (
                SELECT 1 FROM public.foods
                WHERE id = v_food_id AND is_active AND plan_eligible
                  AND verification_status = 'approved_for_plans'
                  AND nutrition_verified AND dietary_classification_verified
            ) THEN
                RAISE EXCEPTION 'A planned food is not approved for use.';
            END IF;
            INSERT INTO public.meal_plan_items (meal_plan_id, food_id, quantity, serving_size)
            VALUES (
                v_plan_id,
                v_food_id,
                (v_item->>'quantity')::numeric,
                v_item->>'serving_size'
            );
        END LOOP;
    END LOOP;

    RETURN 7;
END;
$function$;

REVOKE ALL ON FUNCTION public.replace_weekly_meal_plans(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_weekly_meal_plans(jsonb) TO authenticated;
