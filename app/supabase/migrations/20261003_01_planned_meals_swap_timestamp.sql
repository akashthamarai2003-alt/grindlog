-- The V2 swap and logging RPC definitions update planned_meals.updated_at.
-- The original planned_meals table omitted that column.
ALTER TABLE public.planned_meals
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
