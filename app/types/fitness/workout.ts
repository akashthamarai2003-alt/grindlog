import { z } from "zod";

export const WorkoutStatusSchema = z.enum(["scheduled", "in_progress", "completed", "cancelled"]);
export const SessionStatusSchema = z.enum(["active", "paused", "completed", "cancelled"]);

export const StartWorkoutSchema = z.object({
  workoutId: z.string().uuid("Invalid workout ID"),
});

export const CompleteSetSchema = z.object({
  setId: z.string().uuid("Invalid set ID"),
  actualReps: z.number().int().min(0, "Reps cannot be negative").optional().nullable(),
  weightKg: z.number().min(0, "Weight cannot be negative").optional().nullable(),
  durationSeconds: z.number().int().min(0, "Duration cannot be negative").optional().nullable(),
});

export const SessionActionSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
});

export const DiscardWorkoutSchema = z.object({
  workoutId: z.string().uuid("Invalid workout ID"),
  sessionId: z.string().uuid("Invalid session ID").optional(),
});

export type WorkoutStatus = z.infer<typeof WorkoutStatusSchema>;
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export type FitnessWorkoutPlan = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  goal: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type FitnessWorkout = {
  id: string;
  user_id: string;
  plan_id: string | null;
  workout_date: string;
  name: string;
  status: WorkoutStatus;
  started_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
};

export type FitnessExercise = {
  id: string;
  workout_id: string;
  name: string;
  exercise_order: number;
  target_sets: number;
  target_reps: number | null;
  target_duration_seconds: number | null;
  rest_seconds: number;
  notes: string | null;
  created_at: string;
};

export type FitnessSet = {
  id: string;
  exercise_id: string;
  set_number: number;
  target_reps: number | null;
  actual_reps: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
};

export type FitnessWorkoutSession = {
  id: string;
  user_id: string;
  workout_id: string;
  started_at: string;
  paused_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  status: SessionStatus;
  created_at: string;
};

// Joined type for full workout execution data
export type FullWorkoutData = FitnessWorkout & {
  fitness_os_exercises: (FitnessExercise & {
    fitness_os_sets: FitnessSet[];
  })[];
  fitness_os_workout_sessions: FitnessWorkoutSession[];
};
