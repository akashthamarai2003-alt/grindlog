import { z } from "zod";

const BodyScanText = z.string().trim().min(1).max(900);

/**
 * This is the durable, photo-only contract saved after a Gemini body scan.
 * Training and nutrition choices intentionally remain outside this object:
 * they are made later from the complete onboarding profile.
 */
export const BodyScanAnalysisSchema = z.object({
  overall_summary: BodyScanText,
  observed_strengths: z.array(BodyScanText).max(3),
  priority_improvements: z.array(BodyScanText).max(3),
  posture_or_movement_note: BodyScanText,
  goal_gap: BodyScanText.nullable().optional(),
});

export type BodyScanAnalysis = z.infer<typeof BodyScanAnalysisSchema>;

function parseJson(value: string): unknown {
  const trimmed = value.trim();
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
