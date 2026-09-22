"use client";

import { WorkoutPageData } from "@/types/fitness/workout-page";

const memoryWorkoutCache: Record<string, WorkoutPageData> = {};

export const workoutClientCache = {
  get(): WorkoutPageData | null {
    if (memoryWorkoutCache["current"]) {
      return memoryWorkoutCache["current"];
    }

    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("grindlog_workout_cache");
        if (stored) {
          const parsed = JSON.parse(stored) as WorkoutPageData;
          if (parsed && parsed.dateStr) {
            memoryWorkoutCache["current"] = parsed;
            return parsed;
          }
        }
      } catch {}
    }
    return null;
  },

  set(data: WorkoutPageData) {
    if (!data) return;
    memoryWorkoutCache["current"] = data;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("grindlog_workout_cache", JSON.stringify(data));
      } catch {}
    }
  },

  clear() {
    delete memoryWorkoutCache["current"];
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("grindlog_workout_cache");
      } catch {}
    }
  },

  notifyUpdated() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("grindlog_workout_updated"));
      try {
        localStorage.setItem("grindlog_workout_last_updated", String(Date.now()));
      } catch {}
    }
  }
};
