import { redirect } from "next/navigation";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { ArrowRight, Brain, Info } from "lucide-react";
import Link from "next/link";
import { RegenerateReportButton } from "@/components/fitness/report/regenerate-report-button";

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasGeneratedStartingReport(strategy: Record<string, any>): boolean {
  const bodyScan = strategy.body_scan_insights;
  const firstTwoWeeks = strategy.first_two_weeks;
  const realityCheck = strategy.reality_check;
  const budget = strategy.budget_breakdown;
  const health = strategy.health_and_safety;

  return isRecord(bodyScan)
    && typeof bodyScan.overall_summary === "string"
    && Array.isArray(bodyScan.observed_strengths)
    && Array.isArray(bodyScan.priority_improvements)
    && typeof bodyScan.posture_or_movement_note === "string"
    && isRecord(firstTwoWeeks)
    && typeof firstTwoWeeks.training_start === "string"
    && typeof firstTwoWeeks.nutrition_start === "string"
    && typeof firstTwoWeeks.recovery_start === "string"
    && typeof strategy.training_strategy === "string"
    && typeof strategy.nutrition_strategy === "string"
    && Array.isArray(strategy.focus_areas) && strategy.focus_areas.length === 5
    && typeof strategy.fitness_score === "number"
    && isRecord(realityCheck)
    && typeof realityCheck.honest_assessment === "string"
    && Array.isArray(realityCheck.achievable_in_timeframe)
    && isRecord(budget)
    && typeof budget.budget_verdict === "string"
    && Array.isArray(budget.recommended_add_ons)
    && Array.isArray(strategy.timeline_projection)
    && strategy.timeline_projection.length >= 3
    && isRecord(health);
}

function displayValue(value: unknown, suffix = ""): string {
  if (value === null || value === undefined || value === "") return "Not specified";
  return `${String(value)}${suffix}`;
}

