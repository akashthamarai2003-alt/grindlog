"use client";

export interface ProfileCacheData {
  user: any;
  fitnessProfile: any;
  mainProfile: any;
  activePlan: any;
  subscriptionPlan: any;
  aiLimitInfo: any;
}

const CACHE_KEY = "grindlog_profile_cache";

export const profileClientCache = {
  get(): ProfileCacheData | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem(CACHE_KEY);
      const parsed = stored ? JSON.parse(stored) : null;
      return parsed?.user?.id ? parsed : null;
    } catch {
      return null;
    }
  },

  set(data: ProfileCacheData) {
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
