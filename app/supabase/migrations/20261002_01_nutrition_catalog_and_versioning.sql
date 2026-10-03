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
