"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { OnboardingData, OnboardingSchema } from "@/types/fitness/onboarding";
import { saveFitnessOnboardingAction } from "@/app/actions/fitness";
import { ArrowLeft, Check, Loader2, Dumbbell, Scale, Target, Flame, Heart, Info, ChevronRight, Clock, ListChecks, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function OnboardingFlow({ initialData = {} }: { initialData?: Partial<OnboardingData> }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const totalSteps = 11;
  const showProgress = step > 1 && step < 11;

  const handleNext = () => {
    setStep(s => Math.min(s + 1, totalSteps));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));
  const jumpToStep = (s: number) => setStep(s);

  const handleUpdate = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleComplete = async () => {
    setIsSaving(true);
    
    const result = OnboardingSchema.safeParse(data);
    if (!result.success) {
      toast.error("Please fill in all required fields correctly.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await saveFitnessOnboardingAction(data);
      if (res.success) {
        toast.success("Profile created!");
        router.push("/fitness/scanner");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save profile.");
      }
    } catch (e: any) {
      console.error("Server Action Exception:", e);
      toast.error(`Network error: ${e.message || String(e)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const OptionCard = ({ 
    selected, 
    onClick, 
    title, 
    desc,
    icon: Icon
  }: { 
    selected: boolean, 
    onClick: () => void, 
    title: string, 
    desc?: string,
    icon?: any
  }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center p-4 rounded-2xl border-2 text-left transition-all ${
        selected ? "border-[#ADFF00] bg-[#ADFF00]/10" : "border-[#1A2619] bg-[#0D150D] hover:border-[#233522]"
      }`}
    >
      {Icon && (
        <div className={`p-3 rounded-xl mr-4 ${selected ? "bg-[#ADFF00]/20 text-[#ADFF00]" : "bg-[#1A2619] text-gray-400"}`}>
          <Icon size={24} />
        </div>
      )}
      <div className="flex-1">
        <h3 className={`font-semibold text-lg ${selected ? "text-[#ADFF00]" : "text-gray-200"}`}>{title}</h3>
        {desc && <p className={`text-sm mt-1 ${selected ? "text-[#ADFF00]/70" : "text-gray-500"}`}>{desc}</p>}
      </div>
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#ADFF00] ml-4">
          <Check size={24} />
        </motion.div>
      )}
    </motion.button>
  );

  const StepHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <div className="mb-8">
      <h2 className="text-3xl font-black text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-gray-400 mt-2">{subtitle}</p>}
    </div>
  );

  const BottomBar = ({ 
    canProceed, 
    onProceed, 
    label = "Continue" 
  }: { 
    canProceed: boolean, 
    onProceed: () => void, 
    label?: string 
  }) => (
    <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-4 bg-[#0A1108]/90 backdrop-blur-xl border-t border-[#1A2619] pb-safe z-20">
      <button
        disabled={!canProceed}
        onClick={onProceed}
        className={`w-full py-4 rounded-full font-extrabold text-lg transition-all flex items-center justify-center gap-2 ${
          canProceed 
            ? "bg-[#ADFF00] text-black hover:bg-[#c6ff47] active:scale-[0.98] shadow-[0_0_25px_rgba(173,255,0,0.3)]" 
            : "bg-[#1A2619] text-gray-500 cursor-not-allowed"
        }`}
      >
        {label}
        {canProceed && <ArrowRight className="w-5 h-5" />}
      </button>
    </div>
  );

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="flex flex-col h-[85vh] justify-center px-6 relative">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex-1 flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 bg-[#ADFF00]/10 border border-[#ADFF00]/30 rounded-3xl flex items-center justify-center mb-8 text-[#ADFF00] shadow-[0_0_30px_rgba(173,255,0,0.15)]">
                <Target size={36} strokeWidth={1.5} />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-5">
                Let's build your transformation plan.
              </h1>
              <p className="text-lg text-gray-400 max-w-sm mb-10">
                We'll ask a few questions about your body, lifestyle, food and goals.
              </p>

              <div className="flex items-center gap-6 text-sm font-semibold text-gray-300">
                <div className="flex items-center gap-2 bg-[#121E12] px-4 py-2 rounded-full border border-[#1E2E1D]">
                  <Clock className="w-4 h-4 text-[#ADFF00]" />
                  <span>5–7 minutes</span>
                </div>
                <div className="flex items-center gap-2 bg-[#121E12] px-4 py-2 rounded-full border border-[#1E2E1D]">
                  <ListChecks className="w-4 h-4 text-[#ADFF00]" />
                  <span>12–14 steps</span>
                </div>
              </div>
            </motion.div>
            <div className="pb-8 space-y-4">
              <button 
                onClick={handleNext} 
                className="w-full py-4 bg-[#ADFF00] text-black rounded-full font-extrabold text-lg shadow-[0_0_30px_rgba(173,255,0,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group hover:bg-[#c4ff33]"
              >
                <span>Let's Start</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="px-6 pt-6 pb-28">
            <StepHeader title="What do you want to achieve?" />
            <div className="space-y-4">
              {[
                { id: "Lose Fat", icon: Flame },
                { id: "Build Muscle", icon: Dumbbell },
                { id: "Build Strength", icon: Target },
                { id: "Body Recomposition", icon: Scale },
                { id: "Improve Fitness", icon: Heart },
                { id: "Improve Health", icon: Info }
              ].map(opt => (
                <OptionCard
                  key={opt.id}
                  title={opt.id}
                  icon={opt.icon}
                  selected={data.goal === opt.id}
                  onClick={() => handleUpdate({ goal: opt.id as any })}
                />
              ))}
            </div>
            <BottomBar canProceed={!!data.goal} onProceed={handleNext} />
          </div>
        );
      case 3:
        return (
          <div className="px-6 pt-6 pb-28">
            <StepHeader title="What's your current fitness level?" subtitle="This helps us calibrate your initial plan." />
            <div className="space-y-4">
              {[
                { id: "Beginner", desc: "New to structured training." },
                { id: "Intermediate", desc: "Consistent training experience." },
                { id: "Advanced", desc: "Experienced with structured training." }
              ].map(opt => (
                <OptionCard
                  key={opt.id}
                  title={opt.id}
                  desc={opt.desc}
                  selected={data.fitness_level === opt.id}
                  onClick={() => handleUpdate({ fitness_level: opt.id as any })}
                />
              ))}
            </div>
            <BottomBar canProceed={!!data.fitness_level} onProceed={handleNext} />
          </div>
        );
      case 4:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Basic Information" subtitle="We need these to calculate your metrics accurately." />
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Age</label>
                <input 
                  type="number" 
                  min={16} max={120}
                  value={data.age || ""} 
                  onChange={e => handleUpdate({ age: parseInt(e.target.value) || undefined })}
                  className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                  placeholder="e.g. 25"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Height (cm)</label>
                  <input 
                    type="number" 
                    value={data.height || ""} 
                    onChange={e => handleUpdate({ height: parseFloat(e.target.value) || undefined })}
                    className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                    placeholder="175"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={data.weight || ""} 
                    onChange={e => handleUpdate({ weight: parseFloat(e.target.value) || undefined })}
                    className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                    placeholder="70"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Target Weight (kg) <span className="text-gray-500 font-normal">(Optional)</span></label>
                <input 
                  type="number" 
                  value={data.target_weight || ""} 
                  onChange={e => handleUpdate({ target_weight: parseFloat(e.target.value) || undefined })}
                  className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                  placeholder="65"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Gender</label>
                <select 
                  value={data.gender || ""} 
                  onChange={e => handleUpdate({ gender: e.target.value as any })}
                  className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none appearance-none"
                >
                  <option value="" disabled className="text-gray-500">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
            <BottomBar 
              canProceed={!!(data.age && data.age >= 16 && data.height && data.weight && data.gender)} 
              onProceed={handleNext} 
            />
          </div>
        );
      case 5:
        return (
          <div className="px-6 pt-6 pb-28">
            <StepHeader title="Where do you train?" />
            <div className="space-y-4">
              {["Gym", "Home", "Outdoor", "Mixed"].map(opt => (
                <OptionCard
                  key={opt}
                  title={opt}
                  selected={data.training_location === opt}
                  onClick={() => handleUpdate({ training_location: opt as any })}
                />
              ))}
            </div>
            <BottomBar canProceed={!!data.training_location} onProceed={handleNext} />
          </div>
        );
      case 6:
        return (
          <div className="px-6 pt-6 pb-28">
            <StepHeader title="What equipment do you have access to?" subtitle="Select all that apply." />
            <div className="space-y-3">
              {[
                "No Equipment", "Dumbbells", "Barbell", "Bench", "Resistance Bands", 
                "Pull-up Bar", "Cable Machine", "Machines", "Full Gym"
              ].map(opt => {
                const isSelected = data.equipment?.includes(opt) || false;
                return (
                  <OptionCard
                    key={opt}
                    title={opt}
                    selected={isSelected}
                    onClick={() => {
                      let newEq = [...(data.equipment || [])];
                      if (opt === "No Equipment") {
                        newEq = ["No Equipment"];
                      } else {
                        newEq = newEq.filter(e => e !== "No Equipment");
                        if (isSelected) {
                          newEq = newEq.filter(e => e !== opt);
                        } else {
                          newEq.push(opt);
                        }
                      }
                      handleUpdate({ equipment: newEq });
                    }}
                  />
                );
              })}
            </div>
            <BottomBar canProceed={!!(data.equipment && data.equipment.length > 0)} onProceed={handleNext} />
          </div>
        );
      case 7:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Training Schedule" subtitle="How much time can you commit?" />
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Days per week</label>
                <div className="flex justify-between gap-2">
                  {[2,3,4,5,6,7].map(d => (
                    <button 
                      key={d}
                      onClick={() => handleUpdate({ training_days_per_week: d })}
                      className={`flex-1 aspect-square rounded-xl flex items-center justify-center text-lg font-bold transition-all border ${
                        data.training_days_per_week === d ? 'bg-[#ADFF00] border-[#ADFF00] text-black shadow-[0_0_15px_rgba(173,255,0,0.3)]' : 'border-[#1A2619] bg-[#0D150D] text-gray-400 hover:border-[#ADFF00]/50 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Preferred Workout Duration</label>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 20, 30, 45, 60, 90].map(m => (
                    <button 
                      key={m}
                      onClick={() => handleUpdate({ workout_duration_minutes: m })}
                      className={`py-3 rounded-xl flex flex-col items-center justify-center transition-all border ${
                        data.workout_duration_minutes === m ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-[#1A2619] bg-[#0D150D] text-gray-400 hover:border-[#ADFF00]/50 hover:text-white'
                      }`}
                    >
                      <span className="font-bold text-xl">{m}</span>
                      <span className="text-xs uppercase tracking-wider font-semibold mt-0.5">min</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Preferred Time</label>
                <select 
                  value={data.preferred_training_time || ""} 
                  onChange={e => handleUpdate({ preferred_training_time: e.target.value })}
                  className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none appearance-none"
                >
                  <option value="" disabled className="text-gray-500">Select time</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                  <option value="Anytime">Anytime</option>
                </select>
              </div>
            </div>
            <BottomBar 
              canProceed={!!(data.training_days_per_week && data.workout_duration_minutes && data.preferred_training_time)} 
              onProceed={handleNext} 
            />
          </div>
        );
      case 8:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Nutrition Preferences" subtitle="We only store your preferences. No diet plan is generated yet." />
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Diet Type</label>
                <div className="grid grid-cols-1 gap-3">
                  {["No Preference", "Vegetarian", "Vegan", "Non-Vegetarian", "Other"].map(opt => (
                    <OptionCard
                      key={opt}
                      title={opt}
                      selected={data.diet_preference === opt}
                      onClick={() => handleUpdate({ diet_preference: opt as any })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Meals Per Day</label>
                <input 
                  type="number" 
                  min={1} max={10}
                  value={data.meals_per_day || ""} 
                  onChange={e => handleUpdate({ meals_per_day: parseInt(e.target.value) || undefined })}
                  className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                  placeholder="e.g. 3"
                />
              </div>
            </div>
            <BottomBar canProceed={!!(data.diet_preference && data.meals_per_day)} onProceed={handleNext} />
          </div>
        );
      case 9:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Lifestyle" subtitle="Tell us about your daily activity." />
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Daily Activity Level</label>
                <div className="space-y-3">
                  {[
                    { id: "Mostly sedentary", desc: "Desk job, little walking." },
                    { id: "Lightly active", desc: "Some walking, standing." },
                    { id: "Moderately active", desc: "Active job, manual labor." },
                    { id: "Very active", desc: "Intense physical work daily." }
                  ].map(opt => (
                    <OptionCard
                      key={opt.id}
                      title={opt.id}
                      desc={opt.desc}
                      selected={data.activity_level === opt.id}
                      onClick={() => handleUpdate({ activity_level: opt.id as any })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Average Sleep (Hours)</label>
                <input 
                  type="number" 
                  min={3} max={16}
                  value={data.sleep_duration || ""} 
                  onChange={e => handleUpdate({ sleep_duration: parseFloat(e.target.value) || undefined })}
                  className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                  placeholder="e.g. 7.5"
                />
              </div>
            </div>
            <BottomBar canProceed={!!(data.activity_level && data.sleep_duration)} onProceed={handleNext} />
          </div>
        );
      case 10:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Review Your Profile" subtitle="Make sure everything looks good." />
            <div className="space-y-4">
              {[
                { label: "Goal", value: data.goal, stepIndex: 2 },
                { label: "Fitness Level", value: data.fitness_level, stepIndex: 3 },
                { label: "Body Info", value: `${data.age} yrs, ${data.height} cm, ${data.weight} kg`, stepIndex: 4 },
                { label: "Location", value: data.training_location, stepIndex: 5 },
                { label: "Equipment", value: data.equipment?.join(", "), stepIndex: 6 },
                { label: "Schedule", value: `${data.training_days_per_week} days/wk, ${data.workout_duration_minutes} min`, stepIndex: 7 },
                { label: "Nutrition", value: `${data.diet_preference}, ${data.meals_per_day} meals`, stepIndex: 8 },
                { label: "Lifestyle", value: `${data.activity_level}, ${data.sleep_duration} hrs sleep`, stepIndex: 9 }
              ].map((section, idx) => (
                <div key={idx} className="bg-[#0D150D] p-4 rounded-2xl border border-[#1A2619] flex justify-between items-center">
                  <div className="pr-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{section.label}</p>
                    <p className="text-white font-medium">{section.value || "Not set"}</p>
                  </div>
                  <button 
                    onClick={() => jumpToStep(section.stepIndex)}
                    className="px-4 py-2 text-sm font-bold text-[#ADFF00] bg-[#ADFF00]/10 rounded-xl hover:bg-[#ADFF00]/20 active:scale-95 transition-all flex-shrink-0"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
            <BottomBar canProceed={true} onProceed={handleNext} label="Looks Good" />
          </div>
        );
      case 11:
        return (
          <div className="flex flex-col h-[85vh] justify-center px-6 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col justify-center items-center">
              <div className="w-20 h-20 bg-[#ADFF00] rounded-full flex items-center justify-center mb-6 text-black shadow-[0_0_30px_rgba(173,255,0,0.5)]">
                <Check size={40} strokeWidth={3} />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-4">
                You're ready.
              </h1>
              <p className="text-lg text-gray-400 max-w-[280px]">
                We have everything we need to personalize your Fitness AI OS.
              </p>
            </motion.div>
            <div className="pb-8">
              <button 
                onClick={handleComplete} 
                disabled={isSaving}
                className="w-full py-4 bg-[#ADFF00] text-black rounded-full font-extrabold text-lg shadow-[0_0_30px_rgba(173,255,0,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Enter My Fitness OS"
                )}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#0A1108] selection:bg-[#ADFF00] selection:text-black">
      <div className="max-w-[480px] mx-auto min-h-[100dvh] flex flex-col relative overflow-hidden bg-[#0A1108] shadow-2xl shadow-black/50 border-x border-[#121E12]">
        {/* Top Nav (Progress & Back) */}
        <div className="h-16 flex items-center px-4 relative z-10">
          {step > 1 && step < 11 && (
            <button 
              onClick={handleBack}
              className="p-2 rounded-full bg-[#121E12] border border-[#1E2E1D] hover:bg-[#1A2619] active:scale-95 transition-all text-gray-300"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          
          {showProgress && (
            <div className="flex-1 px-8 flex justify-center">
              <div className="w-full bg-[#1A2619] h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#ADFF00]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((step - 1) / (totalSteps - 2)) * 100}%` }}
                  transition={{ ease: "easeInOut" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-hide"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
