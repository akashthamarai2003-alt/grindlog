import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { GoogleGenAI } from "@google/genai";

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
    for (const [view, base64Str] of Object.entries(images as Record<string, string>)) {
      if (base64Str && base64Str.startsWith('data:image')) {
        const [meta, data] = base64Str.split(',');
        const mimeType = meta.split(';')[0].split(':')[1];
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

    const promptText = `You are an elite, world-class fitness coach and biomechanics expert. 
You are presented with body scan photos of a client, which may include Front, Side, and Back views, as well as an optional Goal Physique target photo.

Your task is to analyze these photos and provide a highly personalized, structured physical assessment.

ANALYSIS REQUIREMENTS:
1. Current Physique Assessment: Identify general visual characteristics (e.g., broad shoulders, narrow waist, relative muscle mass, apparent postural imbalances like forward head posture or anterior pelvic tilt).
2. Gap Analysis: If a goal physique photo is included, compare their current state to the goal. Explicitly identify the specific muscle groups or focus areas they need to prioritize to bridge that gap.
3. Workout Implications: Briefly translate your findings into practical programming advice (e.g., "Due to anterior pelvic tilt, prioritize core strengthening and hip flexor stretching").

CRITICAL SAFETY & COMPLIANCE INSTRUCTIONS:
- DO NOT make any medical diagnoses (e.g., "you have scoliosis"). Use observational language (e.g., "there appears to be a slight spinal curvature").
- DO NOT guess or state exact body-fat percentages (e.g., "you are 15% body fat").
- Keep the analysis empowering, professional, concise, and highly structured.
Respond in clear, readable plain text using bullet points where appropriate.`;

    // 5. Call Gemini 1.5 Flash Server-Side
    const response = await geminiClient.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{
        role: "user",
        parts: [
          { text: promptText },
          ...imageParts
        ]
      }]
    });

    const analysisText = response.text;

    if (!analysisText) {
      throw new Error("No analysis generated from Gemini.");
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
        gemini_analysis: analysisText,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    if (dbError) {
      console.error("Database save error:", dbError);
      return NextResponse.json({ success: false, error: "Failed to save analysis." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { analysis: analysisText } });

  } catch (error: any) {
    console.error("Scanner API Error:", error);
    return NextResponse.json({ success: false, error: `Vision AI Error: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