export default async function AIStartingReportPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await getCachedUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const aiStrategy = isRecord(profile.ai_strategy) ? profile.ai_strategy : {};

  if (!hasGeneratedStartingReport(aiStrategy)) {
    return (
      <div className="min-h-screen bg-[#0A1108] text-white p-6 pb-28">
        <div className="max-w-md mx-auto space-y-8 mt-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121E12] border border-[#1A2619] mb-4">
              <Brain size={14} className="text-[#ADFF00]" />
              <span className="text-xs font-bold text-gray-300 tracking-wider">AI STARTING REPORT</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Your Starting Point</h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Weight</p>
              <p className="text-2xl font-black text-white">{displayValue(profile.weight, " kg")}</p>
            </div>
            <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Weight</p>
              <p className="text-2xl font-black text-white">{displayValue(profile.target_weight, " kg")}</p>
            </div>
            <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Goal</p>
              <p className="text-lg font-bold text-[#ADFF00] leading-tight">{displayValue(profile.goal)}</p>
            </div>
          </div>

          <div className="bg-[#121E12] border border-amber-500/30 rounded-3xl p-5 space-y-4">
            <h2 className="text-lg font-black">Your report is not ready yet</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              We do not show generic coaching advice here. Create the report to analyse the onboarding details you provided.
            </p>
            <RegenerateReportButton />
          </div>
        </div>
      </div>
    );
  }
  const focusAreas = Array.isArray(aiStrategy.focus_areas) ? aiStrategy.focus_areas : [];
  const onboardingData = isRecord(profile.onboarding_data) ? profile.onboarding_data : {};
  const bodyScanInsights = aiStrategy.body_scan_insights as Record<string, any>;
  const firstTwoWeeks = aiStrategy.first_two_weeks as Record<string, any>;
  const bodyDetails = [
    ["Height", displayValue(onboardingData.height ?? profile.height, " cm")],
    ["BMI", displayValue(profile.bmi)],
    ["Waist", displayValue(onboardingData.waist_cm, " cm")],
    ["Chest", displayValue(onboardingData.chest_cm, " cm")],
    ["Arm", displayValue(onboardingData.arm_cm, " cm")],
    ["Thigh", displayValue(onboardingData.thigh_cm, " cm")],
  ];
  const personalNumbers = [
    ["Protein starting target", displayValue(profile.initial_protein_target, " g/day")],
    ["Maintenance estimate", displayValue(profile.baseline_calories, " kcal/day")],
    ["Daily activity", displayValue(profile.daily_steps)],
    ["Sleep", displayValue(profile.sleep_duration)],
    ["Target deadline", displayValue(onboardingData.target_deadline_days, " days")],
    ["Workout time", displayValue(profile.preferred_training_time || profile.workout_time)],
  ];
  
  const rawFitnessScore = aiStrategy.fitness_score;
  const fitnessScore = (typeof rawFitnessScore === 'number' || typeof rawFitnessScore === 'string')
    ? rawFitnessScore
    : null;
    
  const rawRealityCheck = aiStrategy.reality_check;
  const realityCheck = rawRealityCheck || {};

  const rawBudgetBreakdown = aiStrategy.budget_breakdown;
  const budgetBreakdown = rawBudgetBreakdown || {
    total_estimated_monthly_cost: "Varies",
    monthly_budget: "Varies",
    budget_verdict: "Focus on whole foods — eggs, rice, lentils, and seasonal vegetables give the best nutrition per rupee. Cook at home as much as possible to stay within budget.",
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
    <div className="min-h-screen bg-[#0A1108] text-white p-6 pb-28">
      <div className="max-w-md mx-auto space-y-8 mt-4">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121E12] border border-[#1A2619] mb-4">
            <Brain size={14} className="text-[#ADFF00]" />
            <span className="text-xs font-bold text-gray-300 tracking-wider">AI STARTING REPORT</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Your Starting Point</h1>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Weight</p>
            <p className="text-2xl font-black text-white">{displayValue(profile.weight, " kg")}</p>
          </div>
          <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Weight</p>
            <p className="text-2xl font-black text-white">{displayValue(profile.target_weight, " kg")}</p>
          </div>
          <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target</p>
            <p className="text-lg font-bold text-[#ADFF00] leading-tight">{displayValue(profile.goal)}</p>
          </div>
          <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Physique</p>
            <p className="text-lg font-bold text-[#ADFF00] leading-tight">
              {displayValue(profile.target_physique)}
            </p>
          </div>
        </div>

        {/* Body details entered during onboarding */}
        <section className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-[#ADFF00] uppercase tracking-wider mb-1">Your body details</p>
            <h2 className="text-lg font-black tracking-tight">Starting measurements</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {bodyDetails.map(([label, value]) => (
              <div key={label} className="bg-[#0D150D] border border-white/5 rounded-2xl px-3.5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
                <p className="mt-1 text-sm font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Insight generated from the optional uploaded body scan */}
        <section className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-[#ADFF00] uppercase tracking-wider mb-1">Your body scan insights</p>
            <h2 className="text-lg font-black tracking-tight">What the uploaded photos show</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed bg-[#0D150D] border border-white/5 rounded-2xl p-4">
            {String(bodyScanInsights.overall_summary)}
          </p>

          {bodyScanInsights.has_body_scan && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-4">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Visible strengths</p>
                <ul className="space-y-2">
                  {bodyScanInsights.observed_strengths.map((item: string, index: number) => (
                    <li key={`${item}-${index}`} className="text-xs leading-relaxed text-gray-300">{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-4">
                <p className="text-xs font-bold text-[#ADFF00] uppercase tracking-wider mb-2">Priority improvements</p>
                <ul className="space-y-2">
                  {bodyScanInsights.priority_improvements.map((item: string, index: number) => (
                    <li key={`${item}-${index}`} className="text-xs leading-relaxed text-gray-300">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 leading-relaxed">{String(bodyScanInsights.posture_or_movement_note)}</p>
          <p className="text-[11px] text-gray-500">Photo observations are coaching guidance only, not a medical diagnosis or body-fat measurement.</p>
        </section>

        {/* Profile Configuration */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-lg font-black tracking-tight text-white leading-tight">Your Settings</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold bg-[#1A2619] text-gray-300 px-3 py-1.5 rounded-full border border-white/5">
              {displayValue(profile.training_location)}
            </span>
            <span className="text-xs font-bold bg-[#1A2619] text-gray-300 px-3 py-1.5 rounded-full border border-white/5">
              {displayValue(profile.training_days_per_week, " Days/Week")}
            </span>
            <span className="text-xs font-bold bg-[#1A2619] text-gray-300 px-3 py-1.5 rounded-full border border-white/5">
              {displayValue(profile.workout_duration_minutes, " Mins")}
            </span>
            <span className="text-xs font-bold bg-[#1A2619] text-gray-300 px-3 py-1.5 rounded-full border border-white/5">
              {displayValue(profile.food_type || profile.diet_preference)}
            </span>
            <span className="text-xs font-bold bg-[#1A2619] text-gray-300 px-3 py-1.5 rounded-full border border-white/5">
              {displayValue(profile.food_environment)}
            </span>
            {profile.fitness_level && (
              <span className="text-xs font-bold bg-[#1A2619] text-gray-300 px-3 py-1.5 rounded-full border border-white/5">
                {profile.fitness_level}
              </span>
            )}
          </div>
        </div>

        {/* Directly calculated from body and lifestyle inputs saved at onboarding */}
        <section className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-[#ADFF00] uppercase tracking-wider mb-1">Your personal numbers</p>
            <h2 className="text-lg font-black tracking-tight">Starting targets and routine</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {personalNumbers.map(([label, value]) => (
              <div key={label} className="bg-[#0D150D] border border-white/5 rounded-2xl px-3.5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
                <p className="mt-1 text-sm font-bold text-white leading-snug">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-gray-500">Protein and maintenance are starting estimates calculated from your onboarding details; adjust them with real progress over time.</p>
        </section>

        {/* One practical, user-specific start instead of a generic hard programme */}
        <section className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-[#ADFF00] uppercase tracking-wider mb-1">Your first two weeks</p>
            <h2 className="text-lg font-black tracking-tight">Start safely and build consistency</h2>
          </div>
          <div className="space-y-3">
            {[
              ["Training", firstTwoWeeks.training_start],
              ["Nutrition", firstTwoWeeks.nutrition_start],
              ["Recovery", firstTwoWeeks.recovery_start],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#0D150D] border border-white/5 rounded-2xl p-4">
                <p className="text-xs font-bold text-[#ADFF00] uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm leading-relaxed text-gray-300">{String(value)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tailored strategies produced from the complete onboarding profile */}
        <section className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-4">
          <h2 className="text-lg font-black tracking-tight">Your tailored strategy</h2>
          <div className="space-y-3">
            <div className="bg-[#0D150D] border border-white/5 rounded-2xl p-4">
              <p className="text-xs font-bold text-[#ADFF00] uppercase tracking-wider mb-1">Training approach</p>
              <p className="text-sm leading-relaxed text-gray-300">{String(aiStrategy.training_strategy)}</p>
            </div>
            <div className="bg-[#0D150D] border border-white/5 rounded-2xl p-4">
              <p className="text-xs font-bold text-[#ADFF00] uppercase tracking-wider mb-1">Nutrition approach</p>
              <p className="text-sm leading-relaxed text-gray-300">{String(aiStrategy.nutrition_strategy)}</p>
            </div>
          </div>
        </section>

        {/* REALITY CHECK SECTION */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h2 className="text-lg font-black tracking-tight text-white leading-tight">Timeframe & Reality Check</h2>
            </div>
            <span className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-center shrink-0 ${
              realityCheck.is_timeframe_realistic 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}>
              {realityCheck.is_timeframe_realistic ? "Realistic" : "Expectation Adjusted"}
            </span>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed font-medium bg-[#0D150D] p-4 rounded-2xl border border-white/5">
            {String(realityCheck.honest_assessment || '')}
          </p>

          {achievableList.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#ADFF00] uppercase tracking-wider mb-2">What you WILL achieve in this period:</p>
              <ul className="space-y-2">
                {achievableList.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-[#ADFF00] font-bold mt-0.5">✓</span>
                    <span>{String(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* BUDGET & DIET ENVIRONMENT BREAKDOWN */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💰</span>
              <h2 className="text-lg font-black tracking-tight text-white leading-tight">Budget & Diet Plan</h2>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-[#ADFF00] bg-[#ADFF00]/10 px-3 py-1 rounded-full border border-[#ADFF00]/20 shrink-0 text-center">
              {String(budgetBreakdown.total_estimated_monthly_cost || budgetBreakdown.monthly_budget || '')}
            </span>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            {String(budgetBreakdown.budget_verdict || '')}
          </p>

          {recommendedAddOns.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Affordable Protein Add-ons:</p>
              <div className="space-y-2">
                {recommendedAddOns.map((addon: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-[#0D150D] p-3 rounded-xl border border-white/5 text-xs">
                    <div>
                      <p className="font-bold text-white">{String(addon.item || '')} <span className="text-gray-400 font-normal">({String(addon.daily_qty || '')})</span></p>
                      <p className="text-gray-500 text-[11px]">{String(addon.protein_provided_g || '')} protein/day</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-[#ADFF00]">{String(addon.monthly_cost || '')}</p>
                      <p className="text-gray-500 text-[10px]">{String(addon.daily_cost || '')}/day</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* HEALTH & SAFETY PROTOCOL */}
        {healthAndSafety && healthAndSafety.has_concerns && (
          <div className="bg-[#121E12] border border-red-900/30 rounded-3xl p-5 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
            
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏥</span>
                <h2 className="text-lg font-black tracking-tight text-white leading-tight">Safety Protocol</h2>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 shrink-0 text-center uppercase tracking-wider">
                Active Restrictions
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-medium bg-[#0D150D] p-4 rounded-2xl border border-red-900/20 relative z-10">
              {String(healthAndSafety.safety_verdict || '')}
            </p>

            {healthAndSafety.medical_focus_areas && healthAndSafety.medical_focus_areas.length > 0 && (
              <div className="relative z-10 pt-2">
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Medical Focus Areas:</p>
                <ul className="space-y-2">
                  {healthAndSafety.medical_focus_areas.map((item: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-red-400 font-bold mt-0.5">⚕️</span>
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
          <h2 className="text-lg font-black mb-4 flex items-center gap-2">
            <span>📅</span> Expected Progress Roadmap
          </h2>
          <div className="space-y-3">
            {timelineProjection.map((phase: any, index: number) => (
              <div key={index} className="bg-[#121E12] p-4 rounded-2xl border border-[#1A2619] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#ADFF00] uppercase tracking-wider">{String(phase.timeframe || '')}</span>
                  {phase.target_weight_kg && (
                    <span className="text-xs font-extrabold text-white bg-black/40 px-2.5 py-0.5 rounded-full">
                      {String(phase.target_weight_kg)} kg
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-300 font-medium">{String(phase.expected_changes || '')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Focus Areas */}
        <div>
          <h2 className="text-lg font-black mb-4">AI Focus Areas</h2>
          <div className="space-y-3">
            {focusAreas.map((area: any, index: number) => (
              <div key={index} className="flex items-center gap-4 bg-[#121E12] p-4 rounded-2xl border border-[#1A2619]">
                <span className="text-[#ADFF00] font-black text-lg opacity-50 w-6">0{index + 1}</span>
                <span className="font-semibold text-gray-200">{String(area)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fitness Score */}
        <div>
          <h2 className="text-lg font-black mb-4">Fitness Score</h2>
          <div className="bg-[#121E12] border border-[#1A2619] p-6 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <div className="w-[150px] h-[150px] bg-[#ADFF00] rounded-full blur-[50px]" />
            </div>

            <div className="flex items-end gap-2 mb-2 relative z-10">
              <span className="text-6xl font-black text-white tracking-tighter">{fitnessScore}</span>
              <span className="text-xl font-bold text-gray-500 mb-2">/ 100</span>
            </div>
            
            <p className="text-sm font-semibold text-[#ADFF00] mb-4 relative z-10">App-generated coaching score</p>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 relative z-10 bg-black/40 px-3 py-1.5 rounded-full">
              <Info size={12} />
              <span>Not a medical measurement.</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <Link href="/plan-setup" className="w-full py-4 bg-[#ADFF00] text-black rounded-full font-extrabold text-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(173,255,0,0.35)] hover:bg-[#c4ff33]">
            <span>Generate My Plan</span>
            <ArrowRight size={20} />
          </Link>
        </div>

      </div>
    </div>
  );
}
