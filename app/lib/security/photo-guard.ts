import crypto from "crypto";
import { createAdminClient } from "@/lib/services/supabase/admin";

export interface ValidatedImage {
  label: string;
  data: string; // raw base64 data without prefix
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  byteSize: number;
}

export interface PhotoValidationResult {
  valid: boolean;
  error?: string;
  images?: ValidatedImage[];
  totalByteSize?: number;
  photoHash?: string;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Validates real magic bytes from the binary buffer to prevent spoofed MIME types,
 * SVG injection, HTML scripts, or executable payloads.
 */
function detectRealMimeType(buffer: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (!buffer || buffer.length < 12) return null;

  // Check for text/markup injection (SVG / HTML / scripts)
  const headerText = buffer.subarray(0, Math.min(buffer.length, 128)).toString("utf8").toLowerCase();
  if (
    headerText.includes("<svg") ||
    headerText.includes("<?xml") ||
    headerText.includes("<!doctype") ||
    headerText.includes("<html") ||
    headerText.includes("<script")
  ) {
    return null;
  }

  // Check for executable signatures (MZ for PE executables, \x7fELF for Linux)
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) return null; // MZ
  if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) return null; // ELF

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // WebP: RIFF....WEBP (bytes 0-3: 'RIFF', bytes 8-11: 'WEBP')
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export class PhotoGuard {
  // In-memory LRU cache for rapid repeated submissions (e.g. double clicks within 10 minutes)
  private static memoryCache = new Map<string, { analysis: any; timestamp: number }>();

  /**
   * Validates an array of raw base64 or dataURL images.
   * Checks MIME, magic bytes, per-image size (max 5MB), and total payload size (max 15MB).
   */
  static validateImages(
    rawInputs: Array<{ label: string; base64Str?: string | null }>
  ): PhotoValidationResult {
    const validatedImages: ValidatedImage[] = [];
    let totalByteSize = 0;

    for (const input of rawInputs) {
      if (!input.base64Str || typeof input.base64Str !== "string") continue;

      let rawData = input.base64Str.trim();
      let reportedMime = "image/jpeg";

      if (rawData.startsWith("data:image")) {
        const commaIdx = rawData.indexOf(",");
        if (commaIdx === -1) {
          return { valid: false, error: `Malformed data URL for ${input.label}` };
        }
        const meta = rawData.substring(0, commaIdx);
        reportedMime = meta.split(";")[0].split(":")[1] || reportedMime;
        rawData = rawData.substring(commaIdx + 1);
      }

      if (!ALLOWED_MIME_TYPES.has(reportedMime)) {
        return {
          valid: false,
          error: `Invalid image type for ${input.label}. Only JPEG, PNG, and WebP are allowed.`,
        };
      }

      let buffer: Buffer;
      try {
        buffer = Buffer.from(rawData, "base64");
      } catch {
        return { valid: false, error: `Invalid base64 encoding for ${input.label}` };
      }

      if (buffer.length === 0) {
        return { valid: false, error: `Empty image payload for ${input.label}` };
      }

      if (buffer.length > MAX_IMAGE_SIZE) {
        return {
          valid: false,
          error: `Image ${input.label} exceeds maximum allowed size of 5MB (${(buffer.length / (1024 * 1024)).toFixed(2)}MB).`,
        };
      }

      // Magic byte verification — do not trust client header alone
      const realMime = detectRealMimeType(buffer);
      if (!realMime) {
        return {
          valid: false,
          error: `Image payload for ${input.label} contains invalid or prohibited binary format (SVG, HTML, or non-image content is not permitted).`,
        };
      }

      totalByteSize += buffer.length;
      if (totalByteSize > MAX_TOTAL_SIZE) {
        return {
          valid: false,
          error: `Total image payload exceeds maximum allowed size of 15MB (${(totalByteSize / (1024 * 1024)).toFixed(2)}MB).`,
        };
      }

      validatedImages.push({
        label: input.label,
        data: rawData,
        mimeType: realMime,
        byteSize: buffer.length,
      });
    }

    if (validatedImages.length === 0) {
      return { valid: false, error: "No valid image data provided." };
    }

    // Compute composite SHA-256 hash across all image payloads for idempotency
    const hash = crypto
      .createHash("sha256")
      .update(validatedImages.map((img) => `${img.label}:${img.data}`).join("|"))
      .digest("hex");

    return {
      valid: true,
      images: validatedImages,
      totalByteSize,
      photoHash: hash,
    };
  }

  /**
   * Retrieves an existing cached analysis for this user and photo hash.
   * Multi-instance safe: checks in-memory cache first, then checks Supabase durable records.
   * Isolates strictly by userId so User B can never read User A's cached analysis.
   */
  static async getCachedAnalysis(userId: string, photoHash: string): Promise<any | null> {
    const scopedKey = `${userId}:${photoHash}`;

    // 1. Process-local fast check (10-minute TTL)
    const memEntry = this.memoryCache.get(scopedKey);
    if (memEntry && Date.now() - memEntry.timestamp < 10 * 60 * 1000) {
      return memEntry.analysis;
    }

    // 2. Multi-instance durable check: look in fitness_os_ai_sessions for identical hash completed today
    try {
      const admin = createAdminClient();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: durableSession } = await admin
        .from("fitness_os_ai_sessions")
        .select("response")
        .eq("user_id", userId)
        .eq("session_type", "body_scan_analysis")
        .like("prompt", `%photo_hash:${photoHash}%`)
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (durableSession?.response) {
        try {
          const parsed = JSON.parse(durableSession.response);
          // Populate local cache
          this.memoryCache.set(scopedKey, { analysis: parsed, timestamp: Date.now() });
          return parsed;
        } catch {
          // If response isn't pure JSON, return null
        }
      }
    } catch (dbErr) {
      console.warn("[PhotoGuard] Error checking durable photo cache:", dbErr);
    }

    return null;
  }

  /**
   * Stores a completed analysis in both fast in-memory cache and durable storage reference.
   */
  static setCachedAnalysis(userId: string, photoHash: string, analysis: any): void {
    const scopedKey = `${userId}:${photoHash}`;
    this.memoryCache.set(scopedKey, { analysis, timestamp: Date.now() });

    // Clean up memory cache if it grows beyond 500 items
    if (this.memoryCache.size > 500) {
      const oldestKeys = Array.from(this.memoryCache.keys()).slice(0, 100);
      for (const k of oldestKeys) this.memoryCache.delete(k);
    }
  }
}
