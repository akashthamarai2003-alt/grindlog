-- ============================================================================
-- GrindLog Nutrition Engine v2.0 - Complete Schema Migration (Migrations 1 + 2 + 3)
-- File: supabase/migrations/20261002_00_nutrition_v2_complete_schema.sql
-- Run this script FIRST in Supabase SQL Editor to create all tables and columns.
-- Then run 20261002_04_seed_nutrition_catalog.sql to seed the data.
-- ============================================================================

-- ============================================================================
-- GrindLog Nutrition Engine v2.0 - Migration 1: Catalog, Recipes & Pricing
-- File: supabase/migrations/20261002_01_nutrition_catalog_and_versioning.sql
-- ============================================================================

-- 1. Extend foods table with structured physical & preparation metadata
ALTER TABLE public.foods
    ADD COLUMN IF NOT EXISTS serving_unit TEXT DEFAULT 'g',
    ADD COLUMN IF NOT EXISTS serving_weight_g NUMERIC(6,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS preparation_state TEXT DEFAULT 'cooked' CHECK (preparation_state IN ('raw', 'cooked', 'packaged', 'not_applicable')),
    ADD COLUMN IF NOT EXISTS dietary_tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS allergens TEXT[] DEFAULT '{}';

-- 2. Portion Rules (Data-driven discrete & continuous bounds)
CREATE TABLE IF NOT EXISTS public.portion_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
    portion_type TEXT NOT NULL CHECK (portion_type IN ('DISCRETE', 'CONTINUOUS')),
    unit TEXT NOT NULL,                                     -- 'piece', 'slice', 'egg', 'g', 'ml'
    min_portion NUMERIC(6,2) NOT NULL CHECK (min_portion > 0),
    default_portion NUMERIC(6,2) NOT NULL CHECK (default_portion >= min_portion),
    max_sensible_portion NUMERIC(6,2) NOT NULL CHECK (max_sensible_portion >= default_portion),
    increment_step NUMERIC(6,2) NOT NULL CHECK (increment_step > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_portion_rule_food UNIQUE (food_id)
);

-- 3. Food Prices (Explicit quantity, unit, regional pricing)
CREATE TABLE IF NOT EXISTS public.food_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
    price_inr NUMERIC(8,2) NOT NULL CHECK (price_inr >= 0),
    quantity NUMERIC(8,2) NOT NULL CHECK (quantity > 0),    -- e.g. 12 (for eggs), 1 (for 1 kg)
    quantity_unit TEXT NOT NULL,                            -- 'piece', 'kg', 'liter', 'pack', 'g'
    region_code TEXT NOT NULL DEFAULT 'IN-DEFAULT',
    source TEXT NOT NULL DEFAULT 'curated_estimate_2026',   -- explicit estimate marker
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_food_price_region_effective UNIQUE (food_id, region_code, effective_from)
);

-- 4. Recipes (Canonical Identity Table)
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    current_version_id UUID,                                -- Composite FK added after recipe_versions exists
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Recipe Versions (Immutable Content & Metadata)
CREATE TABLE IF NOT EXISTS public.recipe_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    version INT NOT NULL CHECK (version >= 1),
    name TEXT NOT NULL,
    description TEXT,
    diet_category TEXT NOT NULL CHECK (diet_category IN ('vegan', 'vegetarian', 'eggetarian', 'non-veg')),
    compatible_diets TEXT[] NOT NULL DEFAULT '{}',          -- ARRAY['vegan', 'vegetarian', 'eggetarian', 'non-veg']
    dietary_tags TEXT[] NOT NULL DEFAULT '{}',              -- ARRAY['high-protein', 'gluten-free', 'quick-prep']
    cuisine TEXT NOT NULL DEFAULT 'Homestyle Indian',
    prep_instructions TEXT NOT NULL,
    cooking_time_min INT NOT NULL DEFAULT 15,
    difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'advanced')),
    required_equipment TEXT[] NOT NULL DEFAULT '{}',        -- ARRAY['stove', 'kettle', 'blender', 'microwave']
    supported_environments TEXT[] NOT NULL DEFAULT '{}',    -- ARRAY['I Cook', 'Home', 'PG', 'Hostel', 'Office/Canteen']
    primary_protein TEXT NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT false,               -- Set to true when published or referenced
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_recipe_version_number UNIQUE (recipe_id, version),
    CONSTRAINT uq_recipe_version_ownership UNIQUE (id, recipe_id) -- Required for Composite Version Ownership FK
);

