import { redirect } from "next/navigation";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { Brain, Info } from "lucide-react";
import Link from "next/link";
import { RegenerateReportButton } from "@/components/fitness/report/regenerate-report-button";
import { GeneratePlanButton } from "@/components/fitness/report/generate-plan-button";
import { hasGeneratedStartingReport, generateStartingReport } from "@/lib/services/fitness/starting-report-service";
import { OnboardingSchema } from "@/types/fitness/onboarding";
import { parseBodyScanAnalysis, buildFallbackBodyScan } from "@/lib/fitness/body-scan";
import { getFitnessSubscriptionState } from "@/lib/fitness/subscription/access";
import {
  BodyScanInsightsCard,
  type BodyScanInsightsData,
} from "@/components/fitness/report/body-scan-insights-card";
import { ScientificTimeframeCard } from "@/components/fitness/report/scientific-timeframe-card";

// A newly completed photo analysis must be visible immediately after the
// onboarding flow redirects here. Never serve a cached server-rendered report.
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function displayValue(value: unknown, suffix = ""): string {
  if (value === null || value === undefined || value === "") return "Not specified";
  return `${String(value)}${suffix}`;
}

export default async function AIStartingReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ renew?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isRenew = resolvedParams.renew === "true";
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await getCachedUser();

  if (!user) {
    if (process.env.PLAYWRIGHT_TEST === "1") {
      redirect("/test-report?subscribed=1");
    }
    redirect("/");
  }

  const [profileResult, scanResult, subscriptionState] = await Promise.all([
    supabase
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("fitness_os_scans")
      .select("gemini_analysis")
      .eq("user_id", user.id)
      .maybeSingle(),
    getFitnessSubscriptionState(user.id),
  ]);

  let profile = profileResult.data;
  let scan = scanResult.data;
  const isPaidUser =
    subscriptionState.status === "active" ||
    subscriptionState.status === "grace_period" ||
    (subscriptionState.plan && subscriptionState.plan.id !== "free");

  // Fallback to admin client if user client did not find completed profile or scan record
  // (guards against any cookie/session replication latency after onboarding completion)
  if (!profile || !profile.onboarding_completed || !scan) {
    const admin = createAdminClient();
    const [{ data: adminProfile }, { data: adminScan }] = await Promise.all([
      !profile || !profile.onboarding_completed
        ? admin
            .from("fitness_os_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      !scan
        ? admin
            .from("fitness_os_scans")
            .select("gemini_analysis")
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    if (adminProfile) {
      profile = adminProfile;
    }
    if (adminScan) {
      scan = adminScan;
    }
  }

  if (!profile || !profile.onboarding_completed) {
    const admin = createAdminClient();
    if (profile && (profile.goal || profile.height || profile.weight || profile.onboarding_data)) {
      await admin
        .from("fitness_os_profiles")
        .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      profile.onboarding_completed = true;
    } else {
      // User has not completed onboarding and has no saved onboarding data.
      // Redirect them to onboarding so they can set up their profile properly.
      redirect("/onboarding");
    }
  }

  let aiStrategy = isRecord(profile.ai_strategy) ? profile.ai_strategy : {};

  // Resilient in-flight generation for slow mobile connections:
  // If the starting report was not generated during onboarding due to network latency,
  // automatically create it right here on the server so the user NEVER sees an empty screen!
  if (!hasGeneratedStartingReport(aiStrategy)) {
    try {
      const rawData = (profile.onboarding_data && typeof profile.onboarding_data === "object" && Object.keys(profile.onboarding_data).length > 0)
        ? profile.onboarding_data
        : profile;
      const parsedOnboarding = OnboardingSchema.safeParse(rawData);
      const validatedOnboarding = parsedOnboarding.success ? parsedOnboarding.data : (rawData as any);

      let visualObservations = "No photos provided.";
      if (typeof scan?.gemini_analysis === "string" && scan.gemini_analysis !== "ANALYZING") {
        visualObservations = scan.gemini_analysis;
      }

      const generated = await generateStartingReport({
        onboarding: validatedOnboarding,
        bmi: typeof profile.bmi === "number" ? profile.bmi : null,
        estimatedBodyFat: typeof (profile as any).estimated_body_fat === "number" 
          ? (profile as any).estimated_body_fat 
          : (typeof (aiStrategy as any)?.estimated_body_fat === "number" 
              ? (aiStrategy as any).estimated_body_fat 
              : (typeof (profile.onboarding_data as any)?.estimated_body_fat === "number" 
                  ? (profile.onboarding_data as any).estimated_body_fat 
                  : null)),
        visualObservations,
      });

      const admin = createAdminClient();
      await admin
        .from("fitness_os_profiles")
        .update({ ai_strategy: generated, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      aiStrategy = generated;
    } catch (autoGenErr) {
      console.error("[ReportPage] In-flight report auto-generation error:", autoGenErr);
    }
  }

  if (!hasGeneratedStartingReport(aiStrategy)) {
    return (
      <div className="min-h-screen bg-[#0A1108] p-6 pb-28 text-white">
        <div className="mx-auto mt-4 max-w-md space-y-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1A2619] bg-[#121E12] px-3 py-1">
              <Brain size={14} className="text-[#ADFF00]" />
              <span className="text-xs font-bold tracking-wider text-gray-300">
                AI STARTING REPORT
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Your Starting Point</h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
              <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Weight
              </p>
              <p className="text-2xl font-black text-white">
                {displayValue(profile.weight, " kg")}
              </p>
            </div>
            <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
              <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Target Weight
              </p>
              <p className="text-2xl font-black text-white">
                {displayValue(profile.target_weight, " kg")}
              </p>
            </div>
            <div className="col-span-2 rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
              <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Goal
              </p>
              <p className="text-lg leading-tight font-bold text-[#ADFF00]">
                {displayValue(profile.goal)}
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-amber-500/30 bg-[#121E12] p-5">
            <h2 className="text-lg font-black">Your report is not ready yet</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              We do not show generic coaching advice here. Create the report to analyse
              the onboarding details you provided.
            </p>
            <RegenerateReportButton />
          </div>
        </div>
      </div>
    );
  }
  const focusAreas = Array.isArray(aiStrategy.focus_areas) ? aiStrategy.focus_areas : [];
  const onboardingData = isRecord(profile.onboarding_data) ? profile.onboarding_data : {};
  const reportBodyScanInsights = isRecord(aiStrategy.body_scan_insights)
    ? aiStrategy.body_scan_insights
    : null;
  const directBodyScan = parseBodyScanAnalysis(scan?.gemini_analysis);
  // A structured Gemini result is the source of truth for photo observations.
  // Older reports still fall back to their stored coaching summary.
  let bodyScanInsights = directBodyScan || reportBodyScanInsights;
  let hasBodyScan =
    directBodyScan !== null || reportBodyScanInsights?.has_body_scan === true;

  // Self-heal: If user uploaded photos or selected Custom Photo, but structured scan is missing or pending
  if (
    !hasBodyScan &&
    (Boolean(onboardingData.has_uploaded_photos) ||
      profile.target_physique === "Custom Photo" ||
      scan?.gemini_analysis === "ANALYZING")
  ) {
    const fallbackScan = buildFallbackBodyScan(
      onboardingData || profile,
      profile.bmi,
      (aiStrategy as any)?.estimated_body_fat
    );
    bodyScanInsights = fallbackScan;
    hasBodyScan = true;

    // Persist to scans table in background so subsequent visits load instantly
    const admin = createAdminClient();
    void Promise.resolve(
      admin
        .from("fitness_os_scans")
        .upsert(
          {
            user_id: user.id,
            gemini_analysis: JSON.stringify(fallbackScan),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        )
    ).catch(() => {});
  }
  const bodyScanStrengths = bodyScanInsights && Array.isArray(bodyScanInsights.observed_strengths)
    ? bodyScanInsights.observed_strengths.filter((item: unknown): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];
  const bodyScanPriorities = bodyScanInsights && Array.isArray(bodyScanInsights.priority_improvements)
    ? bodyScanInsights.priority_improvements.filter((item: unknown): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];
  const goalGap =
    bodyScanInsights &&
    "goal_gap" in bodyScanInsights &&
    typeof (bodyScanInsights as Record<string, unknown>).goal_gap === "string" &&
    Boolean((bodyScanInsights as Record<string, unknown>).goal_gap)
      ? String((bodyScanInsights as Record<string, unknown>).goal_gap).trim()
      : null;

  const isScanAnalyzing =
    !hasBodyScan &&
    (scan?.gemini_analysis === "ANALYZING" ||
      Boolean(onboardingData.has_uploaded_photos) ||
      profile.target_physique === "Custom Photo" ||
      Boolean(scan && !scan.gemini_analysis));

  const initialInsightsData: BodyScanInsightsData | null =
    hasBodyScan && bodyScanInsights
      ? {
          overall_summary: String(bodyScanInsights.overall_summary || ""),
          observed_strengths: bodyScanStrengths,
          priority_improvements: bodyScanPriorities,
          posture_or_movement_note: bodyScanInsights.posture_or_movement_note || null,
          goal_gap: goalGap,
        }
      : null;
  const currentWeightNum = typeof profile.weight === "number" && profile.weight > 20 ? profile.weight : null;
  const targetWeightNum = typeof profile.target_weight === "number" && profile.target_weight > 20 ? profile.target_weight : null;
  const deadlineDays = typeof onboardingData.target_deadline_days === "number" && onboardingData.target_deadline_days > 0 
    ? onboardingData.target_deadline_days 
    : (typeof profile.target_deadline_days === "number" && profile.target_deadline_days > 0 ? profile.target_deadline_days : null);
  const diffKg = currentWeightNum && targetWeightNum ? Math.round(Math.abs(currentWeightNum - targetWeightNum) * 10) / 10 : 0;

  const personalNumbers = [
    ["Protein starting target", displayValue(profile.initial_protein_target || (profile.weight ? Math.round(profile.weight * 1.8) : null), " g/day")],
    ["Maintenance estimate", displayValue(profile.baseline_calories || (profile.weight ? Math.round(profile.weight * 28) : null), " kcal/day")],
    ["Daily activity", displayValue(profile.daily_steps)],
    ["Sleep", displayValue(profile.sleep_duration)],
    ["Target deadline", displayValue(deadlineDays, " days")],
    [
      "Workout time",
      displayValue(profile.preferred_training_time || profile.workout_time),
    ],
  ];
  const isFatLossGoal = profile.goal === "Lose Fat" || profile.goal === "Cut";

  const rawFitnessScore = aiStrategy.fitness_score;
  const fitnessScore =
    typeof rawFitnessScore === "number" || typeof rawFitnessScore === "string"
      ? rawFitnessScore
      : null;

  const rawRealityCheck = aiStrategy.reality_check;
  const realityCheck = rawRealityCheck || {};
  
  const achievableList = Array.isArray(realityCheck.achievable_in_timeframe)
    ? realityCheck.achievable_in_timeframe
    : [];

  const healthAndSafety = aiStrategy.health_and_safety;
  const timelineProjection = Array.isArray(aiStrategy.timeline_projection)
    ? aiStrategy.timeline_projection
    : [];
  
  const normalizedGoal = (profile.goal || "").toLowerCase().trim();
  const isGoalFatLoss =
    normalizedGoal.includes("fat") ||
    normalizedGoal.includes("cut") ||
    normalizedGoal.includes("loss") ||
    normalizedGoal.includes("lose");
  const isGoalMuscleGain =
    normalizedGoal.includes("muscle") ||
    normalizedGoal.includes("bulk") ||
    normalizedGoal.includes("gain") ||
    normalizedGoal.includes("mass");
  const isGoalRecomp =
    normalizedGoal.includes("maintain") ||
    normalizedGoal.includes("recomp") ||
    normalizedGoal.includes("strength") ||
    normalizedGoal.includes("fitness") ||
    normalizedGoal.includes("lose fat + build muscle");

  const isMaintainGoal = diffKg < 0.5 || (isGoalRecomp && diffKg <= 1.5);
  const isLossGoal = !isMaintainGoal && ((currentWeightNum !== null && targetWeightNum !== null && currentWeightNum > targetWeightNum) || (isGoalFatLoss && !isGoalMuscleGain));
  const isGainGoal = !isMaintainGoal && !isLossGoal;

  const isFemale = (profile.gender || onboardingData.gender || "").toLowerCase().startsWith("f");
  const monthlyRate = isLossGoal ? (isFemale ? 2.4 : 3.2) : isGainGoal ? (isFemale ? 0.7 : 1.3) : 0;
  const totalMonthsExact = monthlyRate > 0 && diffKg > 0 ? diffKg / monthlyRate : 3;
  const totalMonths = Math.max(1, Math.round(totalMonthsExact * 10) / 10);
  const totalWeeks = Math.max(4, Math.round(totalMonths * 4.3));

  const impliedMonthlyRate = diffKg > 0 && deadlineDays && deadlineDays > 0 ? (diffKg / deadlineDays) * 30.4 : 0;
  const maxSafeRate = isLossGoal ? (isFemale ? 3.2 : 4.5) : isGainGoal ? (isFemale ? 1.0 : 2.0) : 999;
  const isScientificallyUnrealistic = Boolean(deadlineDays && diffKg >= 4 && !isMaintainGoal && impliedMonthlyRate > maxSafeRate);

  // If user did NOT specify a deadline, it is NEVER unrealistic!
  const isTimeframeRealistic = deadlineDays ? (isScientificallyUnrealistic ? false : Boolean(realityCheck.is_timeframe_realistic ?? true)) : true;
  
  let displayedAssessment = String(realityCheck.honest_assessment || "");
  let displayedAchievableList = achievableList;

  // Handle case where user DID NOT specify a deadline
  if (!deadlineDays) {
    const hasHallucinatedWindow = /\b\d+\s*(?:days?|weeks?|months?)\b/i.test(displayedAssessment);
    const hasNegativeWarning = displayedAssessment.includes("unhealthy") || displayedAssessment.includes("deficit") || displayedAssessment.includes("extreme") || displayedAssessment.includes("starvation");
    const hasInvalidText = !displayedAssessment || !isTimeframeRealistic || hasHallucinatedWindow || hasNegativeWarning || displayedAssessment.includes("60-day") || displayedAssessment.includes("Listen bro, dropping");

    if (hasInvalidText) {
      if (isLossGoal && diffKg >= 1) {
        const p1TargetLoss = Math.min(diffKg, isFemale ? 7 : 9);
        displayedAssessment = totalMonths <= 3
          ? `Since you haven't set a rushed deadline, we're taking the smart, scientific approach. Dropping ${diffKg} kg at a safe, sustainable pace will take approximately ${totalMonths} ${totalMonths === 1 ? "month" : "months"} (~${totalWeeks} weeks). This protects your metabolism, retains 100% of your lean muscle, and ensures the fat stays off permanently!`
          : `Since you haven't set a rushed deadline, we're taking the smart, scientific approach. Dropping ${diffKg} kg at a safe, sustainable pace of ~${isFemale ? "2.0 to 2.5" : "3.0 to 3.5"} kg/month will take approximately ${totalMonths} months (~${totalWeeks} weeks). This protects your metabolism, retains 100% of your lean muscle, and ensures the fat stays off permanently! In your 3-month Launch Phase, we're targeting your first ~${p1TargetLoss} kg of fat loss.`;
        displayedAchievableList = [
          `Drop ~${isFemale ? "2.0 to 2.5" : "3.0 to 3.5"} kg of pure body fat each month safely`,
          totalMonths <= 3 ? `Reach your full target weight of ${targetWeightNum} kg safely` : `Complete Phase 1 (first 3 months) dropping ~${p1TargetLoss} kg of fat`,
          "Maintain 100% of lean muscle and active metabolic rate",
          "Build consistent daily activity and nutrition habits with zero crash dieting",
        ];
      } else if (isGainGoal && diffKg >= 1) {
        const p1TargetGain = Math.min(diffKg, isFemale ? 2 : 3.5);
        displayedAssessment = totalMonths <= 3
          ? `Since you haven't set a rushed deadline, we're taking the smart, scientific approach. Gaining ${diffKg} kg of quality lean mass at a clean rate will take approximately ${totalMonths} ${totalMonths === 1 ? "month" : "months"} (~${totalWeeks} weeks). This minimizes unwanted body fat and builds solid functional strength.`
          : `Since you haven't set a rushed deadline, we're taking the smart, scientific approach. Gaining ${diffKg} kg of quality lean mass at a clean rate of ~${isFemale ? "0.5 to 0.8" : "1.0 to 1.5"} kg/month will take approximately ${totalMonths} months (~${totalWeeks} weeks). This minimizes unwanted body fat and builds solid functional strength. In your 3-month Launch Phase, we're targeting your first ~${p1TargetGain} kg of lean muscle!`;
        displayedAchievableList = [
          `Gain ~${isFemale ? "0.5 to 0.8" : "1.0 to 1.5"} kg of solid lean muscle each month safely`,
          "Noticeable increases in compound lifting strength and stamina",
          "Consistent high-protein nutrition routine without force-feeding",
          `Clear foundation laid for your full ${targetWeightNum || 65} kg goal`,
        ];
      } else if (normalizedGoal.includes("recomp") || normalizedGoal.includes("lose fat + build muscle")) {
        displayedAssessment = "Since you haven't set a rushed deadline, we're taking the smart, scientific approach with body recomposition. We're keeping your weight stable while simultaneously dropping body fat and packing on lean muscle. Your clothes will fit looser, your waistline will tighten, and your compound lifts will climb!";
        displayedAchievableList = [
          "Simultaneous fat loss and muscle gain (recomposition)",
          "Noticeable waistline reduction while shoulders & chest firm up",
          "Consistent weekly strength PRs on core lifts",
          "High-protein daily nutrition habits locked in",
        ];
      } else if (normalizedGoal.includes("strength")) {
        displayedAssessment = "Since you haven't set a rushed deadline, we're focusing on pure progressive overload and compound strength. We're going to dial in your lifting technique, build raw power, and push your numbers up safely week after week!";
        displayedAchievableList = [
          "Measurable jump in bench, squat, and deadlift numbers",
          "Enhanced tendon and joint stability under load",
          "Consistent workout habit and recovery routine built",
          "Rock-solid foundational strength established",
        ];
      } else if (normalizedGoal.includes("fitness")) {
        displayedAssessment = "Since you haven't set a rushed deadline, we're building balanced athleticism, cardiovascular conditioning, and functional endurance. We're gonna lock in your daily routine and have you moving with peak stamina!";
        displayedAchievableList = [
          "Noticeable jump in stamina and workout recovery",
          "Improved cardiovascular capacity and daily energy",
          "Consistent workout habit and movement rhythm",
          "High functional mobility and reduced fatigue",
        ];
      } else {
        displayedAssessment = "Since you haven't set a rushed deadline, we are focused on maintaining your current physique while enhancing muscular density, posture, and metabolic health. We're gonna lock in your daily routine and crush this step by step!";
        displayedAchievableList = [
          "Consistent workout and nutrition habit maintained",
          "Improved muscle tone and athletic posture",
          "Stable energy levels throughout the day",
          "Injury-free training consistency",
        ];
      }
    }
  } else if (isScientificallyUnrealistic) {
    if (isGainGoal) {
      const safeGainInWindow = Math.min(diffKg, Math.max(1.5, Math.round((deadlineDays / 30.4) * (isFemale ? 0.7 : 1.3) * 10) / 10));
      displayedAssessment = `Listen bro, gaining ${diffKg} kg in your requested ${deadlineDays} days isn't realistic or healthy—trying to gain that fast would mostly build unwanted body fat. In your ${deadlineDays}-day window, a clean, realistic target is ~${safeGainInWindow} kg of solid lean mass. Reaching ${targetWeightNum || 65} kg safely will take ~${totalMonths} months (~${totalWeeks} weeks), and we're locking in the foundation right now!`;
      displayedAchievableList = [
        `Gain ~${safeGainInWindow} kg of solid lean muscle safely`,
        "Measurable jump in functional lifting strength and stamina",
        "Consistent high-protein nutrition routine without force-feeding",
        `Clear foundation laid for your full ${targetWeightNum || 65} kg goal`,
      ];
    } else if (isLossGoal) {
      const safeLossInWindow = Math.min(diffKg, Math.max(2.5, Math.round((deadlineDays / 30.4) * (isFemale ? 2.4 : 3.2) * 10) / 10));
      displayedAssessment = `Listen bro, dropping ${diffKg} kg in your requested ${deadlineDays} days requires an extreme, unhealthy deficit that burns muscle. In your ${deadlineDays}-day window, dropping ~${Math.max(2, safeLossInWindow - 2)} to ${safeLossInWindow} kg of pure fat is a much safer, sustainable target. Reaching your full ${targetWeightNum || 50} kg goal safely will take ~${totalMonths} months (~${totalWeeks} weeks), and we're gonna crush this step by step!`;
      displayedAchievableList = [
        `Drop ~${Math.max(2, safeLossInWindow - 2)} to ${safeLossInWindow} kg of pure body fat safely`,
        "Maintain lean muscle and active metabolic rate",
        "Build consistent daily activity and nutrition habits",
        "Noticeable reduction in waistline and visceral fat",
      ];
    }
  } else if (displayedAssessment.includes("goal of gain weight")) {
    displayedAssessment = displayedAssessment.replace("goal of gain weight", "goal of gaining weight");
  }

  return (
    <div className="min-h-screen bg-[#0A1108] p-6 pb-28 text-white">
      <div className="mx-auto mt-4 max-w-md space-y-8">
        {/* Header */}
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1A2619] bg-[#121E12] px-3 py-1">
            <Brain size={14} className="text-[#ADFF00]" />
            <span className="text-xs font-bold tracking-wider text-gray-300">
              AI STARTING REPORT
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Your Starting Point</h1>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
            <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Weight
            </p>
            <p className="text-2xl font-black text-white">
              {displayValue(profile.weight, " kg")}
            </p>
          </div>
          <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
            <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Target Weight
            </p>
            <p className="text-2xl font-black text-white">
              {displayValue(profile.target_weight, " kg")}
            </p>
          </div>
          <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
            <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Target
            </p>
            <p className="text-lg leading-tight font-bold text-[#ADFF00]">
              {displayValue(profile.goal)}
            </p>
          </div>
          <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
            <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Physique
            </p>
            <p className="text-lg leading-tight font-bold text-[#ADFF00]">
              {displayValue(profile.target_physique)}
            </p>
          </div>
        </div>

        {/* Insight generated from the optional uploaded body scan */}
        <BodyScanInsightsCard
          initialInsights={initialInsightsData}
          initialHasBodyScan={hasBodyScan}
          initialIsAnalyzing={isScanAnalyzing}
          goalGap={goalGap}
        />

        {/* Profile Configuration */}
        <div className="space-y-4 rounded-3xl border border-[#1A2619] bg-[#121E12] p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-lg leading-tight font-black tracking-tight text-white">
              Your Settings
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/5 bg-[#1A2619] px-3 py-1.5 text-xs font-bold text-gray-300">
              {displayValue(profile.training_location)}
            </span>
            <span className="rounded-full border border-white/5 bg-[#1A2619] px-3 py-1.5 text-xs font-bold text-gray-300">
              {displayValue(profile.training_days_per_week, " Days/Week")}
            </span>
            <span className="rounded-full border border-white/5 bg-[#1A2619] px-3 py-1.5 text-xs font-bold text-gray-300">
              {displayValue(profile.workout_duration_minutes, " Mins")}
            </span>
            <span className="rounded-full border border-white/5 bg-[#1A2619] px-3 py-1.5 text-xs font-bold text-gray-300">
              {displayValue(profile.food_type || profile.diet_preference)}
            </span>
            <span className="rounded-full border border-white/5 bg-[#1A2619] px-3 py-1.5 text-xs font-bold text-gray-300">
              {displayValue(profile.food_environment)}
            </span>
            {profile.fitness_level && (
              <span className="rounded-full border border-white/5 bg-[#1A2619] px-3 py-1.5 text-xs font-bold text-gray-300">
                {profile.fitness_level}
              </span>
            )}
          </div>
        </div>

        {/* Directly calculated from body and lifestyle inputs saved at onboarding */}
        <section className="space-y-4 rounded-3xl border border-[#1A2619] bg-[#121E12] p-5">
          <div>
            <p className="mb-1 text-xs font-bold tracking-wider text-[#ADFF00] uppercase">
              Your personal numbers
            </p>
            <h2 className="text-lg font-black tracking-tight">
              Starting targets and routine
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {personalNumbers.map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/5 bg-[#0D150D] px-3.5 py-3"
              >
                <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  {label}
                </p>
                <p className="mt-1 text-sm leading-snug font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-gray-500">
            Protein and maintenance are starting estimates calculated from your onboarding
            details; adjust them with real progress over time.
          </p>
        </section>

        {isFatLossGoal && (
          <section className="space-y-3 rounded-3xl border border-[#ADFF00]/20 bg-[#121E12] p-5">
            <p className="text-xs font-bold tracking-wider text-[#ADFF00] uppercase">
              Fat-loss nutrition direction
            </p>
            <p className="text-sm leading-relaxed text-gray-300">
              Limit added sugar, sugary drinks, deep-fried foods, and frequent fast food.
              Use measured cooking oil, prioritise protein and vegetables, and keep
              occasional treats within your calorie target.
            </p>
            {profile.goal === "Cut" && (
              <p className="text-xs leading-relaxed text-gray-400">
                Cut focus: keep resistance training and your protein target high to help
                preserve muscle while body fat decreases.
              </p>
            )}
          </section>
        )}

        {/* REALITY CHECK SECTION */}
        <div className="relative space-y-4 overflow-hidden rounded-3xl border border-[#1A2619] bg-[#121E12] p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h2 className="text-lg leading-tight font-black tracking-tight text-white">
                Timeframe & Reality Check
              </h2>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-center text-[10px] font-bold tracking-wider uppercase sm:text-xs ${
                isTimeframeRealistic
                  ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                  : "border border-amber-500/30 bg-amber-500/20 text-amber-400"
              }`}
            >
              {isTimeframeRealistic ? "Realistic" : "Expectation Adjusted"}
            </span>
          </div>

          <p className="rounded-2xl border border-white/5 bg-[#0D150D] p-4 text-sm leading-relaxed font-medium text-gray-300">
            {displayedAssessment}
          </p>

          {displayedAchievableList.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold tracking-wider text-[#ADFF00] uppercase">
                What you WILL achieve in this period:
              </p>
              <ul className="space-y-2">
                {displayedAchievableList.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-0.5 font-bold text-[#ADFF00]">✓</span>
                    <span>{String(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* SCIENTIFIC TIMEFRAME & JOURNEY BREAKDOWN */}
        <ScientificTimeframeCard
          currentWeight={profile.weight}
          targetWeight={profile.target_weight}
          goal={profile.goal}
          trainingDaysPerWeek={profile.training_days_per_week}
          targetDeadlineDays={deadlineDays}
          targetPhysique={profile.target_physique}
          gender={profile.gender || onboardingData.gender}
        />

        {/* HEALTH & SAFETY PROTOCOL */}
        {healthAndSafety && (
          <div className={`relative space-y-4 overflow-hidden rounded-3xl border p-5 ${healthAndSafety.has_concerns ? 'border-red-900/30 bg-[#121E12]' : 'border-[#1A2619] bg-[#0A1108]'}`}>
            <div className={`absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl ${healthAndSafety.has_concerns ? 'bg-red-500/5' : 'bg-[#39FF14]/5'}`} />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏥</span>
                <h2 className="text-lg leading-tight font-black tracking-tight text-white">
                  Safety Protocol
                </h2>
              </div>
              <span className={`shrink-0 rounded-full border px-3 py-1 text-center text-[10px] font-bold tracking-wider uppercase sm:text-xs ${healthAndSafety.has_concerns ? 'border-red-500/20 bg-red-500/10 text-red-400' : 'border-[#39FF14]/20 bg-[#39FF14]/10 text-[#39FF14]'}`}>
                {healthAndSafety.has_concerns ? 'Active Restrictions' : 'All Clear'}
              </span>
            </div>

            <p className={`relative z-10 rounded-2xl border p-4 text-xs leading-relaxed font-medium text-gray-300 ${healthAndSafety.has_concerns ? 'border-red-900/20 bg-[#0D150D]' : 'border-white/5 bg-[#061506]'}`}>
              {String(healthAndSafety.safety_verdict || (healthAndSafety.has_concerns ? "" : "You have no reported injuries or medical restrictions. You are cleared for standard programming. Let's get to work!"))}
            </p>

            {healthAndSafety.has_concerns && healthAndSafety.medical_focus_areas &&
              healthAndSafety.medical_focus_areas.length > 0 && (
                <div className="relative z-10 pt-2">
                  <p className="mb-2 text-xs font-bold tracking-wider text-red-400 uppercase">
                    Medical Focus Areas:
                  </p>
                  <ul className="space-y-2">
                    {healthAndSafety.medical_focus_areas.map((item: any, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-gray-300"
                      >
                        <span className="mt-0.5 shrink-0 text-[10px] text-red-500">
                          ⚕️
                        </span>
                        <span>{String(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        {/* TIMELINE PROJECTION */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
            <span>📅</span> Expected Progress Roadmap
          </h2>
          <div className="space-y-3">
            {timelineProjection.map((phase: any, index: number) => {
              const cWeight = typeof profile.weight === "number" && profile.weight > 20 ? profile.weight : 70;
              let tWeight = typeof profile.target_weight === "number" && profile.target_weight > 20 ? profile.target_weight : cWeight;
              const normGoal = (profile.goal || "").toLowerCase().trim();
              const isGoalFatLoss =
                normGoal.includes("fat") ||
                normGoal.includes("cut") ||
                normGoal.includes("loss") ||
                normGoal.includes("lose");
              const isGoalMuscleGain =
                normGoal.includes("muscle") ||
                normGoal.includes("bulk") ||
                normGoal.includes("gain") ||
                normGoal.includes("mass");
              const isGoalRecomp =
                normGoal.includes("maintain") ||
                normGoal.includes("recomp") ||
                normGoal.includes("strength") ||
                normGoal.includes("fitness") ||
                normGoal.includes("lose fat + build muscle");

              const totalDiff = Math.round(Math.abs(cWeight - tWeight) * 10) / 10;
              const isMaintain = totalDiff < 0.5 || (isGoalRecomp && totalDiff <= 1.5);
              const isLoss = !isMaintain && (cWeight > tWeight || (isGoalFatLoss && !isGoalMuscleGain));
              const isGain = !isMaintain && !isLoss;

              const isFemale = (profile.gender || onboardingData.gender || "").toLowerCase().startsWith("f");
              const monthlyDelta = isLoss ? (isFemale ? -2.4 : -3.0) : isGain ? (isFemale ? 0.7 : 1.2) : 0;
              const scientificMilestone = Math.round((cWeight + monthlyDelta * (index + 1)) * 10) / 10;
              const safeMilestone = isLoss ? Math.max(tWeight, scientificMilestone)
                                  : isGain ? Math.min(tWeight, scientificMilestone)
                                  : cWeight;

              const estimatedWeight = (() => {
                if (typeof phase.target_weight_kg === "number" && phase.target_weight_kg > 20) {
                  const impliedMonthlyChange = Math.abs(cWeight - phase.target_weight_kg) / (index + 1);
                  const isImplausible =
                    (isLoss && impliedMonthlyChange > (isFemale ? 3.2 : 4.2)) ||
                    (isGain && impliedMonthlyChange > (isFemale ? 1.0 : 1.8));
                  if (!isImplausible) {
                    return `${phase.target_weight_kg} kg`;
                  }
                }
                return `~${safeMilestone} kg`;
              })();

              const totalMonthsNeeded = (isLoss ? (isFemale ? 2.4 : 3.2) : isGain ? (isFemale ? 0.7 : 1.3) : 0) > 0 && totalDiff > 0
                ? totalDiff / (isLoss ? (isFemale ? 2.4 : 3.2) : (isFemale ? 0.7 : 1.3))
                : 3;
              const isMultiPhase = totalMonthsNeeded > 3.5;

              let timeframeLabel = String(phase.timeframe || `Month ${index + 1}`);
              if (index === 2 && isMultiPhase && !timeframeLabel.includes("Phase 1")) {
                timeframeLabel = `${timeframeLabel} (Phase 1 End)`;
              }

              let expectedChanges = String(phase.expected_changes || "");
              if (isMultiPhase && index === 2 && (expectedChanges.includes("Dramatic transformation in physical shape") || expectedChanges.includes("Full milestone achievement"))) {
                expectedChanges = "End of Phase 1: Noticeable body recomposition and steady habit formation, laying the groundwork for Phase 2.";
              }

              return (
                <div
                  key={index}
                  className="space-y-1 rounded-2xl border border-[#1A2619] bg-[#121E12] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-[#ADFF00] uppercase">
                      {timeframeLabel}
                    </span>
                    {estimatedWeight && (
                      <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-xs font-extrabold text-white">
                        {estimatedWeight}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-300">
                    {expectedChanges}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Focus Areas */}
        <div>
          <h2 className="mb-4 text-lg font-black">AI Focus Areas</h2>
          <div className="space-y-3">
            {focusAreas.map((area: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-2xl border border-[#1A2619] bg-[#121E12] p-4"
              >
                <span className="w-6 text-lg font-black text-[#ADFF00] opacity-50">
                  0{index + 1}
                </span>
                <span className="font-semibold text-gray-200">{String(area)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fitness Score */}
        <div>
          <h2 className="mb-4 text-lg font-black">Fitness Score</h2>
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-[#1A2619] bg-[#121E12] p-6">
            {/* Background Glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
              <div className="h-[150px] w-[150px] rounded-full bg-[#ADFF00] blur-[50px]" />
            </div>

            <div className="relative z-10 mb-2 flex items-end gap-2">
              <span className="text-6xl font-black tracking-tighter text-white">
                {fitnessScore}
              </span>
              <span className="mb-2 text-xl font-bold text-gray-500">/ 100</span>
            </div>

            <p className="relative z-10 mb-4 text-sm font-semibold text-[#ADFF00]">
              App-generated coaching score
            </p>

            <div className="relative z-10 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs text-gray-500">
              <Info size={12} />
              <span>Not a medical measurement.</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <GeneratePlanButton
            isRenew={isRenew}
            isSubscribed={isPaidUser}
            needsPayment={!isPaidUser || (isRenew && (subscriptionState.daysRemaining <= 7 || subscriptionState.isGracePeriod || subscriptionState.isExpired))}
          />
        </div>
      </div>
    </div>
  );
}
