import Groq from "groq-sdk";
import OpenAI from "openai";

// ------------------------------------------------------------------
// 1. PROVIDER INITIALIZATION
// ------------------------------------------------------------------

// A. GROQ SETUP (Tier 1 Primary)
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

// B. NVIDIA SETUP (Tier 2 Emergency Fallback)
let nvidiaClient: OpenAI | null = null;
function getNvidiaClient(): OpenAI | null {
  if (nvidiaClient) return nvidiaClient;
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;
  nvidiaClient = new OpenAI({
    apiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });
  return nvidiaClient;
}

// ------------------------------------------------------------------
// 2. MODEL ROUTING MAPS
// ------------------------------------------------------------------
export const GROQ_MODELS = {
  primary: "llama-3.3-70b-versatile",
  reasoning: "deepseek-r1-distill-llama-70b",
  fast: "mixtral-8x7b-32768",
} as const;

export type RouteModel = keyof typeof GROQ_MODELS;

// ------------------------------------------------------------------
// 3. MASTER ROUTING LOGIC (2-Tier Tag-Team for Text)
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

  // ==================================================================
  // TIER 1: GROQ (The High-Speed Round-Robin Primary)
  // ==================================================================
  const groqKeys = getGroqApiKeys();
  if (groqKeys.length > 0) {
    console.log(`[AI ROUTER] Tier 1: Attempting Groq (${groqKeys.length} keys)...`);
    
    // We'll try the requested model, then gracefully degrade to instant if needed
    const requestedGroqModel = GROQ_MODELS[model] || "mixtral-8x7b-32768";
    const modelsToTry = Array.from(new Set([requestedGroqModel, "mixtral-8x7b-32768"]));

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
          if (content) return content;
        } catch (err: any) {
          console.warn(`[AI ROUTER] Tier 1 Groq (Key ${selectedKeyIndex}, Model ${targetModel}) Failed:`, err.message);
          errors.push(`Groq [${targetModel}]: ${err.message}`);
        }
      }
    }
  }

  // ==================================================================
  // TIER 2: NVIDIA NIM (The Emergency Net)
  // ==================================================================
  const nvidia = getNvidiaClient();
  if (nvidia) {
    try {
      console.log(`[AI ROUTER] Tier 2: Attempting NVIDIA NIM Emergency Backup...`);
      const completion = await nvidia.chat.completions.create({
        model: "meta/llama3-70b-instruct",
        messages: finalMessages,
        max_tokens: maxTokens,
        temperature,
      });

      const content = completion.choices[0]?.message?.content;
      if (content) return content;
    } catch (err: any) {
      console.warn(`[AI ROUTER] Tier 2 NVIDIA Failed:`, err.message);
      errors.push(`NVIDIA: ${err.message}`);
    }
  }

  // If we reach here, all providers are dead, rate-limited, or misconfigured.
  console.error("[AI ROUTER] ALL TIERS EXHAUSTED. Errors:", errors);
  throw new Error(`Our AI engines are currently experiencing extreme viral traffic! Please try again in 60 seconds. [DEBUG: ${errors.join(" | ")}]`);
}

// ------------------------------------------------------------------
// JSON HELPER FUNCTION
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
    responseFormat: "json_object", // Note: NVIDIA might ignore this, so the prompt enforces it
  });

  try {
    return JSON.parse(text.trim()) as T;
  } catch {
    // Aggressive JSON extraction fallback if the AI ignores instructions
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim()) as T;
    }
    
    // Find the first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const extracted = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(extracted) as T;
    }

    throw new Error("AI generated an invalid JSON response structure.");
  }
}

// ------------------------------------------------------------------
// BACKWARD COMPATIBILITY
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
