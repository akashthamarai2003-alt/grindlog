-- ============================================
-- GrindLog — Database Migration v1.0
-- Run this in Supabase SQL Editor
-- ============================================

-- ========== EXTENSIONS ==========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== PROFILES ==========
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  email TEXT UNIQUE,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Gamification
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,

  -- Tree
  tree_stage INTEGER DEFAULT 0,
  tree_water_count INTEGER DEFAULT 0,
  tree_leaves_count INTEGER DEFAULT 0,
  tree_butterflies_count INTEGER DEFAULT 0,
  tree_birds_count INTEGER DEFAULT 0,
  tree_flowers_count INTEGER DEFAULT 0,
  tree_golden BOOLEAN DEFAULT FALSE,

  -- Premium
  is_premium BOOLEAN DEFAULT FALSE,
  premium_tier TEXT,
  premium_expires_at TIMESTAMPTZ,
  trial_used BOOLEAN DEFAULT FALSE,

  -- Preferences
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  morning_reminder TIME DEFAULT '08:00',
  afternoon_reminder TIME DEFAULT '14:00',
  evening_reminder TIME DEFAULT '20:00',

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  ai_plan_created BOOLEAN DEFAULT FALSE
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========== HABITS ==========
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '🌱',
  category TEXT NOT NULL DEFAULT 'other',
  frequency TEXT NOT NULL DEFAULT 'daily',
  custom_days INTEGER[],
  preferred_time TEXT DEFAULT 'anytime',
  reminder_time TIME,
  target_count INTEGER DEFAULT 1,
  target_unit TEXT DEFAULT 'times',
  target_value INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT '#34C759',
  sort_order INTEGER DEFAULT 0,

  -- Stats (denormalized)
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  total_skips INTEGER DEFAULT 0,
  completion_rate REAL DEFAULT 0,

  -- AI
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_reasoning TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own habits"
  ON habits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_category ON habits(category);
CREATE INDEX idx_habits_active ON habits(is_active) WHERE is_active = TRUE;

-- ========== HABIT LOGS ==========
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('completed', 'skipped', 'missed')),
  completed_at TIMESTAMPTZ,
  value INTEGER,
  note TEXT,
  mood TEXT,
  streak_before INTEGER DEFAULT 0,
  streak_after INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(habit_id, date)
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own logs"
  ON habit_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_logs_user_date ON habit_logs(user_id, date);
CREATE INDEX idx_logs_habit_date ON habit_logs(habit_id, date);

-- ========== JOURNAL ENTRIES ==========
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT,
  content TEXT,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  energy INTEGER CHECK (energy BETWEEN 1 AND 5),
  focus INTEGER CHECK (focus BETWEEN 1 AND 5),
  photo_urls TEXT[],
  voice_note_url TEXT,
  voice_transcript TEXT,
  ai_summary TEXT,
  ai_sentiment TEXT,
  ai_insights TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own entries"
  ON journal_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========== ACHIEVEMENTS (global) ==========
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT DEFAULT '🏆',
  category TEXT NOT NULL DEFAULT 'streaks',
  xp_reward INTEGER DEFAULT 100,
  coins_reward INTEGER DEFAULT 50,
  icon_url TEXT,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read achievements"
  ON achievements FOR SELECT
  USING (true);

-- ========== USER ACHIEVEMENTS ==========
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress_current INTEGER DEFAULT 0,
  progress_target INTEGER DEFAULT 1,

  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ========== AI SESSIONS ==========
CREATE TABLE ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  session_type TEXT NOT NULL,
  prompt TEXT,
  response TEXT,
  model TEXT DEFAULT 'llama-4',
  tokens_used INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI sessions"
  ON ai_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI sessions"
  ON ai_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ========== SUBSCRIPTIONS ==========
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  razorpay_subscription_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'trial',

  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ========== STORAGE BUCKETS ==========
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('journal-photos', 'journal-photos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('journal-voice', 'journal-voice', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Avatar access - everyone read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Avatar access - owner write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Journal photos - owner only"
  ON storage.objects FOR ALL
  USING (bucket_id = 'journal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Journal voice - owner only"
  ON storage.objects FOR ALL
  USING (bucket_id = 'journal-voice' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ========== SEED ACHIEVEMENTS ==========
INSERT INTO achievements (key, name, description, emoji, category, xp_reward, coins_reward, sort_order) VALUES
  ('first_habit', 'First Steps', 'Complete your first habit', '🏆', 'streaks', 100, 20, 1),
  ('three_day', 'Getting Started', '3-day streak on any habit', '🌱', 'streaks', 150, 30, 2),
  ('seven_day', 'Weekly Warrior', '7-day streak on any habit', '🔥', 'streaks', 200, 50, 3),
  ('fourteen_day', 'Fortnight Force', '14-day streak on any habit', '💪', 'streaks', 300, 75, 4),
  ('twenty_one_day', 'Habit Formed', '21-day streak on any habit', '🎯', 'streaks', 500, 100, 5),
  ('thirty_day', 'Monthly Master', '30-day streak on any habit', '📅', 'streaks', 800, 150, 6),
  ('sixty_day', 'Two Month Titan', '60-day streak on any habit', '⚡', 'streaks', 1500, 300, 7),
  ('hundred_day', 'Centurion', '100-day streak on any habit', '👑', 'streaks', 3000, 500, 8),
  ('perfect_week', 'Perfect Week', 'All habits done every day for a week', '⭐', 'consistency', 400, 100, 10),
  ('perfect_month', 'Perfect Month', 'All habits done every day for a month', '🌟', 'consistency', 2000, 400, 11),
  ('early_bird', 'Early Bird', 'Complete all habits before 9 AM for 7 days', '🌅', 'consistency', 300, 80, 12),
  ('night_owl', 'Night Owl', 'Complete all habits after 9 PM for 7 days', '🌙', 'consistency', 300, 80, 13),
  ('no_skips_30', 'No Excuses', '30 days without skipping any habit', '🛡️', 'consistency', 1000, 200, 14),
  ('first_water', 'First Drop', 'Water your tree for the first time', '💧', 'tree', 50, 10, 20),
  ('sprout_unlocked', 'Life Begins', 'Tree reaches sprout stage', '🌱', 'tree', 100, 25, 21),
  ('first_leaf', 'First Leaf', 'Tree grows its first leaf', '🍃', 'tree', 150, 30, 22),
  ('first_butterfly', 'Butterfly Effect', 'First butterfly appears on your tree', '🦋', 'tree', 200, 40, 23),
  ('first_bird', 'A Friend Arrives', 'First bird visits your tree', '🕊️', 'tree', 300, 50, 24),
  ('blooming', 'In Bloom', 'First flowers appear on your tree', '🌸', 'tree', 500, 100, 25),
  ('golden', 'Golden Touch', 'Tree turns golden', '✨', 'tree', 5000, 1000, 26),
  ('journal_beginner', 'Dear Diary', 'Write your first journal entry', '📖', 'special', 100, 25, 30),
  ('journal_streak_7', 'Reflective Week', '7 days of journal entries', '✍️', 'special', 300, 60, 31),
  ('journal_streak_30', 'Life Chronicler', '30 days of journal entries', '📚', 'special', 1000, 200, 32),
  ('ai_plan', 'AI Guided', 'Create your first AI habit plan', '🤖', 'special', 150, 30, 33),
  ('voice_journal', 'Voice of Reason', 'Record a voice journal entry', '🎤', 'special', 100, 20, 34)
ON CONFLICT (key) DO NOTHING;
