export interface CachedProfilePageData {
  fitnessProfile: any;
  mainProfile: any;
  activePlan: any;
  subscriptionPlan: any;
  aiLimitInfo: any;
}

const profilePageCache = new Map<string, { timestamp: number; data: CachedProfilePageData }>();
const PROFILE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export function getCachedProfilePageData(userId: string): CachedProfilePageData | null {
  const cached = profilePageCache.get(userId);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > PROFILE_CACHE_TTL) {
    profilePageCache.delete(userId);
    return null;
  }
  return cached.data;
}

export function setCachedProfilePageData(userId: string, data: CachedProfilePageData): void {
  profilePageCache.set(userId, {
    timestamp: Date.now(),
    data,
  });
}

export function invalidateProfilePageCache(userId?: string): void {
  if (userId) {
    profilePageCache.delete(userId);
  } else {
    profilePageCache.clear();
  }
}