-- Enforce Current Version Ownership (Composite FK with ON DELETE RESTRICT)
ALTER TABLE public.recipes 
    ADD CONSTRAINT fk_recipes_current_version_ownership 
    FOREIGN KEY (current_version_id, id) 
    REFERENCES public.recipe_versions(id, recipe_id) 
    ON DELETE RESTRICT;

-- Automatic trigger to guarantee compatible_diets matches diet_category without drift
CREATE OR REPLACE FUNCTION public.validate_recipe_diet_compatibility()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.diet_category = 'vegan' THEN
        NEW.compatible_diets := ARRAY['vegan', 'vegetarian', 'eggetarian', 'non-veg']::TEXT[];
    ELSIF NEW.diet_category = 'vegetarian' THEN
        NEW.compatible_diets := ARRAY['vegetarian', 'eggetarian', 'non-veg']::TEXT[];
    ELSIF NEW.diet_category = 'eggetarian' THEN
        NEW.compatible_diets := ARRAY['eggetarian', 'non-veg']::TEXT[];
    ELSIF NEW.diet_category = 'non-veg' THEN
        NEW.compatible_diets := ARRAY['non-veg']::TEXT[];
    ELSE
        RAISE EXCEPTION 'Invalid diet_category: %', NEW.diet_category;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_recipe_diet_compatibility ON public.recipe_versions;
CREATE TRIGGER trg_validate_recipe_diet_compatibility
    BEFORE INSERT OR UPDATE OF diet_category ON public.recipe_versions
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_recipe_diet_compatibility();

-- 6. Recipe Variants (LIGHT, REGULAR, HIGH_ENERGY, HIGH_PROTEIN)
CREATE TABLE IF NOT EXISTS public.recipe_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_version_id UUID NOT NULL REFERENCES public.recipe_versions(id) ON DELETE CASCADE,
    variant_tier TEXT NOT NULL CHECK (variant_tier IN ('LIGHT', 'REGULAR', 'HIGH_ENERGY', 'HIGH_PROTEIN')),
    target_calories INT NOT NULL CHECK (target_calories > 0),
    target_protein NUMERIC(6,2) NOT NULL CHECK (target_protein >= 0),
    target_carbs NUMERIC(6,2) NOT NULL CHECK (target_carbs >= 0),
    target_fat NUMERIC(6,2) NOT NULL CHECK (target_fat >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_recipe_variant_tier UNIQUE (recipe_version_id, variant_tier),
    CONSTRAINT uq_recipe_variant_ownership UNIQUE (id, recipe_version_id) -- Required for Variant Ownership FK
);

-- 7. Recipe Variant Ingredients (Normalized ingredients tied to variant)
CREATE TABLE IF NOT EXISTS public.recipe_variant_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_variant_id UUID NOT NULL REFERENCES public.recipe_variants(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE RESTRICT,
    portion_type TEXT NOT NULL CHECK (portion_type IN ('DISCRETE', 'CONTINUOUS')),
    amount NUMERIC(6,2) NOT NULL CHECK (amount > 0),
    unit TEXT NOT NULL,
    min_portion NUMERIC(6,2),
    max_portion NUMERIC(6,2),
    increment_step NUMERIC(6,2),
    role TEXT NOT NULL CHECK (role IN ('PRIMARY_PROTEIN', 'STAPLE_CARB', 'VEGGIE', 'FAT_SEASONING', 'OPTIONAL_SIDE')),
    is_removable BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_variant_food UNIQUE (recipe_variant_id, food_id)
);

