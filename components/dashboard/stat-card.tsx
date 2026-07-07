"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { springs } from "@/animations/springs";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

export function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      transition={springs.micro}
      className="flex flex-col gap-2 rounded-2xl bg-[var(--color-bg-secondary)] p-4"
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: color + "18" }}
      >
        <Icon className="h-4.5 w-4.5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-extrabold tabular-nums text-[var(--color-text-primary)]">
          {value}
        </p>
        <p className="text-xs font-medium text-[var(--color-text-tertiary)]">
          {label}
        </p>
      </div>
    </motion.div>
  );
}
