"use client";

import { Bell, Bot } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/services/supabase/client";

interface DashboardHeaderProps {
  name: string;
  dayNumber: number;
  avatarUrl?: string;
}

export function DashboardHeader({ name, dayNumber, avatarUrl }: DashboardHeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnreadCount() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('in_app_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (count !== null) {
        setUnreadCount(count);
      }
    }
    fetchUnreadCount();
  }, []);

  // Determine time of day for greeting
  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Profile Avatar - Tappable to open Profile */}
        <Link 
          href="/profile" 
          prefetch={true}
          className="w-12 h-12 rounded-full overflow-hidden bg-[#1A2619] border-2 border-[#ADFF00]/40 shadow-[0_0_15px_rgba(173,255,0,0.15)] shrink-0 active:scale-95 hover:border-[#ADFF00] transition-all group"
          title="View Profile"
        >
          <img 
            src={avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${name}&backgroundColor=ADFF00`}
            alt="Profile Avatar"
            width={48}
            height={48}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </Link>
        
        <div className="flex flex-col min-w-0">
          <p className="text-xs font-semibold text-white/50 flex items-center gap-1.5">
            {greeting} <span className="inline-block animate-wave">👋</span>
          </p>
          <h1 className="text-2xl font-black text-white tracking-tight leading-tight truncate mt-0.5">
            {name}
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/25 text-[10px] font-black text-[#ADFF00] tracking-widest uppercase shadow-[0_0_10px_rgba(173,255,0,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF00] animate-pulse" />
              Day {dayNumber} of Transformation
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("open_fitness_chatbot"));
          }}
          className="w-10 h-10 rounded-full bg-[#121E12] border border-[#ADFF00]/40 text-[#ADFF00] shadow-[0_0_12px_rgba(173,255,0,0.2)] flex items-center justify-center relative hover:bg-[#1A2619] active:scale-95 transition-all cursor-pointer group"
          title="Open AI Fitness Coach"
        >
          <Bot size={18} className="group-hover:scale-110 transition-transform" />
          <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ADFF00] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ADFF00] border-2 border-[#121E12]" />
          </span>
        </button>

        <Link 
          href="/notifications" 
          prefetch={true} 
          className="w-10 h-10 rounded-full bg-[#121E12] border border-[#1A2619] flex items-center justify-center relative hover:bg-[#1A2619] hover:border-white/10 active:scale-95 transition-all"
          title="Notifications"
        >
          <Bell size={18} className="text-gray-300" />
          {/* Notification Dot */}
          {unreadCount > 0 && (
            <div className="absolute top-0 right-0 min-w-[16px] h-[16px] px-1 bg-red-500 rounded-full border-2 border-[#121E12] flex items-center justify-center">
              <span className="text-[8px] font-black text-white leading-none">{unreadCount > 9 ? '9+' : unreadCount}</span>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}
