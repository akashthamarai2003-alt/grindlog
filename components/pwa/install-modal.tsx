"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Share, PlusSquare, Download } from "lucide-react";
import Image from "next/image";

// Global event store for the prompt so we don't lose it
let globalDeferredPrompt: any = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
  });
}

export function InstallModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-install-modal", handleOpen);
    return () => window.removeEventListener("open-install-modal", handleOpen);
  }, []);

  useEffect(() => {
    // Detect if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Sync with global prompt
    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      globalDeferredPrompt = e;
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isOpen]); // Re-run when opened just in case

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
      setIsOpen(false);
    }
  };

  if (isStandalone) return null; // Don't show if already installed

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-white/20 bg-[#1a1f2e] p-6 shadow-2xl pointer-events-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent-green)] to-emerald-600 shadow-lg shadow-[var(--color-accent-green)]/20">
                  <Download className="h-8 w-8 text-white" />
                </div>
                
                <h2 className="mb-2 text-2xl font-bold text-white">
                  Install GrindLog
                </h2>
                <p className="mb-6 text-sm text-gray-300">
                  Add GrindLog to your home screen for a faster, full-screen native experience!
                </p>

                {isIOS ? (
                  <div className="w-full rounded-xl bg-white/5 border border-white/10 p-5 text-left">
                    <ol className="flex flex-col gap-4 text-sm font-medium text-gray-200">
                      <li className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
                          1
                        </span>
                        <span>
                          Tap the <Share className="mx-1 inline h-4 w-4" /> Share button below
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
                          2
                        </span>
                        <span>
                          Scroll down and tap{" "}
                          <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="mx-1 inline h-4 w-4" />
                        </span>
                      </li>
                    </ol>
                  </div>
                ) : (
                  <button
                    onClick={handleInstallClick}
                    disabled={!deferredPrompt}
                    className="w-full rounded-xl bg-[var(--color-accent-green)] py-3.5 font-bold text-black shadow-lg shadow-[var(--color-accent-green)]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {deferredPrompt ? "Install Now" : "Install from Browser Menu"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
