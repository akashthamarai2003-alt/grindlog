-- Verified food-library metadata and controlled-import support.
--
-- Existing rows remain available for the current planner, but are explicitly
-- marked as curated until their nutrition, dietary classification, and local
-- price have been reviewed. Imported USDA rows are source-verified for
-- nutrition only and are not automatically eligible for meal-plan generation
-- because USDA does not provide Indian market prices.

ALTER TABLE public.foods
    ADD COLUMN IF NOT EXISTS source_name TEXT,
    ADD COLUMN IF NOT EXISTS source_reference TEXT,
    ADD COLUMN IF NOT EXISTS source_license TEXT,
    ADD COLUMN IF NOT EXISTS source_record_id TEXT,
    ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'curated_review_required',
    ADD COLUMN IF NOT EXISTS nutrition_verified BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS dietary_classification_verified BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS cost_verification_status TEXT NOT NULL DEFAULT 'curated_estimate',
    ADD COLUMN IF NOT EXISTS plan_eligible BOOLEAN NOT NULL DEFAULT true;

UPDATE public.foods
SET
    source_name = COALESCE(source_name, 'Grindlog curated seed'),
    verification_status = COALESCE(verification_status, 'curated_review_required'),
    nutrition_verified = COALESCE(nutrition_verified, false),
    dietary_classification_verified = COALESCE(dietary_classification_verified, false),
    cost_verification_status = COALESCE(cost_verification_status, 'curated_estimate'),
    plan_eligible = COALESCE(plan_eligible, true);

ALTER TABLE public.foods
    DROP CONSTRAINT IF EXISTS foods_verification_status_check,
    DROP CONSTRAINT IF EXISTS foods_cost_verification_status_check;

ALTER TABLE public.foods
    ADD CONSTRAINT foods_verification_status_check
        CHECK (verification_status IN ('curated_review_required', 'source_verified', 'approved_for_plans')),
    ADD CONSTRAINT foods_cost_verification_status_check
        CHECK (cost_verification_status IN ('curated_estimate', 'unavailable', 'review_required', 'market_reviewed'));

CREATE UNIQUE INDEX IF NOT EXISTS foods_source_record_id_unique
    ON public.foods (source_record_id)
    WHERE source_record_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS foods_plan_catalog_idx
    ON public.foods (is_active, plan_eligible, diet_type);

COMMENT ON COLUMN public.foods.verification_status IS
    'Provenance state: source_verified covers the imported source record; approved_for_plans requires local review too.';
COMMENT ON COLUMN public.foods.cost_verification_status IS
    'USDA supplies nutrition, not Indian market prices. Imported rows remain unavailable for cost-based planning until reviewed.';
COMMENT ON COLUMN public.foods.plan_eligible IS
    'Only rows explicitly eligible here are sent to the AI plan generator.';
