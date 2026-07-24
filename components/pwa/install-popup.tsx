"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, X } from "lucide-react";

export function InstallPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    // Only show if NOT standalone
    const isPwa = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    setIsStandalone(!!isPwa);

    if (!isPwa) {
      // Delay showing the popup by 3 seconds so it's not too aggressive
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed right-4 top-4 z-[60] flex w-[300px] max-w-[calc(100vw-32px)] cursor-pointer items-center justify-between overflow-hidden rounded-2xl bg-black/60 p-3 pr-2 shadow-2xl backdrop-blur-xl border border-white/20 sm:top-6 sm:right-6"
          onClick={() => {
            window.dispatchEvent(new Event("open-install-modal"));
            setIsVisible(false);
          }}
        >
          {/* Subtle green glow */}
          <div className="absolute -left-4 top-0 h-16 w-16 rounded-full bg-[var(--color-accent-green)]/30 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-accent-green)] to-emerald-600 shadow-md">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <h4 className="text-sm font-bold text-white leading-tight">Install App</h4>
              <p className="text-[11px] font-medium text-white/80">Add to home screen</p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="relative z-10 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
