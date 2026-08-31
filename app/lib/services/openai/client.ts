import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (openaiClient) return openaiClient;

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Please configure it in your environment variables.",
    );
  }

  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-5.6-terra";
// Full weekly plans are generated only after the user explicitly confirms the
// onboarding report. Keep this separately configurable from other AI features.
export const FITNESS_PLAN_MODEL =
  process.env.FITNESS_PLAN_MODEL?.trim() || "gpt-5.6-luna";

export async function generateOpenAIResponseJSON<T>({
  systemPrompt,
  userPrompt,
  model = OPENAI_MODEL,
  maxTokens = 2500,
  temperature = 0.2,
  reasoningEffort = "high",
  minimumOutputTokens = 8000,
}: {
  systemPrompt: string;
  userPrompt: string;
  /** Override the default model for a specific product workflow. */
  model?: string;
  maxTokens?: number;
  temperature?: number;
  /** Use low effort for short, bounded tasks such as the onboarding report. */
  reasoningEffort?: "low" | "medium" | "high";
  /** GPT-5.6 counts reasoning and visible output in this shared budget. */
  minimumOutputTokens?: number;
}): Promise<T> {
  // Reasoning tokens are included in the completion budget for GPT-5.6.
  // A small visible-output limit can therefore finish before JSON is emitted.
  const completionTokenBudget = model.startsWith("gpt-5.6-")
    ? Math.max(maxTokens, minimumOutputTokens)
    : maxTokens;

  const response = await getOpenAIClient().responses.create({
    model,
    input: `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\nUSER REQUEST:\n${userPrompt}\n\nReturn valid JSON only. Do not include markdown or explanation text.`,
    max_output_tokens: completionTokenBudget,
    ...(model.startsWith("gpt-5.6-")
      ? { reasoning: { effort: reasoningEffort } }
      : { temperature }),
    text: { format: { type: "json_object" } },
  });

  const text = response.output_text?.trim();
  if (!text) {
    throw new Error(
      `OpenAI returned an empty response (status: ${response.status || "unknown"}).`,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) return JSON.parse(jsonMatch[1].trim()) as T;

    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1)) as T;
    }

    throw new Error("OpenAI generated an invalid JSON response structure.");
  }
}
