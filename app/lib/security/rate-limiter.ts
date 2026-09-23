import { NextResponse } from "next/server";

interface RateLimitTierConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMIT_TIERS: Record<"auth" | "ai" | "general", RateLimitTierConfig> = {
  auth: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 req / minute
  },
  ai: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 req / minute
  },
  general: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 60 req / minute
  },
};

interface RateLimitRecord {
  timestamps: number[];
}

/**
 * In-memory sliding window rate limiter.
 *
 * NOTE ON MULTI-INSTANCE / SERVERLESS DEPLOYMENTS:
 * This in-memory rate limiter provides fast, zero-latency burst and DoS mitigation
 * within each Node.js process. In a distributed multi-instance deployment (e.g. AWS Lambda / Vercel),
 * memory is per-instance. Critical quota boundaries (such as AI usage quotas) are durably
 * enforced at the database level via AIUsageService to guarantee correctness across all instances.
 */
class SlidingWindowRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private lastCleanup = Date.now();

  private cleanup(windowMs: number) {
    const now = Date.now();
    // Run cleanup every 60 seconds
    if (now - this.lastCleanup < 60 * 1000) return;
    this.lastCleanup = now;

    for (const [key, record] of this.store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }

  check(
    identifier: string,
    tier: "auth" | "ai" | "general" = "general"
  ): {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetInSeconds: number;
  } {
    const config = RATE_LIMIT_TIERS[tier];
    const now = Date.now();
    this.cleanup(config.windowMs);

    const key = `${tier}:${identifier}`;
    let record = this.store.get(key);

    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < config.windowMs);

    const oldestTs = record.timestamps[0] || now;
    const resetInSeconds = Math.max(1, Math.ceil((oldestTs + config.windowMs - now) / 1000));

    if (record.timestamps.length >= config.maxRequests) {
      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        resetInSeconds,
      };
    }

    record.timestamps.push(now);
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - record.timestamps.length),
      resetInSeconds,
    };
  }

  reset(identifier: string, tier: "auth" | "ai" | "general" = "general") {
    this.store.delete(`${tier}:${identifier}`);
  }
}

export const rateLimiter = new SlidingWindowRateLimiter();

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Guard utility for Route Handlers. Returns a 429 NextResponse if rate limit is exceeded,
 * or null if request is within limits.
 */
export function enforceRateLimit(
  req: Request,
  tier: "auth" | "ai" | "general" = "general",
  userId?: string
): NextResponse | null {
  const identifier = userId || getClientIp(req);
  const result = rateLimiter.check(identifier, tier);

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.resetInSeconds),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
        },
      }
    );
  }

  return null;
}
