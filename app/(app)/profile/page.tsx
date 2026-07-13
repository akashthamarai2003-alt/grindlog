"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  Settings,
  Bell,
  Shield,
  Download,
  Star,
  Trash2,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { springs } from "@/animations/springs";
import { useUIStore } from "@/store/ui-store";
import { useAuth } from "@/hooks/use-auth";

interface SettingItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  toggle?: boolean;
  hasValue?: boolean;
  value?: string;
  hasChevron?: boolean;
  danger?: boolean;
  action?: string;
}

const settingsGroups: { items: SettingItem[] }[] = [
  {
    items: [
      { icon: Moon, label: "Dark Theme", toggle: true, action: "theme" },
      { icon: Bell, label: "Notifications", hasValue: true, value: "On" },
      { icon: Shield, label: "Privacy", hasChevron: true },
    ],
  },
  {
    items: [
      { icon: Download, label: "Export Data", hasChevron: true },
      { icon: Star, label: "Premium", hasValue: true, value: "Free", action: "premium" },
    ],
  },
  {
    items: [
      { icon: Settings, label: "About", hasChevron: true },
      { icon: Trash2, label: "Delete Account", danger: true },
    ],
  },
];

export default function ProfilePage() {
  const { theme, toggleTheme } = useUIStore();
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-5 px-5 pb-40 pt-4 safe-top">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
      >
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Profile
        </h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.1 }}
        className="flex items-center gap-4 rounded-2xl bg-[var(--color-bg-secondary)] p-5"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent-green-light)] to-[var(--color-accent-green)] text-2xl shadow-lg shadow-[var(--color-accent-green)]/20">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar" className="h-full w-full rounded-2xl object-cover" />
          ) : (
            "👤"
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
            {user?.display_name || "User"}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {user?.email || ""}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-full bg-[var(--color-accent-green)]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-accent-green)]">
              Level {user?.level || 1} Gardener
            </span>
            <span className="rounded-full bg-[var(--color-xp)]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-xp)]">
              {user?.is_premium ? "Premium" : "Free"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Settings Groups */}
      {settingsGroups.map((group, gi) => (
        <motion.div
          key={gi}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.15 + gi * 0.05 }}
          className="overflow-hidden rounded-2xl bg-[var(--color-bg-secondary)]"
        >
          {group.items.map((item, ii) => (
            <div key={ii}>
              {ii > 0 && <div className="mx-4 h-px bg-[var(--color-bg-tertiary)]" />}
              <button
                onClick={() => {
                  if (item.action === "theme") toggleTheme();
                  else if (item.action === "premium") window.location.href = "/premium";
                  else alert("This feature is coming soon!");
                }}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
              >
                <item.icon
                  className={`h-5 w-5 ${
                    item.danger
                      ? "text-[var(--color-error)]"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                />
                <span
                  className={`flex-1 text-sm font-medium ${
                    item.danger
                      ? "text-[var(--color-error)]"
                      : "text-[var(--color-text-primary)]"
                  }`}
                >
                  {item.label}
                </span>
                {item.toggle && (
                  <div
                    className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                      theme === "dark"
                        ? "bg-[var(--color-accent-green)]"
                        : "bg-[var(--color-bg-tertiary)]"
                    }`}
                  >
                    <motion.div
                      className="h-5 w-5 rounded-full bg-white shadow-sm"
                      animate={{ x: theme === "dark" ? 20 : 0 }}
                      transition={springs.snappy}
                    />
                  </div>
                )}
                {item.hasValue && (
                  <span className="text-sm text-[var(--color-text-tertiary)]">
                    {item.value}
                  </span>
                )}
                {item.hasChevron && (
                  <ChevronRight className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                )}
              </button>
            </div>
          ))}
        </motion.div>
      ))}

      {/* Sign Out */}
      <motion.button
        onClick={async () => {
          const { createClient } = await import("@/lib/services/supabase/client");
          const supabase = createClient();
          await supabase.auth.signOut();
          window.location.href = "/auth/signin";
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-error)]/20 py-3.5 text-sm font-semibold text-[var(--color-error)] w-full"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </motion.button>

    </div>
  );
}
