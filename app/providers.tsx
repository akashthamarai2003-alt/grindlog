"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

export function Providers({ children, initialTheme = "default" }: { children: React.ReactNode, initialTheme?: string }) {
  const theme = useUIStore((s) => s.theme);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    const root = document.documentElement;
    
    // Clear old theme classes dynamically
    const classes = Array.from(root.classList);
    classes.forEach(c => {
      if (c.startsWith("theme-")) {
        root.classList.remove(c);
      }
    });
    root.classList.remove("dark");
    
    if (theme === "dark") {
      root.classList.add("dark");
    }
    
    if (initialTheme && initialTheme !== "default") {
      root.classList.add(`theme-${initialTheme.replace('_theme', '')}`);
    }
  }, [theme, initialTheme]);

  return (
    <div
      className={cn(
        "mx-auto min-h-dvh",
        !isAdmin && "max-w-[430px]",
        "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]",
        "relative overflow-x-hidden"
      )}
    >
      {children}
      <Toaster position="bottom-center" richColors />
    </div>
  );
}
