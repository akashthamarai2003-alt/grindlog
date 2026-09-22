import { getCachedUser } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { WorkoutSkeleton } from "@/components/fitness/workout/workout-skeleton";
import { WorkoutView } from "@/components/fitness/workout/workout-view";
import { getWorkoutPageData } from "@/lib/services/fitness/workout-page-service";

export const dynamic = "force-dynamic";

async function WorkoutContent() {
  const { data: { user } } = await getCachedUser();
  
  if (!user) {
    redirect("/auth/signin?redirect=/workout");
  }

  const data = await getWorkoutPageData(user.id);

  return <WorkoutView initialData={data} />;
}

export default function WorkoutIndexPage() {
  return (
    <Suspense fallback={<WorkoutSkeleton />}>
      <WorkoutContent />
    </Suspense>
  );
}
