import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/services/supabase/server";
import { OnboardingSchema } from '@/types/fitness/onboarding';
import Groq from 'groq-sdk';

// Initialize Groq (ensure GROQ_API_KEY is in your environment)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY?.split(',')[0] || process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await req.json();
    const result = OnboardingSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Invalid data provided' }, { status: 400 });
    }

    const data = result.data;

    // Optional: Extract images
    const images: any[] = [];
    const addImage = (base64Str?: string) => {
      if (base64Str && base64Str.startsWith('data:image')) {
        images.push({
          type: "image_url",
          image_url: { url: base64Str }
        });
      }
    };
    
    addImage(data.body_scan_front);
    addImage(data.body_scan_left);
    addImage(data.body_scan_right);
    addImage(data.body_scan_back);
    addImage(data.goal_physique_image);

    let visualObservations = "No photos provided.";

    if (images.length > 0) {
      console.log(`Sending ${images.length} images to Groq Vision...`);
      try {
        const visionResponse = await groq.chat.completions.create({
          messages: [
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: "You are an expert fitness coach and physique analyst. Analyze these photos of the user (and possibly their target inspiration physique). Output a structured JSON response with your visual observations including: estimated body fat percentage range, muscle mass distribution, posture assessment, and what needs to change to achieve the target physique. Output ONLY valid JSON." 
                },
                ...images
              ],
            }
          ],
          model: "llama-3.2-90b-vision-preview",
          temperature: 0.2,
          response_format: { type: "json_object" }
        });

        visualObservations = visionResponse.choices[0]?.message?.content || "{}";
        console.log("Vision Observations:", visualObservations);
      } catch (err) {
        console.error("Groq Vision API Error:", err);
        visualObservations = JSON.stringify({ error: "Failed to analyze images due to API error." });
      }
    }

    // Now, call Groq Text for the final strategy
    console.log("Generating fitness reasoning...");
    let aiStrategy = {};
    try {
      const systemPrompt = `You are an elite AI Fitness Coach building a highly personalized transformation strategy.
Here is the user's data:
Gender: ${data.gender || 'Not specified'}
Age: ${data.age || 'Not specified'}
Height: ${data.height ? data.height + 'cm' : 'Not specified'}
Weight: ${data.weight ? data.weight + 'kg' : 'Not specified'}
Goal: ${data.goal || 'Not specified'}
Target Weight: ${data.target_weight ? data.target_weight + 'kg' : 'Not specified'}
Target Physique: ${data.target_physique || 'Not specified'}
Fitness Level: ${data.fitness_level || 'Not specified'}
Training Days: ${data.training_days_per_week || 'Not specified'}
Training Location: ${data.training_location || 'Not specified'}
Equipment: ${data.equipment?.join(', ') || 'Not specified'}
Diet Type: ${data.food_type || 'Not specified'}
Allergies: ${data.food_allergies || 'None'}
Injuries/Health Issues: ${data.physical_problems?.join(', ') || 'None'}

Visual Observations (from our Vision AI):
${visualObservations}

Generate a comprehensive Transformation Strategy JSON containing exactly these top-level keys:
- "training_strategy": (string) A summary of the workout approach they should take.
- "nutrition_strategy": (string) A summary of the diet approach.
- "progress_roadmap": (array of strings) 3-4 key milestones they will hit in the next 3-6 months.
Output ONLY valid JSON matching this schema.`;

      const reasoningResponse = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate my strategy now." }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const reasoningJson = reasoningResponse.choices[0]?.message?.content || "{}";
      aiStrategy = JSON.parse(reasoningJson);
      console.log("AI Strategy Generated:", aiStrategy);
    } catch (err) {
      console.error("Groq Reasoning API Error:", err);
      aiStrategy = { error: "Failed to generate strategy." };
    }

    // Now calculate baseline data
    let bmi = null;
    if (data.height && data.weight) {
      const heightInMeters = data.height / 100;
      bmi = parseFloat((data.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    let baseline_calories = null;
    if (data.weight && data.height && data.age && data.gender) {
      let bmr = 0;
      if (data.gender === "Male") {
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5;
      } else if (data.gender === "Female") {
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
      } else {
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 78;
      }

      const activityMultipliers: Record<string, number> = {
        "Mostly sitting": 1.2,
        "Lightly active": 1.375,
        "Moderately active": 1.55,
        "Very active": 1.725
      };
      const multiplier = data.activity_level ? (activityMultipliers[data.activity_level] || 1.2) : 1.2;
      baseline_calories = Math.round(bmr * multiplier);
    }

    let initial_protein_target = null;
    if (data.weight) {
      let proteinMultiplier = 1.6;
      if (data.goal === "Build Muscle" || data.goal === "Lose Fat + Build Muscle") {
        proteinMultiplier = 2.0;
      } else if (data.goal === "Build Strength") {
        proteinMultiplier = 1.8;
      }
      initial_protein_target = Math.round(data.weight * proteinMultiplier);
    }

    const weight_trend_baseline = data.weight || null;

    // Save to database
    const { error: upsertError } = await supabase
      .from("fitness_os_profiles")
      .upsert(
        { 
          user_id: user.id, 
          ...data,
          bmi,
          baseline_calories,
          initial_protein_target,
          weight_trend_baseline,
          ai_strategy: aiStrategy,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Failed to save fitness profile:", upsertError);
      return NextResponse.json({ success: false, error: "Failed to save profile." }, { status: 500 });
    }

    return NextResponse.json({ success: true, ai_strategy: aiStrategy });

  } catch (err: any) {
    console.error("Analysis Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
