import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export async function createServerSupabase() {
  let cookieStore: any = null;
  try {
    cookieStore = await cookies();
  } catch {
    // Graceful fallback when called outside a Next.js request scope (e.g. scripts, background tests)
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return cookieStore ? cookieStore.getAll() : [];
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) {
          if (!cookieStore) return;
          for (const { name, value, options } of cookiesToSet) {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Ignore cookie writes in read-only or outside context
            }
          }
        },
      },
    },
  );
}

// Alias for convenience used in Fitness AI OS
export const createClient = createServerSupabase;

import { createAdminClient } from "./admin";

export const getCachedUser = cache(async () => {
  const supabase = await createServerSupabase();
  return await supabase.auth.getUser();
});

export const getCachedFitnessProfile = cache(async (userId: string) => {
  const admin = createAdminClient();
  const { data } = await admin
    .from("fitness_os_profiles")
    .select("id, user_id, onboarding_completed, name, weight, weight_trend_baseline, target_weight, goal, physical_problems, diet_preference, food_type, food_allergies, foods_disliked, foods_avoided, available_foods, nutrition_budget, food_environment, meals_per_day, ai_strategy")
    .eq("user_id", userId)
    .maybeSingle();
  return data || null;
});
