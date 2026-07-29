"use client";

import { motion, AnimatePresence } from "motion/react";
import { Crown, CheckCircle2, Zap, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProUpgradeModal({
  isOpen,
  onClose,
  title = "Upgrade to GrindLog Pro",
  description = "Unlock the Personal AI Growth Coach, Smart Routine Builder, Unlimited Habits, & Analytics.",
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-sm rounded-[28px] bg-[var(--color-bg-primary)] p-6 shadow-2xl border border-[var(--color-bg-tertiary)] flex flex-col gap-5 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header Icon */}
          <div className="flex flex-col items-center text-center gap-2 pt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD60A] to-[#FF9500] shadow-md shadow-amber-500/20">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight mt-1">
              {title}
            </h2>
            <p className="text-xs font-medium text-[var(--color-text-secondary)] leading-relaxed px-2">
              {description}
            </p>
          </div>

          {/* Key Pro Benefits List */}
          <div className="flex flex-col gap-2.5 bg-[var(--color-bg-secondary)] p-4 rounded-2xl border border-[var(--color-bg-tertiary)]">
            {[
              "Personalized AI Growth Coach & Daily Tasks",
              "Smart AI Schedule Builder & Chronotype Sync",
              "Unlimited Active Habits & Smart Reminders",
              "Full Life Tracking & Virtual Growth Tree",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#34C759]" />
                <span className="text-xs font-bold text-[var(--color-text-primary)]">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                onClose();
                router.push("/payment");
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#34C759] to-[#28A745] text-sm font-black text-white shadow-lg shadow-green-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Zap className="h-4 w-4" />
              <span>Upgrade to Pro Now</span>
            </button>

            <button
              onClick={onClose}
              className="h-10 w-full rounded-xl text-xs font-bold text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
