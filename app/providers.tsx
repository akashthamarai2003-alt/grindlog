"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div
      className={cn(
        "mx-auto min-h-dvh max-w-[430px]",
        "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]",
        "relative overflow-x-hidden"
      )}
    >
      {children}
    </div>
  );
}
