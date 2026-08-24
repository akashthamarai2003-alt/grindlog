/**
 * Linear Auto-Progression Logic
 * Independently implemented. Concept inspired by linear periodization principles.
 * NOT derived from openGym's progression.js (AGPL).
 */

export interface SetRecord {
  actual_reps: number | null;
  target_reps: number | null;
  weight_kg: string | number | null;
  completed: boolean | null;
}

export interface ProgressionSuggestion {
  suggestedWeightKg: number;
  reason: "increase" | "maintain" | "deload";
  label: string;
  delta: number; // Change from last weight (+2.5, 0, -10%)
}

const INCREASE_STEP_KG = 2.5; // Standard barbell micro-plate increment
const DELOAD_FACTOR = 0.9;    // 10% deload
const STALL_THRESHOLD = 2;    // Sessions failed before deload

/**
 * Determine progression suggestion for next session.
 *
 * @param recentSessions Array of sessions (newest first), each containing
 *   the sets performed for this exercise.
 * @param targetReps Target reps per set from the plan.
 */
export function suggestNextWeight(
  recentSessions: SetRecord[][],
  targetReps: number
): ProgressionSuggestion | null {
  if (!recentSessions || recentSessions.length === 0) return null;

  // Extract last session's sets
  const lastSets = recentSessions[0];
  if (!lastSets || lastSets.length === 0) return null;

  const completedSets = lastSets.filter(s => s.completed);
  if (completedSets.length === 0) return null;

  // Determine the working weight from last session (most common completed weight)
  const weights = completedSets
    .map(s => {
      const w = typeof s.weight_kg === "string" ? parseFloat(s.weight_kg) : (s.weight_kg ?? 0);
      return isNaN(w) ? 0 : w;
    })
    .filter(w => w > 0);

  if (weights.length === 0) return null;
  const lastWeight = Math.max(...weights);

  // Check if all sets hit or exceeded target reps (success)
  const allSetsSucceeded = completedSets.every(s => {
    const reps = s.actual_reps ?? 0;
    return reps >= (targetReps || 0);
  });

  // Count consecutive stalled sessions (only if we have history)
  let stalledSessions = 0;
  for (const session of recentSessions) {
    const sessCompleted = session.filter(s => s.completed);
    const sessSucceeded = sessCompleted.every(s => (s.actual_reps ?? 0) >= (targetReps || 0));
    if (!sessSucceeded) {
      stalledSessions++;
    } else {
      break; // Chain broken — reset stall count
    }
  }

  if (stalledSessions >= STALL_THRESHOLD) {
    const deloadWeight = Math.round(lastWeight * DELOAD_FACTOR * 2) / 2; // Round to nearest 0.5
    return {
      suggestedWeightKg: deloadWeight,
      reason: "deload",
      label: `Deload → ${deloadWeight} kg`,
      delta: deloadWeight - lastWeight,
    };
  }

  if (allSetsSucceeded) {
    const nextWeight = lastWeight + INCREASE_STEP_KG;
    return {
      suggestedWeightKg: nextWeight,
      reason: "increase",
      label: `Try ${nextWeight} kg`,
      delta: INCREASE_STEP_KG,
    };
  }

  return {
    suggestedWeightKg: lastWeight,
    reason: "maintain",
    label: `Same: ${lastWeight} kg`,
    delta: 0,
  };
}

/**
 * Format suggestion as a display string for the exercise UI
 */
export function formatProgressionLabel(suggestion: ProgressionSuggestion | null): string | null {
  if (!suggestion) return null;
  const emoji =
    suggestion.reason === "increase" ? "💪" :
    suggestion.reason === "deload" ? "⬇️" : "✓";
  return `${emoji} ${suggestion.label}`;
}
