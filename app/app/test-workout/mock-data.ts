import { WorkoutPageData } from "@/types/fitness/workout-page";

export const mockFreeWorkoutPageData: WorkoutPageData = {
  dateStr: "Tue, Sep 29",
  isFree: true,
  planBadge: "Preview Split",
  hasActivePlan: false,
  isPro: false,
  effectiveWeekDays: [
    { day: "MON", status: "completed", name: "Push Day", isToday: false },
    { day: "TUE", status: "today", name: "Pull Day", isToday: true },
    { day: "WED", status: "rest", name: "Rest", isToday: false },
    { day: "THU", status: "upcoming", name: "Leg Day", isToday: false },
    { day: "FRI", status: "upcoming", name: "Upper Body", isToday: false },
    { day: "SAT", status: "upcoming", name: "Core & Arms", isToday: false },
    { day: "SUN", status: "rest", name: "Rest", isToday: false },
  ],
  effectivePlanDays: [
    { day: "MON", status: "completed", name: "Push Day", isToday: false },
    { day: "TUE", status: "today", name: "Pull Day", isToday: true },
    { day: "WED", status: "rest", name: "Rest", isToday: false },
    { day: "THU", status: "upcoming", name: "Leg Day", isToday: false },
    { day: "FRI", status: "upcoming", name: "Upper Body", isToday: false },
    { day: "SAT", status: "upcoming", name: "Core & Arms", isToday: false },
    { day: "SUN", status: "rest", name: "Rest", isToday: false },
  ],
  effectiveWorkout: {
    id: "sample-free-pull",
    name: "Pull Day (Preview)",
    workout_date: "2026-09-29",
    status: "scheduled",
    duration_minutes: 45,
    difficulty_level: "Moderate",
    plan_data: { target_muscles: ["Back", "Biceps"] },
    fitness_os_exercises: [
      {
        id: "ex-free-1",
        name: "Lat Pulldown",
        target_sets: 3,
        target_reps: "10-12",
        rest_seconds: 60,
        fitness_os_sets: [
          { id: "s-free-1", set_number: 1, target_reps: 10, weight_kg: 45, completed: false },
          { id: "s-free-2", set_number: 2, target_reps: 10, weight_kg: 45, completed: false },
          { id: "s-free-3", set_number: 3, target_reps: 10, weight_kg: 45, completed: false },
        ]
      },
      {
        id: "ex-free-2",
        name: "Seated Cable Row",
        target_sets: 3,
        target_reps: "10-12",
        rest_seconds: 60,
        fitness_os_sets: [
          { id: "s-free-4", set_number: 1, target_reps: 10, weight_kg: 40, completed: false },
          { id: "s-free-5", set_number: 2, target_reps: 10, weight_kg: 40, completed: false },
        ]
      }
    ],
    exerciseCount: 2,
    completedExercises: 0,
  },
  nextWorkout: null,
  initialCoachNote: null,
};

