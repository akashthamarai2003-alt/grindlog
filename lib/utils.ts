import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getGreeting(): {
  greeting: string;
  emoji: string;
  subtitle: string;
} {
  const hour = new Date().getHours();
  if (hour < 12)
    return {
      greeting: "Good Morning",
      emoji: "👋",
      subtitle: "Let's make today count.",
    };
  if (hour < 17)
    return {
      greeting: "Good Afternoon",
      emoji: "☀️",
      subtitle: "Keep the momentum going.",
    };
  if (hour < 21)
    return {
      greeting: "Good Evening",
      emoji: "🌅",
      subtitle: "Finish strong today.",
    };
  return {
    greeting: "Good Night",
    emoji: "🌙",
    subtitle: "Reflect on your wins.",
  };
}

export function getLevel(xp: number): {
  level: number;
  currentXp: number;
  xpForNext: number;
  progress: number;
  title: string;
} {
  let level = 1;
  let xpNeeded = 100;
  let totalXpForLevel = 0;

  while (xp >= totalXpForLevel + xpNeeded) {
    totalXpForLevel += xpNeeded;
    level++;
    xpNeeded = Math.floor(100 * level * (1 + level * 0.15));
  }

  const currentLevelXp = xp - totalXpForLevel;

  const titles: Record<number, string> = {
    1: "Seed",
    2: "Sprout",
    3: "Seedling",
    5: "Small Plant",
    7: "Bush",
    10: "Tree",
    15: "Mature Tree",
    20: "Great Tree",
    25: "Ancient Tree",
    30: "Forest Guardian",
    40: "Tree of Life",
    50: "Legend",
  };

  let title = "Gardener";
  for (const [lvl, t] of Object.entries(titles)) {
    if (level >= Number(lvl)) title = t;
  }

  return {
    level,
    currentXp: currentLevelXp,
    xpForNext: xpNeeded,
    progress: currentLevelXp / xpNeeded,
    title,
  };
}
