"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./dashboard/bottom-nav";
import { FitnessChatbot } from "./chatbot/fitness-chatbot";

// Only primary root tab pages show the bottom navigation bar and floating AI coach button
const MAIN_PAGES = new Set([
  "/",
  "/workout",
  "/nutrition",
  "/diet",
  "/progress",
  "/profile",
]);

export function FitnessShell({ children, isPro = false }: { children: React.ReactNode; isPro?: boolean }) {
  const pathname = usePathname();
  
  // Normalize pathname by stripping trailing slashes for robust matching
  const cleanPath = pathname ? (pathname.replace(/\/+$/, "") || "/") : "/";
  const isMainPage = MAIN_PAGES.has(cleanPath);

  return (
    <div className="flex justify-center min-h-screen bg-[#0A1108]">
      <div className="w-full min-h-[100dvh] relative flex flex-col overflow-x-hidden">
        <main className={`flex-1 ${isMainPage ? 'pb-24' : ''}`}>
          {children}
        </main>
        {isMainPage && (
          <>
            {isPro && <FitnessChatbot />}
            <BottomNav isPro={isPro} />
          </>
        )}
      </div>
    </div>
  );
}
