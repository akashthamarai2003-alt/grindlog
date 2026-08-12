-- GrindLog Nutrition Module Schema
-- Ensures all tables exist, have RLS, and necessary indexes

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. foods (Master Food Database)
CREATE TABLE IF NOT EXISTS public.foods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT,
    serving_size TEXT,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    protein NUMERIC(6,2) NOT NULL CHECK (protein >= 0),
    carbs NUMERIC(6,2) NOT NULL CHECK (carbs >= 0),
    fat NUMERIC(6,2) NOT NULL CHECK (fat >= 0),
    estimated_cost NUMERIC(6,2) DEFAULT 0 CHECK (estimated_cost >= 0),
    diet_type TEXT, -- e.g., 'veg', 'non-veg', 'vegan'
    is_pg_friendly BOOLEAN DEFAULT true,
    allergens TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for foods (Shared Master Table)
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active foods" 
    ON public.foods FOR SELECT 
    USING (auth.role() = 'authenticated' AND is_active = true);

-- Normal users cannot INSERT/UPDATE/DELETE. Requires service_role or separate admin policy.

-- 2. nutrition_targets
CREATE TABLE IF NOT EXISTS public.nutrition_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    protein NUMERIC(6,2) NOT NULL CHECK (protein >= 0),
    carbs NUMERIC(6,2) NOT NULL CHECK (carbs >= 0),
    fat NUMERIC(6,2) NOT NULL CHECK (fat >= 0),
    water_ml INTEGER NOT NULL CHECK (water_ml >= 0),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nutrition_targets_user_date ON public.nutrition_targets(user_id, effective_date);

ALTER TABLE public.nutrition_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own nutrition targets" 
    ON public.nutrition_targets FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 3. meal_plans
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT, -- e.g., 'breakfast', 'lunch', 'dinner', 'snack'
    name TEXT NOT NULL,
    calories INTEGER DEFAULT 0 CHECK (calories >= 0),
    protein NUMERIC(6,2) DEFAULT 0 CHECK (protein >= 0),
    carbs NUMERIC(6,2) DEFAULT 0 CHECK (carbs >= 0),
    fat NUMERIC(6,2) DEFAULT 0 CHECK (fat >= 0),
    estimated_cost NUMERIC(6,2) DEFAULT 0 CHECK (estimated_cost >= 0),
    ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON public.meal_plans(user_id, date);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own meal plans" 
    ON public.meal_plans FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 4. meal_plan_items
CREATE TABLE IF NOT EXISTS public.meal_plan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE RESTRICT,
    quantity NUMERIC(6,2) NOT NULL CHECK (quantity > 0),
    serving_size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_items_plan ON public.meal_plan_items(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_food ON public.meal_plan_items(food_id);

ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own meal plan items" 
    ON public.meal_plan_items FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.meal_plans 
            WHERE meal_plans.id = meal_plan_items.meal_plan_id 
            AND meal_plans.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meal_plans 
            WHERE meal_plans.id = meal_plan_items.meal_plan_id 
            AND meal_plans.user_id = auth.uid()
        )
    );

-- 5. food_logs
CREATE TABLE IF NOT EXISTS public.food_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    food_id UUID REFERENCES public.foods(id) ON DELETE SET NULL,
    meal_type TEXT,
    quantity NUMERIC(6,2) NOT NULL CHECK (quantity > 0),
    calories INTEGER NOT NULL CHECK (calories >= 0),
    protein NUMERIC(6,2) NOT NULL CHECK (protein >= 0),
    carbs NUMERIC(6,2) NOT NULL CHECK (carbs >= 0),
    fat NUMERIC(6,2) NOT NULL CHECK (fat >= 0),
    estimated_cost NUMERIC(6,2) DEFAULT 0 CHECK (estimated_cost >= 0),
    source TEXT DEFAULT 'manual', -- 'manual', 'ai', 'scanner'
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_logs_user_time ON public.food_logs(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_food_logs_food ON public.food_logs(food_id);

ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own food logs" 
    ON public.food_logs FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 6. water_logs
CREATE TABLE IF NOT EXISTS public.water_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_water_logs_user_time ON public.water_logs(user_id, logged_at);

ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own water logs" 
    ON public.water_logs FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 7. nutrition_daily_summary
CREATE TABLE IF NOT EXISTS public.nutrition_daily_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    calories INTEGER DEFAULT 0 CHECK (calories >= 0),
    protein NUMERIC(6,2) DEFAULT 0 CHECK (protein >= 0),
    carbs NUMERIC(6,2) DEFAULT 0 CHECK (carbs >= 0),
    fat NUMERIC(6,2) DEFAULT 0 CHECK (fat >= 0),
    water_ml INTEGER DEFAULT 0 CHECK (water_ml >= 0),
    meals_completed INTEGER DEFAULT 0 CHECK (meals_completed >= 0),
    nutrition_score INTEGER CHECK (nutrition_score >= 0 AND nutrition_score <= 100),
    ai_review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_nutrition_daily_summary_user_date ON public.nutrition_daily_summary(user_id, date);

ALTER TABLE public.nutrition_daily_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own nutrition daily summary" 
    ON public.nutrition_daily_summary FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);


