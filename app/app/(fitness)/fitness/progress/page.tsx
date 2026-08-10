import { FitnessGuard } from "@/components/fitness/fitness-guard";

export default function FitnessProgress() {
  return (
    <FitnessGuard>
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Progress</h1>
        <p className="text-gray-500">Your transformation progress will appear here.</p>
      </div>
    </FitnessGuard>
  );
}
