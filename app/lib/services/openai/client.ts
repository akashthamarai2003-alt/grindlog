import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (openaiClient) return openaiClient;

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Please configure it in your environment variables.");
  }

  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

export async function generateOpenAIResponseJSON<T>({
  systemPrompt,
  userPrompt,
  maxTokens = 2500,
  temperature = 0.2,
}: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<T> {
  const completion = await getOpenAIClient().chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content: `${systemPrompt}\n\nYou MUST respond with valid JSON only. No markdown formatting, no code blocks, and no explanation text. Return only the raw JSON object.`,
      },
      { role: "user", content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI returned an empty response.");

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
