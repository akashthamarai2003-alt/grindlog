-- ============================================================================
-- GrindLog Nutrition Engine v2.0 - Migration Rollback & Recovery Script
-- File: supabase/migrations/20261002_rollback_nutrition_v2.sql
-- ============================================================================

-- Safe idempotent rollback script to cleanly revert v2 additive objects if needed

-- 1. Drop child triggers and RLS policies
DROP TRIGGER IF EXISTS trg_recipe_version_immutability ON public.recipe_versions;
DROP TRIGGER IF EXISTS trg_variant_ingredient_immutability ON public.recipe_variant_ingredients;
DROP TRIGGER IF EXISTS trg_validate_recipe_diet_compatibility ON public.recipe_versions;

DROP FUNCTION IF EXISTS public.check_recipe_version_immutability();
DROP FUNCTION IF EXISTS public.check_variant_ingredient_immutability();
DROP FUNCTION IF EXISTS public.validate_recipe_diet_compatibility();

-- 2. Drop v2 timeline tables
DROP TABLE IF EXISTS public.planned_meals CASCADE;

-- 3. Drop template tables
DROP TABLE IF EXISTS public.meal_template_slot_options CASCADE;
DROP TABLE IF EXISTS public.meal_template_slots CASCADE;
DROP TABLE IF EXISTS public.meal_templates CASCADE;

-- 4. Drop recipe hierarchy
DROP TABLE IF EXISTS public.recipe_variant_ingredients CASCADE;
DROP TABLE IF EXISTS public.recipe_images CASCADE;
DROP TABLE IF EXISTS public.recipe_variants CASCADE;
ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS fk_recipes_current_version_ownership;
DROP TABLE IF EXISTS public.recipe_versions CASCADE;
DROP TABLE IF EXISTS public.recipes CASCADE;

-- 5. Drop portion rules & food prices
DROP TABLE IF EXISTS public.portion_rules CASCADE;
DROP TABLE IF EXISTS public.food_prices CASCADE;

-- 6. Cleanly drop newly added columns on existing tables (without touching legacy columns)
ALTER TABLE public.foods
    DROP COLUMN IF EXISTS serving_unit,
    DROP COLUMN IF EXISTS serving_weight_g,
    DROP COLUMN IF EXISTS preparation_state,
    DROP COLUMN IF EXISTS dietary_tags;

ALTER TABLE public.fitness_os_profiles
    DROP COLUMN IF EXISTS available_equipment,
    DROP COLUMN IF EXISTS mess_available,
    DROP COLUMN IF EXISTS mess_meals,
    DROP COLUMN IF EXISTS mess_included_in_budget,
    DROP COLUMN IF EXISTS available_foods_v2,
    DROP COLUMN IF EXISTS budget_policy;

ALTER TABLE public.meal_plans
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS timezone_snapshot,
    DROP COLUMN IF EXISTS budget_target_weekly,
    DROP COLUMN IF EXISTS budget_utilized_weekly;

ALTER TABLE public.meal_plan_items
    DROP COLUMN IF EXISTS planned_meal_id,
    DROP COLUMN IF EXISTS portion_type,
    DROP COLUMN IF EXISTS unit,
    DROP COLUMN IF EXISTS ingredient_role,
    DROP COLUMN IF EXISTS is_provided,
    DROP COLUMN IF EXISTS calories_snapshot,
    DROP COLUMN IF EXISTS protein_snapshot,
    DROP COLUMN IF EXISTS carbs_snapshot,
    DROP COLUMN IF EXISTS fat_snapshot,
    DROP COLUMN IF EXISTS cost_snapshot;

ALTER TABLE public.food_logs
    DROP COLUMN IF EXISTS planned_meal_id,
    DROP COLUMN IF EXISTS recipe_version_id,
    DROP COLUMN IF EXISTS recipe_name_snapshot,
    DROP COLUMN IF EXISTS serving_snapshot,
    DROP COLUMN IF EXISTS ingredients_snapshot;

-- Restore standard policies on legacy tables
DROP POLICY IF EXISTS "Users can manage their own meal plan items" ON public.meal_plan_items;
CREATE POLICY "Users can manage their own meal plan items" ON public.meal_plan_items
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.meal_plans 
        WHERE meal_plans.id = meal_plan_items.meal_plan_id 
        AND meal_plans.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.meal_plans 
        WHERE meal_plans.id = meal_plan_items.meal_plan_id 
        AND meal_plans.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can manage their own food logs" ON public.food_logs;
CREATE POLICY "Users can manage their own food logs" ON public.food_logs
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
