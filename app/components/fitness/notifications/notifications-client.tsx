"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BellOff,
  Dumbbell,
  Utensils,
  Zap,
  Trophy,
  Headphones,
  Sparkles,
  CheckCheck,
  Trash2,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FitnessNotificationItem,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  clearAllNotificationsAction,
  getOrSyncFitnessNotifications,
} from "@/app/actions/fitness-notifications";
import { toast } from "sonner";

interface NotificationsClientProps {
  initialNotifications: FitnessNotificationItem[];
  initialUnreadCount: number;
  userName?: string;
}

type CategoryTab = "all" | "workout" | "nutrition" | "subscription" | "support";

export function NotificationsClient({
  initialNotifications,
  initialUnreadCount,
  userName = "Athlete",
}: NotificationsClientProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<FitnessNotificationItem[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await getOrSyncFitnessNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        toast.success("Notifications updated");
      }
    } catch {
      toast.error("Failed to refresh notifications");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      const res = await markAllNotificationsAsReadAction();
      if (res.success) {
        toast.success("All notifications marked as read");
      }
    });
  };

  const handleClearAll = () => {
    const currentIds = notifications.map((n) => n.id);
    startTransition(async () => {
      setNotifications([]);
      const res = await clearAllNotificationsAction(currentIds);
      if (res.success) {
        toast.success("All notifications cleared");
      }
    });
  };

  const handleNotificationClick = async (notif: FitnessNotificationItem) => {
    if (!notif.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      markNotificationAsReadAction(notif.id).catch(() => null);
    }
    router.push(notif.link || "/");
  };

  // Filtered list
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "workout") return n.type === "workout";
    if (activeTab === "nutrition") return n.type === "nutrition";
    if (activeTab === "subscription") return n.type === "subscription";
    if (activeTab === "support") return n.type === "support";
    return true;
  });

  const getCategoryCount = (tab: CategoryTab) => {
    if (tab === "all") return notifications.length;
    return notifications.filter((n) => n.type === tab).length;
  };

  const getIcon = (type: FitnessNotificationItem["type"], read: boolean) => {
    switch (type) {
      case "workout":
        return <Dumbbell className={`h-5 w-5 ${read ? "text-emerald-500/70" : "text-[#ADFF00]"}`} />;
      case "nutrition":
        return <Utensils className={`h-5 w-5 ${read ? "text-amber-500/70" : "text-amber-400"}`} />;
      case "subscription":
        return <Zap className={`h-5 w-5 ${read ? "text-purple-400/70" : "text-purple-400"}`} />;
      case "milestone":
        return <Trophy className={`h-5 w-5 ${read ? "text-yellow-500/70" : "text-yellow-400"}`} />;
      case "support":
        return <Headphones className={`h-5 w-5 ${read ? "text-blue-400/70" : "text-blue-400"}`} />;
      default:
        return <Sparkles className={`h-5 w-5 ${read ? "text-cyan-400/70" : "text-cyan-400"}`} />;
    }
  };

  const getActionLabel = (type: FitnessNotificationItem["type"]) => {
    switch (type) {
      case "workout":
        return "Open Workout";
      case "nutrition":
        return "View Fuel Targets";
      case "subscription":
        return "Manage Membership";
      case "milestone":
        return "Start Check-in";
      case "support":
        return "View Ticket";
      default:
        return "Open Protocol";
    }
  };

  const tabs: { id: CategoryTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "workout", label: "Workouts" },
    { id: "nutrition", label: "Nutrition" },
    { id: "subscription", label: "Pass" },
    { id: "support", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-[radial-gradient(ellipse_at_top,#1A2619_0%,transparent_70%)] pointer-events-none opacity-60 z-0" />

      <div className="relative z-10 w-full max-w-md mx-auto px-4 pt-6 pb-28">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#121E12] border border-white/5 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center">
            <h1 className="text-sm font-black tracking-widest text-white uppercase">Notifications</h1>
            {unreadCount > 0 ? (
              <p className="text-[10px] font-black text-[#ADFF00] tracking-widest uppercase mt-0.5">
                {unreadCount} Unread Alert{unreadCount === 1 ? "" : "s"}
              </p>
            ) : (
              <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mt-0.5">
                All Caught Up
              </p>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#121E12] border border-white/5 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin text-[#ADFF00]" : ""} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-4">
          {tabs.map((tab) => {
            const count = getCategoryCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#ADFF00] text-[#0A1108] shadow-[0_0_12px_rgba(173,255,0,0.25)]"
                    : "bg-[#121E12] text-gray-400 border border-[#1A2619] hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-full leading-none ${
                      isActive ? "bg-[#0A1108]/20 text-[#0A1108]" : "bg-white/10 text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Action Bar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[11px] font-semibold text-gray-500">
              Showing {filteredNotifications.length} alert{filteredNotifications.length === 1 ? "" : "s"}
            </span>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={isPending}
                  className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-[#ADFF00] transition-colors uppercase tracking-wider bg-[#121E12] px-2.5 py-1 rounded-full border border-[#1A2619] active:scale-95 disabled:opacity-50"
                >
                  <CheckCheck className="h-3 w-3 text-[#ADFF00]" />
                  Mark read
                </button>
              )}
              <button
                onClick={handleClearAll}
                disabled={isPending}
                className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-red-400 transition-colors uppercase tracking-wider bg-[#121E12] px-2.5 py-1 rounded-full border border-[#1A2619] active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Notification Cards List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-14 px-6 flex flex-col items-center justify-center text-center bg-[#121E12] border border-[#1A2619] rounded-3xl"
            >
              <div className="w-14 h-14 bg-[#1A2619] rounded-2xl flex items-center justify-center mb-4 border border-[#ADFF00]/20 shadow-[0_0_20px_rgba(173,255,0,0.08)]">
                <BellOff className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-base font-black text-white mb-1.5 tracking-tight">
                {activeTab === "all" ? `You're all caught up, ${userName}!` : `No ${activeTab} alerts`}
              </h3>
              <p className="text-xs text-gray-400 font-medium max-w-[260px] leading-relaxed mb-6">
                {activeTab === "all"
                  ? "No unread alerts at the moment. Keep grinding on your training protocol and nutrition targets."
                  : `There are currently no active alerts in the ${activeTab} category.`}
              </p>

              {/* Quick Jump Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-xs">
                <Link
                  href="/workout"
                  className="flex-1 min-w-[120px] text-center py-2.5 px-3 rounded-xl bg-[#1A2619] hover:bg-[#223321] text-xs font-bold text-[#ADFF00] border border-[#ADFF00]/30 transition-all active:scale-95"
                >
                  Go to Workout →
                </Link>
                <Link
                  href="/nutrition"
                  className="flex-1 min-w-[120px] text-center py-2.5 px-3 rounded-xl bg-[#1A2619] hover:bg-[#223321] text-xs font-bold text-white border border-white/10 transition-all active:scale-95"
                >
                  Log Meals →
                </Link>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredNotifications.map((notif, index) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      notif.read
                        ? "bg-[#0E170E] border-[#182417] opacity-80 hover:opacity-100 hover:border-white/10"
                        : "bg-[#121E12] border-[#ADFF00]/35 shadow-[0_0_20px_rgba(173,255,0,0.06)] hover:border-[#ADFF00]/60"
                    }`}
                  >
                    {/* Unread Accent Indicator */}
                    {!notif.read && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#ADFF00] shadow-[0_0_8px_#ADFF00]" />
                    )}

                    <div className="flex items-start gap-3.5">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          notif.read
                            ? "bg-[#182417] border border-white/5"
                            : "bg-[#ADFF00]/10 border border-[#ADFF00]/25"
                        }`}
                      >
                        {getIcon(notif.type, notif.read)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <h4
                            className={`text-sm font-black tracking-tight truncate ${
                              notif.read ? "text-gray-300" : "text-white"
                            }`}
                          >
                            {notif.title}
                          </h4>
                        </div>

                        <p
                          className={`text-xs leading-relaxed line-clamp-2 ${
                            notif.read ? "text-gray-400" : "text-gray-300"
                          }`}
                        >
                          {notif.body}
                        </p>

                        {/* Action Link Footer */}
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-[10px] font-bold text-[#ADFF00] uppercase tracking-wider flex items-center gap-1 group-hover:underline">
                            {getActionLabel(notif.type)}
                            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                          </span>

                          <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">
                            GrindLog Alert
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
