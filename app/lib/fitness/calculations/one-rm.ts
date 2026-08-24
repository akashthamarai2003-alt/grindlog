/**
 * Estimated 1-Rep Maximum Calculations
 * Independently implemented mathematical formulas.
 * Sources: Epley (1985), Brzycki (1993), Lombardi (1989)
 * These are standard published formulas, not derived from any third-party code.
 */

/** Maximum reps for reliable 1RM estimation — beyond 12 reps accuracy degrades */
export const ONE_RM_REP_CAP = 12;

/**
 * Epley (1985) — most common formula, good for moderate rep ranges (3-10)
 * 1RM = weight × (1 + reps / 30)
 */
export function epley1RM(weight: number, reps: number): number | null {
  if (reps <= 0 || weight <= 0 || reps > ONE_RM_REP_CAP) return null;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Brzycki (1993) — conservative estimate, better for lower reps (1-6)
 * 1RM = weight × 36 / (37 - reps)
 */
export function brzycki1RM(weight: number, reps: number): number | null {
  if (reps <= 0 || weight <= 0 || reps > ONE_RM_REP_CAP || reps >= 37) return null;
  if (reps === 1) return weight;
  return Math.round((weight * 36) / (37 - reps) * 10) / 10;
}

/**
 * Lombardi (1989) — power formula
 * 1RM = weight × reps^0.10
 */
export function lombardi1RM(weight: number, reps: number): number | null {
  if (reps <= 0 || weight <= 0 || reps > ONE_RM_REP_CAP) return null;
  if (reps === 1) return weight;
  return Math.round(weight * Math.pow(reps, 0.10) * 10) / 10;
}

/**
 * Primary function: Epley formula (default, most widely used)
 */
export function estimated1RM(weight: number, reps: number): number | null {
  return epley1RM(weight, reps);
}

/**
 * Format 1RM for display — shows "XX kg" or null string
 */
export function format1RM(weight: number, reps: number): string {
  const val = estimated1RM(weight, reps);
  if (val === null) return "";
  return `~${val} kg`;
}

/**
 * Get the best (highest estimated 1RM) set from a list of sets
 */
export function bestEstimated1RM(
  sets: { weight_kg: string | number | null; actual_reps: number | null; completed: boolean | null }[]
): number | null {
  let best: number | null = null;
  for (const s of sets) {
    if (!s.completed) continue;
    const w = typeof s.weight_kg === "string" ? parseFloat(s.weight_kg) : (s.weight_kg ?? 0);
    const r = s.actual_reps ?? 0;
    if (w <= 0 || r <= 0) continue;
    const e = estimated1RM(w, r);
    if (e !== null && (best === null || e > best)) best = e;
  }
  return best;
}
