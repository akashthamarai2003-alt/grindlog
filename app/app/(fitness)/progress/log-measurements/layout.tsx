import { FitnessGuard } from "@/components/fitness/fitness-guard";

export default function LogMeasurementsLayout({ children }: { children: React.ReactNode }) {
  return (
    <FitnessGuard requirePro featureName="Body Measurements">
      {children}
    </FitnessGuard>
  );
}
