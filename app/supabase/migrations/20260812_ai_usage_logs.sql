-- 1. Create ai_usage_logs table
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    model TEXT NOT NULL,
    status TEXT NOT NULL,
    request_id TEXT,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    prompt_version TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_feature ON public.ai_usage_logs(user_id, feature, created_at);

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own ai logs" 
    ON public.ai_usage_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can read own ai logs" 
    ON public.ai_usage_logs FOR SELECT 
    USING (auth.uid() = user_id);

-- 2. Add UNIQUE constraint to meal_plans
-- Since date is already part of idx_meal_plans_user_date, we can just add a unique constraint.
-- If there are duplicates, this might fail, so in production we'd need to clean up first.
-- Assuming dev environment where it's safe to add.
ALTER TABLE public.meal_plans
ADD CONSTRAINT unique_user_date UNIQUE (user_id, date);
