-- ============================================
-- Fitness AI OS — Database Migration Phase 2
-- Run this in Supabase SQL Editor AFTER the main migration
-- ============================================

-- ========== FITNESS OS PROFILES ==========
CREATE TABLE IF NOT EXISTS fitness_os_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic Info & Goal
  goal TEXT,
  fitness_level TEXT,
  age INTEGER,
  height REAL,
  weight REAL,
  target_weight REAL,
  gender TEXT,
  
  -- Training
  training_location TEXT,
  equipment JSONB,
  training_days_per_week INTEGER,
  workout_duration_minutes INTEGER,
  preferred_training_days JSONB,
  preferred_training_time TEXT,
  
  -- Nutrition
  diet_preference TEXT,
  food_avoidances JSONB,
  allergies JSONB,
  meals_per_day INTEGER,
  nutrition_budget TEXT,
  
  -- Lifestyle
  activity_level TEXT,
  sleep_duration REAL,
  wake_time TIME,
  sleep_time TIME,
  lifestyle_description TEXT,
  
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fitness_os_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies ensuring strict data isolation
CREATE POLICY "Users can view own fitness profile" 
  ON fitness_os_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fitness profile" 
  ON fitness_os_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fitness profile" 
  ON fitness_os_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fitness_os_profiles_user_id ON fitness_os_profiles(user_id);

-- Trigger to update 'updated_at' automatically
CREATE OR REPLACE FUNCTION update_fitness_os_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_fitness_os_profiles_updated_at ON fitness_os_profiles;
CREATE TRIGGER update_fitness_os_profiles_updated_at
  BEFORE UPDATE ON fitness_os_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_fitness_os_profiles_updated_at();
