import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { PlanGeneration } from "@/components/fitness/plan/plan-generation";
import { WorkoutHeader } from "@/components/fitness/workout/workout-header";

export default function GeneratingPlanPage() {
  return (
    <FitnessGuard>
      <div className="min-h-screen bg-gray-50/50">
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-8">
          <WorkoutHeader title="Fitness OS" backUrl="/" />
          <PlanGeneration />
        </div>
      </div>
    </FitnessGuard>
  );
}
