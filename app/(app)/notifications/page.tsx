"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, BellOff, Bell, Flame, Brain, Sprout, Loader2, X, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NotificationPrompt } from "@/components/notifications/notification-prompt";
import { createClient } from "@/lib/services/supabase/client";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch notifications
      const { data, error } = await supabase
        .from("in_app_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data);
      }
      setLoading(false);
    }
    loadNotifications();
  }, []);

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    await supabase
      .from("in_app_notifications")
      .update({ read: true })
      .in("id", unreadIds);
  };

  const clearAll = async () => {
    const ids = notifications.map(n => n.id);
    if (ids.length === 0) return;

    setNotifications([]);

    await supabase
      .from("in_app_notifications")
      .delete()
      .in("id", ids);
  };

  const clearNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    await supabase
      .from("in_app_notifications")
      .delete()
      .eq("id", id);
  };
  
  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    
    await supabase
      .from("in_app_notifications")
      .update({ read: true })
      .eq("id", id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "tree": return <Sprout className="h-5 w-5 text-green-500" />;
      case "streak": return <Flame className="h-5 w-5 text-orange-500" />;
      case "ai": return <Brain className="h-5 w-5 text-purple-500" />;
      default: return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
  <div className="flex flex-col min-h-dvh px-5 pb-8 pt-4 safe-top ">
      {/* Header */}
      <div className="flex items-center justify-between py-2 mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
            Notifications
          </h1>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-3">
            {notifications.some(n => !n.read) && (
              <button 
                onClick={markAllAsRead} 
                className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button 
              onClick={clearAll} 
              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col w-full max-w-md mx-auto">
        {loading ? (
          <div className="flex-1 flex items-center justify-center pt-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-tertiary)]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center pt-[15vh]">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-elevated)] mb-6 shadow-inner ring-1 ring-[var(--color-bg-tertiary)]"
            >
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--color-text-tertiary)]/30 animate-[spin_20s_linear_infinite]" />
              <BellOff className="h-10 w-10 text-[var(--color-text-tertiary)]/50 relative z-10" strokeWidth={1.5} />
            </motion.div>
            <h2 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)]">All Caught Up!</h2>
            <p className="mt-3 text-[15px] font-semibold leading-relaxed text-[var(--color-text-secondary)] text-center max-w-[280px]">
              You have no new notifications. Keep grinding and check back later!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {notifications.map((notif, i) => (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  className={`relative flex gap-4 p-4 rounded-2xl border cursor-pointer group ${notif.read ? 'bg-[var(--color-bg-primary)] border-[var(--color-bg-secondary)]' : 'bg-[var(--color-bg-elevated)] border-transparent shadow-sm'}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${notif.read ? 'bg-[var(--color-bg-secondary)]' : 'bg-white shadow-sm'}`}>
                      {getIcon(notif.type)}
                    </div>
                  </div>
                  <div className="flex-1 pr-6">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-sm text-[var(--color-text-primary)]">{notif.title}</h3>
                      <span className="text-[10px] whitespace-nowrap text-[var(--color-text-tertiary)]">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                      {notif.body}
                    </p>
                  </div>
                  
                  {/* Delete button (visible on hover) */}
                  <button 
                    onClick={(e) => clearNotification(notif.id, e)}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--color-text-tertiary)] hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                    aria-label="Clear notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  
                  {/* Unread indicator dot */}
                  {!notif.read && (
                    <div className="absolute top-5 right-4 h-2 w-2 rounded-full bg-blue-500 group-hover:opacity-0 transition-opacity"></div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-12 flex justify-center w-full">
          <div className="w-full max-w-sm">
            <NotificationPrompt />
          </div>
        </div>
      </div>
    </div>
  );
}