export const mockProScheduledWorkoutPageData: WorkoutPageData = {
  dateStr: "Tue, Sep 29",
  isFree: false,
  planBadge: "4-Day Split",
  hasActivePlan: true,
  isPro: true,
  effectiveWeekDays: [
    { day: "MON", status: "completed", name: "Chest & Triceps", isToday: false },
    { day: "TUE", status: "today", name: "Back & Biceps", isToday: true },
    { day: "WED", status: "rest", name: "Rest", isToday: false },
    { day: "THU", status: "upcoming", name: "Legs & Core", isToday: false },
    { day: "FRI", status: "upcoming", name: "Shoulders & Arms", isToday: false },
    { day: "SAT", status: "rest", name: "Rest", isToday: false },
    { day: "SUN", status: "rest", name: "Rest", isToday: false },
  ],
  effectivePlanDays: [
    { day: "MON", status: "completed", name: "Chest & Triceps", isToday: false },
    { day: "TUE", status: "today", name: "Back & Biceps", isToday: true },
    { day: "WED", status: "rest", name: "Rest", isToday: false },
    { day: "THU", status: "upcoming", name: "Legs & Core", isToday: false },
    { day: "FRI", status: "upcoming", name: "Shoulders & Arms", isToday: false },
    { day: "SAT", status: "rest", name: "Rest", isToday: false },
    { day: "SUN", status: "rest", name: "Rest", isToday: false },
  ],
  effectiveWorkout: {
    id: "pro-workout-back",
    name: "Back & Biceps",
    workout_date: "2026-09-29",
    status: "scheduled",
    duration_minutes: 50,
    difficulty_level: "High",
    plan_data: { target_muscles: ["Back", "Biceps"] },
    fitness_os_exercises: [
      {
        id: "ex-pro-1",
        name: "Barbell Deadlift",
        target_sets: 3,
        target_reps: "6-8",
        rest_seconds: 120,
        fitness_os_sets: [
          { id: "s-pro-1", set_number: 1, target_reps: 8, weight_kg: 100, completed: false },
          { id: "s-pro-2", set_number: 2, target_reps: 8, weight_kg: 100, completed: false },
          { id: "s-pro-3", set_number: 3, target_reps: 6, weight_kg: 100, completed: false },
        ]
      },
      {
        id: "ex-pro-2",
        name: "Lat Pulldown",
        target_sets: 3,
        target_reps: "10-12",
        rest_seconds: 90,
        fitness_os_sets: [
          { id: "s-pro-4", set_number: 1, target_reps: 10, weight_kg: 55, completed: false },
          { id: "s-pro-5", set_number: 2, target_reps: 10, weight_kg: 55, completed: false },
          { id: "s-pro-6", set_number: 3, target_reps: 10, weight_kg: 55, completed: false },
        ]
      },
      {
        id: "ex-pro-3",
        name: "Barbell Bicep Curl",
        target_sets: 3,
        target_reps: "10-12",
        rest_seconds: 60,
        fitness_os_sets: [
          { id: "s-pro-7", set_number: 1, target_reps: 10, weight_kg: 25, completed: false },
          { id: "s-pro-8", set_number: 2, target_reps: 10, weight_kg: 25, completed: false },
          { id: "s-pro-9", set_number: 3, target_reps: 10, weight_kg: 25, completed: false },
        ]
      }
    ],
    exerciseCount: 3,
    completedExercises: 0,
  },
  nextWorkout: null,
  initialCoachNote: null,
};

export const mockProInProgressWorkoutPageData: WorkoutPageData = {
  dateStr: "Tue, Sep 29",
  isFree: false,
  planBadge: "4-Day Split",
  hasActivePlan: true,
  isPro: true,
  effectiveWeekDays: [
    { day: "MON", status: "completed", name: "Chest & Triceps", isToday: false },
    { day: "TUE", status: "today", name: "Back & Biceps", isToday: true },
    { day: "WED", status: "rest", name: "Rest", isToday: false },
    { day: "THU", status: "upcoming", name: "Legs & Core", isToday: false },
    { day: "FRI", status: "upcoming", name: "Shoulders & Arms", isToday: false },
    { day: "SAT", status: "rest", name: "Rest", isToday: false },
    { day: "SUN", status: "rest", name: "Rest", isToday: false },
  ],
  effectivePlanDays: [],
  effectiveWorkout: {
    id: "pro-workout-inprogress",
    name: "Back & Biceps",
    workout_date: "2026-09-29",
    status: "in_progress",
    duration_minutes: 50,
    difficulty_level: "High",
    plan_data: { target_muscles: ["Back", "Biceps"] },
    fitness_os_exercises: [
      {
        id: "ex-inp-1",
        name: "Barbell Deadlift",
        target_sets: 3,
        target_reps: "6-8",
        rest_seconds: 120,
        fitness_os_sets: [
          { id: "s-inp-1", set_number: 1, target_reps: 8, weight_kg: 100, completed: true, actual_reps: 8 },
          { id: "s-inp-2", set_number: 2, target_reps: 8, weight_kg: 100, completed: true, actual_reps: 8 },
          { id: "s-inp-3", set_number: 3, target_reps: 6, weight_kg: 100, completed: true, actual_reps: 6 },
        ]
      },
      {
        id: "ex-inp-2",
        name: "Lat Pulldown",
        target_sets: 3,
        target_reps: "10-12",
        rest_seconds: 90,
        fitness_os_sets: [
          { id: "s-inp-4", set_number: 1, target_reps: 10, weight_kg: 55, completed: false },
          { id: "s-inp-5", set_number: 2, target_reps: 10, weight_kg: 55, completed: false },
        ]
      }
    ],
    exerciseCount: 2,
    completedExercises: 1,
  },
  nextWorkout: null,
  initialCoachNote: null,
};

