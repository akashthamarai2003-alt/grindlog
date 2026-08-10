"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { OnboardingSchema, OnboardingData } from "@/types/fitness/onboarding";
import { revalidatePath } from "next/cache";

export async function saveFitnessOnboardingAction(payload: Partial<OnboardingData>) {
  const supabase = await createServerSupabase();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Server-side Zod Validation
  const result = OnboardingSchema.safeParse(payload);
  
  if (!result.success) {
    console.error("Fitness Onboarding Validation Error:", result.error.format());
    return { success: false, error: "Invalid data provided" };
  }

  const validData = result.data;

  // Insert or Update logic based on UNIQUE user_id
  const { error: upsertError } = await supabase
    .from("fitness_os_profiles")
    .upsert(
      { 
        user_id: user.id, 
        ...validData,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    console.error("Failed to save fitness profile:", upsertError);
    return { success: false, error: "Failed to save profile. Please try again." };
  }

  revalidatePath("/fitness");
  return { success: true };
}
