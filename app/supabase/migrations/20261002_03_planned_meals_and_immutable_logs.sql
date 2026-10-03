-- ============================================================================
-- GrindLog Nutrition Engine v2.0 - Migration 3: Planned Meals Timeline & Immutable Logs
-- File: supabase/migrations/20261002_03_planned_meals_and_immutable_logs.sql
-- ============================================================================

-- 1. Extend meal_plans with status lifecycle, timezone snapshot & weekly budget tracking
ALTER TABLE public.meal_plans
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'READY' 
        CHECK (status IN ('GENERATING', 'READY', 'NEEDS_REVIEW', 'COMPLETED', 'FAILED', 'SUPERSEDED')),
    ADD COLUMN IF NOT EXISTS timezone_snapshot TEXT NULL, -- Safe NULL for legacy plans (no fabricated UTC!)
    ADD COLUMN IF NOT EXISTS planning_context_snapshot JSONB DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS planner_version TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS budget_target_weekly NUMERIC(8,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS budget_utilized_weekly NUMERIC(8,2) DEFAULT 0;

-- Defensive deduplication: If any user has multiple READY plans for the same date,
-- retain the most recently created one as READY and transition older duplicates to SUPERSEDED.
WITH ranked_plans AS (
    SELECT id, ROW_NUMBER() OVER (
        PARTITION BY user_id, date 
        ORDER BY created_at DESC, id DESC
    ) AS rn
    FROM public.meal_plans
    WHERE status = 'READY'
)
UPDATE public.meal_plans mp
SET status = 'SUPERSEDED'
FROM ranked_plans rp
WHERE mp.id = rp.id AND rp.rn > 1;

-- Idempotency Guard: Exactly one active READY plan per user per date
CREATE UNIQUE INDEX IF NOT EXISTS uq_meal_plans_single_active_plan 
    ON public.meal_plans (user_id, date) 
    WHERE status = 'READY';

-- 2. Planned Meals (Normalized timeline slot entities)
CREATE TABLE IF NOT EXISTS public.planned_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    local_date DATE NOT NULL,
    meal_slot TEXT NOT NULL,                                -- 'breakfast', 'lunch', 'dinner', 'snack', 'pre_workout'
    meal_sequence INT NOT NULL CHECK (meal_sequence >= 1),  -- 1, 2, 3, 4, 5 (permits multiple snacks on same day!)
    scheduled_time TIME WITHOUT TIME ZONE,                  -- Database TIME type (e.g. 08:00:00)
    source_type TEXT NOT NULL CHECK (source_type IN ('RECIPE', 'TEMPLATE')),
    recipe_version_id UUID,
    recipe_variant_id UUID,
    meal_template_id UUID REFERENCES public.meal_templates(id) ON DELETE SET NULL,
    image_asset_id UUID,
    image_storage_path_snapshot TEXT,                       -- Durable image key snapshot
    image_url_snapshot TEXT,                                -- Transient delivery URL
    calories_snapshot INT NOT NULL CHECK (calories_snapshot >= 0),
    protein_snapshot NUMERIC(6,2) NOT NULL CHECK (protein_snapshot >= 0),
    carbs_snapshot NUMERIC(6,2) NOT NULL CHECK (carbs_snapshot >= 0),
    fat_snapshot NUMERIC(6,2) NOT NULL CHECK (fat_snapshot >= 0),
    cost_snapshot NUMERIC(8,2) NOT NULL CHECK (cost_snapshot >= 0),
    status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'LOGGED', 'SKIPPED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Multiple same-type meals supported cleanly via meal_sequence
    CONSTRAINT uq_planned_meals_sequence UNIQUE (user_id, local_date, meal_sequence),
    -- Variant Ownership FK: variant must belong to the exact recipe_version (ON DELETE RESTRICT)
    CONSTRAINT fk_planned_meals_variant_ownership 
        FOREIGN KEY (recipe_variant_id, recipe_version_id) 
        REFERENCES public.recipe_variants(id, recipe_version_id) 
        ON DELETE RESTRICT,
    -- Image Ownership FK: image must belong to the exact recipe_version (ON DELETE RESTRICT)
    CONSTRAINT fk_planned_meals_image_ownership 
        FOREIGN KEY (image_asset_id, recipe_version_id) 
        REFERENCES public.recipe_images(id, recipe_version_id) 
        ON DELETE RESTRICT,
    -- Tightened Source Type Check: Unambiguous mutually exclusive recipe vs template integrity
    CONSTRAINT chk_planned_meal_source_integrity CHECK (
        (source_type = 'RECIPE' 
         AND recipe_version_id IS NOT NULL 
         AND recipe_variant_id IS NOT NULL 
         AND meal_template_id IS NULL)
        OR
        (source_type = 'TEMPLATE' 
         AND meal_template_id IS NOT NULL 
         AND recipe_version_id IS NULL 
         AND recipe_variant_id IS NULL)
    )
);

