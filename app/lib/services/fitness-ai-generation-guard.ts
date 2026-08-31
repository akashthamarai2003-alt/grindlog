import type { SupabaseClient } from "@supabase/supabase-js";

const RETRY_COOLDOWN_MS = 60_000;

export async function getGenerationRetryAfterSeconds(
  supabase: SupabaseClient,
  userId: string,
  sessionType: string,
): Promise<number> {
  const cutoff = new Date(Date.now() - RETRY_COOLDOWN_MS).toISOString();
  const { data, error } = await supabase
    .from("fitness_os_ai_sessions")
    .select("created_at")
    .eq("user_id", userId)
    .eq("session_type", sessionType)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.created_at) return 0;

  const elapsed = Date.now() - new Date(data.created_at).getTime();
  return Math.max(0, Math.ceil((RETRY_COOLDOWN_MS - elapsed) / 1000));
}

export async function recordGenerationAttempt(
  supabase: SupabaseClient,
  userId: string,
  sessionType: string,
  model: string,
): Promise<void> {
  const { error } = await supabase.from("fitness_os_ai_sessions").insert({
    user_id: userId,
    session_type: sessionType,
    prompt: "Generation attempt recorded for retry protection.",
    response: null,
    model,
    tokens_used: 0,
  });

  if (error) {
    // Never prevent a legitimate generation solely because telemetry is unavailable.
    console.error("Failed to record AI generation attempt:", error);
  }
}
