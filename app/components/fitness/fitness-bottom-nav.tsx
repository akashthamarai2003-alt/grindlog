"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Dumbbell, Utensils, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/fitness" },
  { id: "workout", label: "Workout", icon: Dumbbell, path: "/fitness/workout" },
  { id: "diet", label: "Diet", icon: Utensils, path: "/fitness/diet" },
  { id: "progress", label: "Progress", icon: TrendingUp, path: "/fitness/progress" },
  { id: "profile", label: "Profile", icon: User, path: "/fitness/profile" },
];

export function FitnessBottomNav() {
  const pathname = usePathname();
  
  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[390px] -translate-x-1/2 bg-white border-t border-gray-100 shadow-[0_-8px_20px_rgba(0,0,0,0.02)] pb-safe">
      <nav className="flex h-[80px] w-full items-center justify-around px-2 pb-2 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          // Match exact path for Home since it's the root /fitness
          const isActive = tab.path === "/fitness" 
            ? pathname === "/fitness" 
            : pathname?.startsWith(tab.path);
            
          return (
            <Link 
              href={tab.path} 
              key={tab.id} 
              className="flex flex-1 flex-col items-center justify-center gap-1.5 p-2"
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-all duration-200",
                  isActive ? "text-[#10b981] scale-110" : "text-gray-400"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-bold transition-colors",
                  isActive ? "text-[#10b981]" : "text-gray-400"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
