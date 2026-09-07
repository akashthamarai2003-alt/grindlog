"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function ProUpgradeModal({
  isOpen,
  onClose,
  featureName = "This feature",
}: ProUpgradeModalProps) {
  const pathname = usePathname();
  const returnTo = pathname || "/";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="relative w-full max-w-sm bg-[#111A10] border border-[#ADFF00]/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(173,255,0,0.2)] overflow-hidden z-10"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#ADFF00]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Header */}
            <div className="w-12 h-12 rounded-2xl bg-[#ADFF00]/15 border border-[#ADFF00]/30 flex items-center justify-center text-[#ADFF00] mb-4 shadow-[0_0_15px_rgba(173,255,0,0.25)]">
              <Lock className="w-6 h-6" />
            </div>

            {/* Badge & Title */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#ADFF00] text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Pro Feature
              </span>
            </div>

            <h3 className="text-xl font-black text-white leading-tight mb-2">
              Unlock {featureName}
            </h3>

            <p className="text-xs text-white/70 leading-relaxed mb-5">
              Core members can preview these pages, but interactive tracking, logging, and AI coach tools require GrindLog Pro.
            </p>

            {/* Pro Benefits List */}
            <div className="space-y-2 mb-6 bg-black/40 border border-white/5 rounded-2xl p-3.5 text-xs text-white/85">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#ADFF00]/20 flex items-center justify-center text-[#ADFF00] shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Personalized 7-day meals & smart swaps</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#ADFF00]/20 flex items-center justify-center text-[#ADFF00] shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Full food, macro, and water logging</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#ADFF00]/20 flex items-center justify-center text-[#ADFF00] shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Photo body scans & measurement history</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#ADFF00]/20 flex items-center justify-center text-[#ADFF00] shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>24/7 Unlimited AI Coaching with Luna</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2.5">
              <Link
                href={`/payment?returnTo=${encodeURIComponent(returnTo)}&intent=upgrade_pro`}
                onClick={onClose}
                className="w-full py-3.5 bg-[#ADFF00] hover:bg-[#c4ff33] text-black font-black uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.35)] active:scale-[0.98] transition-all"
              >
                <span>Upgrade to Pro</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs font-bold text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                Keep Browsing Preview
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
