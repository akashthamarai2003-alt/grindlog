import { redirect } from "next/navigation";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { AlertTriangle, ArrowRight, Brain, Check, Info } from "lucide-react";
import Link from "next/link";
import { RegenerateReportButton } from "@/components/fitness/report/regenerate-report-button";

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function displayValue(value: unknown, suffix = ""): string | null {
  if (value === null || value === undefined || value === "") return null;
  return `${String(value)}${suffix}`;
}

function hasGeneratedStartingReport(strategy: Record<string, any>): boolean {
  const bodyScan = strategy.body_scan_insights;
  const firstTwoWeeks = strategy.first_two_weeks;
  const realityCheck = strategy.reality_check;
  const health = strategy.health_and_safety;

  return isRecord(bodyScan)
    && typeof bodyScan.has_body_scan === "boolean"
    && typeof bodyScan.overall_summary === "string"
    && Array.isArray(bodyScan.priority_improvements)
    && typeof bodyScan.posture_or_movement_note === "string"
    && isRecord(firstTwoWeeks)
    && typeof firstTwoWeeks.training_start === "string"
    && firstTwoWeeks.training_start.length <= 180
    && typeof firstTwoWeeks.nutrition_start === "string"
    && firstTwoWeeks.nutrition_start.length <= 180
    && typeof firstTwoWeeks.recovery_start === "string"
    && firstTwoWeeks.recovery_start.length <= 180
    && typeof strategy.training_strategy === "string"
    && typeof strategy.nutrition_strategy === "string"
    && Array.isArray(strategy.focus_areas) && strategy.focus_areas.length === 5
    && isRecord(realityCheck)
    && typeof realityCheck.is_timeframe_realistic === "boolean"
    && typeof realityCheck.honest_assessment === "string"
    && realityCheck.honest_assessment.length <= 260
    && Array.isArray(realityCheck.achievable_in_timeframe)
    && realityCheck.achievable_in_timeframe.length === 3
    && isRecord(health)
    && typeof health.has_concerns === "boolean"
    && typeof health.safety_verdict === "string";
}

