import { FitnessGuard } from "@/components/fitness/fitness-guard";

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return (
    <FitnessGuard requirePro={false} featureName="progress tracking">
      {children}
    </FitnessGuard>
  );
}
