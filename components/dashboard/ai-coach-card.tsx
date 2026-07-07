"use client";

import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { springs } from "@/animations/springs";

interface AICoachCardProps {
  message: string;
}

export function AICoachCard({ message }: AICoachCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...springs.default, delay: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-[var(--color-accent-blue)]/20 bg-gradient-to-br from-[var(--color-accent-blue-light)] to-[var(--color-bg-secondary)] p-4"
    >
      {/* Glow */}
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[var(--color-accent-blue)]/10 blur-2xl" />

      <div className="relative flex items-start gap-3">
        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-blue)]/15"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="h-5 w-5 text-[var(--color-accent-blue)]" />
        </motion.div>

        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-blue)]">
            AI Coach
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-primary)]">
            {message}
          </p>

          <motion.button
            whileTap={{ scale: 0.96 }}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent-blue)]"
          >
            Get Boost
            <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
