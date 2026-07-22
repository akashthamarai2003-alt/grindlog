"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  Settings,
  Bell,
  Download,
  Star,
  Trash2,
  LogOut,
  ChevronRight,
  Edit2,
  Sparkles,
  Award,
} from "lucide-react";
import { springs } from "@/animations/springs";
import { useUIStore } from "@/store/ui-store";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { requestFirebaseNotificationPermission } from "@/lib/firebase/client";
import { exportUserData } from "@/app/actions/export";
import * as XLSX from "xlsx";

interface SettingItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  toggle?: boolean;
  hasValue?: boolean;
  value?: string;
  hasChevron?: boolean;
  danger?: boolean;
  action?: string;
  highlight?: boolean;
}

export default function ProfilePage() {
  const { theme, toggleTheme, notificationsEnabled, setNotificationsEnabled, toggleNotifications, addToast } = useUIStore();
  const { user } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Sync initial notification state from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isRegistered = localStorage.getItem("fcm_registered") === "true";
      setNotificationsEnabled(isRegistered);
    }
  }, [setNotificationsEnabled]);
  
  const settingsGroups: { items: SettingItem[] }[] = [
    {
      items: [
        { icon: Bell, label: "Notifications", toggle: true, action: "notifications" },
      ],
    },
    {
      items: [
        { icon: Download, label: "Export Data", hasChevron: true, action: "export" },
        { 
          icon: Star, 
          label: "Account", 
          hasValue: true, 
          value: user?.premium_level === "pro" ? "Pro" : "Core", 
          action: "premium", 
          highlight: user?.premium_level === "pro"
        },
      ],
    },
    {
      items: [
        { icon: Settings, label: "About & Support", hasChevron: true, action: "support" },
        { icon: Trash2, label: "Delete Account", danger: true, action: "delete" },
      ],
    },
  ];
  
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    addToast({ title: "Export Started", description: "Preparing your data...", type: "success" });
    try {
      const res = await exportUserData();
      if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to export");
      }
      
      const { profile, habits, habitLogs, journalEntries, goals, fitnessLogs } = res.data as any;

      // Create workbook and add sheets
      const wb = XLSX.utils.book_new();

      // Profile Sheet (array of one object)
      const profileSheet = XLSX.utils.json_to_sheet([profile]);
      XLSX.utils.book_append_sheet(wb, profileSheet, "Profile");

      // Habits Sheet
      if (habits && habits.length > 0) {
        const habitsSheet = XLSX.utils.json_to_sheet(habits);
        XLSX.utils.book_append_sheet(wb, habitsSheet, "Habits");
      }

      // Habit Logs Sheet
      if (habitLogs && habitLogs.length > 0) {
        const logsSheet = XLSX.utils.json_to_sheet(habitLogs);
        XLSX.utils.book_append_sheet(wb, logsSheet, "Habit Logs");
      }

      // Journal Sheet
      if (journalEntries && journalEntries.length > 0) {
        const journalSheet = XLSX.utils.json_to_sheet(journalEntries);
        XLSX.utils.book_append_sheet(wb, journalSheet, "Journal");
      }

      // Goals Sheet
      if (goals && goals.length > 0) {
        const goalsSheet = XLSX.utils.json_to_sheet(goals);
        XLSX.utils.book_append_sheet(wb, goalsSheet, "Goals");
      }

      // Fitness Sheet
      if (fitnessLogs && fitnessLogs.length > 0) {
        const fitnessSheet = XLSX.utils.json_to_sheet(fitnessLogs);
        XLSX.utils.book_append_sheet(wb, fitnessSheet, "Fitness Logs");
      }

      // Write workbook to buffer and trigger download
      XLSX.writeFile(wb, `grindlog_export_${new Date().toISOString().split("T")[0]}.xlsx`);
      
      addToast({ title: "Export Complete", description: "Your data has been downloaded.", type: "success" });
    } catch (e: any) {
      addToast({ title: "Export Failed", description: e.message || "Could not export data.", type: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleNotificationToggle = async () => {
    // Turning off: unregister from backend
    if (notificationsEnabled) {
      setIsRegistering(true);
      try {
        const token = localStorage.getItem("fcm_token");
        if (token) {
          await fetch("/api/fcm/unregister", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
        }
        localStorage.removeItem("fcm_registered");
        localStorage.removeItem("fcm_token");
        localStorage.setItem("fcm_disabled_manually", "true");
        toggleNotifications();
        addToast({ title: "Notifications Disabled", description: "You will no longer receive reminders.", type: "success" });
      } catch (e) {
        addToast({ title: "Error", description: "Could not disable notifications.", type: "error" });
      } finally {
        setIsRegistering(false);
      }
      return;
    }

    // Turning on: request permission
    setIsRegistering(true);
    try {
      const oldToken = localStorage.getItem("fcm_token");
      const token = await requestFirebaseNotificationPermission();
      
      if (!token) {
        addToast({ title: "Permission Denied", description: "Please enable notifications in your browser settings.", type: "error" });
        setIsRegistering(false);
        return;
      }

      const res = await fetch("/api/fcm/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, oldToken }),
      });

      if (!res.ok) throw new Error("Registration failed");
      
      localStorage.setItem("fcm_registered", "true");
      localStorage.setItem("fcm_token", token);
      localStorage.removeItem("fcm_disabled_manually");
      
      toggleNotifications(); // Finally flip it on
      addToast({ title: "Notifications Enabled", description: "You will now receive reminders.", type: "success" });
    } catch (e) {
      addToast({ title: "Error", description: "Could not enable notifications.", type: "error" });
    } finally {
      setIsRegistering(false);
    }
  };

  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const currentLevelXp = xp % 1000;
  const progressPct = Math.round((currentLevelXp / 1000) * 100);

  return (
    <div className="relative flex flex-col gap-6 px-5 pb-28 pt-6 safe-top min-h-dvh overflow-hidden bg-[var(--color-bg-primary)]">
      
      {/* Static Background Orbs (Removed animation to fix lag on mobile) */}
      <div className="absolute top-0 left-0 w-full h-[300px] overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--color-accent-green)]/20 blur-[60px] rounded-full" />
        <div className="absolute top-20 -left-10 w-48 h-48 bg-[#007AFF]/15 blur-[50px] rounded-full" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="relative z-10 flex items-center justify-between"
      >
        <h1 className="text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
          Profile
        </h1>
        <Link href="/profile/edit">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] shadow-sm hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Edit2 className="h-4.5 w-4.5" />
          </motion.button>
        </Link>
      </motion.div>

      {/* Premium Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.1 }}
        className="relative z-10 overflow-hidden rounded-[28px] bg-[var(--color-bg-elevated)] p-6 shadow-xl ring-1 ring-[var(--color-bg-tertiary)]/50"
      >
        <div className="flex items-center gap-5">
          <div 
            className={cn(
              "relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-[var(--color-accent-green-light)] to-[var(--color-accent-green)] text-3xl shadow-lg shadow-[var(--color-accent-green)]/25 ring-4 ring-[var(--color-bg-primary)] z-10",
              user?.equipped_frame && user.equipped_frame !== "none" ? `frame-${user.equipped_frame.replace('_frame', '')}` : ""
            )}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="h-full w-full rounded-[20px] object-cover" />
            ) : (
              "👤"
            )}
            
            {/* Level Badge Overlay */}
            <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#FFD700] text-[10px] font-black text-[#8B6508] ring-2 ring-[var(--color-bg-elevated)] shadow-sm">
              {level}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-xl font-black text-[var(--color-text-primary)]">
              {user?.display_name || "User"}
            </h3>
            <p className="truncate text-sm font-medium text-[var(--color-text-tertiary)]">
              {user?.email || ""}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-[var(--color-accent-green)]/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--color-accent-green)]">
                <Award className="h-3 w-3" />
                Gardener
              </span>
              {user?.premium_level === "pro" ? (
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FFD700]/20 to-[#FF9500]/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#d48806] ring-1 ring-[#FFD700]/30">
                  <Sparkles className="h-3 w-3" />
                  PRO
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-[var(--color-bg-tertiary)]/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)] ring-1 ring-[var(--color-bg-tertiary)]/50">
                  <Star className="h-3 w-3" />
                  CORE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-6 flex flex-col gap-2 rounded-2xl bg-[var(--color-bg-secondary)] p-3.5">
          <div className="flex items-center justify-between px-1 text-xs font-bold">
            <span className="text-[var(--color-text-secondary)]">Level {level}</span>
            <span className="text-[var(--color-text-primary)]">{currentLevelXp} <span className="text-[var(--color-text-tertiary)]">/ 1000 XP</span></span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-tertiary)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="absolute h-full rounded-full bg-gradient-to-r from-[var(--color-accent-green-light)] to-[var(--color-accent-green)] shadow-[0_0_10px_rgba(52,199,89,0.5)]"
            />
          </div>
        </div>
      </motion.div>

      {/* Settings Groups */}
      <div className="relative z-10 flex flex-col gap-4 mt-2">
        {settingsGroups.map((group, gi) => (
          <motion.div
            key={gi}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.default, delay: 0.15 + gi * 0.05 }}
            className="overflow-hidden rounded-[24px] bg-[var(--color-bg-secondary)] shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50"
          >
            {group.items.map((item, ii) => (
              <div key={ii}>
                {ii > 0 && <div className="mx-5 h-px bg-[var(--color-bg-tertiary)]/60" />}
                <button
                  disabled={(item.action === "notifications" && isRegistering) || (item.action === "export" && isExporting)}
                  onClick={() => {
                    if (item.action === "theme") toggleTheme();
                    else if (item.action === "notifications") handleNotificationToggle();
                    else if (item.action === "premium") window.location.href = "/payment";
                    else if (item.action === "export") handleExportData();
                    else if (item.action === "support") window.location.href = "/support";
                    else alert("This feature is coming soon!");
                  }}
                  className="group relative flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--color-bg-tertiary)]/30 active:bg-[var(--color-bg-tertiary)]/50 disabled:opacity-50"
                >
                  <div className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                    item.danger ? "bg-red-500/10" : item.highlight ? "bg-[#FFD700]/15" : "bg-[var(--color-bg-tertiary)]"
                  )}>
                    <item.icon
                      className={cn(
                        "h-4.5 w-4.5 transition-transform group-active:scale-90",
                        item.danger ? "text-red-500" : item.highlight ? "text-[#d48806] fill-[#d48806]/20" : "text-[var(--color-text-secondary)]"
                      )}
                    />
                  </div>
                  
                  <span
                    className={cn(
                      "flex-1 text-[15px] font-bold tracking-tight",
                      item.danger ? "text-red-500" : item.highlight ? "text-[#d48806]" : "text-[var(--color-text-primary)]"
                    )}
                  >
                    {item.label}
                  </span>

                  {item.toggle && (
                    <div
                      className={cn(
                        "flex h-[26px] w-[46px] items-center rounded-full p-1 transition-colors duration-300",
                        (item.action === "theme" ? theme === "dark" : notificationsEnabled) 
                          ? "bg-[var(--color-accent-green)]" 
                          : "bg-[var(--color-text-tertiary)]/30"
                      )}
                    >
                      <motion.div
                        className="h-4.5 w-4.5 rounded-full bg-white shadow-sm"
                        animate={{ x: (item.action === "theme" ? theme === "dark" : notificationsEnabled) ? 20 : 0 }}
                        transition={springs.snappy}
                      />
                    </div>
                  )}

                  {item.hasValue && !item.toggle && (
                    <span className="text-[13px] font-bold text-[var(--color-text-tertiary)]">
                      {item.value}
                    </span>
                  )}

                  {item.hasChevron && (
                    <ChevronRight className="h-5 w-5 text-[var(--color-text-tertiary)] transition-transform group-active:translate-x-1" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Sign Out Trigger */}
      <motion.button
        onClick={() => setShowSignOutModal(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 mt-2 flex items-center justify-center gap-2 rounded-[24px] bg-red-500/10 py-4 text-[15px] font-black tracking-tight text-red-500 transition-all hover:bg-red-500/15 active:scale-[0.98]"
      >
        <LogOut className="h-5 w-5" strokeWidth={2.5} />
        Sign Out
      </motion.button>

      {/* Sign Out Modal */}
      <AnimatePresence>
        {showSignOutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => !isSigningOut && setShowSignOutModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xs overflow-hidden rounded-[28px] bg-[var(--color-bg-elevated)] p-6 shadow-2xl ring-1 ring-white/10"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-500 mx-auto">
                <LogOut className="h-7 w-7" strokeWidth={2.5} />
              </div>
              <h2 className="mb-2 text-center text-xl font-black text-[var(--color-text-primary)]">
                Sign Out
              </h2>
              <p className="mb-6 text-center text-sm font-medium text-[var(--color-text-secondary)] leading-relaxed">
                Are you sure you want to sign out of your GrindLog account?
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    setIsSigningOut(true);
                    const { createClient } = await import("@/lib/services/supabase/client");
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    window.location.href = "/auth/signin";
                  }}
                  disabled={isSigningOut}
                  className="flex w-full items-center justify-center h-12 rounded-xl bg-red-500 font-bold text-white transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSigningOut ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Signing out...
                    </div>
                  ) : (
                    "Yes, sign me out"
                  )}
                </button>
                
                <button
                  onClick={() => setShowSignOutModal(false)}
                  disabled={isSigningOut}
                  className="flex w-full items-center justify-center h-12 rounded-xl bg-[var(--color-bg-secondary)] font-bold text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-bg-tertiary)] active:scale-[0.98] disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
