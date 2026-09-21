import { InstantDashboardLoader } from "@/components/fitness/dashboard/instant-dashboard-loader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <InstantDashboardLoader />
    </div>
  );
}
