// ─────────────────────────────────────────────────────────────────────────────
// Live Transformation Roadmap — Full Journey Types
// Covers: Phase 1 (M1-3) → Phase 2 (M4-6) → Phase 3 (M7+) → Goal
// ─────────────────────────────────────────────────────────────────────────────

/** A single month in the transformation journey */
export interface MonthMilestone {
  monthNumber: number;
  status: "completed" | "current" | "upcoming";
  dateRange: string;
  weekRange: string;

  // Phase context
  phaseName: string;
  focusArea: string;
  trainingFocus?: string;
  nutritionFocus?: string;

  // Weight
  projectedWeight: number;
  actualWeight: number | null;
  weightDelta: number | null;

  // Workout stats
  workoutsCompleted: number;
  workoutsScheduled: number;

  // Markers
  isPhaseEnd: boolean;
  isFinalGoal: boolean;
  milestone: string | null;
}

/** A multi-month phase block (3 months each) */
export interface PhaseBlock {
  phaseNumber: number;
  phaseName: string;
  status: "completed" | "current" | "upcoming";
  months: MonthMilestone[];
  /** Condensed weight range for collapsed display */
  weightRange: string;
}

/** Full journey data computed server-side */
export interface TransformationRoadmapData {
  // Journey overview
  journeyStartDate: string;
  totalMonthsProjected: number;
  currentMonth: number;
  currentWeekInMonth: number;
  currentDay: number;

  // Goal
  goal: string;
  direction: "loss" | "gain" | "maintain";
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  progressPercentage: number;

  // Phase structure
  phases: PhaseBlock[];

  // Aggregate stats
  totalWorkoutsCompleted: number;
  totalWorkoutsScheduled: number;
  streak: number;
  consistencyScore: number;
}
