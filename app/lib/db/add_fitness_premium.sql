-- Add premium tracking specific to Fitness OS
ALTER TABLE fitness_os_profiles 
ADD COLUMN IF NOT EXISTS fitness_is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fitness_premium_tier TEXT,
ADD COLUMN IF NOT EXISTS fitness_premium_expires_at TIMESTAMPTZ,

-- Computed analysis columns
ADD COLUMN IF NOT EXISTS bmi REAL,
ADD COLUMN IF NOT EXISTS baseline_calories INTEGER,
ADD COLUMN IF NOT EXISTS initial_protein_target INTEGER,
ADD COLUMN IF NOT EXISTS weight_trend_baseline REAL,
ADD COLUMN IF NOT EXISTS ai_strategy JSONB,
ADD COLUMN IF NOT EXISTS onboarding_data JSONB;
