"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "./dashboard/bottom-nav";
import { FitnessChatbot } from "./chatbot/fitness-chatbot";
import { NavigationProvider, useInstantNav } from "./navigation-context";
import { WorkoutInstantFallback } from "./workout/workout-instant-fallback";
import { ProgressInstantFallback } from "./progress/progress-instant-fallback";
import { DashboardInstantFallback } from "./dashboard/dashboard-instant-fallback";
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
  "/test-home",
  "/test-workout",
  "/test-nutrition",
  "/test-progress",
]);

function FitnessShellInner({ children, isPro = false }: { children: React.ReactNode; isPro?: boolean }) {
  const pathname = usePathname();
  const { navigatingTo } = useInstantNav();

  // Instant local memory/cookie check so Pro users never see free-tier badges or paywall flashes on refresh
  const [clientPro, setClientPro] = useState(() => {
    if (isPro) return true;
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("grindlog_is_pro") === "true";
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    if (isPro) {
      setClientPro(true);
      try {
        localStorage.setItem("grindlog_is_pro", "true");
        document.cookie = "grindlog_is_pro=true; path=/; max-age=31536000; SameSite=Lax";
      } catch {}
    }
  }, [isPro]);

  const effectivePro = isPro || clientPro;

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
      activeSkeleton = <ProgressInstantFallback isPro={effectivePro} />;
    } else if (navigatingTo === "/") {
      activeSkeleton = (
        <DashboardInstantFallback />
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
            <FitnessChatbot isPro={effectivePro} />
            <BottomNav isPro={effectivePro} />
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
