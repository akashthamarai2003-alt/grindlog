import { redirect } from "next/navigation";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { ArrowRight, Brain, Info } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="max-w-md mx-auto px-5 pt-12 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#ADFF00]/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-[#ADFF00]" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tight">AI STRATEGY</h1>
            <p className="text-gray-400 text-sm">Custom plan generated</p>
          </div>
        </div>

        {/* Phase Timeline */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ADFF00]/5 blur-3xl -mr-10 -mt-10 rounded-full" />
          
          <h2 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider">Transformation Phases</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4 relative">
              <div className="w-px h-full bg-white/10 absolute left-[15px] top-8" />
              <div className="w-8 h-8 rounded-full bg-[#ADFF00] flex items-center justify-center shrink-0 z-10 text-black font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{aiStrategy.phase_1_name || "Foundation & Base"}</h3>
                <p className="text-sm text-gray-400">Weeks 1-4. Focus on form, consistency, and initial body recomp.</p>
              </div>
            </div>
            
            <div className="flex gap-4 relative">
              <div className="w-px h-full bg-white/10 absolute left-[15px] top-8" />
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 z-10 text-gray-400 font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{aiStrategy.phase_2_name || "Hypertrophy & Cut"}</h3>
                <p className="text-sm text-gray-400">Weeks 5-8. Progressive overload and targeted fat loss.</p>
              </div>
            </div>

            <div className="flex gap-4 relative">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 z-10 text-gray-400 font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{aiStrategy.phase_3_name || "Peak & Polish"}</h3>
                <p className="text-sm text-gray-400">Weeks 9-12. Fine-tuning details and maximizing strength.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Focus Areas */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Primary Focus</h2>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((area: string, idx: number) => (
              <div key={idx} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium">
                {area}
              </div>
            ))}
          </div>
        </div>

        {/* Key Directive */}
        <div className="bg-[#ADFF00]/10 border border-[#ADFF00]/20 rounded-2xl p-5 mb-10 flex gap-4 items-start">
          <Info className="w-5 h-5 text-[#ADFF00] shrink-0 mt-0.5" />
          <p className="text-sm text-[#ADFF00] leading-relaxed">
            Your plan requires strict adherence to progressive overload. We will adjust macros bi-weekly based on weigh-ins and visual check-ins.
          </p>
        </div>

        {/* CTA */}
        <Link 
          href="/fitness/payment?returnTo=/fitness"
          className="w-full flex items-center justify-center gap-2 bg-[#ADFF00] text-black font-bold py-4 rounded-xl hover:bg-[#9BE500] transition-colors"
        >
          GENERATE MY PLAN <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
