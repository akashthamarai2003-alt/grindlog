"use client";

import { AggregatedProgressPayload, AnalyticsPeriod } from "@/types/fitness/analytics";

const memoryProgressCache: Record<string, AggregatedProgressPayload> = {};

export const progressClientCache = {
  get(period: AnalyticsPeriod = "30D"): AggregatedProgressPayload | null {
    if (memoryProgressCache[period]) {
      return memoryProgressCache[period];
    }

    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(`grindlog_progress_cache_${period}`);
        if (stored) {
          const parsed = JSON.parse(stored) as AggregatedProgressPayload;
          if (parsed && parsed.period === period) {
            memoryProgressCache[period] = parsed;
            return parsed;
          }
        }
      } catch {}
    }
    return null;
  },

  set(period: AnalyticsPeriod, data: AggregatedProgressPayload) {
    if (!data) return;
    memoryProgressCache[period] = data;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`grindlog_progress_cache_${period}`, JSON.stringify(data));
      } catch {}
    }
  },

  clear() {
    for (const key of Object.keys(memoryProgressCache)) {
      delete memoryProgressCache[key];
    }
    if (typeof window !== "undefined") {
      try {
        const periods: AnalyticsPeriod[] = ["7D", "30D", "3M", "6M", "ALL"];
        periods.forEach((p) => sessionStorage.removeItem(`grindlog_progress_cache_${p}`));
      } catch {}
    }
  },

  notifyUpdated() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("grindlog_progress_updated"));
    }
  },
};
