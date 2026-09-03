import { Metadata } from "next";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { FitnessShell } from "@/components/fitness/fitness-shell";
import { ExerciseBrowser } from "@/components/fitness/exercises/exercise-browser";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Exercise Library - Fitness AI OS",
  description: "Browse the full exercise database.",
};

export default async function ExercisesPage() {
  const { data: { user } } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/exercises");
  }

  const supabase = await createServerSupabase();
  const { data: exercises } = await supabase
    .from("fitness_exercises_library")
    .select("id, slug, name, target_muscle, equipment, level, image_urls")
    .order("name", { ascending: true })
    .range(0, 99);

  return (
    <FitnessGuard requirePro featureName="the full exercise library">
      <FitnessShell>
        <ExerciseBrowser initialExercises={exercises || []} />
      </FitnessShell>
    </FitnessGuard>
  );
}
