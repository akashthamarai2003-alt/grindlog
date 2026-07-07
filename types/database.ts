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
          streak_before: number; streak_after: number;
          xp_earned: number; coins_earned: number;
          created_at: string;
        };
        Insert: {
          id?: string; habit_id: string; user_id: string;
          date?: string; status: "completed" | "skipped" | "missed";
          completed_at?: string | null; value?: number | null;
          note?: string | null; mood?: string | null;
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
    };
    Functions: {
      add_xp: { Args: { xp_amount: number }; Returns: void };
      water_tree: { Args: Record<string, never>; Returns: void };
    };
  };
}
