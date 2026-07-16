export interface Profile {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
  xp: number;
  coins: number;
  level: number;
  tree_stage: TreeStage;
  tree_water_count: number;
  tree_leaves_count: number;
  tree_butterflies_count: number;
  tree_birds_count: number;
  tree_flowers_count: number;
  tree_golden: boolean;
  is_premium: boolean;
  premium_tier: PremiumTier | null;
  premium_expires_at: string | null;
  trial_used: boolean;
  theme: "light" | "dark";
  notifications_enabled: boolean;
  morning_reminder: string;
  afternoon_reminder: string;
  evening_reminder: string;
  onboarding_completed: boolean;
  ai_plan_created: boolean;
  unlocked_items: string[];
  equipped_theme: string;
  equipped_frame: string;
}

export type TreeStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type PremiumTier = "monthly" | "annual" | "lifetime";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  emoji: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  custom_days: number[] | null;
  preferred_time: TimeOfDay | null;
  reminder_time: string | null;
  target_count: number;
  target_unit: string | null;
  target_value: number | null;
  is_active: boolean;
  is_archived: boolean;
  color: string;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  total_skips: number;
  completion_rate: number;
  ai_generated: boolean;
  ai_reasoning: string | null;
  created_at: string;
  updated_at: string;
}

export type HabitCategory =
  | "fitness"
  | "learning"
  | "health"
  | "mindfulness"
  | "finance"
  | "social"
  | "work"
  | "creative"
  | "other";

export type HabitFrequency =
  | "daily"
  | "weekly"
  | "weekdays"
  | "weekends"
  | "custom";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night" | "anytime";

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  status: "completed" | "skipped" | "missed";
  completed_at: string | null;
  value: number | null;
  note: string | null;
  mood: string | null;
  streak_before: number;
  streak_after: number;
  xp_earned: number;
  coins_earned: number;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  title: string | null;
  content: string | null;
  mood: number | null;
  energy: number | null;
  focus: number | null;
  photo_urls: string[] | null;
  voice_note_url: string | null;
  voice_transcript: string | null;
  ai_summary: string | null;
  ai_sentiment: string | null;
  ai_insights: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  xp_reward: number;
  coins_reward: number;
  icon_url: string | null;
  sort_order: number;
}

export type AchievementCategory =
  | "streaks"
  | "consistency"
  | "tree"
  | "special"
  | "legendary";

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress_current: number;
  progress_target: number;
  achievement?: Achievement;
}

export interface AISession {
  id: string;
  user_id: string;
  session_type: AISessionType;
  prompt: string | null;
  response: string | null;
  model: string;
  tokens_used: number;
  created_at: string;
}

export type AISessionType =
  | "plan_generation"
  | "coach_chat"
  | "weekly_report"
  | "prediction"
  | "motivation"
  | "suggestion"
  | "schedule"
  | "reflection";

export interface Subscription {
  id: string;
  user_id: string;
  razorpay_subscription_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  plan: PremiumTier;
  status: "active" | "cancelled" | "expired" | "trial";
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export interface AIHabitPlan {
  habits: AIHabitPlanItem[];
  insight: string;
  suggestedOrder: string[];
}

export interface AIHabitPlanItem {
  name: string;
  emoji: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  preferredTime: TimeOfDay;
  targetCount: number;
  targetUnit: string;
  reason: string;
}
