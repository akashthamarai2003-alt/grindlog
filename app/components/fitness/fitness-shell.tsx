"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "./dashboard/bottom-nav";
import { FitnessChatbot } from "./chatbot/fitness-chatbot";
import { NavigationProvider, useInstantNav } from "./navigation-context";
import { DashboardSkeleton } from "./dashboard/dashboard-skeleton";
import { WorkoutSkeleton } from "./workout/workout-skeleton";
import NutritionLoading from "@/app/(fitness)/nutrition/loading";
import ProgressLoading from "@/app/(fitness)/progress/loading";
import ProfileLoading from "@/app/(fitness)/profile/loading";

// Primary root tab pages supported by the native warm-tab container
const MAIN_PAGES = new Set([
  "/",
  "/workout",
  "/nutrition",
  "/diet",
  "/progress",
  "/profile",
]);

function getTabSkeleton(tab: string) {
  switch (tab) {
    case "/workout":
      return <WorkoutSkeleton />;
    case "/nutrition":
    case "/diet":
      return <NutritionLoading />;
    case "/progress":
      return <ProgressLoading />;
    case "/profile":
      return <ProfileLoading />;
    case "/":
    default:
      return (
        <div className="w-full max-w-md mx-auto px-4 pt-6">
          <DashboardSkeleton />
        </div>
      );
  }
}

function FitnessShellInner({ children, isPro = false }: { children: React.ReactNode; isPro?: boolean }) {
  const pathname = usePathname();
  const { navigatingTo } = useInstantNav();

  // Normalize pathname by stripping trailing slashes for robust matching
  const cleanPath = pathname ? (pathname.replace(/\/+$/, "") || "/") : "/";
  const isMainPage = MAIN_PAGES.has(cleanPath);

  // Tab cache stores the rendered React elements for each visited main tab.
  // Initialized with the current SSR page so initial load has zero hydration mismatch.
  const [tabCache, setTabCache] = useState<Record<string, React.ReactNode>>(() => {
    if (isMainPage && children) {
      return { [cleanPath]: children };
    }
    return {};
  });

  const scrollPositions = useRef<Record<string, number>>({});
  const prevTabRef = useRef<string>(cleanPath);

  // Active tab determination: if a navigation is in-flight to a main tab, switch immediately at 0ms!
  const targetTab = navigatingTo && MAIN_PAGES.has(navigatingTo) ? navigatingTo : cleanPath;
  const activeTab = isMainPage ? targetTab : cleanPath;

  // Whenever Next.js completes navigation and provides updated children for a main page,
  // save it into tabCache so it stays warm and up-to-date.
  useEffect(() => {
    if (isMainPage && children) {
      setTabCache((prev) => ({
        ...prev,
        [cleanPath]: children,
      }));
    }
  }, [cleanPath, children, isMainPage]);

  // Per-tab scroll preservation (Native Android / iOS ViewPager behavior)
  useEffect(() => {
    if (!isMainPage) return;

    if (prevTabRef.current !== activeTab) {
      if (typeof window !== "undefined") {
        // Save scroll position of the previous tab
        scrollPositions.current[prevTabRef.current] = window.scrollY;
        prevTabRef.current = activeTab;

        // Restore scroll position of the newly active tab
        const savedY = scrollPositions.current[activeTab] || 0;
        window.scrollTo({ top: savedY, behavior: "instant" });

        // Dispatch background events so listening components can silently re-sync data
        window.dispatchEvent(new CustomEvent("grindlog_tab_switched", { detail: { tab: activeTab } }));
        if (activeTab === "/") {
          window.dispatchEvent(new CustomEvent("grindlog_meals_updated"));
        }
      }
    }
  }, [activeTab, isMainPage]);

  // If navigating to an unvisited tab, show the top indicator while the server completes the background fetch
  const isColdNavigation = Boolean(navigatingTo && navigatingTo !== cleanPath && !tabCache[navigatingTo]);

  return (
    <div className="flex justify-center min-h-screen bg-[#0A1108]">
      {/* Sleek top indicator when fetching an unvisited tab */}
      {isColdNavigation && (
        <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] overflow-hidden bg-black/40 pointer-events-none">
          <div className="h-full bg-gradient-to-r from-[#ADFF00] via-[#c4ff33] to-[#ADFF00] shadow-[0_0_12px_#ADFF00] animate-pulse w-full" />
        </div>
      )}

      <div className="w-full min-h-[100dvh] relative flex flex-col overflow-x-hidden">
        {/* For non-main sub-pages (e.g. active workout session /workout/[id], /grocery), render directly */}
        {!isMainPage ? (
          <main className="flex-1">
            {children}
          </main>
        ) : (
          <main className="flex-1 pb-24">
            {/* Render all warm tabs in memory, toggling visibility in 0ms */}
            {Object.entries(tabCache).map(([tabKey, tabNode]) => {
              const isCurrent = tabKey === activeTab;
              return (
                <div
                  key={tabKey}
                  style={{ display: isCurrent ? "block" : "none" }}
                  aria-hidden={!isCurrent}
                  className={isCurrent ? "animate-in fade-in duration-100" : ""}
                >
                  {tabNode}
                </div>
              );
            })}

            {/* If the active tab hasn't finished initial server render yet, show its skeleton in 0ms */}
            {!tabCache[activeTab] && (
              <div className="animate-in fade-in duration-100">
                {getTabSkeleton(activeTab)}
              </div>
            )}
          </main>
        )}

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
