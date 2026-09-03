import { FitnessGuard } from "@/components/fitness/fitness-guard";

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return (
    <FitnessGuard requirePro featureName="progress tracking">
      {children}
    </FitnessGuard>
  );
}
