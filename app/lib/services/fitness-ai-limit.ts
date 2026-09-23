import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { getFitnessAILimit } from "@/lib/fitness/subscription/access";

import { AIUsageService } from "./ai/ai-usage-service";
export { AIUsageService };

export async function checkFitnessAILimit(supabase: SupabaseClient, userId: string) {
  return await AIUsageService.getRemainingQuota(userId);
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
