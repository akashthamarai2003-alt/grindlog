import type { TreeStage } from "@/types";

export const TREE_STAGES = {
  SEED: 0,
  SPROUT: 1,
  SMALL_PLANT: 2,
  BUSH: 3,
  YOUNG_TREE: 4,
  MATURE_TREE: 5,
  FLOWERING: 6,
  GOLDEN: 7,
} as const;

export const TREE_STAGE_LABELS: Record<TreeStage, string> = {
  0: "Seed",
  1: "Sprout",
  2: "Small Plant",
  3: "Bush",
  4: "Young Tree",
  5: "Mature Tree",
  6: "Flowering Tree",
  7: "Golden Tree",
};

export const TREE_STAGE_EMOJIS: Record<TreeStage, string> = {
  0: "🌰",
  1: "🌱",
  2: "🌿",
  3: "🪴",
  4: "🌳",
  5: "🌳",
  6: "🌸",
  7: "✨",
};

interface TreeState {
  stage: TreeStage;
  waterCount: number;
  leafCount: number;
  butterflyCount: number;
  birdCount: number;
  flowerCount: number;
  isGolden: boolean;
}

/**
 * Calculate tree stage based on cumulative metrics.
 */
export function calculateTreeStage({
  waterCount,
  longestStreak,
  totalCompletions,
}: {
  waterCount: number;
  longestStreak: number;
  totalCompletions: number;
}): TreeState {
  const stage = determineStage(waterCount, longestStreak, totalCompletions);

  return {
    stage,
    waterCount,
    leafCount: Math.floor(waterCount / 7),
    butterflyCount: longestStreak >= 21 ? Math.floor(longestStreak / 21) : 0,
    birdCount: longestStreak >= 30 ? Math.floor(longestStreak / 30) : 0,
    flowerCount: longestStreak >= 60 ? Math.floor(longestStreak / 60) : 0,
    isGolden: stage === 7,
  };
}

function determineStage(
  waterCount: number,
  longestStreak: number,
  totalCompletions: number,
): TreeStage {
  // Golden tree: 365+ day streak or 10,000+ completions
  if (longestStreak >= 365 || totalCompletions >= 10000) return 7;

  // Flowering: 100+ day streak or 5,000+ completions
  if (longestStreak >= 100 || totalCompletions >= 5000) return 6;

  // Mature tree: 60+ day streak or 1,000+ completions
  if (longestStreak >= 60 || totalCompletions >= 1000) return 5;

  // Young tree: 30+ day streak or 500+ completions
  if (longestStreak >= 30 || totalCompletions >= 500) return 4;

  // Bush: 14+ day streak or 200+ completions
  if (longestStreak >= 14 || totalCompletions >= 200) return 3;

  // Small plant: 7+ day streak or 50+ completions
  if (longestStreak >= 7 || totalCompletions >= 50) return 2;

  // Sprout: 3+ day streak or 1+ completions
  if (longestStreak >= 3 || totalCompletions >= 1) return 1;

  return 0;
}

/**
 * Calculate what elements unlock next and at what threshold.
 */
export function getNextUnlock(stage: TreeStage, waterCount: number) {
  const thresholds: { element: string; emoji: string; at: number }[] = [
    { element: "Sprout", emoji: "🌱", at: 1 },
    { element: "Small Plant", emoji: "🌿", at: 3 },
    { element: "Leaves", emoji: "🍃", at: 7 },
    { element: "Bush", emoji: "🪴", at: 14 },
    { element: "Small Flowers", emoji: "🌸", at: 21 },
    { element: "Butterflies", emoji: "🦋", at: 30 },
    { element: "Young Tree", emoji: "🌳", at: 50 },
    { element: "Birds", emoji: "🕊️", at: 60 },
    { element: "Mature Tree", emoji: "🌳", at: 100 },
    { element: "Large Flowers", emoji: "🌺", at: 150 },
    { element: "Flowering Tree", emoji: "🌸", at: 200 },
    { element: "Golden Tree", emoji: "✨", at: 365 },
  ];

  return thresholds.find((t) => waterCount < t.at) || null;
}
