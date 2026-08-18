"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BellOff, Bell, Brain, Flame, Trash2, Check, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/services/supabase/client";
import { formatDistanceToNow } from "date-fns";

export default function FitnessNotificationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("in_app_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);

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

  const getIcon = (type: string, read: boolean) => {
    const baseClass = read ? "text-gray-500" : "text-[#ADFF00]";
    switch (type) {
      case "ai": return <Brain className={`h-5 w-5 ${baseClass}`} />;
      case "streak": return <Flame className={`h-5 w-5 ${baseClass}`} />;
      case "plan": return <Zap className={`h-5 w-5 ${baseClass}`} />;
      default: return <Bell className={`h-5 w-5 ${baseClass}`} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-[radial-gradient(ellipse_at_top,#1A2619_0%,transparent_70%)] pointer-events-none opacity-50 z-0" />

      <div className="relative z-10 w-full max-w-md mx-auto px-5 pt-8 pb-28">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#111A10] border border-white/5 text-white/70 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="text-center">
            <h1 className="text-base font-black tracking-widest text-white uppercase">Notifications</h1>
            {notifications.filter(n => !n.read).length > 0 && (
              <p className="text-[11px] font-bold text-[#ADFF00] tracking-widest uppercase mt-1">
                {notifications.filter(n => !n.read).length} New
              </p>
            )}
          </div>
          
          <div className="w-10 h-10" />
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-end gap-3 mb-4">
            {notifications.some(n => !n.read) && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-[#ADFF00] transition-colors uppercase tracking-wider bg-[#121E12] px-3 py-1.5 rounded-full border border-[#1A2619]"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-red-400 transition-colors uppercase tracking-wider bg-[#121E12] px-3 py-1.5 rounded-full border border-[#1A2619]"
            >
              <Trash2 className="h-3 w-3" />
              Clear all
            </button>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500">
              <div className="w-8 h-8 rounded-full border-2 border-gray-600 border-t-[#ADFF00] animate-spin mb-4" />
              <p className="text-xs font-bold uppercase tracking-wider">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="py-16 flex flex-col items-center justify-center text-center bg-[#121E12] border border-[#1A2619] rounded-3xl p-6"
            >
              <div className="w-16 h-16 bg-[#1A2619] rounded-full flex items-center justify-center mb-4 border border-white/5">
                <BellOff className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-black text-white mb-2 tracking-tight">You're all caught up!</h3>
              <p className="text-xs text-gray-400 font-medium max-w-[250px]">
                No new notifications at the moment. Keep grinding on your transformation.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {notifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={notif.link || "#"}>
                    <div className={`p-4 rounded-2xl border transition-all ${
                      notif.read 
                        ? "bg-[#0A1108] border-[#1A2619] opacity-75" 
                        : "bg-[#121E12] border-[#ADFF00]/30 shadow-[0_0_15px_rgba(173,255,0,0.05)]"
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          notif.read ? "bg-[#1A2619]" : "bg-[#ADFF00]/10 border border-[#ADFF00]/20"
                        }`}>
                          {getIcon(notif.type, notif.read)}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`text-sm font-bold truncate ${notif.read ? "text-gray-300" : "text-white"}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] font-bold text-gray-500 shrink-0 uppercase tracking-wider">
                              {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className={`text-xs ${notif.read ? "text-gray-500" : "text-gray-400"} line-clamp-2`}>
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
