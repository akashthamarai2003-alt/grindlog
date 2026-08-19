"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  name: string;
  dayNumber: number;
  avatarUrl?: string;
}

export function DashboardHeader({ name, dayNumber, avatarUrl }: DashboardHeaderProps) {
  // Determine time of day for greeting
  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        {/* Placeholder Avatar - matching the aesthetic */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1A2619] border border-[#ADFF00]/30 shadow-[0_0_15px_rgba(173,255,0,0.1)] shrink-0">
          {/* Using native img to avoid next/image domain restrictions for Google profiles */}
          <img 
            src={avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${name}&backgroundColor=ADFF00`}
            alt="Profile Avatar"
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex flex-col">
          <p className="text-sm font-medium text-white/60 flex items-center gap-1">
            {greeting} <span>👋</span>
          </p>
          <h1 className="text-xl font-bold text-white tracking-tight leading-tight max-w-[200px] truncate">
            {name}
          </h1>
          <p className="text-[11px] text-gray-400 font-medium tracking-widest uppercase mt-0.5">
            Day {dayNumber} of transformation
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/fitness/notifications" className="w-10 h-10 rounded-full bg-[#121E12] border border-[#1A2619] flex items-center justify-center relative hover:bg-[#1A2619] transition-colors">
          <Bell size={18} className="text-gray-300" />
          {/* Notification Dot */}
          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-[#121E12] flex items-center justify-center">
            <span className="text-[9px] font-bold text-white leading-none">3</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
