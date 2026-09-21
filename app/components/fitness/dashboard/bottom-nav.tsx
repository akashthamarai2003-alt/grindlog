"use client";

import { Home, Dumbbell, Utensils, User, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function BottomNav({ isPro = false }: { isPro?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Dumbbell, label: "Workout", href: "/workout" },
    { icon: Utensils, label: "Meals", href: "/nutrition", proOnly: true },
    { icon: TrendingUp, label: "Progress", href: "/progress", proOnly: true },
    { icon: User, label: "Profile", href: "/profile" }
  ];

  // Eagerly prefetch all 5 primary routes into router cache on mount
  useEffect(() => {
    navItems.forEach((item) => {
      try {
        router.prefetch(item.href);
      } catch {
        // ignore prefetch errors
      }
    });
  }, [router]);

  // Reset optimistic state as soon as pathname catches up
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  // Safety timer in case navigation is cancelled or interrupted
  useEffect(() => {
    if (pendingHref) {
      const timer = setTimeout(() => {
        setPendingHref(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [pendingHref]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4 bg-gradient-to-t from-[#0A1108] via-[#0A1108]/90 to-transparent pointer-events-none">
      <div className="max-w-sm mx-auto bg-[#121E12] border border-[#1A2619] rounded-full px-5 py-3 flex items-center justify-between shadow-2xl backdrop-blur-xl pointer-events-auto">
        {navItems.map((item) => {
          const isCurrentRoute = pathname === item.href || (item.href === "/nutrition" && pathname === "/grocery");
          const isActive = pendingHref ? pendingHref === item.href : isCurrentRoute;
          const isPendingThis = pendingHref === item.href && !isCurrentRoute;
          const Icon = item.icon;

          return (
            <Link 
              key={item.href} 
              href={item.href}
              prefetch={true}
              onClick={(e) => {
                if (pathname === item.href) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  return;
                }
                // Instant 0ms visual feedback
                setPendingHref(item.href);
              }}
              onTouchStart={() => {
                try {
                  router.prefetch(item.href);
                } catch {}
              }}
              onPointerDown={() => {
                try {
                  router.prefetch(item.href);
                } catch {}
              }}
              className="flex flex-col items-center gap-1 group relative active:scale-90 transition-transform duration-100 touch-manipulation select-none"
            >
              {isActive && (
                <div className="absolute -inset-2 bg-[#ADFF00]/15 rounded-full blur-md" />
              )}
              
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isActive 
                  ? 'bg-[#ADFF00] text-black shadow-[0_0_15px_rgba(173,255,0,0.4)]' 
                  : 'text-gray-400 group-hover:text-white'
              }`}>
                <Icon size={isActive ? 18 : 20} strokeWidth={isActive ? 2.5 : 2} />
                {item.proOnly && !isPro && (
                  <span className="absolute -top-1 -right-1 bg-[#ADFF00] text-black text-[7px] font-black px-1 rounded-full uppercase tracking-tight shadow-sm">
                    PRO
                  </span>
                )}
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
