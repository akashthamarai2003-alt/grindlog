import Groq from "groq-sdk";

// ------------------------------------------------------------------
// 1. GROQ PROVIDER INITIALIZATION
// ------------------------------------------------------------------
const groqClients = new Map<string, Groq>();
let globalKeyCounter = 0;

function getGroqApiKeys(): string[] {
  const apiKeyString = process.env.GROQ_API_KEY;
  if (!apiKeyString) return [];
  return apiKeyString.split(",").map((k) => k.trim()).filter((k) => k.length > 0);
}

function getGroqClientForKey(apiKey: string): Groq {
  if (!groqClients.has(apiKey)) {
    groqClients.set(apiKey, new Groq({ apiKey }));
  }
  return groqClients.get(apiKey)!;
}

// ------------------------------------------------------------------
// 2. GROQ MODEL ROUTING MAP
// ------------------------------------------------------------------
export const GROQ_MODELS = {
  primary: "qwen/qwen3.8-27b",
  reasoning: "openai/gpt-oss-120b",
  fast: "groq/compound-mini",
} as const;

export type RouteModel = keyof typeof GROQ_MODELS;

// ------------------------------------------------------------------
// 3. MASTER ROUTING LOGIC (Groq AI Only)
// ------------------------------------------------------------------
export async function generateAIResponse({
  systemPrompt,
  userPrompt,
  messages,
  model = "fast",
  maxTokens = 2500,
  temperature = 0.7,
  responseFormat,
}: {
  systemPrompt?: string;
  userPrompt?: string;
  messages?: { role: "system" | "user" | "assistant"; content: string }[];
  model?: RouteModel;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "json_object" | "text";
}): Promise<string> {
  const errors: string[] = [];

  const finalMessages = messages || [
    ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
    ...(userPrompt ? [{ role: "user" as const, content: userPrompt }] : []),
  ];

  const groqKeys = getGroqApiKeys();
  if (groqKeys.length === 0) {
    throw new Error("GROQ_API_KEY is not configured in your environment.");
  }

  const configuredModel = process.env.GROQ_MODEL?.trim();
  const requestedGroqModel = configuredModel || GROQ_MODELS[model] || GROQ_MODELS.fast;

  const modelsToTry = Array.from(new Set([
    requestedGroqModel,
    "groq/compound-mini",
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-20b"
  ]));

  for (let keyAttempt = 0; keyAttempt < groqKeys.length; keyAttempt++) {
    const selectedKeyIndex = (globalKeyCounter + keyAttempt) % groqKeys.length;
    const currentApiKey = groqKeys[selectedKeyIndex];
    const groq = getGroqClientForKey(currentApiKey);

    for (const targetModel of modelsToTry) {
      try {
        const completion = await groq.chat.completions.create({
          model: targetModel,
          messages: finalMessages,
          max_tokens: maxTokens,
          temperature,
          response_format: responseFormat ? { type: responseFormat } : undefined,
        });

        // Advance counter so next request starts on a fresh key
        globalKeyCounter = (globalKeyCounter + 1) % groqKeys.length;

        const content = completion.choices[0]?.message?.content;
        if (content && content.trim().length > 0) {
          return content.trim();
        }
      } catch (err: any) {
        console.warn(`[GROQ AI] Key ${selectedKeyIndex}, Model ${targetModel} Failed:`, err.message);
        errors.push(`Groq [${targetModel}]: ${err.message}`);
      }
    }
  }

  console.error("[GROQ AI] All Groq model attempts failed. Errors:", errors);
  throw new Error(`Groq AI request failed: ${errors.join(" | ")}`);
}

// ------------------------------------------------------------------
// 4. JSON HELPER FUNCTION (Groq AI)
// ------------------------------------------------------------------
export async function generateAIResponseJSON<T>({
  systemPrompt,
  userPrompt,
  model = "fast",
  maxTokens = 2500,
  temperature = 0.2,
}: {
  systemPrompt: string;
  userPrompt: string;
  model?: RouteModel;
  maxTokens?: number;
  temperature?: number;
}): Promise<T> {
  const text = await generateAIResponse({
    systemPrompt: `${systemPrompt}\n\nYou MUST respond with valid JSON only. No markdown formatting, no code blocks like \`\`\`json, no explanation text. Just the raw JSON object.`,
    userPrompt,
    model,
    maxTokens,
    temperature,
    responseFormat: "json_object",
  });

  try {
    return JSON.parse(text.trim()) as T;
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim()) as T;
    }
    
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      const extracted = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(extracted) as T;
    }

    throw new Error("Groq AI generated an invalid JSON response structure.");
  }
}

// ------------------------------------------------------------------
// 5. BACKWARD COMPATIBILITY
// ------------------------------------------------------------------
export function getGroqClient(): Groq {
  const keys = getGroqApiKeys();
  if (keys.length === 0) {
    throw new Error("GROQ_API_KEY is missing. Please configure it in your environment variables.");
  }
  const currentApiKey = keys[globalKeyCounter % keys.length];
  globalKeyCounter = (globalKeyCounter + 1) % keys.length;
  return getGroqClientForKey(currentApiKey);
}