export const mockRestDayWorkoutPageData: WorkoutPageData = {
  dateStr: "Wed, Sep 30",
  isFree: false,
  planBadge: "4-Day Split",
  hasActivePlan: true,
  isPro: true,
  effectiveWeekDays: [
    { day: "MON", status: "completed", name: "Chest & Triceps", isToday: false },
    { day: "TUE", status: "completed", name: "Back & Biceps", isToday: false },
    { day: "WED", status: "today", name: "Rest", isToday: true },
    { day: "THU", status: "upcoming", name: "Legs & Core", isToday: false },
    { day: "FRI", status: "upcoming", name: "Shoulders & Arms", isToday: false },
    { day: "SAT", status: "rest", name: "Rest", isToday: false },
    { day: "SUN", status: "rest", name: "Rest", isToday: false },
  ],
  effectivePlanDays: [],
  effectiveWorkout: null,
  nextWorkout: {
    id: "pro-workout-legs",
    name: "Legs & Core",
    workout_date: "2026-10-01",
    status: "scheduled",
    duration_minutes: 55,
    difficulty_level: "High",
    exerciseCount: 4,
    completedExercises: 0,
    fitness_os_exercises: [
      { id: "leg-1", name: "Barbell Squats", target_sets: 4, target_reps: "8-10", rest_seconds: 120, fitness_os_sets: [] },
      { id: "leg-2", name: "Romanian Deadlift", target_sets: 3, target_reps: "10-12", rest_seconds: 90, fitness_os_sets: [] }
    ]
  },
  nextWorkoutLabel: "Thursday, Oct 1",
  initialCoachNote: null,
};

export const mockExecutionWorkout = {
  id: "exec-test-1",
  name: "Upper Body Hypertrophy",
  status: "in_progress",
  fitness_os_exercises: [
    {
      id: "exec-ex-1",
      name: "Bench Press",
      target_muscles: ["Chest"],
      target_sets: 2,
      target_reps: "8-10",
      rest_seconds: 60,
      fitness_os_sets: [
        { id: "s1", set_number: 1, target_reps: 10, weight_kg: 60, completed: false, actual_reps: null },
        { id: "s2", set_number: 2, target_reps: 8, weight_kg: 60, completed: false, actual_reps: null }
      ]
    },
    {
      id: "exec-ex-2",
      name: "Incline Dumbbell Press",
      target_muscles: ["Upper Chest"],
      target_sets: 2,
      target_reps: "10-12",
      rest_seconds: 60,
      fitness_os_sets: [
        { id: "s3", set_number: 1, target_reps: 12, weight_kg: 18, completed: false, actual_reps: null },
        { id: "s4", set_number: 2, target_reps: 10, weight_kg: 18, completed: false, actual_reps: null }
      ]
    }
  ],
  fitness_os_workout_sessions: [
    { id: "session-test-1", status: "active", started_at: new Date().toISOString() }
  ]
};
