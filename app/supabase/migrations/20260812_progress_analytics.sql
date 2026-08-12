-- GrindLog Progress / Analytics Backend Schema
-- Ensures all tables exist, have RLS, and necessary indexes

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Body Metrics (weight and tape measurements)
CREATE TABLE IF NOT EXISTS public.fitness_os_body_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    weight NUMERIC(5,2),
    waist NUMERIC(5,2),
    chest NUMERIC(5,2),
    hip NUMERIC(5,2),
    neck NUMERIC(5,2),
    left_arm NUMERIC(5,2),
    right_arm NUMERIC(5,2),
    left_thigh NUMERIC(5,2),
    right_thigh NUMERIC(5,2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fitness_os_body_metrics_user_time ON public.fitness_os_body_metrics(user_id, recorded_at);

ALTER TABLE public.fitness_os_body_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own body metrics" 
    ON public.fitness_os_body_metrics FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 2. Body Scans (photos and AI analysis)
CREATE TABLE IF NOT EXISTS public.fitness_os_body_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    front_image_url TEXT,
    side_image_url TEXT,
    back_image_url TEXT,
    goal_image_url TEXT,
    scan_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ai_analysis_ref JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fitness_os_body_scans_user_date ON public.fitness_os_body_scans(user_id, scan_date);

ALTER TABLE public.fitness_os_body_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own body scans" 
    ON public.fitness_os_body_scans FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 3. Workout Sessions
CREATE TABLE IF NOT EXISTS public.fitness_os_workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    planned_workout TEXT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    status TEXT DEFAULT 'planned', -- 'planned', 'in_progress', 'completed'
    difficulty TEXT,
    feeling TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.fitness_os_workout_sessions
ADD COLUMN IF NOT EXISTS planned_workout TEXT,
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS completion_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planned',
ADD COLUMN IF NOT EXISTS difficulty TEXT,
ADD COLUMN IF NOT EXISTS feeling TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_fitness_os_workout_sessions_user_time ON public.fitness_os_workout_sessions(user_id, start_time);

ALTER TABLE public.fitness_os_workout_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own workout sessions" 
    ON public.fitness_os_workout_sessions FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 4. Exercise Logs (sets within a session)
CREATE TABLE IF NOT EXISTS public.fitness_os_exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.fitness_os_workout_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    weight NUMERIC(6,2),
    reps INTEGER,
    duration_seconds INTEGER,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fitness_os_exercise_logs_session ON public.fitness_os_exercise_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_fitness_os_exercise_logs_user ON public.fitness_os_exercise_logs(user_id);

ALTER TABLE public.fitness_os_exercise_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own exercise logs" 
    ON public.fitness_os_exercise_logs FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 5. Meal Logs
CREATE TABLE IF NOT EXISTS public.fitness_os_meal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT, -- 'breakfast', 'lunch', 'dinner', 'snack'
    food_name TEXT NOT NULL,
    quantity TEXT,
    calories INTEGER DEFAULT 0,
    protein NUMERIC(6,2) DEFAULT 0,
    carbohydrates NUMERIC(6,2) DEFAULT 0,
    fat NUMERIC(6,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fitness_os_meal_logs_user_date ON public.fitness_os_meal_logs(user_id, meal_date);

ALTER TABLE public.fitness_os_meal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own meal logs" 
    ON public.fitness_os_meal_logs FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 6. Water Logs
CREATE TABLE IF NOT EXISTS public.fitness_os_water_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    amount_ml INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fitness_os_water_logs_user_time ON public.fitness_os_water_logs(user_id, logged_at);

ALTER TABLE public.fitness_os_water_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own water logs" 
    ON public.fitness_os_water_logs FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 7. Activity Logs (Steps, cardio)
CREATE TABLE IF NOT EXISTS public.fitness_os_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    steps INTEGER DEFAULT 0,
    active_minutes INTEGER DEFAULT 0,
    distance_km NUMERIC(6,2) DEFAULT 0,
    calories_burned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, activity_date) -- One aggregated record per day usually
);

ALTER TABLE public.fitness_os_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own activity logs" 
    ON public.fitness_os_activity_logs FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 8. Sleep Logs
CREATE TABLE IF NOT EXISTS public.fitness_os_sleep_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sleep_date DATE NOT NULL DEFAULT CURRENT_DATE, -- The date they woke up
    duration_hours NUMERIC(4,2),
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, sleep_date)
);

ALTER TABLE public.fitness_os_sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sleep logs" 
    ON public.fitness_os_sleep_logs FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 9. AI Insights Cache
CREATE TABLE IF NOT EXISTS public.fitness_os_ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    insight_type TEXT DEFAULT 'weekly_review',
    summary TEXT,
    strengths TEXT[],
    weaknesses TEXT[],
    recommendations TEXT[],
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fitness_os_ai_insights_user_time ON public.fitness_os_ai_insights(user_id, generated_at DESC);

ALTER TABLE public.fitness_os_ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own AI insights" 
    ON public.fitness_os_ai_insights FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 10. Achievements Engine
CREATE TABLE IF NOT EXISTS public.fitness_os_achievements (
    id TEXT PRIMARY KEY, -- e.g., 'FIRST_WORKOUT', 'TEN_KG_LOST'
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    points INTEGER DEFAULT 0,
    category TEXT -- 'workout', 'nutrition', 'consistency', 'milestone'
);

CREATE TABLE IF NOT EXISTS public.fitness_os_user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.fitness_os_achievements(id) ON DELETE CASCADE,
    progress NUMERIC(5,2) DEFAULT 0, -- e.g. 5 out of 10 workouts
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.fitness_os_user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own achievements" 
    ON public.fitness_os_user_achievements FOR SELECT 
    USING (auth.uid() = user_id);
-- Insert updates can be handled via service_role bypassing RLS or explicit policies
CREATE POLICY "Users can manage their own achievements" 
    ON public.fitness_os_user_achievements FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);


-- Profile updates (ensure columns exist for calculations)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS starting_weight NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS target_weight NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS current_weight NUMERIC(5,2);