-- 8. Recipe Images (Versioned, durable paths, approved assets)
CREATE TABLE IF NOT EXISTS public.recipe_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_version_id UUID NOT NULL REFERENCES public.recipe_versions(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,                             -- Durable storage key in Supabase Storage
    url TEXT NOT NULL,                                      -- CDN deliverable URL
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'REJECTED')),
    alt_text TEXT NOT NULL,
    dominant_foods TEXT[] NOT NULL DEFAULT '{}',
    is_primary BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_recipe_image_ownership UNIQUE (id, recipe_version_id) -- Required for Image Ownership FK
);

-- Partial Unique Index: AT MOST ONE approved primary image per recipe version
CREATE UNIQUE INDEX IF NOT EXISTS uq_recipe_version_primary_approved_image 
    ON public.recipe_images (recipe_version_id) 
    WHERE status = 'APPROVED' AND is_primary = true;

-- 9. Recipe Immutability Triggers (Protects UPDATE & DELETE of published/referenced versions)
CREATE OR REPLACE FUNCTION public.check_recipe_version_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_locked = true THEN
        RAISE EXCEPTION 'RECIPE_VERSION_IMMUTABLE: Cannot modify locked recipe version %. Create a new version instead.', OLD.id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'planned_meals') THEN
        IF EXISTS (SELECT 1 FROM public.planned_meals WHERE recipe_version_id = OLD.id) 
           OR EXISTS (SELECT 1 FROM public.food_logs WHERE recipe_version_id = OLD.id) THEN
            RAISE EXCEPTION 'RECIPE_VERSION_IMMUTABLE: Recipe version % is referenced in user plans or historical food logs and cannot be altered or deleted. Create a new version instead.', OLD.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recipe_version_immutability ON public.recipe_versions;
CREATE TRIGGER trg_recipe_version_immutability
    BEFORE UPDATE OR DELETE ON public.recipe_versions
    FOR EACH ROW
    EXECUTE FUNCTION public.check_recipe_version_immutability();

-- Function to lock variant rows when parent version is locked
CREATE OR REPLACE FUNCTION public.check_recipe_variant_immutability()
RETURNS TRIGGER AS $$
DECLARE
    v_locked BOOLEAN;
    v_version_id UUID;
BEGIN
    SELECT is_locked, id INTO v_locked, v_version_id
    FROM public.recipe_versions
    WHERE id = OLD.recipe_version_id;

    IF v_locked = true THEN
        RAISE EXCEPTION 'RECIPE_VARIANT_IMMUTABLE: Cannot modify or delete variant of locked recipe version.';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'planned_meals') THEN
        IF EXISTS (SELECT 1 FROM public.planned_meals WHERE recipe_variant_id = OLD.id)
           OR EXISTS (SELECT 1 FROM public.food_logs WHERE recipe_version_id = v_version_id) THEN
            RAISE EXCEPTION 'RECIPE_VARIANT_IMMUTABLE: Cannot modify or delete a variant referenced in user plans or historical logs.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recipe_variant_immutability ON public.recipe_variants;
CREATE TRIGGER trg_recipe_variant_immutability
    BEFORE UPDATE OR DELETE ON public.recipe_variants
    FOR EACH ROW
    EXECUTE FUNCTION public.check_recipe_variant_immutability();

CREATE OR REPLACE FUNCTION public.check_variant_ingredient_immutability()
RETURNS TRIGGER AS $$
DECLARE
    v_locked BOOLEAN;
    v_version_id UUID;
BEGIN
    SELECT rv.is_locked, rv.id INTO v_locked, v_version_id
    FROM public.recipe_variants rvar
    JOIN public.recipe_versions rv ON rv.id = rvar.recipe_version_id
    WHERE rvar.id = COALESCE(NEW.recipe_variant_id, OLD.recipe_variant_id);

    IF v_locked = true THEN
        RAISE EXCEPTION 'RECIPE_VARIANT_IMMUTABLE: Cannot modify ingredients of locked recipe version.';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'planned_meals') THEN
        IF EXISTS (SELECT 1 FROM public.planned_meals WHERE recipe_version_id = v_version_id)
           OR EXISTS (SELECT 1 FROM public.food_logs WHERE recipe_version_id = v_version_id) THEN
            RAISE EXCEPTION 'RECIPE_VARIANT_IMMUTABLE: Cannot modify ingredients of a referenced recipe version.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_variant_ingredient_immutability ON public.recipe_variant_ingredients;
