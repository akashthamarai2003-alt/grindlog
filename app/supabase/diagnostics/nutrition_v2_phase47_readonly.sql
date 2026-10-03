-- Run in Supabase SQL Editor against the intended project. Every active statement is read-only.
-- Object presence indicates schema shape, not proof of which migration file was applied.

SELECT current_database() AS database_name, current_user AS database_role,
       current_setting('server_version') AS postgres_version;

SELECT to_regclass('supabase_migrations.schema_migrations') AS migration_ledger,
       to_regclass('public.portion_rules') AS phase_01_table,
       to_regclass('public.meal_templates') AS phase_02_table,
       to_regclass('public.planned_meals') AS phase_03_table;

SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (table_name = 'planned_meals' AND column_name IN ('updated_at', 'planner_version', 'timezone_snapshot')
    OR table_name = 'fitness_os_profiles' AND column_name IN ('nutrition_engine_v2', 'mess_available', 'available_equipment')
    OR table_name = 'food_logs' AND column_name IN ('planned_meal_id', 'recipe_version_id', 'ingredients_snapshot'))
ORDER BY table_name, column_name;

SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS signature,
       pg_get_function_result(p.oid) AS result_type,
       p.prosecdef AS security_definer, p.proconfig AS function_settings,
       pg_get_functiondef(p.oid) ~* 'pg_advisory_xact_lock' AS has_advisory_xact_lock,
       pg_get_functiondef(p.oid) ~* 'FOR[[:space:]]+UPDATE' AS has_row_lock,
       pg_get_functiondef(p.oid) ~* 'planned_meals[[:space:]]+SET[^;]*updated_at|updated_at[[:space:]]*=[[:space:]]*NOW' AS writes_updated_at,
       pg_get_functiondef(p.oid) AS deployed_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('persist_v2_meal_plan_atomic', 'execute_v2_meal_swap_atomic', 'log_v2_planned_meal_atomic')
ORDER BY p.proname, signature;

SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('meal_plans', 'planned_meals', 'meal_plan_items', 'food_logs',
                    'meal_templates', 'meal_template_slots', 'meal_template_slot_options')
ORDER BY c.relname;

SELECT tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('meal_plans', 'planned_meals', 'meal_plan_items', 'food_logs',
                    'meal_templates', 'meal_template_slots', 'meal_template_slot_options')
ORDER BY tablename, policyname;

SELECT conrelid::regclass AS source_table, conname,
       pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
  AND conrelid IN ('public.planned_meals'::regclass,
                    'public.meal_template_slot_options'::regclass,
                    'public.recipe_variant_ingredients'::regclass,
                    'public.portion_rules'::regclass,
                    'public.food_prices'::regclass)
ORDER BY source_table, conname;

SELECT 'foods' AS object_name, count(*) AS row_count FROM public.foods
UNION ALL SELECT 'portion_rules', count(*) FROM public.portion_rules
UNION ALL SELECT 'food_prices', count(*) FROM public.food_prices
UNION ALL SELECT 'recipes', count(*) FROM public.recipes
UNION ALL SELECT 'recipe_versions', count(*) FROM public.recipe_versions
UNION ALL SELECT 'recipe_variants', count(*) FROM public.recipe_variants
UNION ALL SELECT 'recipe_variant_ingredients', count(*) FROM public.recipe_variant_ingredients
UNION ALL SELECT 'recipe_images', count(*) FROM public.recipe_images
UNION ALL SELECT 'meal_templates', count(*) FROM public.meal_templates
UNION ALL SELECT 'meal_template_slots', count(*) FROM public.meal_template_slots
UNION ALL SELECT 'meal_template_slot_options', count(*) FROM public.meal_template_slot_options
UNION ALL SELECT 'planned_meals', count(*) FROM public.planned_meals;

SELECT 'recipe_variant_ingredients' AS source, count(*) AS orphan_count
FROM public.recipe_variant_ingredients x LEFT JOIN public.foods f ON f.id = x.food_id WHERE f.id IS NULL
UNION ALL SELECT 'portion_rules', count(*)
FROM public.portion_rules x LEFT JOIN public.foods f ON f.id = x.food_id WHERE f.id IS NULL
UNION ALL SELECT 'food_prices', count(*)
FROM public.food_prices x LEFT JOIN public.foods f ON f.id = x.food_id WHERE f.id IS NULL
UNION ALL SELECT 'meal_template_slot_options', count(*)
FROM public.meal_template_slot_options x LEFT JOIN public.foods f ON f.id = x.food_id
WHERE x.food_id IS NOT NULL AND f.id IS NULL;

-- If migration_ledger above is non-null, run this SELECT separately to identify
-- recorded versions. The repository has both a consolidated 20261002_00 schema
-- and split 20261002_01..05 files, so inspect the ledger before any deployment.
-- SELECT version, to_jsonb(m) AS ledger_row FROM supabase_migrations.schema_migrations m
-- WHERE version LIKE '20261002%' OR version LIKE '20261003%'
-- ORDER BY version;
