import { Brain, Info, Check } from "lucide-react";
import { GeneratePlanButton } from "@/components/fitness/report/generate-plan-button";
import { RegenerateReportButton } from "@/components/fitness/report/regenerate-report-button";
import { BodyScanInsightsCard } from "@/components/fitness/report/body-scan-insights-card";

export const dynamic = "force-dynamic";

function displayValue(value: unknown, suffix = ""): string {
  if (value === null || value === undefined || value === "") return "Not specified";
  return `${String(value)}${suffix}`;
}

export default async function TestReportPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribed?: string; empty?: string; safety?: string }>;
}) {
  const { subscribed, empty, safety } = await searchParams;
  const isPaidUser = subscribed === "1" || subscribed === "true";
  const isEmpty = empty === "1";
  const hasSafetyConcerns = safety === "1";

  const mockProfile = {
    weight: 76.5,
    target_weight: 80,
    goal: "Build Muscle",
    target_physique: "Muscular",
    training_location: "Gym",
    training_days_per_week: 4,
    workout_duration_minutes: 60,
    food_type: "Non-Vegetarian",
    food_environment: "Home",
    fitness_level: "Intermediate",
    initial_protein_target: 160,
    baseline_calories: 2450,
    daily_steps: "5–10k",
    sleep_duration: "7–8h",
    preferred_training_time: "Evening",
    onboarding_data: { target_deadline_days: 90 },
  };

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-[#0A1108] p-6 pb-28 text-white">
        <div className="mx-auto mt-4 max-w-md space-y-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1A2619] bg-[#121E12] px-3 py-1">
              <Brain size={14} className="text-[#ADFF00]" />
              <span className="text-xs font-bold tracking-wider text-gray-300">AI STARTING REPORT</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Your Starting Point</h1>
          </div>
          <div className="space-y-4 rounded-3xl border border-amber-500/30 bg-[#121E12] p-5">
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

  const personalNumbers = [
    ["Protein starting target", `${mockProfile.initial_protein_target} g/day`],
    ["Maintenance estimate", `${mockProfile.baseline_calories} kcal/day`],
    ["Daily activity", mockProfile.daily_steps],
    ["Sleep", mockProfile.sleep_duration],
    ["Target deadline", "90 days"],
    ["Workout time", mockProfile.preferred_training_time],
  ];

  const timelineProjection = [
    { timeframe: "Month 1 (Weeks 1-4)", target_weight_kg: 77.5, expected_changes: "Neurological adaptations, initial glycogen replenishment, form mastery." },
    { timeframe: "Month 2 (Weeks 5-8)", target_weight_kg: 78.8, expected_changes: "Noticeable hypertrophy in chest and arms, progressive overload on compound lifts." },
    { timeframe: "Month 3 (Weeks 9-12)", target_weight_kg: 80.0, expected_changes: "Target goal weight achieved with lean tissue accretion." },
  ];

  const focusAreas = [
    "Progressive overload on upper body compound movements",
    "Meeting minimum 160g protein target daily with whole foods",
    "Consistent 7-8 hours sleep window for optimal hypertrophy recovery",
  ];

  return (
    <div className="min-h-screen bg-[#0A1108] p-6 pb-28 text-white">
      <div className="mx-auto mt-4 max-w-md space-y-8">
        {/* Header */}
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1A2619] bg-[#121E12] px-3 py-1">
            <Brain size={14} className="text-[#ADFF00]" />
            <span className="text-xs font-bold tracking-wider text-gray-300">AI STARTING REPORT</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Your Starting Point</h1>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
            <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">Weight</p>
            <p className="text-2xl font-black text-white">{displayValue(mockProfile.weight, " kg")}</p>
          </div>
          <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
            <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">Target Weight</p>
            <p className="text-2xl font-black text-white">{displayValue(mockProfile.target_weight, " kg")}</p>
          </div>
          <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
            <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">Target</p>
            <p className="text-lg leading-tight font-bold text-[#ADFF00]">{displayValue(mockProfile.goal)}</p>
          </div>
          <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
            <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">Physique</p>
            <p className="text-lg leading-tight font-bold text-[#ADFF00]">{displayValue(mockProfile.target_physique)}</p>
          </div>
        </div>

        {/* Insight generated from the optional uploaded body scan */}
        <BodyScanInsightsCard
          initialInsights={{
            overall_summary: "Visual physique assessment confirms your starting athletic foundation. Ready for targeted training and progressive overload.",
            observed_strengths: [
              "Balanced clavicle and shoulder structure providing good V-taper potential",
              "Symmetric limb-to-torso proportions well suited for compound lifts",
              "Strong foundational core and lower limb posture",
            ],
            priority_improvements: [
              "Progressive overload on compound movements to expand chest and back thickness",
              "Hypertrophy volume targeting shoulders and arms for broader silhouette",
              "High-protein caloric surplus to maximize muscular adaptations",
            ],
            posture_or_movement_note: "Maintain neutral cervical and lumbar alignment, bracing core on all heavy lifts.",
            goal_gap: "Primary focus is bridging current baseline to your Muscular physique target with structured nutrition and training consistency.",
          }}
          initialHasBodyScan={true}
          initialIsAnalyzing={false}
          goalGap="Primary focus is bridging current baseline to your Muscular physique target with structured nutrition and training consistency."
        />

        {/* Profile Configuration */}
        <div className="space-y-4 rounded-3xl border border-[#1A2619] bg-[#121E12] p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-lg leading-tight font-black tracking-tight text-white">Your Settings</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/5 bg-[#1A2619] px-3 py-1.5 text-xs font-bold text-gray-300">{mockProfile.training_location}</span>
            <span className="rounded-full border border-white/5 bg-[#1A2619] px-3 py-1.5 text-xs font-bold text-gray-300">{mockProfile.training_days_per_week} Days/Week</span>
            <span className="rounded-full border border-white/5 bg-[#1A2619] px-3 py-1.5 text-xs font-bold text-gray-300">{mockProfile.workout_duration_minutes} Mins</span>
            <span className="rounded-full border border-white/5 bg-[#1A2619] px-3 py-1.5 text-xs font-bold text-gray-300">{mockProfile.food_type}</span>
            <span className="rounded-full border border-white/5 bg-[#1A2619] px-3 py-1.5 text-xs font-bold text-gray-300">{mockProfile.food_environment}</span>
            <span className="rounded-full border border-white/5 bg-[#1A2619] px-3 py-1.5 text-xs font-bold text-gray-300">{mockProfile.fitness_level}</span>
          </div>
        </div>

        {/* Personal Numbers */}
        <section className="space-y-4 rounded-3xl border border-[#1A2619] bg-[#121E12] p-5">
          <div>
            <p className="mb-1 text-xs font-bold tracking-wider text-[#ADFF00] uppercase">Your personal numbers</p>
            <h2 className="text-lg font-black tracking-tight">Starting targets and routine</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {personalNumbers.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/5 bg-[#0D150D] px-3.5 py-3">
                <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">{label}</p>
                <p className="mt-1 text-sm leading-snug font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeframe & Reality Check */}
        <div className="relative space-y-4 overflow-hidden rounded-3xl border border-[#1A2619] bg-[#121E12] p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h2 className="text-lg leading-tight font-black tracking-tight text-white">Timeframe & Reality Check</h2>
            </div>
            <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 text-center text-[10px] font-bold tracking-wider uppercase text-emerald-400">
              Realistic
            </span>
          </div>
          <p className="rounded-2xl border border-white/5 bg-[#0D150D] p-4 text-sm leading-relaxed font-medium text-gray-300">
            A 3.5 kg lean muscle gain over 90 days represents an optimal ~0.3 kg/week rate of lean mass accretion with negligible fat gain.
          </p>
        </div>

        {/* Health & Safety Protocol */}
        <div className={`relative space-y-4 overflow-hidden rounded-3xl border p-5 ${hasSafetyConcerns ? 'border-red-900/30 bg-[#121E12]' : 'border-[#1A2619] bg-[#0A1108]'}`}>
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏥</span>
              <h2 className="text-lg leading-tight font-black tracking-tight text-white">Safety Protocol</h2>
            </div>
            <span className={`shrink-0 rounded-full border px-3 py-1 text-center text-[10px] font-bold tracking-wider uppercase sm:text-xs ${hasSafetyConcerns ? 'border-red-500/20 bg-red-500/10 text-red-400' : 'border-[#39FF14]/20 bg-[#39FF14]/10 text-[#39FF14]'}`}>
              {hasSafetyConcerns ? 'Active Restrictions' : 'All Clear'}
            </span>
          </div>
          <p className={`relative z-10 rounded-2xl border p-4 text-xs leading-relaxed font-medium text-gray-300 ${hasSafetyConcerns ? 'border-red-900/20 bg-[#0D150D]' : 'border-white/5 bg-[#061506]'}`}>
            {hasSafetyConcerns 
              ? "Lower back strain reported. Overhead compression movements are substituted with chest-supported variations."
              : "You have no reported injuries or medical restrictions. You are cleared for standard programming. Let's get to work!"}
          </p>
        </div>

        {/* Expected Progress Roadmap */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
            <span>📅</span> Expected Progress Roadmap
          </h2>
          <div className="space-y-3">
            {timelineProjection.map((phase, index) => (
              <div key={index} className="space-y-1 rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-[#ADFF00] uppercase">{phase.timeframe}</span>
                  <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-xs font-extrabold text-white">{phase.target_weight_kg} kg</span>
                </div>
                <p className="text-xs font-medium text-gray-300">{phase.expected_changes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Focus Areas */}
        <div>
          <h2 className="mb-4 text-lg font-black">AI Focus Areas</h2>
          <div className="space-y-3">
            {focusAreas.map((area, index) => (
              <div key={index} className="flex items-center gap-4 rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
                <span className="w-6 text-lg font-black text-[#ADFF00] opacity-50">0{index + 1}</span>
                <span className="font-semibold text-gray-200">{area}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fitness Score */}
        <div>
          <h2 className="mb-4 text-lg font-black">Fitness Score</h2>
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-[#1A2619] bg-[#121E12] p-6">
            <div className="relative z-10 mb-2 flex items-end gap-2">
              <span className="text-6xl font-black tracking-tighter text-white">82</span>
              <span className="mb-2 text-xl font-bold text-gray-500">/ 100</span>
            </div>
            <p className="relative z-10 mb-4 text-sm font-semibold text-[#ADFF00]">App-generated coaching score</p>
            <div className="relative z-10 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs text-gray-500">
              <Info size={12} />
              <span>Not a medical measurement.</span>
            </div>
          </div>
        </div>

        {/* Generate Plan Button */}
        <div className="pt-4">
          <GeneratePlanButton isSubscribed={isPaidUser} />
        </div>
      </div>
    </div>
  );
}
