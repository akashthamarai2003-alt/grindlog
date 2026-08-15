import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { ArrowRight, Brain, Info } from "lucide-react";
import Link from "next/link";

export default async function AIStartingReportPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || !profile.onboarding_completed) {
    redirect("/fitness/onboarding");
  }

  const aiStrategy = profile.ai_strategy || {};
  const focusAreas = Array.isArray(aiStrategy.focus_areas) ? aiStrategy.focus_areas : [
    "Reduce waist/body fat",
    "Develop shoulders",
    "Develop chest",
    "Improve core strength",
    "Improve overall conditioning"
  ];
  
  const fitnessScore = aiStrategy.fitness_score || 68;
  const realityCheck = aiStrategy.reality_check;
  const budgetBreakdown = aiStrategy.budget_breakdown;
  const healthAndSafety = aiStrategy.health_and_safety;
  const timelineProjection = Array.isArray(aiStrategy.timeline_projection) ? aiStrategy.timeline_projection : [];

  const achievableList = realityCheck && Array.isArray(realityCheck.achievable_in_timeframe) 
    ? realityCheck.achievable_in_timeframe 
    : [];

  const recommendedAddOns = budgetBreakdown && Array.isArray(budgetBreakdown.recommended_add_ons) 
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
            <p className="text-2xl font-black text-white">{profile.weight || '--'} kg</p>
          </div>
          <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Goal</p>
            <p className="text-2xl font-black text-white">{profile.target_weight || '--'} kg</p>
          </div>
          <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target</p>
            <p className="text-lg font-bold text-[#ADFF00] leading-tight">{profile.goal || 'Not specified'}</p>
          </div>
          <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Physique</p>
            <p className="text-lg font-bold text-[#ADFF00] leading-tight">{profile.target_physique || 'Not specified'}</p>
          </div>
        </div>

        {/* REALITY CHECK SECTION */}
        {realityCheck && (
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
              {realityCheck.honest_assessment}
            </p>

            {achievableList.length > 0 && (
              <div>
                <p className="text-xs font-bold text-[#ADFF00] uppercase tracking-wider mb-2">What you WILL achieve in this period:</p>
                <ul className="space-y-2">
                  {achievableList.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-[#ADFF00] font-bold mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* BUDGET & DIET ENVIRONMENT BREAKDOWN */}
        {budgetBreakdown && (
          <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <h2 className="text-lg font-black tracking-tight text-white leading-tight">Budget & Diet Plan</h2>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-[#ADFF00] bg-[#ADFF00]/10 px-3 py-1 rounded-full border border-[#ADFF00]/20 shrink-0 text-center">
                {budgetBreakdown.total_estimated_monthly_cost || budgetBreakdown.monthly_budget}
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              {budgetBreakdown.budget_verdict}
            </p>

            {recommendedAddOns.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Affordable Protein Add-ons:</p>
                <div className="space-y-2">
                  {recommendedAddOns.map((addon: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-[#0D150D] p-3 rounded-xl border border-white/5 text-xs">
                      <div>
                        <p className="font-bold text-white">{addon.item} <span className="text-gray-400 font-normal">({addon.daily_qty})</span></p>
                        <p className="text-gray-500 text-[11px]">{addon.protein_provided_g} protein/day</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-[#ADFF00]">{addon.monthly_cost}</p>
                        <p className="text-gray-500 text-[10px]">{addon.daily_cost}/day</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
              {healthAndSafety.safety_verdict}
            </p>

            {healthAndSafety.medical_focus_areas && healthAndSafety.medical_focus_areas.length > 0 && (
              <div className="relative z-10 pt-2">
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Medical Focus Areas:</p>
                <ul className="space-y-2">
                  {healthAndSafety.medical_focus_areas.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-red-400 font-bold mt-0.5">⚕️</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TIMELINE PROJECTION */}
        {timelineProjection.length > 0 && (
          <div>
            <h2 className="text-lg font-black mb-4 flex items-center gap-2">
              <span>📅</span> Expected Progress Roadmap
            </h2>
            <div className="space-y-3">
              {timelineProjection.map((phase: any, index: number) => (
                <div key={index} className="bg-[#121E12] p-4 rounded-2xl border border-[#1A2619] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#ADFF00] uppercase tracking-wider">{phase.timeframe}</span>
                    {phase.target_weight_kg && (
                      <span className="text-xs font-extrabold text-white bg-black/40 px-2.5 py-0.5 rounded-full">
                        {phase.target_weight_kg} kg
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 font-medium">{phase.expected_changes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Focus Areas */}
        <div>
          <h2 className="text-lg font-black mb-4">AI Focus Areas</h2>
          <div className="space-y-3">
            {focusAreas.map((area: string, index: number) => (
              <div key={index} className="flex items-center gap-4 bg-[#121E12] p-4 rounded-2xl border border-[#1A2619]">
                <span className="text-[#ADFF00] font-black text-lg opacity-50 w-6">0{index + 1}</span>
                <span className="font-semibold text-gray-200">{area}</span>
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
          <Link href="/fitness/plan-setup" className="w-full py-4 bg-[#ADFF00] text-black rounded-full font-extrabold text-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(173,255,0,0.35)] hover:bg-[#c4ff33]">
            <span>Generate My Plan</span>
            <ArrowRight size={20} />
          </Link>
        </div>

      </div>
    </div>
  );
}
