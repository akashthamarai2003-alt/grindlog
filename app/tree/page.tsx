"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Droplets,
  Leaf,
  Bird,
  Flower2,
  Bug,
  Star,
} from "lucide-react";
import { springs } from "@/animations/springs";
import { getLevel } from "@/lib/utils";
import { TreeSVG } from "@/components/tree/tree-svg";
import { TREE_STAGE_LABELS, TREE_STAGE_EMOJIS } from "@/features/tree/utils/tree-stage-engine";
import { cn } from "@/lib/utils";

const TREE_STATS = [
  { icon: Droplets, label: "Waters", value: "847", color: "#007AFF" },
  { icon: Leaf, label: "Leaves", value: "142", color: "#34C759" },
  { icon: Bug, label: "Butterflies", value: "23", color: "#FF9500" },
  { icon: Bird, label: "Birds", value: "5", color: "#5856D6" },
  { icon: Flower2, label: "Flowers", value: "8", color: "#FF3B30" },
  { icon: Star, label: "Golden", value: "1", color: "#FFD700" },
];

const GROWTH_JOURNEY = [
  { stage: "Seed", emoji: "🌰", label: "Day 1", unlocked: true, stageNum: 0 },
  { stage: "Sprout", emoji: "🌱", label: "Day 3", unlocked: true, stageNum: 1 },
  { stage: "Small Plant", emoji: "🌿", label: "Week 1", unlocked: true, stageNum: 2 },
  { stage: "Bush", emoji: "🪴", label: "Week 2", unlocked: true, stageNum: 3 },
  { stage: "Young Tree", emoji: "🌳", label: "Week 4", unlocked: false, stageNum: 4 },
  { stage: "Mature Tree", emoji: "🌳", label: "Week 8", unlocked: false, stageNum: 5 },
  { stage: "Flowering", emoji: "🌸", label: "Month 3", unlocked: false, stageNum: 6 },
  { stage: "Golden Tree", emoji: "✨", label: "Month 12", unlocked: false, stageNum: 7 },
];

export default function TreePage() {
  const router = useRouter();
  const { level, currentXp, xpForNext, progress, title } = getLevel(840);

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-4 safe-top">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]"
        >
          <ChevronLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </button>
        <h1 className="text-xl font-extrabold text-[var(--color-text-primary)]">
          The Tree of Life
        </h1>
      </div>

      {/* Full SVG Tree */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springs.bouncy}
        className="relative flex flex-col items-center justify-center rounded-[28px] bg-gradient-to-b from-[#e8f8ed] via-[var(--color-accent-green-light)] to-[var(--color-bg-secondary)] py-8"
      >
        <TreeSVG stage={3} size={260} interactive />

        <div className="mt-4 rounded-full bg-white/70 px-4 py-1.5">
          <span className="text-sm font-bold text-[var(--color-accent-green)]">
            Bush · Stage 3 of 8
          </span>
        </div>
      </motion.div>

      {/* Garden Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.2 }}
        className="rounded-2xl bg-[var(--color-bg-secondary)] p-4"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
            Garden Level {level}
          </span>
          <span className="text-xs font-medium tabular-nums text-[var(--color-text-tertiary)]">
            {currentXp}/{xpForNext} XP
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg-tertiary)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-green)] to-[var(--color-tree-mature)]"
          />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {TREE_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.default, delay: 0.2 + i * 0.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1 rounded-2xl bg-[var(--color-bg-secondary)] py-4"
          >
            <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
            <span className="text-xl font-extrabold tabular-nums text-[var(--color-text-primary)]">
              {stat.value}
            </span>
            <span className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Growth Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.35 }}
        className="rounded-2xl bg-[var(--color-bg-secondary)] p-5"
      >
        <h3 className="mb-4 text-sm font-bold text-[var(--color-text-primary)]">
          Growth Journey
        </h3>
        <div className="flex flex-col">
          {GROWTH_JOURNEY.map((stage, i) => (
            <div key={stage.stage} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm",
                    stage.unlocked
                      ? "bg-[var(--color-accent-green-light)]"
                      : "bg-[var(--color-bg-tertiary)] grayscale",
                  )}
                >
                  {stage.emoji}
                </div>
                {i < GROWTH_JOURNEY.length - 1 && (
                  <div
                    className={cn(
                      "h-8 w-0.5",
                      GROWTH_JOURNEY[i + 1].unlocked
                        ? "bg-[var(--color-accent-green)]/30"
                        : "bg-[var(--color-bg-tertiary)]",
                    )}
                  />
                )}
              </div>
              <div className="flex-1 pt-1.5">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    stage.unlocked
                      ? "text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-tertiary)]",
                  )}
                >
                  {stage.stage}
                  {i === 3 && (
                    <span className="ml-2 text-[10px] font-semibold text-[var(--color-accent-green)]">
                      ← You
                    </span>
                  )}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  {stage.unlocked ? `Unlocked · ${stage.label}` : stage.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="h-4" />
    </div>
  );
}
