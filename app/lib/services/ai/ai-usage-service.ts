import { createAdminClient } from "@/lib/services/supabase/admin";
import { getFitnessAILimit } from "@/lib/fitness/subscription/access";

export interface AIReservationResult {
  allowed: boolean;
  reservationId?: string;
  limit?: number;
  used?: number;
  remaining?: number;
  error?: string;
  reason?: "no_access" | "quota_exceeded" | "concurrency_blocked" | "database_error";
}

export interface CompleteAIUsagePayload {
  prompt?: string;
  response?: string;
  model?: string;
  tokens?: number;
}

/**
 * Centralized, multi-instance durable AI usage and quota reservation service.
 *
 * Prevents concurrency race conditions where two simultaneous requests could both
 * read count < limit and invoke the LLM before any record is inserted.
 *
 * Implements an atomic write-and-verify reservation pattern directly in the database:
 * 1. Writes a durable `pending_reservation` row in `fitness_os_ai_sessions`.
 * 2. Checks if total sessions + active reservations exceed the user's daily limit.
 * 3. If exceeded, immediately rolls back (deletes) the reservation and rejects the second request.
 * 4. If AI provider fails, deletes the reservation row so user quota is never lost on network errors.
 * 5. On successful completion, commits the actual prompt, response, model, and tokens.
 */
export class AIUsageService {
  /**
   * Checks the user's tier limit and atomically reserves a quota slot.
   */
  static async checkAndReserve(
    userId: string,
    sessionType: string
  ): Promise<AIReservationResult> {
    try {
      const adminClient = createAdminClient();

      // 1. Fetch dynamic daily limit based on user's active tier
      const dailyLimit = await getFitnessAILimit(userId);

      if (dailyLimit <= 0) {
        return {
          allowed: false,
          limit: 0,
          used: 0,
          remaining: 0,
          error: "AI features require an active subscription.",
          reason: "no_access",
        };
      }

      // 2. Insert a pending reservation row to establish a concurrency lock
      const { data: reservation, error: insertError } = await adminClient
        .from("fitness_os_ai_sessions")
        .insert({
          user_id: userId,
          session_type: sessionType,
          model: "pending_reservation",
          prompt: "in_flight_reservation",
          tokens_used: 0,
        })
        .select("id")
        .single();

      if (insertError || !reservation) {
        console.error("[AIUsageService] Error inserting reservation:", insertError);
        return {
          allowed: false,
          error: "Failed to reserve AI quota. Please try again.",
          reason: "database_error",
        };
      }

      // 3. Count today's total sessions including this reservation
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { count, error: countError } = await adminClient
        .from("fitness_os_ai_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .neq("session_type", "plan_generation_attempt")
        .gte("created_at", startOfDay.toISOString());

      if (countError) {
        console.error("[AIUsageService] Error checking usage count:", countError);
        // Clean up reservation on error
        await adminClient.from("fitness_os_ai_sessions").delete().eq("id", reservation.id);
        return {
          allowed: false,
          error: "Failed to verify AI usage quota.",
          reason: "database_error",
        };
      }

      const totalCount = count || 0;

      // 4. Concurrency check: If another concurrent request already took the final slot
      if (totalCount > dailyLimit) {
        console.warn(
          `[AIUsageService] Concurrent quota exceeded for user ${userId}: count=${totalCount}, limit=${dailyLimit}`
        );
        // Release our reservation immediately
        await adminClient.from("fitness_os_ai_sessions").delete().eq("id", reservation.id);
        return {
          allowed: false,
          limit: dailyLimit,
          used: totalCount - 1,
          remaining: 0,
          error: "Daily AI usage limit reached. Please upgrade or try again tomorrow.",
          reason: "quota_exceeded",
        };
      }

      // Reservation confirmed
      const remaining = Math.max(0, dailyLimit - totalCount);
      return {
        allowed: true,
        reservationId: reservation.id,
        limit: dailyLimit,
        used: totalCount,
        remaining,
      };
    } catch (err: any) {
      console.error("[AIUsageService] checkAndReserve unexpected error:", err);
      return {
        allowed: false,
        error: "Internal error checking AI limits.",
        reason: "database_error",
      };
    }
  }

  /**
   * Commits the actual response and token usage upon successful completion of the AI request.
   */
  static async completeReservation(
    reservationId: string,
    payload: CompleteAIUsagePayload
  ): Promise<void> {
    if (!reservationId) return;
    try {
      const adminClient = createAdminClient();
      await adminClient
        .from("fitness_os_ai_sessions")
        .update({
          prompt: payload.prompt || "",
          response: payload.response || "",
          model: payload.model || "system",
          tokens_used: payload.tokens || 0,
        })
        .eq("id", reservationId);
    } catch (err) {
      console.error("[AIUsageService] Error completing AI reservation:", err);
    }
  }

  /**
   * Releases (deletes) the reservation if the AI call fails or throws an exception.
   * Ensures the user is NOT penalized for external provider outages.
   */
  static async releaseReservation(reservationId: string): Promise<void> {
    if (!reservationId) return;
    try {
      const adminClient = createAdminClient();
      await adminClient.from("fitness_os_ai_sessions").delete().eq("id", reservationId);
    } catch (err) {
      console.error("[AIUsageService] Error releasing AI reservation:", err);
    }
  }

  /**
   * Simple read-only check for UI indicators (e.g. remaining quota badge on profile).
   */
  static async getRemainingQuota(userId: string): Promise<{
    allowed: boolean;
    limit: number;
    used: number;
    remaining: number;
  }> {
    const dailyLimit = await getFitnessAILimit(userId);
    if (dailyLimit <= 0) {
      return { allowed: false, limit: 0, used: 0, remaining: 0 };
    }

    const adminClient = createAdminClient();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count } = await adminClient
      .from("fitness_os_ai_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .neq("session_type", "plan_generation_attempt")
      .gte("created_at", startOfDay.toISOString());

    const used = count || 0;
    const remaining = Math.max(0, dailyLimit - used);
    return {
      allowed: used < dailyLimit,
      limit: dailyLimit,
      used,
      remaining,
    };
  }
}
