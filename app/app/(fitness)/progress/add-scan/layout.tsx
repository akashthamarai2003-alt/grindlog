import { FitnessGuard } from "@/components/fitness/fitness-guard";

export default function AddScanLayout({ children }: { children: React.ReactNode }) {
  return (
    <FitnessGuard requirePro featureName="Progress Photo Scans">
      {children}
    </FitnessGuard>
  );
}