CREATE TRIGGER trg_variant_ingredient_immutability
    BEFORE INSERT OR UPDATE OR DELETE ON public.recipe_variant_ingredients
    FOR EACH ROW
    EXECUTE FUNCTION public.check_variant_ingredient_immutability();

-- 10. Query Indexes for Migration 1
CREATE INDEX IF NOT EXISTS idx_recipes_status ON public.recipes(status);
CREATE INDEX IF NOT EXISTS idx_recipe_versions_recipe_version ON public.recipe_versions(recipe_id, version);
CREATE INDEX IF NOT EXISTS idx_recipe_versions_compatible_diets ON public.recipe_versions USING GIN(compatible_diets);
CREATE INDEX IF NOT EXISTS idx_recipe_versions_equipment ON public.recipe_versions USING GIN(required_equipment);
CREATE INDEX IF NOT EXISTS idx_recipe_versions_environments ON public.recipe_versions USING GIN(supported_environments);
CREATE INDEX IF NOT EXISTS idx_recipe_variants_version ON public.recipe_variants(recipe_version_id);
CREATE INDEX IF NOT EXISTS idx_recipe_variant_ingredients_lookup ON public.recipe_variant_ingredients(recipe_variant_id, food_id);
CREATE INDEX IF NOT EXISTS idx_recipe_images_approved ON public.recipe_images(recipe_version_id) WHERE status = 'APPROVED';
CREATE INDEX IF NOT EXISTS idx_food_prices_lookup ON public.food_prices(food_id, region_code, effective_from DESC);
CREATE INDEX IF NOT EXISTS idx_portion_rules_food ON public.portion_rules(food_id);

-- 11. Row Level Security for Migration 1
ALTER TABLE public.portion_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_variant_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read portion rules" ON public.portion_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read food prices" ON public.food_prices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read published recipes" ON public.recipes FOR SELECT TO authenticated USING (status = 'PUBLISHED');

-- Publication Gating: Child catalog items only visible if parent recipe is PUBLISHED
CREATE POLICY "Authenticated users can read published recipe versions" ON public.recipe_versions FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_versions.recipe_id AND r.status = 'PUBLISHED'));

CREATE POLICY "Authenticated users can read published recipe variants" ON public.recipe_variants FOR SELECT TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM public.recipe_versions rv 
        JOIN public.recipes r ON r.id = rv.recipe_id 
        WHERE rv.id = recipe_variants.recipe_version_id AND r.status = 'PUBLISHED'
    ));

CREATE POLICY "Authenticated users can read published variant ingredients" ON public.recipe_variant_ingredients FOR SELECT TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM public.recipe_variants rvar 
        JOIN public.recipe_versions rv ON rv.id = rvar.recipe_version_id 
        JOIN public.recipes r ON r.id = rv.recipe_id 
        WHERE rvar.id = recipe_variant_ingredients.recipe_variant_id AND r.status = 'PUBLISHED'
    ));

CREATE POLICY "Authenticated users can read approved recipe images" ON public.recipe_images FOR SELECT TO authenticated 
    USING (status = 'APPROVED' AND EXISTS (
        SELECT 1 FROM public.recipe_versions rv 
        JOIN public.recipes r ON r.id = rv.recipe_id 
        WHERE rv.id = recipe_images.recipe_version_id AND r.status = 'PUBLISHED'
    ));

-- ============================================================================
-- GrindLog Nutrition Engine v2.0 - Migration 2: Meal Templates & User Profile Context
-- File: supabase/migrations/20261002_02_meal_templates_and_profiles.sql
-- ============================================================================