export default async function AIStartingReportPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await getCachedUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || !profile.onboarding_completed) redirect("/onboarding");

  const aiStrategy = isRecord(profile.ai_strategy) ? profile.ai_strategy : {};
  const onboardingData = isRecord(profile.onboarding_data) ? profile.onboarding_data : {};
  const targetWeight = displayValue(profile.target_weight, " kg");
  const deadline = displayValue(onboardingData.target_deadline_days, " days");

  if (!hasGeneratedStartingReport(aiStrategy)) {
    return (
      <main className="min-h-screen bg-[#0A1108] text-white p-6 pb-28">
        <div className="max-w-md mx-auto space-y-7 mt-4">
          <header>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121E12] border border-[#1A2619] mb-4">
              <Brain size={14} className="text-[#ADFF00]" />
              <span className="text-xs font-bold text-gray-300 tracking-wider">AI STARTING REPORT</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Your Starting Point</h1>
          </header>

          <section className="grid grid-cols-2 gap-3">
            <StatCard label="Current weight" value={displayValue(profile.weight, " kg")} />
            <StatCard label="Target weight" value={targetWeight} />
            <StatCard label="Goal" value={displayValue(profile.goal)} />
            <StatCard label="Timeline" value={deadline} />
          </section>

          <section className="bg-[#121E12] border border-amber-500/30 rounded-3xl p-5 space-y-4">
            <h2 className="text-lg font-black">Create your personal report</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              This short report is created from your onboarding details and optional body-scan observations. We never fill it with generic advice.
            </p>
            <RegenerateReportButton />
          </section>
        </div>
      </main>
    );
  }

  const bodyScan = aiStrategy.body_scan_insights as Record<string, any>;
  const firstTwoWeeks = aiStrategy.first_two_weeks as Record<string, any>;
  const realityCheck = aiStrategy.reality_check as Record<string, any>;
  const safety = aiStrategy.health_and_safety as Record<string, any>;
  const hasSeverePain = Number(onboardingData.current_pain_severity || 0) >= 7;
  const settings = [
    displayValue(profile.fitness_level),
    displayValue(profile.training_location),
    displayValue(profile.training_days_per_week, " days/week"),
    displayValue(profile.workout_duration_minutes, " min"),
    displayValue(profile.food_type || profile.diet_preference),
    displayValue(profile.food_environment),
  ].filter((item): item is string => Boolean(item));
  const nextSteps = [
    ["Training", firstTwoWeeks.training_start],
    ["Food", firstTwoWeeks.nutrition_start],
    ["Recovery", firstTwoWeeks.recovery_start],
  ];
  const outcomes = realityCheck.achievable_in_timeframe as string[];
  const priorities = bodyScan.priority_improvements as string[];

  return (
    <main className="min-h-screen bg-[#0A1108] text-white p-6 pb-28">
      <div className="max-w-md mx-auto space-y-7 mt-4">
        <header>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121E12] border border-[#1A2619] mb-4">
            <Brain size={14} className="text-[#ADFF00]" />
            <span className="text-xs font-bold text-gray-300 tracking-wider">AI STARTING REPORT</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Your Starting Point</h1>
          <p className="mt-2 text-sm text-gray-400">The essential actions for your first two weeks.</p>
        </header>

        <section className="grid grid-cols-2 gap-3">
          <StatCard label="Current weight" value={displayValue(profile.weight, " kg")} />
          <StatCard label="Target weight" value={targetWeight} />
          <StatCard label="Goal" value={displayValue(profile.goal)} accent />
          <StatCard label="Timeline" value={deadline} accent />
        </section>

        {settings.length > 0 && (
          <section className="flex flex-wrap gap-2">
            {settings.map((setting) => (
              <span key={setting} className="rounded-full border border-white/5 bg-[#121E12] px-3 py-1.5 text-xs font-bold text-gray-300">
                {setting}
              </span>
            ))}
          </section>
        )}

        {safety.has_concerns && (
          <section className={`rounded-3xl border p-5 space-y-3 ${hasSeverePain ? "border-red-500/40 bg-red-500/[0.07]" : "border-amber-500/30 bg-amber-500/[0.05]"}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={19} className={hasSeverePain ? "text-red-400" : "text-amber-400"} />
              <h2 className="text-lg font-black">{hasSeverePain ? "Pause before training" : "Start with care"}</h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-200">{String(safety.safety_verdict)}</p>
          </section>
        )}

        {bodyScan.has_body_scan && (
          <section className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-4">
            <div>
              <p className="text-xs font-bold text-[#ADFF00] uppercase tracking-wider mb-1">Body-scan insight</p>
              <h2 className="text-lg font-black">What to work on first</h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-300">{String(bodyScan.overall_summary)}</p>
            {priorities.length > 0 && (
              <div className="space-y-2">
                {priorities.map((priority, index) => (
                  <div key={`${priority}-${index}`} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check size={16} className="shrink-0 mt-0.5 text-[#ADFF00]" />
                    <span>{priority}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-gray-500">Photo observations are coaching guidance, not a diagnosis or body-fat measurement.</p>
          </section>
        )}

        <section className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-[#ADFF00] uppercase tracking-wider mb-1">Your next 14 days</p>
            <h2 className="text-lg font-black">Build consistency first</h2>
          </div>
          <div className="space-y-3">
            {nextSteps.map(([label, action]) => (
              <div key={label} className="flex items-start gap-3 rounded-2xl bg-[#0D150D] border border-white/5 p-3.5">
                <span className="w-8 shrink-0 text-xs font-black uppercase tracking-wide text-[#ADFF00]">{label}</span>
                <p className="text-sm leading-relaxed text-gray-300">{String(action)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">Reality check</h2>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${realityCheck.is_timeframe_realistic ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
              {realityCheck.is_timeframe_realistic ? "Realistic" : "Adjusted"}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-300">{String(realityCheck.honest_assessment)}</p>
          <ul className="space-y-2">
            {outcomes.map((outcome, index) => (
              <li key={`${outcome}-${index}`} className="flex items-start gap-2 text-sm text-gray-300">
                <Check size={16} className="shrink-0 mt-0.5 text-[#ADFF00]" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-[#1A2619] bg-[#121E12] p-4 text-center text-xs text-gray-400">
          <Info size={14} className="inline mr-1.5 -mt-0.5" />
          Your full workouts and food plan are created next from these same onboarding details.
        </section>

        <Link href="/plan-setup" className="w-full py-4 bg-[#ADFF00] text-black rounded-full font-extrabold text-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(173,255,0,0.35)] hover:bg-[#c4ff33]">
          <span>Generate My Plan</span>
          <ArrowRight size={20} />
        </Link>
      </div>
    </main>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: string | null; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-1.5 text-lg font-black leading-tight ${accent ? "text-[#ADFF00]" : "text-white"}`}>{value || "Not set"}</p>
    </div>
  );
}
