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

export interface BodyScanImageInput {
  label: string;
  data: string;     // base64 data without data:image/... prefix
  mimeType: string; // e.g. "image/jpeg"
}

export interface BodyScanVisionResult {
  success: boolean;
  analysis?: BodyScanAnalysis;
  rawText?: string;
  provider?: string;
  error?: string;
}

/**
 * Robust, production-grade vision analysis for fitness/physique photos.
 * 1. Executes Google Gemini Vision with explicit safety filter overrides (BLOCK_NONE)
 *    so shirtless/sports-bra gym photos are never blocked as false-positive NSFW.
 * 2. Uses verified working Gemini models (gemini-3.6-flash, gemini-3.5-flash, gemini-3.1-flash-lite).
 * 3. Automatically falls back to OpenAI Vision (gpt-4o-mini) if Gemini is down or exhausted.
 */
export async function analyzeBodyScanImages(
  images: BodyScanImageInput[]
): Promise<BodyScanVisionResult> {
  if (!images || images.length === 0) {
    return { success: false, error: "No images provided" };
  }

  const promptText = `You are a cautious fitness coach. Analyse the labelled images below. The current-body views show the user from different angles; the optional goal-physique image is only a reference for direction. Keep the response concise, encouraging, and practical.\n${BODY_SCAN_RESPONSE_INSTRUCTIONS}`;

  // 1. Primary Attempt: Google Gemini Vision with verified working models & explicit safety overrides
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const gemini = new GoogleGenAI({ apiKey: geminiApiKey });

      // Verified working models for vision (excluding deprecated 2.5-flash and overloaded 3.8-flash)
      const candidateModels = [
        process.env.GEMINI_VISION_MODEL?.trim(),
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
      ].filter((model, idx, arr): model is string => Boolean(model && arr.indexOf(model) === idx));

      for (const model of candidateModels) {
        try {
          const response = await gemini.models.generateContent({
            model,
            contents: [
              {
                role: "user",
                parts: [
                  { text: promptText },
                  ...images.flatMap((img) => [
                    { text: img.label },
                    { inlineData: { data: img.data, mimeType: img.mimeType } },
                  ]),
                ],
              },
            ],
            config: {
              temperature: 0.2,
              responseMimeType: "application/json",
              safetySettings: [
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
              ] as any,
            },
          });

          const rawText = response?.text;
          if (rawText) {
            const parsed = parseBodyScanAnalysis(rawText);
            if (parsed) {
              return { success: true, analysis: parsed, rawText, provider: `gemini (${model})` };
            }
          }
        } catch (modelErr: any) {
          console.warn(`[BodyScan] Gemini model ${model} failed:`, modelErr?.message || modelErr);
        }
      }
    } catch (geminiInitErr) {
      console.warn("[BodyScan] Gemini initialization error:", geminiInitErr);
    }
  }

  // 2. Secondary Fallback: OpenAI Vision (gpt-4o-mini)
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (openaiApiKey) {
    try {
      console.log("[BodyScan] Trying OpenAI Vision fallback (gpt-4o-mini)...");
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: openaiApiKey });

      const contentParts: Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string; detail: "low" | "high" | "auto" } }
      > = [
        { type: "text", text: promptText },
      ];

      for (const img of images) {
        contentParts.push({ type: "text", text: img.label });
        contentParts.push({
          type: "image_url",
          image_url: {
            url: `data:${img.mimeType};base64,${img.data}`,
            detail: "low",
          },
        });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: contentParts }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const rawText = response.choices?.[0]?.message?.content;
      if (rawText) {
        const parsed = parseBodyScanAnalysis(rawText);
        if (parsed) {
          return { success: true, analysis: parsed, rawText, provider: "openai (gpt-4o-mini)" };
        }
      }
    } catch (openaiErr: any) {
      console.error("[BodyScan] OpenAI Vision fallback error:", openaiErr?.message || openaiErr);
    }
  }

  return { success: false, error: "All vision models were unable to analyze the body photos" };
}

