import { Metadata } from "next";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { FitnessShell } from "@/components/fitness/fitness-shell";
import { CustomExerciseForm } from "@/components/fitness/exercises/custom-exercise-form";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create Custom Exercise - Fitness AI OS",
  description: "Add a custom exercise to your library.",
};

export default async function CustomExercisePage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/exercises/custom");
  }

  return (
    <FitnessGuard>
      <FitnessShell>
        <CustomExerciseForm />
      </FitnessShell>
    </FitnessGuard>
  );
}
