export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          email: string | null;
          avatar_url: string | null;
          timezone: string;
          created_at: string;
          xp: number; coins: number; level: number;
          tree_stage: number; tree_water_count: number;
          tree_leaves_count: number; tree_butterflies_count: number;
          tree_birds_count: number; tree_flowers_count: number;
          tree_golden: boolean; is_premium: boolean;
          premium_tier: string | null; premium_expires_at: string | null;
          trial_used: boolean; theme: string;
          notifications_enabled: boolean;
          morning_reminder: string; afternoon_reminder: string; evening_reminder: string;
          onboarding_completed: boolean; ai_plan_created: boolean;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      habits: {
        Row: {
          id: string; user_id: string; name: string;
          description: string | null; emoji: string;
          category: string; frequency: string;
          custom_days: number[] | null; preferred_time: string | null;
          reminder_time: string | null; target_count: number;
          target_unit: string | null; target_value: number | null;
          is_active: boolean; is_archived: boolean;
          color: string; sort_order: number;
          current_streak: number; longest_streak: number;
          total_completions: number; total_skips: number;
          completion_rate: number;
          ai_generated: boolean; ai_reasoning: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; user_id: string; name: string;
          description?: string | null; emoji?: string;
          category?: string; frequency?: string;
          custom_days?: number[] | null; preferred_time?: string | null;
          reminder_time?: string | null; target_count?: number;
          target_unit?: string | null; target_value?: number | null;
          is_active?: boolean; is_archived?: boolean;
          color?: string; sort_order?: number;
          current_streak?: number; longest_streak?: number;
          total_completions?: number; total_skips?: number;
          completion_rate?: number;
          ai_generated?: boolean; ai_reasoning?: string | null;
          created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["habits"]["Insert"]>;
        Relationships: [];
      };
      habit_logs: {
        Row: {
          id: string; habit_id: string; user_id: string;
          date: string; status: "completed" | "skipped" | "missed";
          completed_at: string | null; value: number | null;
          note: string | null; mood: string | null;
          remarks: string | null;
          streak_before: number; streak_after: number;
          xp_earned: number; coins_earned: number;
          created_at: string;
        };
        Insert: {
          id?: string; habit_id: string; user_id: string;
          date?: string; status: "completed" | "skipped" | "missed";
          completed_at?: string | null; value?: number | null;
          note?: string | null; mood?: string | null;
          remarks?: string | null;
          streak_before?: number; streak_after?: number;
          xp_earned?: number; coins_earned?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["habit_logs"]["Insert"]>;
        Relationships: [];
      };
      journal_entries: {
        Row: {
          id: string; user_id: string; date: string;
          title: string | null; content: string | null;
          mood: number | null; energy: number | null; focus: number | null;
          photo_urls: string[] | null; voice_note_url: string | null;
          voice_transcript: string | null;
          ai_summary: string | null; ai_sentiment: string | null;
          ai_insights: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; user_id: string; date?: string;
          title?: string | null; content?: string | null;
          mood?: number | null; energy?: number | null; focus?: number | null;
          photo_urls?: string[] | null; voice_note_url?: string | null;
          voice_transcript?: string | null;
          ai_summary?: string | null; ai_sentiment?: string | null;
          ai_insights?: string | null;
          created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["journal_entries"]["Insert"]>;
        Relationships: [];
      };
      fitness_logs: {
        Row: {
          id: string; user_id: string; date: string;
          workout_type: string; duration_minutes: number;
          calories_burned: number | null; intensity: number | null;
          notes: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; user_id: string; date?: string;
          workout_type: string; duration_minutes: number;
          calories_burned?: number | null; intensity?: number | null;
          notes?: string | null; created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fitness_logs"]["Insert"]>;
        Relationships: [];
      };
      goals: {
        Row: {
          id: string; user_id: string; title: string;
          description: string | null; target_value: number;
          current_value: number; unit: string;
          deadline: string | null; status: string;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; user_id: string; title: string;
          description?: string | null; target_value: number;
          current_value?: number; unit: string;
          deadline?: string | null; status?: string;
          created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["goals"]["Insert"]>;
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string; key: string; name: string; description: string;
          emoji: string; category: string;
          xp_reward: number; coins_reward: number;
          icon_url: string | null; sort_order: number;
        };
        Insert: Partial<Database["public"]["Tables"]["achievements"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["achievements"]["Row"]>;
        Relationships: [];
      };
      user_achievements: {
        Row: {
          id: string; user_id: string; achievement_id: string;
          unlocked_at: string;
          progress_current: number; progress_target: number;
        };
        Insert: {
          id?: string; user_id: string; achievement_id: string;
          unlocked_at?: string;
          progress_current?: number; progress_target?: number;
        };
        Update: Partial<Database["public"]["Tables"]["user_achievements"]["Insert"]>;
        Relationships: [];
      };
      ai_sessions: {
        Row: {
          id: string; user_id: string; session_type: string;
          prompt: string | null; response: string | null;
          model: string; tokens_used: number; created_at: string;
        };
        Insert: {
          id?: string; user_id: string; session_type: string;
          prompt?: string | null; response?: string | null;
          model?: string; tokens_used?: number; created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_sessions"]["Insert"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string; user_id: string;
          razorpay_subscription_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_order_id: string | null;
          plan: string; status: string;
          started_at: string; expires_at: string | null;
          cancelled_at: string | null; created_at: string;
        };
        Insert: {
          id?: string; user_id: string;
          razorpay_subscription_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_order_id?: string | null;
          plan: string; status?: string;
          started_at?: string; expires_at?: string | null;
          cancelled_at?: string | null; created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [];
      };
      in_app_notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string | null;
          type: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body?: string | null;
          type?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["in_app_notifications"]["Insert"]>;
        Relationships: [];
      };
      fcm_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fcm_tokens"]["Insert"]>;
        Relationships: [];
      };
      user_quests: {
        Row: {
          id: string;
          user_id: string;
          quest_type: string;
          quest_key: string;
          date_key: string;
          progress_current: number;
          progress_target: number;
          is_completed: boolean;
          xp_reward: number;
          coins_reward: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quest_type: string;
          quest_key: string;
          date_key: string;
          progress_current?: number;
          progress_target: number;
          is_completed?: boolean;
          xp_reward?: number;
          coins_reward?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_quests"]["Insert"]>;
        Relationships: [];
      };
      season_progress: {
        Row: {
          id: string;
          user_id: string;
          season_id: string;
          current_xp: number;
          claimed_tiers: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          season_id: string;
          current_xp?: number;
          claimed_tiers?: any;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["season_progress"]["Insert"]>;
        Relationships: [];
      };
      fitness_os_sleep_logs: {
        Row: {
          id: string; user_id: string; sleep_date: string;
          duration_hours: number | null; quality_score: number | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; user_id: string; sleep_date?: string;
          duration_hours?: number | null; quality_score?: number | null;
          created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fitness_os_sleep_logs"]["Insert"]>;
        Relationships: [];
      };
      fitness_os_activity_logs: {
        Row: {
          id: string; user_id: string; activity_date: string;
          steps: number | null; active_minutes: number | null;
          distance_km: number | null; calories_burned: number | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; user_id: string; activity_date?: string;
          steps?: number | null; active_minutes?: number | null;
          distance_km?: number | null; calories_burned?: number | null;
          created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fitness_os_activity_logs"]["Insert"]>;
        Relationships: [];
      };
    };
        fitness_os_profiles: {
          Row: {
            id: string;
            user_id: string;
            fitness_level: string | null;
            age: number | null;
            height: number | null;
            weight: number | null;
            target_weight: number | null;
            gender: string | null;
            equipment: any | null;
            training_days_per_week: number | null;
            workout_duration_minutes: number | null;
            preferred_training_days: any | null;
            preferred_training_time: string | null;
            food_avoidances: any | null;
            allergies: any | null;
            meals_per_day: number | null;
            nutrition_budget: string | null;
            sleep_duration: number | null;
            wake_time: string | null;
            sleep_time: string | null;
            lifestyle_description: string | null;
            onboarding_completed: boolean | null;
            created_at: string | null;
            updated_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            fitness_level?: string | null;
            age?: number | null;
            height?: number | null;
            weight?: number | null;
            target_weight?: number | null;
            gender?: string | null;
            equipment?: any | null;
            training_days_per_week?: number | null;
            workout_duration_minutes?: number | null;
            preferred_training_days?: any | null;
            preferred_training_time?: string | null;
            food_avoidances?: any | null;
            allergies?: any | null;
            meals_per_day?: number | null;
            nutrition_budget?: string | null;
            sleep_duration?: number | null;
            wake_time?: string | null;
            sleep_time?: string | null;
            lifestyle_description?: string | null;
            onboarding_completed?: boolean | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            fitness_level?: string | null;
            age?: number | null;
            height?: number | null;
            weight?: number | null;
            target_weight?: number | null;
            gender?: string | null;
            equipment?: any | null;
            training_days_per_week?: number | null;
            workout_duration_minutes?: number | null;
            preferred_training_days?: any | null;
            preferred_training_time?: string | null;
            food_avoidances?: any | null;
            allergies?: any | null;
            meals_per_day?: number | null;
            nutrition_budget?: string | null;
            sleep_duration?: number | null;
            wake_time?: string | null;
            sleep_time?: string | null;
            lifestyle_description?: string | null;
            onboarding_completed?: boolean | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
        };

        fitness_os_nutrition_plans: {
          Row: {
            id: string;
            plan_id: string;
            user_id: string;
            daily_calories: number | null;
            protein_grams: number | null;
            meals_per_day: number | null;
            guidance: string | null;
            created_at: string | null;
            updated_at: string | null;
          };
          Insert: {
            id?: string;
            plan_id: string;
            user_id: string;
            daily_calories?: number | null;
            protein_grams?: number | null;
            meals_per_day?: number | null;
            guidance?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
          Update: {
            id?: string;
            plan_id?: string;
            user_id?: string;
            daily_calories?: number | null;
            protein_grams?: number | null;
            meals_per_day?: number | null;
            guidance?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
        };

        fitness_os_lifestyle_plans: {
          Row: {
            id: string;
            plan_id: string;
            user_id: string;
            sleep_target_hours: string | null;
            water_target_liters: string | null;
            daily_steps_target: number | null;
            created_at: string | null;
            updated_at: string | null;
          };
          Insert: {
            id?: string;
            plan_id: string;
            user_id: string;
            sleep_target_hours?: string | null;
            water_target_liters?: string | null;
            daily_steps_target?: number | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
          Update: {
            id?: string;
            plan_id?: string;
            user_id?: string;
            sleep_target_hours?: string | null;
            water_target_liters?: string | null;
            daily_steps_target?: number | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
        };

        fitness_os_ai_sessions: {
          Row: {
            id: string;
            user_id: string;
            session_type: string;
            prompt: string | null;
            response: string | null;
            model: string | null;
            tokens_used: number | null;
            created_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            session_type: string;
            prompt?: string | null;
            response?: string | null;
            model?: string | null;
            tokens_used?: number | null;
            created_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            session_type?: string;
            prompt?: string | null;
            response?: string | null;
            model?: string | null;
            tokens_used?: number | null;
            created_at?: string | null;
          };
        };
        fitness_grocery_items: {
          Row: {
            id: string;
            user_id: string;
            plan_id: string;
            name: string;
            monthly_quantity: number;
            unit: string;
            estimated_price: number;
            category: string;
            is_optional: boolean | null;
            reason: string | null;
            purchased: boolean | null;
            created_at: string | null;
            updated_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            plan_id: string;
            name: string;
            monthly_quantity: number;
            unit: string;
            estimated_price: number;
            category: string;
            is_optional?: boolean | null;
            reason?: string | null;
            purchased?: boolean | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            plan_id?: string;
            name?: string;
            monthly_quantity?: number;
            unit?: string;
            estimated_price?: number;
            category?: string;
            is_optional?: boolean | null;
            reason?: string | null;
            purchased?: boolean | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
        };

        fitness_os_coach_sessions: {
          Row: {
            id: string;
            user_id: string;
            title: string | null;
            created_at: string | null;
            updated_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            title?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            title?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
        };

        fitness_os_coach_messages: {
          Row: {
            id: string;
            session_id: string;
            user_id: string;
            role: string | null;
            content: string;
            created_at: string | null;
          };
          Insert: {
            id?: string;
            session_id: string;
            user_id: string;
            role?: string | null;
            content: string;
            created_at?: string | null;
          };
          Update: {
            id?: string;
            session_id?: string;
            user_id?: string;
            role?: string | null;
            content?: string;
            created_at?: string | null;
          };
        };

        fitness_os_progress_reviews: {
          Row: {
            id: string;
            user_id: string;
            week_start: string;
            week_end: string;
            workouts_completed: number | null;
            workouts_planned: number | null;
            sets_completed: number | null;
            total_workout_minutes: number | null;
            ai_summary: string | null;
            ai_highlights: any | null;
            ai_recommendations: any | null;
            created_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            week_start: string;
            week_end: string;
            workouts_completed?: number | null;
            workouts_planned?: number | null;
            sets_completed?: number | null;
            total_workout_minutes?: number | null;
            ai_summary?: string | null;
            ai_highlights?: any | null;
            ai_recommendations?: any | null;
            created_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            week_start?: string;
            week_end?: string;
            workouts_completed?: number | null;
            workouts_planned?: number | null;
            sets_completed?: number | null;
            total_workout_minutes?: number | null;
            ai_summary?: string | null;
            ai_highlights?: any | null;
            ai_recommendations?: any | null;
            created_at?: string | null;
          };
        };

        fitness_os_plan_adjustments: {
          Row: {
            id: string;
            user_id: string;
            plan_id: string;
            adjustment_type: string | null;
            reason: string | null;
            proposed_changes: any;
            status: string | null;
            created_at: string | null;
            approved_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            plan_id: string;
            adjustment_type?: string | null;
            reason?: string | null;
            proposed_changes: any;
            status?: string | null;
            created_at?: string | null;
            approved_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            plan_id?: string;
            adjustment_type?: string | null;
            reason?: string | null;
            proposed_changes?: any;
            status?: string | null;
            created_at?: string | null;
            approved_at?: string | null;
          };
        };

        fitness_os_subscriptions: {
          Row: {
            id: string;
            user_id: string;
            plan: string;
            status: string;
            provider: string;
            provider_order_id: string | null;
            provider_payment_id: string | null;
            provider_subscription_id: string | null;
            current_period_start: string | null;
            current_period_end: string | null;
            created_at: string | null;
            updated_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            plan: string;
            status: string;
            provider: string;
            provider_order_id?: string | null;
            provider_payment_id?: string | null;
            provider_subscription_id?: string | null;
            current_period_start?: string | null;
            current_period_end?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            plan?: string;
            status?: string;
            provider?: string;
            provider_order_id?: string | null;
            provider_payment_id?: string | null;
            provider_subscription_id?: string | null;
            current_period_start?: string | null;
            current_period_end?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
        };

        fitness_os_body_metrics: {
          Row: {
            id: string;
            user_id: string;
            weight: number | null;
            waist: number | null;
            chest: number | null;
            hip: number | null;
            neck: number | null;
            left_arm: number | null;
            right_arm: number | null;
            left_thigh: number | null;
            right_thigh: number | null;
            recorded_at: string | null;
            created_at: string | null;
            updated_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            weight?: number | null;
            waist?: number | null;
            chest?: number | null;
            hip?: number | null;
            neck?: number | null;
            left_arm?: number | null;
            right_arm?: number | null;
            left_thigh?: number | null;
            right_thigh?: number | null;
            recorded_at?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            weight?: number | null;
            waist?: number | null;
            chest?: number | null;
            hip?: number | null;
            neck?: number | null;
            left_arm?: number | null;
            right_arm?: number | null;
            left_thigh?: number | null;
            right_thigh?: number | null;
            recorded_at?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
        };

        fitness_os_body_scans: {
          Row: {
            id: string;
            user_id: string;
            front_image_url: string | null;
            side_image_url: string | null;
            back_image_url: string | null;
            goal_image_url: string | null;
            scan_date: string;
            ai_analysis_ref: Record<string, any> | null;
            created_at: string | null;
            updated_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            front_image_url?: string | null;
            side_image_url?: string | null;
            back_image_url?: string | null;
            goal_image_url?: string | null;
            scan_date?: string;
            ai_analysis_ref?: Record<string, any> | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            front_image_url?: string | null;
            side_image_url?: string | null;
            back_image_url?: string | null;
            goal_image_url?: string | null;
            scan_date?: string;
            ai_analysis_ref?: Record<string, any> | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
        };

        fitness_os_scans: {
          Row: {
            id: string;
            user_id: string;
            front_url: string | null;
            side_url: string | null;
            back_url: string | null;
            goal_url: string | null;
            gemini_analysis: string | null;
            created_at: string | null;
            updated_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            front_url?: string | null;
            side_url?: string | null;
            back_url?: string | null;
            goal_url?: string | null;
            gemini_analysis?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            front_url?: string | null;
            side_url?: string | null;
            back_url?: string | null;
            goal_url?: string | null;
            gemini_analysis?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
        };

        fitness_os_workout_plans: {
          Row: {
            id: string;
            user_id: string;
            name: string;
            description: string | null;
            goal: string | null;
            status: string;
            created_at: string | null;
            updated_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            name: string;
            description?: string | null;
            goal?: string | null;
            status: string;
            created_at?: string | null;
            updated_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            name?: string;
            description?: string | null;
            goal?: string | null;
            status?: string;
            created_at?: string | null;
            updated_at?: string | null;
          };
        };

        fitness_os_workouts: {
          Row: {
            id: string;
            user_id: string;
            plan_id: string | null;
            workout_date: string;
            name: string;
            status: string;
            started_at: string | null;
            completed_at: string | null;
            duration_minutes: number | null;
            created_at: string | null;
            updated_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            plan_id?: string | null;
            workout_date: string;
            name: string;
            status: string;
            started_at?: string | null;
            completed_at?: string | null;
            duration_minutes?: number | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            plan_id?: string | null;
            workout_date?: string;
            name?: string;
            status?: string;
            started_at?: string | null;
            completed_at?: string | null;
            duration_minutes?: number | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
        };

        fitness_os_exercises: {
          Row: {
            id: string;
            workout_id: string;
            name: string;
            exercise_order: number;
            target_sets: number;
            target_reps: number | null;
            target_duration_seconds: number | null;
            rest_seconds: number;
            notes: string | null;
            created_at: string | null;
          };
          Insert: {
            id?: string;
            workout_id: string;
            name: string;
            exercise_order: number;
            target_sets: number;
            target_reps?: number | null;
            target_duration_seconds?: number | null;
            rest_seconds: number;
            notes?: string | null;
            created_at?: string | null;
          };
          Update: {
            id?: string;
            workout_id?: string;
            name?: string;
            exercise_order?: number;
            target_sets?: number;
            target_reps?: number | null;
            target_duration_seconds?: number | null;
            rest_seconds?: number;
            notes?: string | null;
            created_at?: string | null;
          };
        };

        fitness_os_sets: {
          Row: {
            id: string;
            exercise_id: string;
            set_number: number;
            target_reps: number | null;
            actual_reps: number | null;
            weight_kg: string | null;
            duration_seconds: number | null;
            completed: boolean | null;
            completed_at: string | null;
            created_at: string | null;
          };
          Insert: {
            id?: string;
            exercise_id: string;
            set_number: number;
            target_reps?: number | null;
            actual_reps?: number | null;
            weight_kg?: string | null;
            duration_seconds?: number | null;
            completed?: boolean | null;
            completed_at?: string | null;
            created_at?: string | null;
          };
          Update: {
            id?: string;
            exercise_id?: string;
            set_number?: number;
            target_reps?: number | null;
            actual_reps?: number | null;
            weight_kg?: string | null;
            duration_seconds?: number | null;
            completed?: boolean | null;
            completed_at?: string | null;
            created_at?: string | null;
          };
        };

        fitness_os_workout_sessions: {
          Row: {
            id: string;
            user_id: string;
            workout_id: string;
            started_at: string;
            paused_at: string | null;
            completed_at: string | null;
            duration_seconds: number | null;
            status: string;
            created_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            workout_id: string;
            started_at: string;
            paused_at?: string | null;
            completed_at?: string | null;
            duration_seconds?: number | null;
            status: string;
            created_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            workout_id?: string;
            started_at?: string;
            paused_at?: string | null;
            completed_at?: string | null;
            duration_seconds?: number | null;
            status?: string;
            created_at?: string | null;
          };
        };
        profiles: {
          Row: {
            id: string;
            display_name: string;
            email: string | null;
            avatar_url: string | null;
            timezone: string | null;
            created_at: string | null;
            updated_at: string | null;
            coins: number | null;
            level: number | null;
            tree_water_count: number | null;
            tree_leaves_count: number | null;
            tree_butterflies_count: number | null;
            tree_birds_count: number | null;
            tree_flowers_count: number | null;
            tree_golden: boolean | null;
            premium_tier: string | null;
            premium_expires_at: string | null;
            trial_used: boolean | null;
            notifications_enabled: boolean | null;
            morning_reminder: string | null;
            afternoon_reminder: string | null;
            evening_reminder: string | null;
            ai_plan_created: boolean | null;
          };
          Insert: {
            id?: string;
            display_name: string;
            email?: string | null;
            avatar_url?: string | null;
            timezone?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
            coins?: number | null;
            level?: number | null;
            tree_water_count?: number | null;
            tree_leaves_count?: number | null;
            tree_butterflies_count?: number | null;
            tree_birds_count?: number | null;
            tree_flowers_count?: number | null;
            tree_golden?: boolean | null;
            premium_tier?: string | null;
            premium_expires_at?: string | null;
            trial_used?: boolean | null;
            notifications_enabled?: boolean | null;
            morning_reminder?: string | null;
            afternoon_reminder?: string | null;
            evening_reminder?: string | null;
            ai_plan_created?: boolean | null;
          };
          Update: {
            id?: string;
            display_name?: string;
            email?: string | null;
            avatar_url?: string | null;
            timezone?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
            coins?: number | null;
            level?: number | null;
            tree_water_count?: number | null;
            tree_leaves_count?: number | null;
            tree_butterflies_count?: number | null;
            tree_birds_count?: number | null;
            tree_flowers_count?: number | null;
            tree_golden?: boolean | null;
            premium_tier?: string | null;
            premium_expires_at?: string | null;
            trial_used?: boolean | null;
            notifications_enabled?: boolean | null;
            morning_reminder?: string | null;
            afternoon_reminder?: string | null;
            evening_reminder?: string | null;
            ai_plan_created?: boolean | null;
          };
        };
        habits: {
          Row: {
            id: string;
            user_id: string;
            name: string;
            description: string | null;
            emoji: string | null;
            category: string;
            frequency: string;
            custom_days: number | null;
            preferred_time: string | null;
            reminder_time: string | null;
            target_count: number | null;
            target_unit: string | null;
            target_value: number | null;
            is_active: boolean | null;
            is_archived: boolean | null;
            color: string | null;
            sort_order: number | null;
            longest_streak: number | null;
            total_completions: number | null;
            total_skips: number | null;
            completion_rate: number | null;
            ai_reasoning: string | null;
            created_at: string | null;
            updated_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            name: string;
            description?: string | null;
            emoji?: string | null;
            category: string;
            frequency: string;
            custom_days?: number | null;
            preferred_time?: string | null;
            reminder_time?: string | null;
            target_count?: number | null;
            target_unit?: string | null;
            target_value?: number | null;
            is_active?: boolean | null;
            is_archived?: boolean | null;
            color?: string | null;
            sort_order?: number | null;
            longest_streak?: number | null;
            total_completions?: number | null;
            total_skips?: number | null;
            completion_rate?: number | null;
            ai_reasoning?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            name?: string;
            description?: string | null;
            emoji?: string | null;
            category?: string;
            frequency?: string;
            custom_days?: number | null;
            preferred_time?: string | null;
            reminder_time?: string | null;
            target_count?: number | null;
            target_unit?: string | null;
            target_value?: number | null;
            is_active?: boolean | null;
            is_archived?: boolean | null;
            color?: string | null;
            sort_order?: number | null;
            longest_streak?: number | null;
            total_completions?: number | null;
            total_skips?: number | null;
            completion_rate?: number | null;
            ai_reasoning?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
        };
        habit_logs: {
          Row: {
            id: string;
            habit_id: string;
            user_id: string;
            date: string;
            status: string;
            completed_at: string | null;
            value: number | null;
            note: string | null;
            mood: string | null;
            streak_before: number | null;
            streak_after: number | null;
            xp_earned: number | null;
            coins_earned: number | null;
            created_at: string | null;
          };
          Insert: {
            id?: string;
            habit_id: string;
            user_id: string;
            date: string;
            status: string;
            completed_at?: string | null;
            value?: number | null;
            note?: string | null;
            mood?: string | null;
            streak_before?: number | null;
            streak_after?: number | null;
            xp_earned?: number | null;
            coins_earned?: number | null;
            created_at?: string | null;
          };
          Update: {
            id?: string;
            habit_id?: string;
            user_id?: string;
            date?: string;
            status?: string;
            completed_at?: string | null;
            value?: number | null;
            note?: string | null;
            mood?: string | null;
            streak_before?: number | null;
            streak_after?: number | null;
            xp_earned?: number | null;
            coins_earned?: number | null;
            created_at?: string | null;
          };
        };
        journal_entries: {
          Row: {
            id: string;
            user_id: string;
            date: string;
            title: string | null;
            content: string | null;
            mood: number | null;
            energy: number | null;
            focus: number | null;
            photo_urls: string | null;
            voice_note_url: string | null;
            voice_transcript: string | null;
            ai_summary: string | null;
            ai_sentiment: string | null;
            ai_insights: string | null;
            created_at: string | null;
            updated_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            date: string;
            title?: string | null;
            content?: string | null;
            mood?: number | null;
            energy?: number | null;
            focus?: number | null;
            photo_urls?: string | null;
            voice_note_url?: string | null;
            voice_transcript?: string | null;
            ai_summary?: string | null;
            ai_sentiment?: string | null;
            ai_insights?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            date?: string;
            title?: string | null;
            content?: string | null;
            mood?: number | null;
            energy?: number | null;
            focus?: number | null;
            photo_urls?: string | null;
            voice_note_url?: string | null;
            voice_transcript?: string | null;
            ai_summary?: string | null;
            ai_sentiment?: string | null;
            ai_insights?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
          };
        };
        achievements: {
          Row: {
            id: string;
            key: string;
            name: string;
            description: string;
            emoji: string | null;
            category: string;
            xp_reward: number | null;
            coins_reward: number | null;
            icon_url: string | null;
            sort_order: number | null;
          };
          Insert: {
            id?: string;
            key: string;
            name: string;
            description: string;
            emoji?: string | null;
            category: string;
            xp_reward?: number | null;
            coins_reward?: number | null;
            icon_url?: string | null;
            sort_order?: number | null;
          };
          Update: {
            id?: string;
            key?: string;
            name?: string;
            description?: string;
            emoji?: string | null;
            category?: string;
            xp_reward?: number | null;
            coins_reward?: number | null;
            icon_url?: string | null;
            sort_order?: number | null;
          };
        };
        user_achievements: {
          Row: {
            id: string;
            user_id: string;
            achievement_id: string;
            unlocked_at: string | null;
            progress_current: number | null;
            progress_target: number | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            achievement_id: string;
            unlocked_at?: string | null;
            progress_current?: number | null;
            progress_target?: number | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            achievement_id?: string;
            unlocked_at?: string | null;
            progress_current?: number | null;
            progress_target?: number | null;
          };
        };
        ai_sessions: {
          Row: {
            id: string;
            user_id: string;
            session_type: string;
            prompt: string | null;
            response: string | null;
            model: string | null;
            tokens_used: number | null;
            created_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            session_type: string;
            prompt?: string | null;
            response?: string | null;
            model?: string | null;
            tokens_used?: number | null;
            created_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            session_type?: string;
            prompt?: string | null;
            response?: string | null;
            model?: string | null;
            tokens_used?: number | null;
            created_at?: string | null;
          };
        };
        subscriptions: {
          Row: {
            id: string;
            user_id: string;
            razorpay_subscription_id: string | null;
            razorpay_payment_id: string | null;
            razorpay_order_id: string | null;
            plan: string;
            status: string;
            started_at: string | null;
            expires_at: string | null;
            cancelled_at: string | null;
            created_at: string | null;
          };
          Insert: {
            id?: string;
            user_id: string;
            razorpay_subscription_id?: string | null;
            razorpay_payment_id?: string | null;
            razorpay_order_id?: string | null;
            plan: string;
            status: string;
            started_at?: string | null;
            expires_at?: string | null;
            cancelled_at?: string | null;
            created_at?: string | null;
          };
          Update: {
            id?: string;
            user_id?: string;
            razorpay_subscription_id?: string | null;
            razorpay_payment_id?: string | null;
            razorpay_order_id?: string | null;
            plan?: string;
            status?: string;
            started_at?: string | null;
            expires_at?: string | null;
            cancelled_at?: string | null;
            created_at?: string | null;
          };
        };

    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_xp: { Args: { xp_amount: number }; Returns: void };
      water_tree: { Args: Record<string, never>; Returns: void };
    };
  };
}
