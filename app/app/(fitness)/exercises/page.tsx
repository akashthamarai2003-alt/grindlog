import { Metadata } from "next";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { FitnessShell } from "@/components/fitness/fitness-shell";
import { ExerciseBrowser } from "@/components/fitness/exercises/exercise-browser";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Exercise Library - Fitness AI OS",
  description: "Browse the full exercise database.",
};

export default async function ExercisesPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/exercises");
  }

  return (
    <FitnessGuard requirePro featureName="the full exercise library">
      <FitnessShell>
        <ExerciseBrowser />
      </FitnessShell>
    </FitnessGuard>
  );
}
