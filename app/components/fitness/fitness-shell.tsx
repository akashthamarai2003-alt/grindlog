"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./dashboard/bottom-nav";
import { FitnessChatbot } from "./chatbot/fitness-chatbot";
import { NavigationProvider, useInstantNav } from "./navigation-context";
import { WorkoutInstantFallback } from "./workout/workout-instant-fallback";
import { ProgressInstantFallback } from "./progress/progress-instant-fallback";
import { DashboardSkeleton } from "./dashboard/dashboard-skeleton";
import NutritionLoading from "@/app/(fitness)/nutrition/loading";
import ProfileLoading from "@/app/(fitness)/profile/loading";

// Only primary root tab pages show the bottom navigation bar and floating AI coach button
const MAIN_PAGES = new Set([
  "/",
  "/workout",
  "/nutrition",
  "/diet",
  "/progress",
  "/profile",
]);

function FitnessShellInner({ children, isPro = false }: { children: React.ReactNode; isPro?: boolean }) {
  const pathname = usePathname();
  const { navigatingTo } = useInstantNav();

  // Normalize pathname by stripping trailing slashes for robust matching
  const cleanPath = pathname ? (pathname.replace(/\/+$/, "") || "/") : "/";
  const isMainPage = MAIN_PAGES.has(cleanPath);

  // If user tapped a tab, immediately render the skeleton for that tab (0ms native app feel)
  const isNavigatingAway = Boolean(navigatingTo && navigatingTo !== cleanPath);

  let activeSkeleton: React.ReactNode = null;
  if (isNavigatingAway) {
    if (navigatingTo === "/workout") {
      activeSkeleton = <WorkoutInstantFallback />;
    } else if (navigatingTo === "/nutrition" || navigatingTo === "/diet") {
      activeSkeleton = <NutritionLoading />;
    } else if (navigatingTo === "/progress") {
      activeSkeleton = <ProgressInstantFallback />;
    } else if (navigatingTo === "/") {
      activeSkeleton = (
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-28">
          <DashboardSkeleton />
        </div>
      );
    } else if (navigatingTo === "/profile") {
      activeSkeleton = <ProfileLoading />;
    }
  }

  return (
    <div className="flex justify-center min-h-screen bg-[#0A1108]">
      <div className="w-full min-h-[100dvh] relative flex flex-col overflow-x-hidden">
        <main className={`flex-1 ${isMainPage ? 'pb-24' : ''}`}>
          {activeSkeleton || children}
        </main>
        {isMainPage && (
          <>
            <FitnessChatbot isPro={isPro} />
            <BottomNav isPro={isPro} />
          </>
        )}
      </div>
    </div>
  );
}

export function FitnessShell({ children, isPro = false }: { children: React.ReactNode; isPro?: boolean }) {
  return (
    <NavigationProvider>
      <FitnessShellInner isPro={isPro}>{children}</FitnessShellInner>
    </NavigationProvider>
  );
}
