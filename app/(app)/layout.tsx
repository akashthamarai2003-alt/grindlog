"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Home,
  BarChart3,
  Calendar,
  User,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { springs } from "@/animations/springs";

const tabs = [
  { id: "dashboard", label: "Home", icon: Home, path: "/dashboard" },
  { id: "calendar", label: "Calendar", icon: Calendar, path: "/calendar" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTab = tabs.find((t) => pathname.startsWith(t.path))?.id || "dashboard";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[var(--color-bg-secondary)] relative shadow-[0_0_50px_rgba(0,0,0,0.05)] ring-1 ring-gray-200 dark:ring-gray-900 overflow-x-hidden">
      {/* Main content */}
      <main className="flex-1 pb-32">{children}</main>

      {/* Tab Bar Container */}
      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2">
        
        {/* Floating Center Button (Perfectly centered in cutout) */}
        <div className="absolute -top-8 left-1/2 z-50 flex -translate-x-1/2 items-center justify-center">
          <Link href="/habits/new">
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#4E6BFF] shadow-[0_8px_25px_rgba(78,107,255,0.4)] text-white"
            >
              <Plus className="h-8 w-8" strokeWidth={2.5} />
            </motion.div>
          </Link>
        </div>

        {/* Solid Nav Bar with Perfect Cutout Mask */}
        <div style={{ filter: "drop-shadow(0 -6px 20px rgba(0,0,0,0.06))" }}>
          <nav 
            className="relative flex h-[85px] w-full items-center justify-between rounded-t-[32px] bg-[var(--color-bg-elevated)] px-8 safe-bottom"
            style={{
              WebkitMaskImage: "radial-gradient(circle at 50% 0px, transparent 40px, black 41px)",
              maskImage: "radial-gradient(circle at 50% 0px, transparent 40px, black 41px)"
            }}
          >
            
            {/* Left side tabs */}
            <div className="flex w-[40%] justify-between pb-2">
              {tabs.slice(0, 2).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <Link href={tab.path} key={tab.id} className="relative flex flex-col items-center justify-center gap-1.5 p-2 w-12">
                    <Icon
                      className={cn(
                        "h-[24px] w-[24px] transition-colors",
                        isActive
                          ? "text-[#4E6BFF]"
                          : "text-[var(--color-text-tertiary)]"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-bold transition-colors",
                        isActive
                          ? "text-[#4E6BFF]"
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
            <div className="flex w-[40%] justify-between pb-2">
              {tabs.slice(2, 4).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <Link href={tab.path} key={tab.id} className="relative flex flex-col items-center justify-center gap-1.5 p-2 w-12">
                    <Icon
                      className={cn(
                        "h-[24px] w-[24px] transition-colors",
                        isActive
                          ? "text-[#4E6BFF]"
                          : "text-[var(--color-text-tertiary)]"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-bold transition-colors",
                        isActive
                          ? "text-[#4E6BFF]"
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
