import Groq from "groq-sdk";

// Cache clients by API key to avoid recreating them
const groqClients = new Map<string, Groq>();

export function getGroqClient(): Groq {
  const apiKeyString = process.env.GROQ_API_KEY;
  if (!apiKeyString) {
    throw new Error("GROQ_API_KEY is missing. Please configure it in your Vercel Environment Variables or local .env.local file.");
  }
  
  // Support multiple keys separated by commas
  const keys = apiKeyString.split(',').map(k => k.trim()).filter(k => k.length > 0);
  
  if (keys.length === 0) {
    throw new Error("No valid GROQ_API_KEY found.");
  }

  // Pick a random key to distribute the load and bypass rate limits
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  
  if (!groqClients.has(randomKey)) {
    groqClients.set(randomKey, new Groq({ apiKey: randomKey }));
  }
  
  return groqClients.get(randomKey)!;
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
