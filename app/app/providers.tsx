"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export function Providers({ children, initialTheme = "default" }: { children: React.ReactNode, initialTheme?: string }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  
  // Hydrate auth globally
  useAuth();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
  }, []);

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
