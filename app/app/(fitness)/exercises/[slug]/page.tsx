import { Metadata } from "next";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { FitnessShell } from "@/components/fitness/fitness-shell";
import { redirect } from "next/navigation";
import { WorkoutHeader } from "@/components/fitness/workout/workout-header";
import { Target, Dumbbell, Activity, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("fitness_exercises_library").select("name").eq("slug", slug).single();
  
  return {
    title: `${data?.name || "Exercise"} - Fitness AI OS`,
  };
}

export default async function ExerciseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await getCachedUser();

  if (!user) redirect(`/auth/signin?redirect=${encodeURIComponent(`/exercises/${slug}`)}`);

  const { data: exercise } = await supabase
    .from("fitness_exercises_library")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!exercise) {
    redirect("/exercises");
  }

  return (
    <FitnessGuard requirePro featureName="the full exercise library">
      <FitnessShell>
        <div className="w-full flex flex-col h-full bg-[#0A1108] overflow-y-auto pb-32">
          <div className="px-5 pt-8">
            <WorkoutHeader title="Exercise Details" backUrl="/exercises" />
            
            <div className="mt-8 flex flex-col gap-6">
              
              {/* Header section */}
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-white capitalize tracking-tight leading-tight">
                  {exercise.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Link prefetch={true} href={`/exercises?muscle=${encodeURIComponent(exercise.target_muscle)}`}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#ADFF00] bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-3 py-1 rounded-full hover:bg-[#ADFF00]/20 transition-colors"
                  >
                    <Target className="w-3 h-3" /> {exercise.target_muscle}
                  </Link>
                  <Link prefetch={true} href={`/exercises?equipment=${encodeURIComponent(exercise.equipment)}`}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/70 bg-white/5 border border-white/10 px-3 py-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <Dumbbell className="w-3 h-3" /> {exercise.equipment}
                  </Link>
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/70 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    <Activity className="w-3 h-3" /> {exercise.level}
                  </span>
                </div>
              </div>

              {/* Images */}
              {exercise.image_urls && exercise.image_urls.length > 0 && (
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
                  {exercise.image_urls.map((url: string, i: number) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      key={i}
                      src={url} 
                      alt={`${exercise.name} - step ${i+1}`}
                      className="w-[280px] h-[280px] object-cover rounded-3xl border border-white/10 bg-white/5 shrink-0 snap-center"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111A10] border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Mechanic</span>
                  <span className="text-sm font-bold text-white capitalize">{exercise.mechanic || "N/A"}</span>
                </div>
                <div className="bg-[#111A10] border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Force</span>
                  <span className="text-sm font-bold text-white capitalize">{exercise.force || "N/A"}</span>
                </div>
              </div>

              {/* Secondary Muscles */}
              {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
                <div className="bg-[#111A10] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-white/40" /> Secondary Muscles
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {exercise.secondary_muscles.map((sm: string) => (
                      <span key={sm} className="text-xs font-bold text-white/70 bg-white/5 px-2.5 py-1 rounded-lg capitalize">
                        {sm}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {exercise.instructions && exercise.instructions.length > 0 && (
                <div className="flex flex-col gap-4 mt-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Instructions</h3>
                  <div className="flex flex-col gap-4">
                    {exercise.instructions.map((step: string, i: number) => (
                      <div key={i} className="flex gap-4 items-start bg-[#111A10] border border-white/5 rounded-2xl p-4">
                        <div className="w-6 h-6 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-black text-[#ADFF00]">{i + 1}</span>
                        </div>
                        <p className="text-sm font-medium text-white/80 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </FitnessShell>
    </FitnessGuard>
  );
}
