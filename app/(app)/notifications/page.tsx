"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, BellOff, Bell, Flame, Brain, Sprout, Loader2 } from "lucide-react";
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

        // Mark as read in the background
        const unreadIds = data.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length > 0) {
          await supabase
            .from("in_app_notifications")
            .update({ read: true })
            .in("id", unreadIds);
        }
      }
      setLoading(false);
    }
    loadNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "tree": return <Sprout className="h-5 w-5 text-green-500" />;
      case "streak": return <Flame className="h-5 w-5 text-orange-500" />;
      case "ai": return <Brain className="h-5 w-5 text-purple-500" />;
      default: return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col min-h-dvh px-5 pb-8 pt-4 safe-top bg-[var(--color-bg-primary)]">
      {/* Header */}
      <div className="flex items-center gap-4 py-2 mb-4">
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

      <div className="flex-1 flex flex-col w-full max-w-md mx-auto">
        {loading ? (
          <div className="flex-1 flex items-center justify-center pt-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-tertiary)]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center pt-20">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-20 w-20 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center mb-6 text-[var(--color-text-tertiary)]"
            >
              <BellOff className="h-8 w-8" strokeWidth={2} />
            </motion.div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">No new notifications</h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)] text-center max-w-[250px]">
              You're all caught up! Check back later for updates on your habits and achievements.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((notif, i) => (
              <motion.div 
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex gap-4 p-4 rounded-2xl border ${notif.read ? 'bg-[var(--color-bg-primary)] border-[var(--color-bg-secondary)]' : 'bg-[var(--color-bg-elevated)] border-transparent shadow-sm'}`}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${notif.read ? 'bg-[var(--color-bg-secondary)]' : 'bg-white shadow-sm'}`}>
                    {getIcon(notif.type)}
                  </div>
                </div>
                <div className="flex-1">
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
              </motion.div>
            ))}
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
