import Groq from "groq-sdk";

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });
  }
  return groqClient;
}

export const GROQ_MODELS = {
  primary: "meta-llama/llama-4-maverick-17b-128e-instruct",
  reasoning: "deepseek-r1-distill-qwen-32b",
  fast: "qwen-2.5-32b",
} as const;

export async function generateAIResponse({
  systemPrompt,
  userPrompt,
  model = "primary",
  maxTokens = 1024,
  temperature = 0.7,
}: {
  systemPrompt: string;
  userPrompt: string;
  model?: keyof typeof GROQ_MODELS;
  maxTokens?: number;
  temperature?: number;
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
  });

  return completion.choices[0]?.message?.content || "";
}

export async function generateAIResponseJSON<T>({
  systemPrompt,
  userPrompt,
  model = "primary",
}: {
  systemPrompt: string;
  userPrompt: string;
  model?: keyof typeof GROQ_MODELS;
}): Promise<T> {
  const text = await generateAIResponse({
    systemPrompt: `${systemPrompt}\n\nYou MUST respond with valid JSON only. No markdown, no explanation.`,
    userPrompt,
    model,
    maxTokens: 2048,
    temperature: 0.5,
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
