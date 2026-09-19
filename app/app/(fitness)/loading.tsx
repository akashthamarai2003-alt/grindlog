import { DashboardSkeleton } from "@/components/fitness/dashboard/dashboard-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="w-full max-w-md mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-28">
        <DashboardSkeleton />
      </div>
    </div>
  );
}
