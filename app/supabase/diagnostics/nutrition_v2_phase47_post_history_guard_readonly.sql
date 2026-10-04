-- Run ONLY after 20261003_06 has been applied; this script is read-only.
-- The persistence body must have the shared advisory lock and logged-history guard.
-- Run in the intended Supabase SQL Editor. One read-only statement, eight rows.
-- All checks must pass before enabling the designated development profile.
-- This verifies schema, deployed RPC bodies/permissions, and stored ownership.
-- Authenticated two-user SELECT/mutation tests are still required separately.
WITH expected_rpc(name, signature, body_hash) AS (
  VALUES
    ('persist_v2_meal_plan_atomic',
     'public.persist_v2_meal_plan_atomic(uuid,jsonb,jsonb)',
     '46e3693967bb49a76c33c32083f9eb2e'),
    ('execute_v2_meal_swap_atomic',
     'public.execute_v2_meal_swap_atomic(uuid,date,text,timestamptz,timestamptz,jsonb)',
     'f0afa01b9412010c1091e373795a8fbf'),
    ('log_v2_planned_meal_atomic',
     'public.log_v2_planned_meal_atomic(uuid,date,text,jsonb)',
     '0afea0e58dcd0f2d323725ee8c5a4483')
), rpc_checks AS (
  SELECT 'rpc.' || e.name AS check_name,
         COALESCE(
           p.oid IS NOT NULL
           AND md5(btrim(regexp_replace(p.prosrc, '[[:space:]]+', ' ', 'g'))) = e.body_hash
           AND pg_get_function_result(p.oid) = 'jsonb'
           AND p.prosecdef
           AND p.proconfig @> ARRAY['search_path=public, pg_catalog']::text[]
           AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
           AND has_function_privilege('service_role', p.oid, 'EXECUTE')
           AND NOT has_function_privilege('anon', p.oid, 'EXECUTE')
           AND (SELECT count(*) FROM pg_proc overload
                WHERE overload.pronamespace = 'public'::regnamespace
                  AND overload.proname = e.name) = 1,
           false
         ) AS passed,
         jsonb_build_object(
           'signature', pg_get_function_identity_arguments(p.oid),
           'body_hash', md5(btrim(regexp_replace(p.prosrc, '[[:space:]]+', ' ', 'g'))),
           'security_definer', p.prosecdef,
           'settings', p.proconfig,
           'authenticated_execute', has_function_privilege('authenticated', p.oid, 'EXECUTE'),
           'service_role_execute', has_function_privilege('service_role', p.oid, 'EXECUTE'),
           'anon_execute', has_function_privilege('anon', p.oid, 'EXECUTE')
         ) AS details
  FROM expected_rpc e
  LEFT JOIN pg_proc p ON p.oid = to_regprocedure(e.signature)
), ownership_counts(check_name, mismatch_count) AS (
  SELECT 'ownership.planned_meals', count(*)
  FROM public.planned_meals pm
  LEFT JOIN public.meal_plans mp ON mp.id = pm.meal_plan_id
  WHERE pm.user_id IS NULL OR pm.meal_plan_id IS NULL OR mp.id IS NULL
     OR mp.user_id IS DISTINCT FROM pm.user_id
  UNION ALL
  SELECT 'ownership.meal_plan_items', count(*)
  FROM public.meal_plan_items i
  LEFT JOIN public.planned_meals pm ON pm.id = i.planned_meal_id
  LEFT JOIN public.meal_plans mp ON mp.id = pm.meal_plan_id
  WHERE i.planned_meal_id IS NOT NULL
    AND (pm.id IS NULL OR pm.user_id IS NULL OR mp.id IS NULL
      OR mp.user_id IS DISTINCT FROM pm.user_id
      OR (i.meal_plan_id IS NOT NULL AND i.meal_plan_id IS DISTINCT FROM pm.meal_plan_id))
  UNION ALL
  SELECT 'ownership.food_logs', count(*)
  FROM public.food_logs fl
  LEFT JOIN public.planned_meals pm ON pm.id = fl.planned_meal_id
  LEFT JOIN public.meal_plans mp ON mp.id = pm.meal_plan_id
  WHERE fl.planned_meal_id IS NOT NULL
    AND (pm.id IS NULL OR mp.id IS NULL
      OR pm.user_id IS DISTINCT FROM fl.user_id
      OR mp.user_id IS DISTINCT FROM fl.user_id)
), timestamp_check AS (
  SELECT 'column.planned_meals.updated_at' AS check_name,
         EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = 'planned_meals'
             AND column_name = 'updated_at' AND data_type = 'timestamp with time zone'
             AND is_nullable = 'NO' AND column_default IS NOT NULL
         ) AS passed,
         (SELECT jsonb_build_object('type', data_type, 'nullable', is_nullable,
                                    'default', column_default)
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'planned_meals'
            AND column_name = 'updated_at') AS details
), rollout_check AS (
  SELECT 'rollout.no_enabled_profiles_before_test' AS check_name,
         count(*) = 0 AS passed,
         jsonb_build_object('enabled_profiles', count(*)) AS details
  FROM public.fitness_os_profiles WHERE nutrition_engine_v2 = true
)
SELECT check_name, passed, details FROM rpc_checks
UNION ALL SELECT check_name, mismatch_count = 0,
                 jsonb_build_object('mismatch_count', mismatch_count) FROM ownership_counts
UNION ALL SELECT check_name, passed, details FROM timestamp_check
UNION ALL SELECT check_name, passed, details FROM rollout_check
ORDER BY check_name;