-- 1. Database-Driven Meal Templates (Environment Archetypes)
CREATE TABLE IF NOT EXISTS public.meal_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,                              -- 'HOME_INDIAN_LUNCH', 'PG_MESS_LUNCH', 'OFFICE_CANTEEN_PLATE'
    environment TEXT NOT NULL,                              -- 'PG', 'Hostel', 'Home', 'Office/Canteen'
    meal_slot TEXT NOT NULL,                                -- 'breakfast', 'lunch', 'dinner', 'snack'
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Template slots (e.g. Mess Staple, Mess Dal, Protein Booster)
CREATE TABLE IF NOT EXISTS public.meal_template_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.meal_templates(id) ON DELETE CASCADE,
    slot_name TEXT NOT NULL,                                -- 'MESS_STAPLE', 'MESS_DAL', 'PROTEIN_ADDON'
    role TEXT NOT NULL CHECK (role IN ('STAPLE_CARB', 'PRIMARY_PROTEIN', 'VEGGIE', 'FAT_SEASONING', 'OPTIONAL_SIDE')),
    is_provided BOOLEAN NOT NULL DEFAULT false,             -- true = mess provided at â‚¹0 out-of-pocket
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Template slot options with strict XOR check: exactly one of food_id OR recipe_version_id
CREATE TABLE IF NOT EXISTS public.meal_template_slot_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_slot_id UUID NOT NULL REFERENCES public.meal_template_slots(id) ON DELETE CASCADE,
    food_id UUID REFERENCES public.foods(id) ON DELETE RESTRICT,
    recipe_version_id UUID REFERENCES public.recipe_versions(id) ON DELETE CASCADE,
    default_portion NUMERIC(6,2) NOT NULL CHECK (default_portion > 0),
    unit TEXT NOT NULL,
    priority INT NOT NULL DEFAULT 1,
    diet_category TEXT NOT NULL CHECK (diet_category IN ('vegan', 'vegetarian', 'eggetarian', 'non-veg')),
    compatible_diets TEXT[] NOT NULL DEFAULT '{}',
    required_equipment TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- XOR CHECK: exactly one of food_id OR recipe_version_id must be populated!
    CONSTRAINT chk_template_slot_option_xor CHECK (
        (food_id IS NOT NULL AND recipe_version_id IS NULL)
        OR
        (food_id IS NULL AND recipe_version_id IS NOT NULL)
    )
);

-- 2. Extend User Profiles (Explicit Equipment, Mess Availability, Quantity Pantry, Budget Policy)
ALTER TABLE public.fitness_os_profiles
    ADD COLUMN IF NOT EXISTS available_equipment TEXT[] DEFAULT NULL, -- NULL indicates unknown/legacy (no assumed stove!)
    ADD COLUMN IF NOT EXISTS mess_available BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS mess_meals TEXT[] DEFAULT ARRAY['breakfast', 'lunch', 'dinner']::TEXT[],
    ADD COLUMN IF NOT EXISTS mess_included_in_budget BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS available_foods_v2 JSONB DEFAULT '[]'::JSONB,
    ADD COLUMN IF NOT EXISTS budget_policy TEXT NOT NULL DEFAULT 'STRICT' CHECK (budget_policy IN ('STRICT', 'FLEXIBLE'));

-- 3. Query Indexes for Migration 2
CREATE INDEX IF NOT EXISTS idx_meal_templates_env_slot ON public.meal_templates(environment, meal_slot);
CREATE INDEX IF NOT EXISTS idx_meal_template_slots_template ON public.meal_template_slots(template_id);
CREATE INDEX IF NOT EXISTS idx_template_options_slot_priority ON public.meal_template_slot_options(template_slot_id, priority) WHERE is_active = true;

-- 4. Row Level Security for Migration 2
ALTER TABLE public.meal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_template_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_template_slot_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read meal templates" ON public.meal_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read template slots" ON public.meal_template_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read active template options" ON public.meal_template_slot_options FOR SELECT TO authenticated USING (is_active = true);

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