-- 3. Extend meal_plan_items (Nullable additions to safely support legacy rows)
ALTER TABLE public.meal_plan_items
    ADD COLUMN IF NOT EXISTS planned_meal_id UUID REFERENCES public.planned_meals(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS portion_type TEXT NULL CHECK (portion_type IN ('DISCRETE', 'CONTINUOUS')),
    ADD COLUMN IF NOT EXISTS unit TEXT NULL,
    ADD COLUMN IF NOT EXISTS ingredient_role TEXT NULL CHECK (ingredient_role IN ('PRIMARY_PROTEIN', 'STAPLE_CARB', 'VEGGIE', 'FAT_SEASONING', 'OPTIONAL_SIDE')),
    ADD COLUMN IF NOT EXISTS is_provided BOOLEAN NULL,
    ADD COLUMN IF NOT EXISTS calories_snapshot INT NULL,
    ADD COLUMN IF NOT EXISTS protein_snapshot NUMERIC(6,2) NULL,
    ADD COLUMN IF NOT EXISTS carbs_snapshot NUMERIC(6,2) NULL,
    ADD COLUMN IF NOT EXISTS fat_snapshot NUMERIC(6,2) NULL,
    ADD COLUMN IF NOT EXISTS cost_snapshot NUMERIC(8,2) NULL;

-- 4. Extend food_logs (Historical immutability without rewriting original timestamps)
ALTER TABLE public.food_logs
    ADD COLUMN IF NOT EXISTS planned_meal_id UUID REFERENCES public.planned_meals(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS recipe_version_id UUID REFERENCES public.recipe_versions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS recipe_name_snapshot TEXT,
    ADD COLUMN IF NOT EXISTS serving_snapshot TEXT,
    ADD COLUMN IF NOT EXISTS ingredients_snapshot JSONB DEFAULT '[]'::JSONB;

-- 5. Query Indexes for Migration 3
CREATE INDEX IF NOT EXISTS idx_planned_meals_plan_date_seq ON public.planned_meals(meal_plan_id, local_date, meal_sequence);
CREATE INDEX IF NOT EXISTS idx_planned_meals_date_status ON public.planned_meals(local_date, status);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_planned_meal ON public.meal_plan_items(planned_meal_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_planned_meal ON public.food_logs(planned_meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_status_date ON public.meal_plans(user_id, status);

-- 6. Row Level Security for Migration 3
ALTER TABLE public.planned_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own planned meals" ON public.planned_meals
    FOR ALL TO authenticated
    USING (
        (user_id IS NOT NULL AND auth.uid() = user_id)
        OR
        (meal_plan_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.meal_plans 
            WHERE meal_plans.id = planned_meals.meal_plan_id 
            AND meal_plans.user_id = auth.uid()
        ))
    )
    WITH CHECK (
        (user_id IS NOT NULL AND auth.uid() = user_id)
        OR
        (meal_plan_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.meal_plans 
            WHERE meal_plans.id = planned_meals.meal_plan_id 
            AND meal_plans.user_id = auth.uid()
        ))
    );

-- Dual Compatibility policy for meal_plan_items (supports both legacy meal_plan_id and V2 planned_meal_id)
DROP POLICY IF EXISTS "Users can manage their own meal plan items" ON public.meal_plan_items;
CREATE POLICY "Users can manage their own meal plan items" ON public.meal_plan_items
    FOR ALL TO authenticated
    USING (
        (meal_plan_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.meal_plans 
            WHERE meal_plans.id = meal_plan_items.meal_plan_id 
            AND meal_plans.user_id = auth.uid()
        ))
        OR
        (planned_meal_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.planned_meals 
            JOIN public.meal_plans ON meal_plans.id = planned_meals.meal_plan_id
            WHERE planned_meals.id = meal_plan_items.planned_meal_id 
            AND meal_plans.user_id = auth.uid()
        ))
    )
    WITH CHECK (
        (meal_plan_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.meal_plans 
            WHERE meal_plans.id = meal_plan_items.meal_plan_id 
            AND meal_plans.user_id = auth.uid()
        ))
        OR
        (planned_meal_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.planned_meals 
            JOIN public.meal_plans ON meal_plans.id = planned_meals.meal_plan_id
            WHERE planned_meals.id = meal_plan_items.planned_meal_id 
            AND meal_plans.user_id = auth.uid()
        ))
    );

-- Owner-safe policy for food_logs
DROP POLICY IF EXISTS "Users can manage their own food logs" ON public.food_logs;
CREATE POLICY "Users can manage their own food logs" ON public.food_logs
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
