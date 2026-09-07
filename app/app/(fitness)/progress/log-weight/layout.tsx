import { FitnessGuard } from "@/components/fitness/fitness-guard";

export default function LogWeightLayout({ children }: { children: React.ReactNode }) {
  return (
    <FitnessGuard requirePro featureName="Weight Logging">
      {children}
    </FitnessGuard>
  );
}