-- ==========================================
-- SEED DATA: Common Indian / PG Friendly Foods
-- ==========================================
INSERT INTO public.foods (name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly, is_active)
VALUES 
    ('Idli', 'Breakfast', '2 pieces (150g)', 118, 4.0, 24.0, 0.4, 20.0, 'veg', true, true),
    ('Dosa', 'Breakfast', '1 medium (100g)', 168, 3.9, 29.0, 3.7, 30.0, 'veg', true, true),
    ('Chapati', 'Staple', '1 medium (40g)', 120, 3.5, 20.0, 3.0, 10.0, 'veg', true, true),
    ('White Rice', 'Staple', '1 bowl cooked (150g)', 205, 4.3, 44.5, 0.4, 15.0, 'veg', true, true),
    ('Sambar', 'Curry', '1 bowl (150g)', 130, 4.0, 20.0, 4.0, 25.0, 'veg', true, true),
    ('Dal Tadka', 'Curry', '1 bowl (150g)', 180, 9.0, 22.0, 6.0, 30.0, 'veg', true, true),
    ('Curd (Plain)', 'Dairy', '1 bowl (100g)', 98, 4.3, 3.4, 4.3, 20.0, 'veg', true, true),
    ('Whole Milk', 'Dairy', '1 glass (250ml)', 150, 8.0, 12.0, 8.0, 25.0, 'veg', true, true),
    ('Boiled Egg', 'Protein', '1 large (50g)', 78, 6.3, 0.6, 5.3, 10.0, 'non-veg', true, true),
    ('Chicken Breast (Cooked)', 'Protein', '100g', 165, 31.0, 0.0, 3.6, 80.0, 'non-veg', true, true),
    ('Fish Curry', 'Protein', '1 bowl (150g)', 250, 20.0, 10.0, 14.0, 120.0, 'non-veg', false, true),
    ('Paneer Tikka', 'Protein', '100g', 265, 14.0, 10.0, 22.0, 90.0, 'veg', true, true),
    ('Soy Chunks (Cooked)', 'Protein', '1 bowl (100g)', 345, 52.0, 33.0, 0.5, 40.0, 'vegan', true, true),
    ('Roasted Peanuts', 'Snack', '1 handful (30g)', 170, 7.7, 4.8, 14.8, 15.0, 'vegan', true, true),
    ('Banana', 'Fruit', '1 medium (118g)', 105, 1.3, 27.0, 0.3, 5.0, 'vegan', true, true),
    ('Apple', 'Fruit', '1 medium (182g)', 95, 0.5, 25.0, 0.3, 20.0, 'vegan', true, true),
    ('Oats (Cooked)', 'Breakfast', '1 bowl (234g)', 160, 6.0, 27.0, 3.0, 30.0, 'vegan', true, true),
    ('Poha', 'Breakfast', '1 bowl (150g)', 250, 4.0, 45.0, 6.0, 35.0, 'veg', true, true),
    ('Upma', 'Breakfast', '1 bowl (150g)', 210, 4.5, 30.0, 8.0, 35.0, 'veg', true, true),
    ('Pongal', 'Breakfast', '1 bowl (150g)', 220, 5.0, 35.0, 7.0, 40.0, 'veg', true, true),
    ('Chickpeas (Chana Masala)', 'Curry', '1 bowl (150g)', 269, 14.5, 45.0, 4.2, 50.0, 'vegan', true, true),
    ('Rajma (Kidney Beans)', 'Curry', '1 bowl (150g)', 240, 15.0, 40.0, 1.5, 60.0, 'vegan', true, true),
    ('Aloo Sabzi (Potato)', 'Curry', '1 bowl (150g)', 180, 2.5, 25.0, 8.0, 30.0, 'vegan', true, true),
    ('Mixed Vegetables', 'Curry', '1 bowl (150g)', 110, 3.0, 15.0, 5.0, 45.0, 'vegan', true, true)
ON CONFLICT DO NOTHING;
