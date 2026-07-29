"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileName(newName: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not logged in" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: newName })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
