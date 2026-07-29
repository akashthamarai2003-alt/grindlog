import Groq from "groq-sdk";

// Cache Groq SDK client instances per API key
const groqClients = new Map<string, Groq>();

let globalKeyCounter = 0;

function getApiKeys(): string[] {
  const apiKeyString = process.env.GROQ_API_KEY;
  if (!apiKeyString) {
    throw new Error("GROQ_API_KEY is missing. Please configure it in your environment variables.");
  }
  const keys = apiKeyString.split(',').map(k => k.trim()).filter(k => k.length > 0);
  if (keys.length === 0) {
    throw new Error("No valid GROQ_API_KEY found.");
  }
  return keys;
}

function getGroqClientForKey(apiKey: string): Groq {
  if (!groqClients.has(apiKey)) {
    groqClients.set(apiKey, new Groq({ apiKey }));
  }
  return groqClients.get(apiKey)!;
}

export function getGroqClient(): Groq {
  const keys = getApiKeys();
  const currentApiKey = keys[globalKeyCounter % keys.length];
  return getGroqClientForKey(currentApiKey);
}

export const GROQ_MODELS = {
  primary: "llama-3.1-8b-instant",
  reasoning: "deepseek-r1-distill-llama-70b",
  fast: "llama-3.1-8b-instant",
} as const;

const FALLBACK_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "llama3-8b-8192",
  "mixtral-8x7b-32768"
];

export async function generateAIResponse({
  systemPrompt,
  userPrompt,
  model = "fast",
  maxTokens = 1024,
  temperature = 0.7,
  responseFormat,
}: {
  systemPrompt: string;
  userPrompt: string;
  model?: keyof typeof GROQ_MODELS;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "json_object" | "text";
}): Promise<string> {
  const keys = getApiKeys();
  let lastError: any = null;

  // Try each API key in round-robin sequence with fallback models
  for (let keyAttempt = 0; keyAttempt < keys.length; keyAttempt++) {
    const selectedKeyIndex = (globalKeyCounter + keyAttempt) % keys.length;
    const currentApiKey = keys[selectedKeyIndex];
    const groq = getGroqClientForKey(currentApiKey);

    // Primary model requested + fallback models
    const requestedModelName = GROQ_MODELS[model] || "llama-3.1-8b-instant";
    const modelsToTry = Array.from(new Set([requestedModelName, ...FALLBACK_MODELS]));

    for (const targetModel of modelsToTry) {
      try {
        const completion = await groq.chat.completions.create({
          model: targetModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: maxTokens,
          temperature,
          response_format: responseFormat ? { type: responseFormat } : undefined,
        });

        // Advance counter on success so subsequent requests rotate keys evenly
        globalKeyCounter = (globalKeyCounter + 1) % keys.length;

        const content = completion.choices[0]?.message?.content;
        if (content) return content;
      } catch (err: any) {
        lastError = err;
        console.warn(
          `Groq API Call Notice (Key index ${selectedKeyIndex}, Model: ${targetModel}):`,
          err.message || err
        );
        // Continue loop to try next model or next API key seamlessly
      }
    }
  }

  console.error("All Groq API keys and fallback models exhausted. Last error:", lastError);
  throw new Error(lastError?.message || "AI Coach is currently busy. Please try again in a few moments.");
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
    systemPrompt: `${systemPrompt}\n\nYou MUST respond with valid JSON only. No markdown, no extra explanation text.`,
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
