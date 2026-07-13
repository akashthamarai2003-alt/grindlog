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
    <div className="flex min-h-dvh flex-col bg-[var(--color-bg-secondary)] relative">
      {/* Main content */}
      <main className="flex-1 pb-32">{children}</main>

      {/* Floating Pill Tab Bar */}
      <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-[400px] -translate-x-1/2 px-4 safe-bottom">
        <nav className="relative flex h-[72px] w-full items-center justify-between rounded-[36px] bg-[var(--color-bg-elevated)]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-gray-200/50 dark:border-gray-800/50 px-2">
          
          {/* Floating Center Button */}
          <div className="absolute -top-5 left-1/2 z-50 flex -translate-x-1/2 items-center justify-center">
            <Link href="/habits/new">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[var(--color-accent-green)] shadow-[var(--shadow-glow-green)] text-white border-[4px] border-[var(--color-bg-secondary)]"
              >
                <Plus className="h-7 w-7" strokeWidth={2.5} />
              </motion.div>
            </Link>
          </div>

          {/* Left side tabs */}
          <div className="flex flex-1 items-center justify-around pr-6">
            {tabs.slice(0, 2).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Link href={tab.path} key={tab.id} className="relative flex flex-col items-center justify-center gap-1 p-2 w-14">
                  <Icon
                    className={cn(
                      "h-[22px] w-[22px] transition-colors",
                      isActive
                        ? "text-[var(--color-accent-green)]"
                        : "text-[var(--color-text-tertiary)]"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-semibold transition-colors",
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

          {/* Spacer for FAB */}
          <div className="w-12 shrink-0" />

          {/* Right side tabs */}
          <div className="flex flex-1 items-center justify-around pl-6">
            {tabs.slice(2, 4).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Link href={tab.path} key={tab.id} className="relative flex flex-col items-center justify-center gap-1 p-2 w-14">
                  <Icon
                    className={cn(
                      "h-[22px] w-[22px] transition-colors",
                      isActive
                        ? "text-[var(--color-accent-green)]"
                        : "text-[var(--color-text-tertiary)]"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-semibold transition-colors",
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
  );
}
