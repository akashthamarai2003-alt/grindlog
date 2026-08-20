DO $$
DECLARE
    t_name text;
    c_name text := 'user_id';
    tables_list text[] := ARRAY[
        'achievements', 'ai_sessions', 'ai_usage_logs', 'fcm_tokens', 'fitness_logs', 'fitness_os_ai_sessions',
        'fitness_os_coach_messages', 'fitness_os_coach_sessions', 'fitness_os_plan_adjustments',
        'fitness_os_profiles', 'fitness_os_progress_reviews', 'fitness_os_scans',
        'fitness_os_subscriptions', 'fitness_os_workout_plans', 'fitness_os_workout_sessions',
        'fitness_os_workouts', 'goals', 'habit_logs', 'habits', 'in_app_notifications',
        'journal_entries', 'season_progress', 'subscriptions', 'user_achievements',
        'user_quests', 'workout_ai_notes', 'texts', 'coupons', 'plan_pricing', 'support_messages'
    ];
BEGIN
    FOR t_name IN SELECT unnest(tables_list) LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = t_name AND column_name = c_name
        ) THEN
            EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_user_id ON %I(%I)', t_name, t_name, c_name);
        END IF;
    END LOOP;
    
    -- Specific Date Indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fitness_os_workouts' AND column_name = 'workout_date') THEN
        CREATE INDEX IF NOT EXISTS idx_fitness_os_workouts_workout_date ON fitness_os_workouts(workout_date);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'habit_logs' AND column_name = 'date') THEN
        CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'date') THEN
        CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
    END IF;
    
    -- Workout foreign keys
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fitness_os_exercises' AND column_name = 'workout_id') THEN
        CREATE INDEX IF NOT EXISTS idx_fitness_os_exercises_workout_id ON fitness_os_exercises(workout_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fitness_os_sets' AND column_name = 'exercise_id') THEN
        CREATE INDEX IF NOT EXISTS idx_fitness_os_sets_exercise_id ON fitness_os_sets(exercise_id);
    END IF;
END $$;
