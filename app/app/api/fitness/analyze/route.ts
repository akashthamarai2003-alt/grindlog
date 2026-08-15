import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/services/supabase/server";
import { OnboardingSchema } from '@/types/fitness/onboarding';
import { getGroqClient } from "@/lib/services/groq/client";

export async function POST(req: Request) {
  try {
    const groq = getGroqClient();
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

    // Optional: Extract images for Gemini Vision
    const images: any[] = [];
    const addImage = (base64Str?: string) => {
      if (base64Str && base64Str.startsWith('data:image')) {
        const [meta, data] = base64Str.split(',');
        const mimeType = meta.split(';')[0].split(':')[1];
        images.push({
          inlineData: {
            data,
            mimeType
          }
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
      console.log(`Sending ${images.length} images to Google Gemini Vision...`);
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY missing");
        
        const gemini = new GoogleGenAI({ apiKey });
        const response = await gemini.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [{
            role: "user",
            parts: [
              { text: "You are an expert fitness coach and physique analyst. Analyze these photos of the user (and their target inspiration physique, if provided). Output a structured JSON response with your visual observations including: estimated body fat percentage range, muscle mass distribution, posture assessment, fat distribution, visual strengths/weaknesses, and what physically needs to change to approach the target physique. Output ONLY valid JSON." },
              ...images
            ]
          }],
          config: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        });

        visualObservations = response.text || "{}";
        console.log("Gemini Vision Observations:", visualObservations);
      } catch (err) {
        console.error("Gemini Vision API Error:", err);
        visualObservations = JSON.stringify({ error: "Failed to analyze images due to API error." });
      }
    }

    // Calculate baseline math metrics (BMI, Body Fat %, BMR)
    let bmi = null;
    if (data.height && data.weight) {
      const heightInMeters = data.height / 100;
      bmi = parseFloat((data.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    let estimated_body_fat = null;
    if (data.height && data.waist_cm) {
      if (data.gender === "Female") {
        const logVal = Math.log10(data.waist_cm + (data.waist_cm + 15) - 35);
        const logHeight = Math.log10(data.height);
        estimated_body_fat = Math.max(10, Math.min(50, parseFloat((495 / (1.29579 - 0.35004 * logVal + 0.22100 * logHeight) - 450).toFixed(1))));
      } else {
        const neck = 38;
        const diff = Math.max(10, data.waist_cm - neck);
        const logDiff = Math.log10(diff);
        const logHeight = Math.log10(data.height);
        estimated_body_fat = Math.max(5, Math.min(50, parseFloat((495 / (1.0324 - 0.19077 * logDiff + 0.15456 * logHeight) - 450).toFixed(1))));
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
Waist: ${data.waist_cm ? data.waist_cm + 'cm' : 'Not specified'}
Chest: ${data.chest_cm ? data.chest_cm + 'cm' : 'Not specified'}
Arm: ${data.arm_cm ? data.arm_cm + 'cm' : 'Not specified'}
Thigh: ${data.thigh_cm ? data.thigh_cm + 'cm' : 'Not specified'}
Calculated BMI: ${bmi || 'Not computed'}
Formula Estimated Body Fat % (US Navy Method): ${estimated_body_fat ? estimated_body_fat + '%' : 'Not computed (Waist measurement missing)'}
Goal: ${data.goal || 'Not specified'}
Target Weight: ${data.target_weight ? data.target_weight + 'kg' : 'Not specified'}
Target Deadline: ${data.target_deadline_days ? `${data.target_deadline_days} days` : 'Not specified'}
Target Physique Preference: ${data.target_physique || 'Not specified'}
Fitness Level: ${data.fitness_level || 'Not specified'}
Training Days: ${data.training_days_per_week || 'Not specified'}
Training Location: ${data.training_location || 'Not specified'}
Equipment: ${data.equipment?.join(', ') || 'Not specified'}
Diet Type: ${data.food_type || 'Not specified'}
Food Environment: ${data.food_environment || 'Home'}
Meals per day: ${data.meals_per_day || 'Not specified'}
Nutrition Budget: ${data.nutrition_budget || 'Not specified'}
Available Foods: ${data.available_foods?.join(', ') || 'None specified'}
Allergies: ${data.food_allergies || 'None'}
Disliked/Avoided Foods: ${[data.foods_disliked, data.foods_avoided].filter(Boolean).join(', ') || 'None'}
Injuries/Health Issues: ${data.physical_problems?.join(', ') || 'None'}
Previous Injuries: ${data.previous_injuries ? 'Yes' : 'No'}
Exercise Limitations: ${data.exercise_limitations?.join(', ') || 'None'}
Activity Level: ${data.activity_level || 'Not specified'}
Daily Steps: ${data.daily_steps || 'Not specified'}
Sleep Duration: ${data.sleep_duration || 'Not specified'}
Daily Schedule: Wake: ${data.wake_time || 'N/A'}, Work: ${data.work_time || 'N/A'}, Workout: ${data.workout_time || 'N/A'}, Sleep: ${data.sleep_time || 'N/A'}
Lifestyle Context: ${data.lifestyle_description || 'N/A'}

Visual Observations (from our Google Gemini Vision AI on uploaded body scan & goal inspiration photos):
${visualObservations}

Generate a comprehensive Transformation Strategy JSON containing exactly these top-level keys:
- "training_strategy": (string) A summary of the workout approach they should take.
- "nutrition_strategy": (string) A summary of the diet approach. If PG/Hostel is selected, explicitly advise on supplementing PG meals with cheap high-protein add-ons (e.g. boiled eggs, roasted chana, soya chunks).
- "progress_roadmap": (array of strings) 3-4 key milestones they will hit in their journey.
- "focus_areas": (array of exactly 5 short strings) Top 5 areas they need to focus on (e.g. 'Reduce waist/body fat', 'Develop shoulders', etc).
- "fitness_score": (number 0-100) A coach-assigned starting fitness score based on their current stats vs goal.
- "reality_check": (object) Containing:
    - "is_timeframe_realistic": (boolean) If target deadline is specified, evaluate if it's realistic for the weight loss/physique goal. If not specified, set to true.
    - "honest_assessment": (string) If a deadline is provided, assess what can actually be achieved in that time vs the goal. If NO deadline is provided (Not specified), you must calculate and state the MOST REALISTIC timeframe required to achieve their goal safely (e.g. 'To safely lose 15kg, you will need approximately 4 to 6 months of consistency.').
    - "achievable_in_timeframe": (array of strings) 3-5 realistic accomplishments achievable in the provided timeframe (or your calculated timeframe).
- "budget_breakdown": (object) Detail how their budget aligns with extra food costs:
    - "monthly_budget": (string) E.g. "₹2,000/month".
    - "recommended_add_ons": (array of exactly 4 objects with fields "item", "daily_qty", "daily_cost", "monthly_cost", "protein_provided_g").
    - "total_estimated_monthly_cost": (string) E.g. "₹2,100/month".
    - "budget_verdict": (string) Explanation of how it fits their food environment and budget.
    CRITICAL BUDGET RULE: The mathematically calculated sum of the 4 items' "monthly_cost" MUST strictly be equal to or less than their requested Nutrition Budget (${data.nutrition_budget || 'Not specified'}). Do NOT exceed their budget. If their budget is extremely low (e.g. ₹0–1,000), drastically lower the "daily_qty" of the items to ensure the total monthly cost stays under ₹1,000!
- "timeline_projection": (array of objects with fields "timeframe" (e.g. "Week 1-2", "Week 3-4"), "target_weight_kg" (string or number), "expected_changes" (string)).
Output ONLY valid JSON matching this schema.`;

      const { generateAIResponseJSON } = await import("@/lib/services/groq/client");
      
      aiStrategy = await generateAIResponseJSON({
        systemPrompt,
        userPrompt: "Generate my strategy now.",
        model: "primary",
        maxTokens: 8000,
      });
      console.log("AI Strategy Generated:", aiStrategy);
    } catch (err) {
      console.error("Groq Reasoning API Error:", err);
      aiStrategy = { error: "Failed to generate strategy." };
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
      if (data.goal === "Build Muscle" || data.goal === "Gain Weight" || data.goal === "Lose Fat + Build Muscle") {
        proteinMultiplier = 2.0;
      } else if (data.goal === "Build Strength") {
        proteinMultiplier = 1.8;
      }
      initial_protein_target = Math.round(data.weight * proteinMultiplier);
    }

    const weight_trend_baseline = data.weight || null;

    // Remove massive base64 images before saving
    const {
      body_scan_front,
      body_scan_left,
      body_scan_right,
      body_scan_back,
      body_scan_inspiration,
      goal_physique_image,
      ...safeData
    } = data;

    // Save to database
    const { error: upsertError } = await supabase
      .from("fitness_os_profiles")
      .upsert(
        { 
          user_id: user.id, 
          
          // Basic Info
          goal: data.goal,
          fitness_level: data.fitness_level,
          age: data.age,
          height: data.height,
          weight: data.weight,
          target_weight: data.target_weight,
          gender: data.gender,
          
          // Training
          training_location: data.training_location,
          equipment: data.equipment,
          training_days_per_week: data.training_days_per_week,
          workout_duration_minutes: data.workout_duration_minutes,
          preferred_training_days: data.preferred_training_days,
          preferred_training_time: data.preferred_training_time || data.workout_time,
          
          // Nutrition & Lifestyle
          diet_preference: data.food_type,
          food_type: data.food_type,
          food_environment: data.food_environment,
          meals_per_day: data.meals_per_day,
          available_foods: data.available_foods,
          food_allergies: data.food_allergies,
          foods_disliked: data.foods_disliked,
          foods_avoided: data.foods_avoided,
          nutrition_budget: data.nutrition_budget,
          activity_level: data.activity_level,
          daily_steps: data.daily_steps,
          sleep_duration: data.sleep_duration,
          wake_time: data.wake_time,
          workout_time: data.workout_time,
          work_time: data.work_time,
          sleep_time: data.sleep_time,
          lifestyle_description: data.lifestyle_description,
          
          // Physical Concerns & Injuries
          physical_problems: data.physical_problems,
          current_pain_severity: data.current_pain_severity,
          current_pain_triggers: data.current_pain_triggers,
          previous_injuries: data.previous_injuries,
          previous_injury_areas: data.previous_injury_areas,
          previous_injury_timeline: data.previous_injury_timeline,
          exercise_limitations: data.exercise_limitations,
          medical_guidance: data.medical_guidance,
          additional_health_notes: data.additional_health_notes,
          safety_acknowledged: data.safety_acknowledged,
          
          // Body Scans & Physique
          target_physique: data.target_physique,
          
          // Computed Data
          bmi,
          baseline_calories,
          initial_protein_target,
          weight_trend_baseline,
          ai_strategy: aiStrategy,
          onboarding_data: safeData,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Failed to save fitness profile:", upsertError);
      return NextResponse.json({ success: false, error: "Failed to save profile." }, { status: 500 });
    }

    // Save visual observations to scans table so generate-draft can use it
    if (images.length > 0 && visualObservations !== "No photos provided.") {
      await supabase
        .from("fitness_os_scans")
        .upsert(
          {
            user_id: user.id,
            gemini_analysis: visualObservations,
            updated_at: new Date().toISOString()
          },
          { onConflict: "user_id" }
        );
    }

    return NextResponse.json({ success: true, ai_strategy: aiStrategy });

  } catch (err: any) {
    console.error("Analysis Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
