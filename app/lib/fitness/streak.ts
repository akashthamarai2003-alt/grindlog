/**
 * Shared workout streak engine.
 *
 * Single source of truth for the "N Day Streak" shown on the Progress header,
 * the workout heatmap ("Current" / "Longest") and the Roadmap stats card.
 * Pure + isomorphic — safe to import from server services and client components.
 *
 * Streak rules (plan-aware):
 *  - A day with a completed workout extends the streak.
 *  - Today without a completed workout is a grace day (the streak is not lost
 *    until the day is over).
 *  - A past day that had a scheduled workout which was NOT completed (missed)
 *    breaks the streak.
 *  - A past day with nothing scheduled is a planned rest day: it neither adds
 *    to nor breaks the streak, up to `maxRestGap` consecutive rest days. This
 *    stops 3–5 day/week training plans from resetting to 0 on every rest day,
 *    while still ending the streak if the user stops training altogether.
 */

export const DEFAULT_MAX_REST_GAP = 2;

/** Workout statuses that, when dated in the past, count as a missed session. */
const MISSED_STATUSES = new Set(["scheduled", "skipped", "missed"]);

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Converts a date-only string, ISO timestamp or Date into a YYYY-MM-DD string
 * in the given IANA timezone. Date-only strings are returned unchanged because
 * they already represent a local calendar day.
 */
export function toLocalYMD(input: string | Date | null | undefined, timeZone = "UTC"): string {
  if (!input) return "";
  if (typeof input === "string" && YMD_RE.test(input)) return input;
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) {
    return typeof input === "string" ? input.split("T")[0] : "";
  }
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    // Invalid timezone string stored on profile — fall back to UTC.
    return d.toISOString().split("T")[0];
  }
}

/** Today's YYYY-MM-DD in the given timezone. */
export function todayInTimeZone(timeZone = "UTC", now: Date = new Date()): string {
  return toLocalYMD(now, timeZone);
}

/** Shifts a YYYY-MM-DD string by N calendar days (timezone-agnostic, UTC math). */
export function shiftYMD(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().split("T")[0];
}

export interface StreakWorkoutRow {
  status?: string | null;
  workout_date?: string | null;
  completed_at?: string | null;
}

/**
 * Splits raw workout rows into the local calendar days that were trained
 * (by actual completion time) and the past days whose scheduled workout was missed.
 */
export function buildStreakDateSets(
  workouts: StreakWorkoutRow[],
  timeZone: string,
  todayYMD: string = todayInTimeZone(timeZone)
): { completedDates: Set<string>; missedDates: Set<string> } {
  const completedDates = new Set<string>();
  const missedDates = new Set<string>();

  for (const w of workouts || []) {
    const status = String(w.status || "").toLowerCase();
    if (status === "completed") {
      // Prefer the real completion moment (converted to the user's day) so an
      // early/late session is credited to the day it was actually trained.
      const day = toLocalYMD(w.completed_at || w.workout_date, timeZone);
      if (day && day <= todayYMD) completedDates.add(day);
    } else if (MISSED_STATUSES.has(status)) {
      const day = toLocalYMD(w.workout_date, timeZone);
      if (day && day < todayYMD) missedDates.add(day);
    }
  }

  // A day on which the user trained is never a "missed" day.
  for (const d of completedDates) missedDates.delete(d);
  return { completedDates, missedDates };
}

export interface StreakResult {
  /** Current active streak (number of trained days). */
  current: number;
  /** Longest streak ever observed in the provided history. */
  longest: number;
  /** True if a workout has already been completed today. */
  trainedToday: boolean;
  /** Most recent trained day (YYYY-MM-DD) or null. */
  lastWorkoutDate: string | null;
}

export function computeWorkoutStreak(params: {
  completedDates: Iterable<string>;
  missedDates?: Iterable<string>;
  todayYMD: string;
  maxRestGap?: number;
}): StreakResult {
  const { todayYMD, maxRestGap = DEFAULT_MAX_REST_GAP } = params;
  const completed = new Set<string>();
  for (const d of params.completedDates) {
    const key = (d || "").split("T")[0];
    if (key && key <= todayYMD) completed.add(key);
  }
  const missed = new Set<string>();
  for (const d of params.missedDates || []) {
    const key = (d || "").split("T")[0];
    if (key && key < todayYMD && !completed.has(key)) missed.add(key);
  }

  const trainedToday = completed.has(todayYMD);
  if (completed.size === 0) {
    return { current: 0, longest: 0, trainedToday, lastWorkoutDate: null };
  }

  const sorted = Array.from(completed).sort();
  const lastWorkoutDate = sorted[sorted.length - 1];

  // ── Current streak: walk backwards from today ──
  let current = 0;
  let restGap = 0;
  let cursor = todayYMD;
  const earliest = sorted[0];
  while (cursor >= earliest) {
    if (completed.has(cursor)) {
      current++;
      restGap = 0;
    } else if (cursor === todayYMD) {
      // Grace: today isn't over yet.
    } else if (missed.has(cursor)) {
      break;
    } else {
      restGap++;
      if (restGap > maxRestGap) break;
    }
    cursor = shiftYMD(cursor, -1);
  }

  // ── Longest streak: forward scan across full history ──
  let longest = 0;
  let run = 0;
  let gap = 0;
  cursor = earliest;
  while (cursor <= todayYMD) {
    if (completed.has(cursor)) {
      run++;
      gap = 0;
      if (run > longest) longest = run;
    } else if (cursor !== todayYMD) {
      if (missed.has(cursor)) {
        run = 0;
        gap = 0;
      } else {
        gap++;
        if (gap > maxRestGap) {
          run = 0;
          gap = 0;
        }
      }
    }
    cursor = shiftYMD(cursor, 1);
  }

  return { current, longest: Math.max(longest, current), trainedToday, lastWorkoutDate };
}

/** Convenience: raw workout rows → streak result in the user's timezone. */
export function computeStreakFromWorkouts(
  workouts: StreakWorkoutRow[],
  timeZone: string,
  now: Date = new Date()
): StreakResult {
  const todayYMD = todayInTimeZone(timeZone, now);
  const { completedDates, missedDates } = buildStreakDateSets(workouts, timeZone, todayYMD);
  return computeWorkoutStreak({ completedDates, missedDates, todayYMD });
}

/** Human label for the streak badge. */
export function formatStreakLabel(streak: number): string {
  if (!streak || streak <= 0) return "Start your streak";
  return `${streak} Day Streak`;
}
