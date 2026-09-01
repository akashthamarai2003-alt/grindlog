import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { GoogleGenAI } from "@google/genai";
import {
  BODY_SCAN_RESPONSE_INSTRUCTIONS,
  parseBodyScanAnalysis,
} from "@/lib/fitness/body-scan";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { images } = await req.json();
    if (!images || Object.keys(images).length === 0) {
      return NextResponse.json({ success: false, error: "No images provided" }, { status: 400 });
    }

    // 2. Ensure Gemini API key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY is not configured on the server." }, { status: 500 });
    }

    // 3. Construct Gemini Payload
    const geminiClient = new GoogleGenAI({ apiKey });

    // Format base64 images for Gemini
    const imageParts: any[] = [];
    const imageLabels: Record<string, string> = {
      front: "CURRENT BODY — FRONT VIEW",
      side: "CURRENT BODY — SIDE VIEW",
      back: "CURRENT BODY — BACK VIEW",
      goal: "GOAL PHYSIQUE — INSPIRATION ONLY, NOT THE USER'S CURRENT BODY",
    };
    for (const [view, base64Str] of Object.entries(images as Record<string, string>)) {
      if (base64Str && base64Str.startsWith('data:image')) {
        const [meta, data] = base64Str.split(',');
        const mimeType = meta.split(';')[0].split(':')[1];
        imageParts.push({ text: imageLabels[view] || `CURRENT BODY — ${view.toUpperCase()} VIEW` });
        imageParts.push({
          inlineData: {
            data,
            mimeType
          }
        });
      }
    }

    if (imageParts.length === 0) {
      return NextResponse.json({ success: false, error: "Could not process uploaded images" }, { status: 400 });
    }

    const promptText = `You are a cautious fitness coach. Analyse the labelled images below. The current-body views show the user from different angles; the optional goal-physique image is only a reference for direction. Keep the response concise, encouraging, and practical.\n${BODY_SCAN_RESPONSE_INSTRUCTIONS}`;

    // 5. Call Gemini Vision Server-Side
    const models = [
      process.env.GEMINI_VISION_MODEL?.trim() || "gemini-2.5-flash",
      "gemini-2.0-flash",
    ].filter((model, index, list) => list.indexOf(model) === index);
    let response: Awaited<ReturnType<typeof geminiClient.models.generateContent>> | null = null;
    let lastModelError: unknown;
    for (const model of models) {
      try {
        response = await geminiClient.models.generateContent({
          model,
          contents: [{
            role: "user",
            parts: [
              { text: promptText },
              ...imageParts
            ]
          }],
          config: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        });
        break;
      } catch (modelError) {
        lastModelError = modelError;
        if (!String(modelError).includes("404") || model === models[models.length - 1]) {
          throw modelError;
        }
        console.warn(`Gemini model ${model} was not found; trying fallback model.`);
      }
    }
    if (!response) throw lastModelError || new Error("Gemini returned no response.");

    const analysis = parseBodyScanAnalysis(response.text);
    if (!analysis) {
      throw new Error("Gemini returned an invalid body-scan analysis.");
    }

    // 5. Save to Database (Text Analysis ONLY)
    const adminClient = createAdminClient();
    const { error: dbError } = await adminClient
      .from('fitness_os_scans')
      .upsert({
        user_id: user.id,
        front_url: null,
        side_url: null,
        back_url: null,
        goal_url: null,
        gemini_analysis: JSON.stringify(analysis),
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    if (dbError) {
      console.error("Database save error:", dbError);
      return NextResponse.json({ success: false, error: "Failed to save analysis." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { analysis } });

  } catch (error: any) {
    console.error("Scanner API Error:", error);
    return NextResponse.json({ success: false, error: `Vision AI Error: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
