'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/services/supabase/client';
import { ArrowRight, CheckCircle2, Target, Calendar, Activity, Zap, ShieldCheck, Flame, ShoppingCart, User, Brain, TrendingDown, Dumbbell, LoaderCircle } from 'lucide-react';

export default function RoadmapPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<any>(null);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [planTier, setPlanTier] = useState<"starter" | "pro" | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/auth/signin?redirect=/roadmap');
          return;
        }

        const [{ data: fitnessProfile }, { data: savedPlan }, subscriptionResponse] = await Promise.all([
          (supabase.from('fitness_os_profiles' as any) as any).select('*').eq('user_id', user.id).single(),
          (supabase.from('fitness_os_workout_plans' as any) as any)
            .select('id, name, description, goal, plan_data, created_at')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle(),
          fetch('/api/fitness-ai/subscription/status', { cache: 'no-store' }),
        ]);

        if (!subscriptionResponse.ok) {
          router.replace('/payment?returnTo=/roadmap');
          return;
        }

        const subscriptionBody = await subscriptionResponse.json().catch(() => null);
        const subscription = subscriptionBody?.subscription;

        if (subscription?.status !== 'active') {
          router.replace('/payment?returnTo=/roadmap');
          return;
        }
        if (!fitnessProfile?.onboarding_completed) {
          router.replace('/onboarding');
          return;
        }
        if (!savedPlan) {
          router.replace('/report');
          return;
        }
        if (cancelled) return;

        setProfile(fitnessProfile);
        setActivePlan(savedPlan);
        if (subscription.plan !== 'starter' && subscription.plan !== 'pro') {
          router.replace('/payment?returnTo=/roadmap');
          return;
        }
        setPlanTier(subscription.plan);
      } catch {
        router.replace('/');
      } finally {
        if (!cancelled) setIsLoadingPlan(false);
      }
    };
    void fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  useEffect(() => {
    // Auto-advance from roadmap to the ready screen after the animation.
    if (step === 1 && !isLoadingPlan) {
      const timer = setTimeout(() => {
        setStep(2);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isLoadingPlan, step]);

  const currentWeight = profile?.weight ? `${profile.weight} kg` : '-- kg';
  const planData = activePlan?.plan_data || {};
  const workoutsPerWeek = Array.isArray(planData.workouts) ? planData.workouts.length : null;
  const nutritionTarget = planData.nutrition;
  const lifestyleTarget = planData.lifestyle;
  const weightTarget = profile?.target_weight ? `${currentWeight} to ${profile.target_weight} kg` : 'Not set';
  const deadlineDays = Number(profile?.target_deadline_days) > 0 ? Number(profile.target_deadline_days) : null;
  const deadlineWeeks = deadlineDays ? Math.max(1, Math.ceil(deadlineDays / 7)) : null;
  const milestoneWeeks = deadlineWeeks
    ? Array.from(
        new Set(
          Array.from({ length: Math.min(8, deadlineWeeks) }, (_, index) =>
            Math.max(1, Math.round(1 + (index * (deadlineWeeks - 1)) / Math.max(1, Math.min(8, deadlineWeeks) - 1))),
          ),
        ),
      )
    : [1, 2, 3, 4, 5, 6, 7, 8];

  const isPro = planTier === "pro";
  const activatedFeatures = [
    { icon: Target, label: "Personalized Workout Strategy" },
    { icon: Dumbbell, label: "Exercise Sets, Reps & Safety Guidance" },
    { icon: Flame, label: "Calorie & Protein Targets" },
    { icon: User, label: "Goal, Physique & Schedule Mapping" },
    ...(isPro ? [
      { icon: Flame, label: "Personalized Diet Plan" },
      { icon: ShoppingCart, label: "Smart Grocery Strategy" },
      { icon: Activity, label: "Automated Progress Tracking" },
      { icon: Brain, label: "AI Coach Support" },
      { icon: ShieldCheck, label: "Weekly AI Reviews" },
    ] : []),
  ];

  if (isLoadingPlan || !profile || !activePlan || !planTier) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0A1108] text-white">
        <div className="flex flex-col items-center gap-3 text-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#ADFF00]" />
          <p className="text-sm font-semibold text-white/60">Loading your saved plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A1108] text-white flex flex-col relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1A2619_0%,transparent_70%)] pointer-events-none opacity-60" />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="roadmap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
            className="flex-1 flex flex-col px-6 pt-16 pb-12 z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-10"
            >
              <h2 className="text-[#ADFF00] font-bold tracking-widest text-xs uppercase mb-2">Transformation Roadmap</h2>
              <h1 className="text-3xl font-black">The Journey Ahead</h1>
              <p className="text-gray-400 mt-2 text-sm max-w-xs mx-auto">
                {deadlineDays
                  ? `Building sustainable habits toward your ${deadlineDays}-day target.`
                  : 'Building sustainable habits around your saved goal.'}
              </p>
            </motion.div>

            {/* Timeline */}
            <div className="flex-1 relative flex justify-center max-w-sm mx-auto w-full">
              
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#1A2619]" />
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#ADFF00]" 
              />

              <div className="w-full flex flex-col justify-between relative py-2">
                
                {/* START */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center relative z-10"
                >
                  <div className="bg-[#ADFF00] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full mb-2">Start</div>
                  <div className="w-4 h-4 rounded-full bg-[#ADFF00] shadow-[0_0_15px_#ADFF00]" />
                  <span className="text-white font-bold mt-2 text-sm">{currentWeight}</span>
                </motion.div>

                {/* Weeks Grid */}
                <div className="flex flex-col items-center justify-center gap-4 my-8 z-10 relative">
                  {milestoneWeeks.map((w, i) => (
                    <motion.div
                      key={w}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -10 : 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + (i * 0.4) }}
                      className="flex items-center gap-3 w-full"
                    >
                      <div className={`flex-1 text-right text-xs font-bold ${i % 2 === 0 ? 'text-gray-400' : 'opacity-0'}`}>Week {w}</div>
                      <div className="w-2 h-2 rounded-full bg-[#121E12] border border-[#ADFF00]" />
                      <div className={`flex-1 text-left text-xs font-bold ${i % 2 !== 0 ? 'text-gray-400' : 'opacity-0'}`}>Week {w}</div>
                    </motion.div>
                  ))}
                </div>

                {/* NEXT PHASE */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 4.5 }}
                  className="flex flex-col items-center relative z-10"
                >
                  <div className="w-4 h-4 rounded-full bg-[#ADFF00] border-4 border-[#0A1108]" />
                  <div className="bg-[#121E12] border border-[#ADFF00]/50 text-[#ADFF00] text-[10px] font-black uppercase px-4 py-1.5 rounded-full mt-3 flex items-center gap-1 shadow-[0_0_15px_rgba(173,255,0,0.2)]">
                    Next Phase <TrendingDown size={12} />
                  </div>
                </motion.div>

              </div>
            </div>

            {/* Target Cards below */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="mt-10 grid grid-cols-2 gap-3"
            >
               <div className="bg-[#121E12] border border-[#1A2619] p-3 rounded-xl flex items-center gap-3">
                 <div className="bg-[#1A2619] p-2 rounded-lg text-[#ADFF00]"><Target size={16} /></div>
                 <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase">Workout</p>
                   <p className="text-xs font-bold text-gray-300">{workoutsPerWeek ? `${workoutsPerWeek} sessions/week` : 'Not available'}</p>
                 </div>
               </div>
               <div className="bg-[#121E12] border border-[#1A2619] p-3 rounded-xl flex items-center gap-3">
                 <div className="bg-[#1A2619] p-2 rounded-lg text-[#ADFF00]"><Flame size={16} /></div>
                 <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase">Nutrition</p>
                   <p className="text-xs font-bold text-gray-300">{nutritionTarget?.daily_calories ? `${nutritionTarget.daily_calories} kcal / ${nutritionTarget.protein_grams || '--'}g protein` : 'Not available'}</p>
                 </div>
               </div>
               <div className="bg-[#121E12] border border-[#1A2619] p-3 rounded-xl flex items-center gap-3">
                 <div className="bg-[#1A2619] p-2 rounded-lg text-[#ADFF00]"><Activity size={16} /></div>
                 <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase">Steps</p>
                   <p className="text-xs font-bold text-gray-300">{lifestyleTarget?.daily_steps_target ? `${lifestyleTarget.daily_steps_target.toLocaleString()} steps/day` : 'Not available'}</p>
                 </div>
               </div>
               <div className="bg-[#121E12] border border-[#1A2619] p-3 rounded-xl flex items-center gap-3">
                 <div className="bg-[#1A2619] p-2 rounded-lg text-[#ADFF00]"><TrendingDown size={16} /></div>
                 <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase">Weight</p>
                   <p className="text-xs font-bold text-gray-300">{weightTarget}</p>
                 </div>
               </div>
               <div className="bg-[#121E12] border border-[#1A2619] p-3 rounded-xl flex items-center gap-3 col-span-2 justify-center">
                 <div className="bg-[#1A2619] p-2 rounded-lg text-[#ADFF00]"><Calendar size={16} /></div>
                 <div className="text-left">
                   <p className="text-[10px] text-gray-500 font-bold uppercase">Tracking</p>
                   <p className="text-xs font-bold text-gray-300">{activePlan.name || 'Saved workout plan'}</p>
                 </div>
               </div>
            </motion.div>
            
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="ready"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col justify-center px-6 py-12 z-10"
          >
            <div className="bg-[#121E12] border border-[#1A2619] rounded-[2rem] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ADFF00]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#ADFF00]/10 rounded-full blur-3xl" />
              
              <motion.div 
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                className="w-16 h-16 bg-[#ADFF00] rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_rgba(173,255,0,0.3)]"
              >
                <Zap className="text-black" size={32} />
              </motion.div>
              
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2 tracking-tight">{isPro ? "Pro Plan Ready" : "Core Plan Ready"}</h2>
                <p className="text-gray-400 text-sm">Your personalized plan is saved and active.</p>
              </div>

              <div className="space-y-4 mb-10">
                {activatedFeatures.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#1A2619] flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-[#ADFF00]" />
                    </div>
                    <span className="text-sm font-semibold text-gray-300">{item.label}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                onClick={() => {
                  router.replace('/');
                }}
                className="w-full bg-[#ADFF00] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#9BE600] transition-colors"
              >
                Start My Transformation <ArrowRight size={18} />
              </motion.button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

