import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { getFitnessAILimit } from "@/lib/fitness/subscription/access";

export async function checkFitnessAILimit(supabase: SupabaseClient, userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // 1. Get dynamic limit based on active Fitness OS subscription
  const dailyLimit = await getFitnessAILimit(userId);

  // If no limit (0), they don't have access
  if (dailyLimit <= 0) {
    return {
      allowed: false,
      limit: 0,
      used: 0,
      remaining: 0,
    };
  }

  // 2. Count today's fitness AI sessions
  const adminClient = createAdminClient();

  const { count, error } = await adminClient
    .from("fitness_os_ai_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .neq("session_type", "plan_generation_attempt")
    .gte("created_at", startOfDay.toISOString());

  if (error) {
    console.error("Error checking Fitness AI limit:", error);
    return { allowed: false, limit: dailyLimit, used: 0, remaining: 0, error };
  }

  const todayCount = count || 0;
  const remaining = Math.max(0, dailyLimit - todayCount);

  if (todayCount < dailyLimit) {
    return {
      allowed: true,
      limit: dailyLimit,
      used: todayCount,
      remaining,
    };
  }

  return {
    allowed: false,
    limit: dailyLimit,
    used: todayCount,
    remaining: 0,
  };
}

export async function logFitnessAIUsage(
  userId: string,
  sessionType: string,
  prompt: string = "",
  response: string = "",
  model: string = "system",
  tokens: number = 0,
) {
  try {
    const adminClient = createAdminClient();

    const { error } = await adminClient.from("fitness_os_ai_sessions").insert({
      user_id: userId,
      session_type: sessionType,
      prompt,
      response,
      model,
      tokens_used: tokens,
    } as any);

    if (error) {
      console.error("Supabase Fitness AI session insert error:", error);
    }
  } catch (error) {
    console.error("Failed to log Fitness AI usage:", error);
  }
}
