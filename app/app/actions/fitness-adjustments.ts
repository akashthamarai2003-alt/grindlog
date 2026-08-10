"use server";

import { createClient } from "@/lib/services/supabase/server";

export async function approveFitnessPlanAdjustmentAction(adjustmentId: string) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return { success: false, error: "Unauthorized" };
    }
    const userId = authData.user.id;

    // 1. Fetch the pending adjustment
    const { data: adjustment, error: fetchError } = await supabase
      .from("fitness_os_plan_adjustments")
      .select("*")
      .eq("id", adjustmentId)
      .eq("user_id", userId)
      .eq("status", "pending")
      .single();

    if (fetchError || !adjustment) {
      return { success: false, error: "Adjustment not found, not owned by you, or already processed." };
    }

    // 2. Validate proposed changes
    // (In a full implementation, you would parse adjustment.proposed_changes and run SQL updates on the plan)
    // For Phase 6 safety, we just mark it as applied without destructively rewriting workouts.
    const changes = adjustment.proposed_changes;
    if (!changes || !Array.isArray(changes)) {
      return { success: false, error: "Invalid proposed changes format." };
    }

    // 3. Update status
    const { error: updateError } = await supabase
      .from("fitness_os_plan_adjustments")
      .update({
        status: "applied",
        approved_at: new Date().toISOString()
      })
      .eq("id", adjustmentId);

    if (updateError) {
      console.error("Failed to update adjustment status:", updateError);
      return { success: false, error: "Failed to apply adjustment." };
    }

    return { success: true };
  } catch (error) {
    console.error("Approve adjustment error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
