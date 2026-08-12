"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./dashboard/bottom-nav";

export function FitnessShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Pages that are part of the onboarding/setup flow should NOT have the bottom nav
  const isSetupFlow = pathname?.includes("/onboarding") || 
                      pathname?.includes("/report") || 
                      pathname?.includes("/plan-setup") || 
                      pathname?.includes("/roadmap") ||
                      pathname?.includes("/generating") ||
                      pathname?.includes("/payment");

  return (
    <div className="flex justify-center min-h-screen bg-[#0A1108]">
      <div className="w-full min-h-[100dvh] relative flex flex-col overflow-x-hidden">
        <main className={`flex-1 ${isSetupFlow ? '' : 'pb-24'}`}>
          {children}
        </main>
        {!isSetupFlow && <BottomNav />}
      </div>
    </div>
  );
}
