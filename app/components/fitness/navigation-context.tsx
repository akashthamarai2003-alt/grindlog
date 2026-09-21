"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface NavigationContextType {
  navigatingTo: string | null;
  setNavigatingTo: (href: string | null) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  navigatingTo: null,
  setNavigatingTo: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // Clear navigatingTo once pathname matches or catches up with target
  useEffect(() => {
    if (navigatingTo) {
      const cleanPath = pathname ? (pathname.replace(/\/+$/, "") || "/") : "/";
      const cleanTarget = navigatingTo.replace(/\/+$/, "") || "/";
      if (cleanPath === cleanTarget || (cleanTarget === "/nutrition" && cleanPath === "/grocery")) {
        setNavigatingTo(null);
      }
    }
  }, [pathname, navigatingTo]);

  // Safety fallback: if navigation takes longer than 3.5s or gets cancelled, restore view
  useEffect(() => {
    if (navigatingTo) {
      const timer = setTimeout(() => {
        setNavigatingTo(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [navigatingTo]);

  return (
    <NavigationContext.Provider value={{ navigatingTo, setNavigatingTo }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useInstantNav() {
  return useContext(NavigationContext);
}
