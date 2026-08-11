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
  const focusAreas = aiStrategy.focus_areas || [
    "Reduce waist/body fat",
    "Develop shoulders",
    "Develop chest",
    "Improve core strength",
    "Improve overall conditioning"
  ];
  
  const fitnessScore = aiStrategy.fitness_score || 68;

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
          <div className="col-span-2 bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target</p>
            <p className="text-xl font-bold text-[#ADFF00]">{profile.goal || 'Not specified'}</p>
          </div>
        </div>

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
