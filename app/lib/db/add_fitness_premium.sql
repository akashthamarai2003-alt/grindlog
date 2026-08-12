-- Add premium tracking specific to Fitness OS
ALTER TABLE fitness_os_profiles 
ADD COLUMN IF NOT EXISTS fitness_is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fitness_premium_tier TEXT,
ADD COLUMN IF NOT EXISTS fitness_premium_level TEXT,
ADD COLUMN IF NOT EXISTS fitness_premium_expires_at TIMESTAMPTZ;
