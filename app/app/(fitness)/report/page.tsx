import { redirect } from "next/navigation";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { ArrowRight, Brain, Info } from "lucide-react";
import Link from "next/link";
import { RegenerateReportButton } from "@/components/fitness/report/regenerate-report-button";
import { hasGeneratedStartingReport } from "@/lib/services/fitness/starting-report-service";
import { parseBodyScanAnalysis } from "@/lib/fitness/body-scan";

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function displayValue(value: unknown, suffix = ""): string {
  if (value === null || value === undefined || value === "") return "Not specified";
  return `${String(value)}${suffix}`;
}

export default async function AIStartingReportPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await getCachedUser();

  if (!user) {
    redirect("/");
  }

  const [{ data: profile }, { data: scan }] = await Promise.all([
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
  ]);

  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const aiStrategy = isRecord(profile.ai_strategy) ? profile.ai_strategy : {};

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
  const reportBodyScanInsights = aiStrategy.body_scan_insights as Record<string, any>;
  const directBodyScan = parseBodyScanAnalysis(scan?.gemini_analysis);
  // A structured Gemini result is the source of truth for photo observations.
  // Older reports still fall back to their stored coaching summary.
  const bodyScanInsights = directBodyScan || reportBodyScanInsights;
  const hasBodyScan =
    directBodyScan !== null || reportBodyScanInsights.has_body_scan === true;
  const personalNumbers = [
    ["Protein starting target", displayValue(profile.initial_protein_target, " g/day")],
    ["Maintenance estimate", displayValue(profile.baseline_calories, " kcal/day")],
    ["Daily activity", displayValue(profile.daily_steps)],
    ["Sleep", displayValue(profile.sleep_duration)],
    ["Target deadline", displayValue(onboardingData.target_deadline_days, " days")],
    [
      "Workout time",
      displayValue(profile.preferred_training_time || profile.workout_time),
    ],
  ];

  const rawFitnessScore = aiStrategy.fitness_score;
  const fitnessScore =
    typeof rawFitnessScore === "number" || typeof rawFitnessScore === "string"
      ? rawFitnessScore
      : null;

  const rawRealityCheck = aiStrategy.reality_check;
  const realityCheck = rawRealityCheck || {};

  const rawBudgetBreakdown = aiStrategy.budget_breakdown;
  const budgetBreakdown = rawBudgetBreakdown || {
    total_estimated_monthly_cost: "Varies",
    monthly_budget: "Varies",
    budget_verdict:
      "Focus on whole foods — eggs, rice, lentils, and seasonal vegetables give the best nutrition per rupee. Cook at home as much as possible to stay within budget.",
    recommended_add_ons: [],
  };

  const healthAndSafety = aiStrategy.health_and_safety;

  const timelineProjection = Array.isArray(aiStrategy.timeline_projection)
    ? aiStrategy.timeline_projection
    : [];

  const achievableList = Array.isArray(realityCheck.achievable_in_timeframe)
    ? realityCheck.achievable_in_timeframe
    : [];

  const recommendedAddOns = Array.isArray(budgetBreakdown.recommended_add_ons)
    ? budgetBreakdown.recommended_add_ons
    : [];

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
        <section className="space-y-4 rounded-3xl border border-[#1A2619] bg-[#121E12] p-5">
          <div>
            <p className="mb-1 text-xs font-bold tracking-wider text-[#ADFF00] uppercase">
              Your body scan insights
            </p>
            <h2 className="text-lg font-black tracking-tight">
              What the uploaded photos show
            </h2>
          </div>
          {hasBodyScan ? (
            <>
              <p className="rounded-2xl border border-white/5 bg-[#0D150D] p-4 text-sm leading-relaxed text-gray-300">
                {String(bodyScanInsights.overall_summary)}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-4">
                  <p className="mb-2 text-xs font-bold tracking-wider text-emerald-400 uppercase">
                    Visible strengths
                  </p>
                  <ul className="space-y-2">
                    {bodyScanInsights.observed_strengths.map(
                      (item: string, index: number) => (
                        <li
                          key={`${item}-${index}`}
                          className="text-xs leading-relaxed text-gray-300"
                        >
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-4">
                  <p className="mb-2 text-xs font-bold tracking-wider text-[#ADFF00] uppercase">
                    Priority improvements
                  </p>
                  <ul className="space-y-2">
                    {bodyScanInsights.priority_improvements.map(
                      (item: string, index: number) => (
                        <li
                          key={`${item}-${index}`}
                          className="text-xs leading-relaxed text-gray-300"
                        >
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-gray-400">
                {String(bodyScanInsights.posture_or_movement_note)}
              </p>
              {directBodyScan?.goal_gap && (
                <p className="rounded-xl border border-[#ADFF00]/15 bg-[#ADFF00]/5 px-3 py-2 text-xs leading-relaxed text-gray-300">
                  <span className="font-bold text-[#ADFF00]">Goal direction: </span>
                  {directBodyScan.goal_gap}
                </p>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-4">
              <p className="text-sm font-bold text-white">Add photos for visual coaching feedback</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-400">
                Upload fresh front, side, and back photos in onboarding. We keep the
                generated coaching observations, not your raw onboarding photos.
              </p>
              <Link
                href="/onboarding?mode=edit"
                className="mt-3 inline-flex text-xs font-bold text-[#ADFF00] hover:underline"
              >
                Add body-scan photos
              </Link>
            </div>
          )}
          <p className="text-[11px] text-gray-500">
            Photo observations are coaching guidance only, not a medical diagnosis or
            body-fat measurement.
          </p>
        </section>

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
                realityCheck.is_timeframe_realistic
                  ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                  : "border border-amber-500/30 bg-amber-500/20 text-amber-400"
              }`}
            >
              {realityCheck.is_timeframe_realistic ? "Realistic" : "Expectation Adjusted"}
            </span>
          </div>

          <p className="rounded-2xl border border-white/5 bg-[#0D150D] p-4 text-sm leading-relaxed font-medium text-gray-300">
            {String(realityCheck.honest_assessment || "")}
          </p>

          {achievableList.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold tracking-wider text-[#ADFF00] uppercase">
                What you WILL achieve in this period:
              </p>
              <ul className="space-y-2">
                {achievableList.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-0.5 font-bold text-[#ADFF00]">✓</span>
                    <span>{String(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* BUDGET & DIET ENVIRONMENT BREAKDOWN */}
        <div className="space-y-4 rounded-3xl border border-[#1A2619] bg-[#121E12] p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💰</span>
              <h2 className="text-lg leading-tight font-black tracking-tight text-white">
                Budget & Diet Plan
              </h2>
            </div>
            <span className="shrink-0 rounded-full border border-[#ADFF00]/20 bg-[#ADFF00]/10 px-3 py-1 text-center text-[10px] font-bold text-[#ADFF00] sm:text-xs">
              {String(
                budgetBreakdown.total_estimated_monthly_cost ||
                  budgetBreakdown.monthly_budget ||
                  "",
              )}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-gray-400">
            {String(budgetBreakdown.budget_verdict || "")}
          </p>

          {recommendedAddOns.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Affordable Protein Add-ons:
              </p>
              <div className="space-y-2">
                {recommendedAddOns.map((addon: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-[#0D150D] p-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">
                        {String(addon.item || "")}{" "}
                        <span className="font-normal text-gray-400">
                          ({String(addon.daily_qty || "")})
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {String(addon.protein_provided_g || "")} protein/day
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-[#ADFF00]">
                        {String(addon.monthly_cost || "")}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {String(addon.daily_cost || "")}/day
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* HEALTH & SAFETY PROTOCOL */}
        {healthAndSafety && healthAndSafety.has_concerns && (
          <div className="relative space-y-4 overflow-hidden rounded-3xl border border-red-900/30 bg-[#121E12] p-5">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-red-500/5 blur-3xl" />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏥</span>
                <h2 className="text-lg leading-tight font-black tracking-tight text-white">
                  Safety Protocol
                </h2>
              </div>
              <span className="shrink-0 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-center text-[10px] font-bold tracking-wider text-red-400 uppercase sm:text-xs">
                Active Restrictions
              </span>
            </div>

            <p className="relative z-10 rounded-2xl border border-red-900/20 bg-[#0D150D] p-4 text-xs leading-relaxed font-medium text-gray-300">
              {String(healthAndSafety.safety_verdict || "")}
            </p>

            {healthAndSafety.medical_focus_areas &&
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
                        <span className="mt-0.5 font-bold text-red-400">⚕️</span>
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
            {timelineProjection.map((phase: any, index: number) => (
              <div
                key={index}
                className="space-y-1 rounded-2xl border border-[#1A2619] bg-[#121E12] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-[#ADFF00] uppercase">
                    {String(phase.timeframe || "")}
                  </span>
                  {phase.target_weight_kg && (
                    <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-xs font-extrabold text-white">
                      {String(phase.target_weight_kg)} kg
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-300">
                  {String(phase.expected_changes || "")}
                </p>
              </div>
            ))}
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
          <Link
            href="/plan-setup"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ADFF00] py-4 text-lg font-extrabold text-black shadow-[0_0_30px_rgba(173,255,0,0.35)] transition-transform hover:bg-[#c4ff33] active:scale-[0.98]"
          >
            <span>Generate My Plan</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
