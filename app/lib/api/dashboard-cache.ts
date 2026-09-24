"use client";

export interface DashboardCacheData {
  user: any;
  profile: any;
  activePlan?: any;
  todayWorkout?: any;
  weekWorkouts?: any[];
  hasPlan?: boolean;
  nutrition?: any;
  lifestyle?: any;
  dailyActivity?: any;
  dayNumber?: number;
  premiumLevel?: string;
  targetDateStr?: string;
  subscriptionState?: any;
}

const CACHE_KEY = "grindlog_dashboard_cache";

export const dashboardClientCache = {
  get(): DashboardCacheData | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem(CACHE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  set(data: DashboardCacheData) {
    if (typeof window === "undefined" || !data?.user?.id) return;
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      // Storage can be unavailable or full; the server view remains authoritative.
    }
  },

  clear() {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {}
  },
};
