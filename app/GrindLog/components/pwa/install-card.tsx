"use client";

import { useState, useEffect } from "react";
import { Download, Smartphone } from "lucide-react";

export function InstallAppCard() {
  const [isStandalone, setIsStandalone] = useState(true); // Default true to avoid hydration mismatch flash

  useEffect(() => {
    // Only show if NOT standalone
    if (
      !window.matchMedia("(display-mode: standalone)").matches &&
      !(window.navigator as any).standalone
    ) {
      setIsStandalone(false);
    }
  }, []);

  if (isStandalone) return null;

  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-install-modal"))}
      className="mb-6 w-full relative flex items-center justify-between overflow-hidden rounded-[24px] bg-gradient-to-r from-[var(--color-accent-green)] to-emerald-600 p-5 shadow-lg shadow-[var(--color-accent-green)]/20 transition-transform hover:scale-[0.98] active:scale-[0.95]"
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
          <Smartphone className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col items-start text-left">
          <h3 className="text-base font-bold text-white leading-tight">Install App</h3>
          <p className="text-[13px] font-medium text-white/90">Add to home screen</p>
        </div>
      </div>
      
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
        <Download className="h-5 w-5 text-white" />
      </div>

      {/* Decorative background rings */}
      <div className="absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -left-6 -bottom-10 h-24 w-24 rounded-full bg-black/10 blur-xl" />
    </button>
  );
}
