import { FitnessGuard } from "@/components/fitness/fitness-guard";

export default function FitnessWorkout() {
  return (
    <FitnessGuard>
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Workout</h1>
        <p className="text-gray-500">Your workouts will appear here.</p>
      </div>
    </FitnessGuard>
  );
}
