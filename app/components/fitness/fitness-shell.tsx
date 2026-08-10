"use client";

import { usePathname } from "next/navigation";
import { FitnessBottomNav } from "./fitness-bottom-nav";

export function FitnessShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname?.includes("/onboarding");

  return (
    <div className="flex justify-center min-h-screen bg-gray-50/50">
      <div className="w-full max-w-[390px] bg-white min-h-[100dvh] relative flex flex-col overflow-x-hidden shadow-[0_0_50px_rgba(0,0,0,0.05)] ring-1 ring-gray-200">
        <main className={`flex-1 ${isOnboarding ? '' : 'pb-24'}`}>
          {children}
        </main>
        {!isOnboarding && <FitnessBottomNav />}
      </div>
    </div>
  );
}
