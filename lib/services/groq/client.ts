import Groq from "groq-sdk";

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing. Please configure it in your Vercel Environment Variables or local .env.local file.");
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export const GROQ_MODELS = {
  primary: "llama-3.1-8b-instant", // Mapped to fast model to avoid 100K token limit
  reasoning: "deepseek-r1-distill-llama-70b",
  fast: "llama-3.1-8b-instant",
} as const;

export async function generateAIResponse({
  systemPrompt,
  userPrompt,
  model = "fast",
  maxTokens = 1024,
  temperature = 0.7,
}: {
  systemPrompt: string;
  userPrompt: string;
  model?: keyof typeof GROQ_MODELS;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "json_object" | "text";
}): Promise<string> {
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: GROQ_MODELS[model],
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature,
    response_format: responseFormat ? { type: responseFormat } : undefined,
  });

  return completion.choices[0]?.message?.content || "";
}

export async function generateAIResponseJSON<T>({
  systemPrompt,
  userPrompt,
  model = "fast",
  maxTokens = 1024,
}: {
  systemPrompt: string;
  userPrompt: string;
  model?: keyof typeof GROQ_MODELS;
  maxTokens?: number;
}): Promise<T> {
  const text = await generateAIResponse({
    systemPrompt: `${systemPrompt}\n\nYou MUST respond with valid JSON only. No markdown, no explanation.`,
    userPrompt,
    model,
    maxTokens,
    temperature: 0.5,
    responseFormat: "json_object",
  });

  try {
    return JSON.parse(text.trim()) as T;
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim()) as T;
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}
