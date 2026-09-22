const workoutPageCache = new Map<string, { timestamp: number; data: any }>();
const WORKOUT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedWorkoutPageData(key: string): any | null {
  const cached = workoutPageCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > WORKOUT_CACHE_TTL) {
    workoutPageCache.delete(key);
    return null;
  }
  return cached.data;
}

export function setCachedWorkoutPageData(key: string, data: any): void {
  workoutPageCache.set(key, {
    timestamp: Date.now(),
    data,
  });
}

export function invalidateWorkoutPageCache(userId?: string): void {
  if (userId) {
    for (const key of workoutPageCache.keys()) {
      if (key.startsWith(userId)) {
        workoutPageCache.delete(key);
      }
    }
  } else {
    workoutPageCache.clear();
  }
}
