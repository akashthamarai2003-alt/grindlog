import { z } from "zod";

const SafeTextWithDefault = (fallback: string) =>
  z.preprocess(
    (val) => (typeof val === "string" && val.trim() ? val.trim().slice(0, 1500) : fallback),
    z.string().min(1),
  );

/**
 * This is the durable, photo-only contract saved after a Gemini body scan.
 * Training and nutrition choices intentionally remain outside this object:
 * they are made later from the complete onboarding profile.
 */
export const BodyScanAnalysisSchema = z.object({
  overall_summary: SafeTextWithDefault("Visual assessment completed."),
  observed_strengths: z.preprocess(
    (val) =>
      Array.isArray(val)
        ? val
            .map((v) => (typeof v === "string" ? v.trim() : String(v || "")).slice(0, 500))
            .filter(Boolean)
            .slice(0, 3)
        : [],
    z.array(z.string()),
  ),
  priority_improvements: z.preprocess(
    (val) =>
      Array.isArray(val)
        ? val
            .map((v) => (typeof v === "string" ? v.trim() : String(v || "")).slice(0, 500))
            .filter(Boolean)
            .slice(0, 3)
        : [],
    z.array(z.string()),
  ),
  posture_or_movement_note: SafeTextWithDefault(
    "No clear posture concern can be confirmed from these photos.",
  ),
  goal_gap: z.preprocess(
    (val) => (typeof val === "string" && val.trim() ? val.trim().slice(0, 1000) : null),
    z.string().nullable().optional(),
  ),
});

export type BodyScanAnalysis = z.infer<typeof BodyScanAnalysisSchema>;

function parseJson(value: string): unknown {
  const trimmed = value.trim();

  // Try direct parse first
  try {
    return JSON.parse(trimmed);
  } catch {}

  // Try extracting from markdown code fence ```json ... ```
  const matchFence = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (matchFence && matchFence[1]) {
    try {
      return JSON.parse(matchFence[1].trim());
    } catch {}
  }

  // Try finding outermost JSON object { ... }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {}
  }

  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(withoutFence);
}

/**
 * Older scans were saved as plain text. They remain usable as AI context, but
 * only structured scans are rendered directly on the report.
 */
export function parseBodyScanAnalysis(value: unknown): BodyScanAnalysis | null {
  try {
    const candidate = typeof value === "string" ? parseJson(value) : value;
    const parsed = BodyScanAnalysisSchema.safeParse(candidate);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export const BODY_SCAN_RESPONSE_INSTRUCTIONS = `
Return ONLY a valid JSON object with exactly these keys:
{
  "overall_summary": "current-body observations only",
  "observed_strengths": ["up to 3 visible strengths"],
  "priority_improvements": ["up to 3 practical physique priorities"],
  "posture_or_movement_note": "a cautious visible observation or 'No clear posture concern can be confirmed from these photos.'",
  "goal_gap": "how to move toward the goal image" or null
}

The CURRENT BODY images are the user. The GOAL PHYSIQUE image is inspiration only and must never be described as the user's current body. Use only visible observations; do not diagnose health conditions, estimate exact body-fat percentage, or promise the goal physique by a specific date.`;
