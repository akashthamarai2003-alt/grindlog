-- ============================================
-- Fitness AI OS — Body Scanner Phase 3
-- Run this in Supabase SQL Editor
-- ============================================

-- ========== FITNESS OS SCANS ==========
CREATE TABLE IF NOT EXISTS fitness_os_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  front_url TEXT,
  side_url TEXT,
  back_url TEXT,
  goal_url TEXT,
  
  gemini_analysis TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fitness_os_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans" 
  ON fitness_os_scans FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" 
  ON fitness_os_scans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans" 
  ON fitness_os_scans FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_fitness_os_scans_user_id ON fitness_os_scans(user_id);

-- Trigger to update 'updated_at' automatically
CREATE TRIGGER update_fitness_os_scans_updated_at
  BEFORE UPDATE ON fitness_os_scans
  FOR EACH ROW
  EXECUTE FUNCTION update_fitness_os_profiles_updated_at();

-- ========== STORAGE BUCKET ==========
-- Insert into storage.buckets if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fitness_os_scans',
  'fitness_os_scans',
  false, -- MUST be private
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS Policies
CREATE POLICY "Users can view their own scan images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'fitness_os_scans' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own scan images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fitness_os_scans' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own scan images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'fitness_os_scans' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own scan images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'fitness_os_scans' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
