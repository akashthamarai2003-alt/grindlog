/** Individual week milestone in the 4-week mesocycle */
export interface WeekMilestone {
  weekNumber: number;
  status: "completed" | "current" | "upcoming";
  dateRange: string;
  startDate: string;
  endDate: string;

  workoutsCompleted: number;
  workoutsScheduled: number;

  projectedWeight: number | null;
  actualWeight: number | null;
  weightDelta: number | null;

  milestone: string | null;
}

/** Full roadmap payload computed server-side */
export interface TransformationRoadmapData {
  currentDay: number;
  currentWeek: number;
  currentMonth: number;
  totalWeeks: number;
  planStartDate: string;

  goal: string;
  direction: "loss" | "gain" | "maintain";
  phaseName: string;
  phaseDescription: string;

  startWeight: number;
  currentWeight: number;
  targetWeight: number;

  weeks: WeekMilestone[];

  totalWorkoutsCompleted: number;
  totalWorkoutsScheduled: number;
  streak: number;
  consistencyScore: number;
}
