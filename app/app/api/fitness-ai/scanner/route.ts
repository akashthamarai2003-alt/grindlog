import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { getGroqClient } from "@/lib/services/groq/client";
import { createAdminClient } from "@/lib/services/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { paths } = await req.json();
    if (!paths || Object.keys(paths).length === 0) {
      return NextResponse.json({ success: false, error: "No image paths provided" }, { status: 400 });
    }

    // 2. Ensure Gemini API key is present

    // (We don't need GEMINI_API_KEY anymore as getGroqClient handles GROQ_API_KEY)

    // 3. Download images as Base64 using Supabase Admin client
    const adminClient = createAdminClient();
    const base64Images: { view: string; mimeType: string; data: string }[] = [];

    for (const [view, path] of Object.entries(paths)) {
      const { data: blob, error: downloadError } = await adminClient.storage
        .from('fitness_os_scans')
        .download(path as string);
        
      if (downloadError || !blob) {
        console.error(`Failed to download ${view} image:`, downloadError);
        continue;
      }

      const buffer = Buffer.from(await blob.arrayBuffer());
      const base64Data = buffer.toString('base64');
      const mimeType = blob.type || "image/jpeg";
      
      base64Images.push({ view, mimeType, data: base64Data });
    }

    if (base64Images.length === 0) {
      return NextResponse.json({ success: false, error: "Could not process uploaded images" }, { status: 400 });
    }

    // 4. Construct Groq Payload (Limit to 2 images max to avoid Groq 8k TPM limit)
    const priority = ["front", "side", "goal", "back"];
    const sortedImages = base64Images.sort((a, b) => {
      const idxA = priority.indexOf(a.view);
      const idxB = priority.indexOf(b.view);
      // Fallback for unknown views
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
    });

    const imageContents = sortedImages.slice(0, 2).map(img => ({
      type: "image_url",
      image_url: {
        url: `data:${img.mimeType};base64,${img.data}`
      }
    }));

    const promptText = `You are a professional fitness coach and biomechanics expert. Analyze these body scan photos of a client. 
      Identify general visual characteristics (e.g., broad shoulders, narrow waist, apparent postural imbalances like forward head posture or anterior pelvic tilt). 
      If a goal physique photo is included, identify the focus areas needed to bridge the gap.
      CRITICAL INSTRUCTIONS:
      - DO NOT make any medical diagnoses.
      - DO NOT guess or state exact body-fat percentages.
      - Keep the analysis concise, structured, and focused on physical traits that will influence workout programming.
      Respond in plain text.`;

    const groq = getGroqClient();
    
    const response = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            ...imageContents
          ] as any
        }
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });

    const analysisText = response.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error("No analysis generated from Groq.");
    }

    // 5.5 Delete images from Supabase Storage immediately for privacy
    const filePaths = Object.values(paths) as string[];
    const { error: deleteError } = await adminClient.storage
      .from('fitness_os_scans')
      .remove(filePaths);

    if (deleteError) {
      console.error("Failed to delete temporary scan images:", deleteError);
      // We log the error but don't fail the request, since the analysis succeeded.
    }

    // 6. Save to Database (Text Analysis ONLY)
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
    return NextResponse.json({ success: false, error: `Groq Error: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
