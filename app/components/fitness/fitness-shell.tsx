"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./dashboard/bottom-nav";
import { FitnessChatbot } from "./chatbot/fitness-chatbot";
import { NavigationProvider, useInstantNav } from "./navigation-context";

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

  // Native Android-style navigation: keep current screen visible while tab transitions,
  // showing a sleek 2.5px glowing green top progress line instead of destroying the view with skeletons.
  const isNavigatingAway = Boolean(navigatingTo && navigatingTo !== cleanPath);

  return (
    <div className="flex justify-center min-h-screen bg-[#0A1108]">
      {/* Native-style sleek top indicator when switching tabs */}
      {isNavigatingAway && (
        <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] overflow-hidden bg-black/40 pointer-events-none">
          <div className="h-full bg-gradient-to-r from-[#ADFF00] via-[#c4ff33] to-[#ADFF00] shadow-[0_0_12px_#ADFF00] animate-pulse w-full" />
        </div>
      )}

      <div className="w-full min-h-[100dvh] relative flex flex-col overflow-x-hidden">
        <main className={`flex-1 ${isMainPage ? 'pb-24' : ''}`}>
          {children}
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
