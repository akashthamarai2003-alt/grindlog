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
    is_provided BOOLEAN NOT NULL DEFAULT false,             -- true = mess provided at ₹0 out-of-pocket
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
