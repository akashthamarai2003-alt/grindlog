import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/services/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const sqlQuery = `
      -- 1. Alter existing columns that have type mismatches with the frontend string enums
      ALTER TABLE public.fitness_os_profiles
        ALTER COLUMN sleep_duration TYPE TEXT USING sleep_duration::TEXT,
        ALTER COLUMN meals_per_day TYPE TEXT USING meals_per_day::TEXT,
        ALTER COLUMN wake_time TYPE TEXT USING wake_time::TEXT,
        ALTER COLUMN sleep_time TYPE TEXT USING sleep_time::TEXT;

      -- 2. Add all missing columns from the frontend OnboardingSchema and calculated fields
      ALTER TABLE public.fitness_os_profiles
        ADD COLUMN IF NOT EXISTS name TEXT,
        ADD COLUMN IF NOT EXISTS country TEXT,
        ADD COLUMN IF NOT EXISTS preferred_language TEXT,
        ADD COLUMN IF NOT EXISTS target_physique TEXT,
        ADD COLUMN IF NOT EXISTS goal_physique_image TEXT,
        
        ADD COLUMN IF NOT EXISTS waist_cm REAL,
        ADD COLUMN IF NOT EXISTS chest_cm REAL,
        ADD COLUMN IF NOT EXISTS arm_cm REAL,
        ADD COLUMN IF NOT EXISTS thigh_cm REAL,
        
        ADD COLUMN IF NOT EXISTS food_type TEXT,
        ADD COLUMN IF NOT EXISTS food_environment TEXT,
        ADD COLUMN IF NOT EXISTS available_foods JSONB,
        ADD COLUMN IF NOT EXISTS foods_disliked TEXT,
        ADD COLUMN IF NOT EXISTS foods_avoided TEXT,
        ADD COLUMN IF NOT EXISTS food_allergies TEXT,
        
        ADD COLUMN IF NOT EXISTS daily_steps TEXT,
        ADD COLUMN IF NOT EXISTS workout_time TEXT,
        ADD COLUMN IF NOT EXISTS work_time TEXT,
        
        ADD COLUMN IF NOT EXISTS physical_problems JSONB,
        ADD COLUMN IF NOT EXISTS previous_injuries BOOLEAN,
        ADD COLUMN IF NOT EXISTS previous_injury_areas JSONB,
        ADD COLUMN IF NOT EXISTS previous_injury_timeline TEXT,
        ADD COLUMN IF NOT EXISTS current_pain_severity INTEGER,
        ADD COLUMN IF NOT EXISTS current_pain_triggers JSONB,
        ADD COLUMN IF NOT EXISTS exercise_limitations JSONB,
        ADD COLUMN IF NOT EXISTS medical_guidance TEXT,
        ADD COLUMN IF NOT EXISTS additional_health_notes TEXT,
        ADD COLUMN IF NOT EXISTS safety_acknowledged BOOLEAN,
        
        ADD COLUMN IF NOT EXISTS body_scan_front TEXT,
        ADD COLUMN IF NOT EXISTS body_scan_left TEXT,
        ADD COLUMN IF NOT EXISTS body_scan_right TEXT,
        ADD COLUMN IF NOT EXISTS body_scan_back TEXT,
        ADD COLUMN IF NOT EXISTS body_scan_inspiration TEXT,
        
        ADD COLUMN IF NOT EXISTS ai_strategy JSONB,
        
        ADD COLUMN IF NOT EXISTS bmi REAL,
        ADD COLUMN IF NOT EXISTS baseline_calories INTEGER,
        ADD COLUMN IF NOT EXISTS initial_protein_target INTEGER,
        ADD COLUMN IF NOT EXISTS weight_trend_baseline REAL;
        
      ALTER TABLE public.fitness_os_body_scans
        ADD COLUMN IF NOT EXISTS left_image_url TEXT,
        ADD COLUMN IF NOT EXISTS right_image_url TEXT;
    `;
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sqlQuery });
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
