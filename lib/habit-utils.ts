import { HabitFrequency } from "@/types";

export function isHabitScheduled(
  frequency: HabitFrequency | string | undefined,
  customDays: number[] | null | undefined,
  date: Date
): boolean {
  if (!frequency) return true; // Default to daily if missing
  if (frequency === "daily") return true;

  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  if (frequency === "weekdays") {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  if (frequency === "weekends") {
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  if (frequency === "custom" && Array.isArray(customDays)) {
    return customDays.includes(dayOfWeek);
  }

  return true; // Fallback
}
