"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Home,
  BarChart3,
  Calendar,
  LayoutGrid,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { springs } from "@/animations/springs";

const tabs = [
  { id: "dashboard", label: "Home", icon: Home, path: "/dashboard" },
  { id: "calendar", label: "Planner", icon: Calendar, path: "/calendar" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
  { id: "hub", label: "Hub", icon: LayoutGrid, path: "/hub" },
];

export default function ClientAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTab = tabs.find((t) => pathname.startsWith(t.path))?.id || "dashboard";

  return (
    <div className="isolate">

      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.05)] ring-1 ring-gray-200 dark:ring-gray-900 overflow-x-hidden">
        {/* Main content */}
        <main className="flex-1 pb-32">{children}</main>

        {/* Tab Bar Container */}
        <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 drop-shadow-[0_-8px_20px_rgba(0,0,0,0.06)]">
          
          {/* Perfect SVG Background with Smooth Notch */}
          <div className="absolute bottom-0 left-0 h-[85px] w-full">
            <svg width="100%" height="100%" viewBox="0 0 430 85" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Solid mask to hide scrolling content behind the notch */}
              <rect width="430" height="85" fill="var(--color-bg-secondary)" />
              <path 
                d="M 0,32 C 0,14.3 14.3,0 32,0 H 145 C 160,0 168,10 175,20 C 185,35 198,42 215,42 C 232,42 245,35 255,20 C 262,10 270,0 285,0 H 398 C 415.7,0 430,14.3 430,32 V 85 H 0 Z" 
                fill="var(--color-bg-elevated)"
              />
            </svg>
          </div>

          {/* Floating Center Button (Perfectly seated in the notch) */}
          <div className="absolute bottom-[46px] left-1/2 z-50 flex -translate-x-1/2 items-center justify-center">
            <Link href="/coach">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent-blue)] to-[#5856D6] shadow-[0_8px_20px_rgba(0,122,255,0.4)] text-white"
              >
                <Brain className="h-7 w-7" strokeWidth={2.5} />
              </motion.div>
            </Link>
          </div>

          {/* Nav Items Container */}
          <nav className="relative flex h-[85px] w-full items-center justify-between px-6 pb-safe">
            
            {/* Left side tabs */}
            <div className="flex w-[40%] items-center justify-around pb-2 pt-2">
              {tabs.slice(0, 2).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <Link href={tab.path} key={tab.id} prefetch={true} className="relative flex flex-1 flex-col items-center justify-center gap-1.5 p-1">
                    <Icon
                      className={cn(
                        "h-[24px] w-[24px] transition-colors",
                        isActive
                          ? "text-[var(--color-accent-green)]"
                          : "text-[var(--color-text-tertiary)]"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-bold transition-colors whitespace-nowrap",
                        isActive
                          ? "text-[var(--color-accent-green)]"
                          : "text-[var(--color-text-tertiary)]"
                      )}
                    >
                      {tab.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Right side tabs */}
            <div className="flex w-[40%] items-center justify-around pb-2 pt-2">
              {tabs.slice(2, 4).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <Link href={tab.path} key={tab.id} prefetch={true} className="relative flex flex-1 flex-col items-center justify-center gap-1.5 p-1">
                    <Icon
                      className={cn(
                        "h-[24px] w-[24px] transition-colors",
                        isActive
                          ? "text-[var(--color-accent-green)]"
                          : "text-[var(--color-text-tertiary)]"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-bold transition-colors whitespace-nowrap",
                        isActive
                          ? "text-[var(--color-accent-green)]"
                          : "text-[var(--color-text-tertiary)]"
                      )}
                    >
                      {tab.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
