import type { HabitCategory, TimeOfDay } from "@/types";

export const APP_NAME = "GrindLog";
export const APP_DESCRIPTION = "The Personal Growth Operating System";
export const APP_URL = "https://www.grindlog.in";

export const MAX_FREE_HABITS = 5;
export const MAX_VIEWPORT_WIDTH = 430;

export const TREE_STAGES = {
  SEED: 0,
  SPROUT: 1,
  SMALL_PLANT: 2,
  BUSH: 3,
  YOUNG_TREE: 4,
  MATURE_TREE: 5,
  FLOWERING: 6,
  GOLDEN: 7,
} as const;

export const TREE_STAGE_NAMES: Record<number, string> = {
  0: "Seed",
  1: "Sprout",
  2: "Small Plant",
  3: "Bush",
  4: "Young Tree",
  5: "Mature Tree",
  6: "Flowering Tree",
  7: "Golden Tree",
};

export const HABIT_CATEGORIES: { value: HabitCategory; label: string; emoji: string }[] = [
  { value: "fitness", label: "Fitness", emoji: "🏃" },
  { value: "learning", label: "Learning", emoji: "📚" },
  { value: "health", label: "Health", emoji: "💧" },
  { value: "mindfulness", label: "Mindfulness", emoji: "🧘" },
  { value: "finance", label: "Finance", emoji: "💰" },
  { value: "social", label: "Social", emoji: "💬" },
  { value: "work", label: "Work", emoji: "💼" },
  { value: "creative", label: "Creative", emoji: "🎨" },
  { value: "other", label: "Other", emoji: "✨" },
];

export const TIME_OF_DAY: { value: TimeOfDay; label: string; emoji: string }[] = [
  { value: "morning", label: "Morning", emoji: "🌅" },
  { value: "afternoon", label: "Afternoon", emoji: "☀️" },
  { value: "evening", label: "Evening", emoji: "🌅" },
  { value: "night", label: "Night", emoji: "🌙" },
  { value: "anytime", label: "Anytime", emoji: "⏰" },
];

export const MOODS = [
  { value: 1, emoji: "😢", label: "Terrible" },
  { value: 2, emoji: "😔", label: "Bad" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "😍", label: "Amazing" },
];

export const XP_REWARDS = {
  HABIT_COMPLETE: 50,
  PERFECT_DAY: 100,
  STREAK_7: 200,
  STREAK_30: 1000,
  STREAK_100: 5000,
  JOURNAL_ENTRY: 30,
  AI_PLAN_CREATED: 150,
  FIRST_HABIT: 100,
  TREE_STAGE_UP: 300,
  REFERRAL: 500,
} as const;

export const COIN_REWARDS = {
  HABIT_COMPLETE: 10,
  PERFECT_DAY: 25,
  STREAK_7: 50,
  STREAK_30: 200,
  STREAK_100: 1000,
  JOURNAL_ENTRY: 5,
  FIRST_HABIT: 20,
  TREE_STAGE_UP: 100,
  REFERRAL: 100,
} as const;

export const PREMIUM_PLANS = {
  MONTHLY: { price: 299, period: "month", label: "Monthly", emoji: "🌱" },
  ANNUAL: { price: 1999, period: "year", label: "Annual", emoji: "🌳", savings: "44%" },
  LIFETIME: { price: 4999, period: "lifetime", label: "Legend", emoji: "👑" },
} as const;
