"use client";

import { Home, Dumbbell, Utensils, User, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav({ isPro = false }: { isPro?: boolean }) {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Dumbbell, label: "Workout", href: "/workout" },
    ...(isPro ? [
      { icon: Utensils, label: "Meals", href: "/nutrition" },
      { icon: TrendingUp, label: "Progress", href: "/progress" },
    ] : []),
    { icon: User, label: "Profile", href: "/profile" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4 bg-gradient-to-t from-[#0A1108] via-[#0A1108]/90 to-transparent">
      <div className="max-w-sm mx-auto bg-[#121E12] border border-[#1A2619] rounded-full px-6 py-3 flex items-center justify-between shadow-2xl backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex flex-col items-center gap-1 group relative"
            >
              {isActive && (
                <div className="absolute -inset-2 bg-[#ADFF00]/10 rounded-full blur-md" />
              )}
              
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isActive 
                  ? 'bg-[#ADFF00] text-black shadow-[0_0_15px_rgba(173,255,0,0.4)]' 
                  : 'text-gray-400 group-hover:text-white'
              }`}>
                <Icon size={isActive ? 18 : 20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${
                isActive ? 'text-[#ADFF00]' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
