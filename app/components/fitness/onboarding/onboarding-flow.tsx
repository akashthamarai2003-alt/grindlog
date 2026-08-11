"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { OnboardingData, OnboardingSchema } from "@/types/fitness/onboarding";
import { saveFitnessOnboardingAction } from "@/app/actions/fitness";
import { ArrowLeft, Check, Loader2, Dumbbell, Scale, Target, Flame, Heart, Info, ChevronRight, Clock, ListChecks, ArrowRight, User, AlertTriangle, Stethoscope, Activity, Frown } from "lucide-react";
import { toast } from "sonner";

export function OnboardingFlow({ initialData = {} }: { initialData?: Partial<OnboardingData> }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const router = useRouter();

  const totalSteps = 15;
  const showProgress = step > 1 && step < 15;

  const handleNext = () => {
    setDirection(1);
    setStep(s => Math.min(s + 1, totalSteps));
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 1));
  };

  const jumpToStep = (s: number) => {
    setDirection(s > step ? 1 : -1);
    setStep(s);
  };

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

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 30 : -30,
      opacity: 0,
    })
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
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Personal Profile" subtitle="Tell us a bit about yourself." />
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Name</label>
                <input 
                  type="text" 
                  value={data.name || ""} 
                  onChange={e => handleUpdate({ name: e.target.value })}
                  className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                  placeholder="Your Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Age</label>
                  <input 
                    type="number" 
                    min={16} max={120}
                    value={data.age || ""} 
                    onChange={e => handleUpdate({ age: parseInt(e.target.value) || undefined })}
                    className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Gender</label>
                  <select 
                    value={data.gender || ""} 
                    onChange={e => handleUpdate({ gender: e.target.value as any })}
                    className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none appearance-none"
                  >
                    <option value="" disabled className="text-gray-500">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Country</label>
                <input 
                  type="text" 
                  value={data.country || ""} 
                  onChange={e => handleUpdate({ country: e.target.value })}
                  className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                  placeholder="e.g. United States"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Preferred Language</label>
                <input 
                  type="text" 
                  value={data.preferred_language || ""} 
                  onChange={e => handleUpdate({ preferred_language: e.target.value })}
                  className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                  placeholder="e.g. English"
                />
              </div>
            </div>
            <BottomBar 
              canProceed={!!(data.name && data.age && data.age >= 16 && data.gender && data.country && data.preferred_language)} 
              onProceed={handleNext} 
            />
          </div>
        );
      case 3:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Body Details" subtitle="Let's understand your starting point." />
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Height (cm)</label>
                  <input 
                    type="number" 
                    value={data.height || ""} 
                    onChange={e => handleUpdate({ height: parseFloat(e.target.value) || undefined })}
                    className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                    placeholder="173"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={data.weight || ""} 
                    onChange={e => handleUpdate({ weight: parseFloat(e.target.value) || undefined })}
                    className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                    placeholder="73"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Waist (cm) <span className="text-gray-500 font-normal block text-xs">Optional</span></label>
                  <input 
                    type="number" 
                    value={data.waist_cm || ""} 
                    onChange={e => handleUpdate({ waist_cm: parseFloat(e.target.value) || undefined })}
                    className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                    placeholder="80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Chest (cm) <span className="text-gray-500 font-normal block text-xs">Optional</span></label>
                  <input 
                    type="number" 
                    value={data.chest_cm || ""} 
                    onChange={e => handleUpdate({ chest_cm: parseFloat(e.target.value) || undefined })}
                    className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                    placeholder="95"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Arm (cm) <span className="text-gray-500 font-normal block text-xs">Optional</span></label>
                  <input 
                    type="number" 
                    value={data.arm_cm || ""} 
                    onChange={e => handleUpdate({ arm_cm: parseFloat(e.target.value) || undefined })}
                    className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                    placeholder="35"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Thigh (cm) <span className="text-gray-500 font-normal block text-xs">Optional</span></label>
                  <input 
                    type="number" 
                    value={data.thigh_cm || ""} 
                    onChange={e => handleUpdate({ thigh_cm: parseFloat(e.target.value) || undefined })}
                    className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                    placeholder="55"
                  />
                </div>
              </div>
            </div>
            <BottomBar 
              canProceed={!!(data.height && data.weight)} 
              onProceed={handleNext} 
            />
          </div>
        );
      case 4:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="What do you want to achieve?" />
            <div className="space-y-4">
              {[
                { id: "Lose Fat", emoji: "🔥" },
                { id: "Build Muscle", emoji: "💪" },
                { id: "Lose Fat + Build Muscle", emoji: "🔥💪" },
                { id: "Build Strength", emoji: "🏋️" },
                { id: "Improve Fitness", emoji: "🏃" },
                { id: "Maintain", emoji: "⚖️" }
              ].map(opt => (
                <motion.button
                  key={opt.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUpdate({ goal: opt.id as any })}
                  className={`w-full flex items-center p-4 rounded-2xl border-2 text-left transition-all ${
                    data.goal === opt.id ? "border-[#ADFF00] bg-[#ADFF00]/10" : "border-[#1A2619] bg-[#0D150D] hover:border-[#233522]"
                  }`}
                >
                  <div className={`text-2xl mr-4 ${data.goal === opt.id ? "" : "opacity-70 grayscale"}`}>
                    {opt.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${data.goal === opt.id ? "text-[#ADFF00]" : "text-gray-200"}`}>{opt.id}</h3>
                  </div>
                  {data.goal === opt.id && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#ADFF00] ml-4">
                      <Check size={24} />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            <div className="mt-8 p-5 bg-[#0D150D] border border-[#1A2619] rounded-2xl">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Target</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Current Weight</label>
                  <div className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#121E12] text-gray-400 font-medium">
                    {data.weight ? `${data.weight} kg` : "Not set"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#ADFF00] mb-2">Target Weight (kg)</label>
                  <input 
                    type="number" 
                    value={data.target_weight || ""} 
                    onChange={e => handleUpdate({ target_weight: parseFloat(e.target.value) || undefined })}
                    className="w-full p-4 rounded-xl border border-[#ADFF00]/30 bg-[#ADFF00]/5 text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600 font-bold" 
                    placeholder={data.weight ? `${Math.round(data.weight * 0.9)}` : "68"}
                  />
                </div>
              </div>
            </div>

            <BottomBar canProceed={!!data.goal && !!data.target_weight} onProceed={handleNext} />
          </div>
        );
            case 5:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Target Physique" subtitle="What do you want your body to look like?" />
            <div className="space-y-4">
              {[
                "Lean Athletic",
                "Muscular",
                "Six Pack",
                "Men's Physique",
                "Bodybuilder",
                "Sporty",
                "Strong & Functional"
              ].map(opt => (
                <OptionCard
                  key={opt}
                  title={opt}
                  selected={data.target_physique === opt}
                  onClick={() => handleUpdate({ target_physique: opt as any })}
                />
              ))}
            </div>

            <div className="mt-8 p-5 bg-[#0D150D] border border-[#1A2619] rounded-2xl">
              <h3 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">Upload Inspiration</h3>
              <p className="text-xs text-gray-500 mb-4">We'll use this visual reference for AI comparison. We don't guarantee exact results.</p>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleUpdate({ goal_physique_image: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <div className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${data.goal_physique_image ? 'border-[#ADFF00] bg-[#ADFF00]/10' : 'border-[#1A2619] bg-[#121E12] hover:border-[#ADFF00]/50'}`}>
                  {data.goal_physique_image ? (
                    <img src={data.goal_physique_image} alt="Inspiration" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-[#1A2619] rounded-full flex items-center justify-center mb-2">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-300">+ Upload Photo</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <BottomBar canProceed={!!data.target_physique} onProceed={handleNext} />
          </div>
        );
        case 6:
        return (
          <div className="px-6 pt-6 pb-28">
            <StepHeader title="What's your training experience?" />
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Experience Level</label>
                <div className="space-y-4">
                  {[
                    { id: "Beginner", desc: "0–6 months" },
                    { id: "Intermediate", desc: "6 months–2 years" },
                    { id: "Advanced", desc: "2+ years" }
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
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Training Frequency</label>
                <div className="flex justify-between gap-2">
                  {[3,4,5,6,7].map(d => (
                    <button 
                      key={d}
                      onClick={() => handleUpdate({ training_days_per_week: d })}
                      className={`flex-1 py-3 rounded-xl flex flex-col items-center justify-center font-bold transition-all border ${
                        data.training_days_per_week === d ? 'bg-[#ADFF00] border-[#ADFF00] text-black shadow-[0_0_15px_rgba(173,255,0,0.3)]' : 'border-[#1A2619] bg-[#0D150D] text-gray-400 hover:border-[#ADFF00]/50 hover:text-white'
                      }`}
                    >
                      <span className="text-xl">{d}</span>
                      <span className="text-xs uppercase tracking-wider mt-1 opacity-70 font-semibold">days</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <BottomBar canProceed={!!data.fitness_level && !!data.training_days_per_week} onProceed={handleNext} />
          </div>
        );
      case 7:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Workout Environment" subtitle="Where will you train?" />
            <div className="space-y-8">
              <div className="space-y-4">
                {[
                  { id: "Gym", emoji: "🏋️" },
                  { id: "Home", emoji: "🏠" },
                  { id: "Outdoor", emoji: "🌳" },
                  { id: "Combination", emoji: "🔄" }
                ].map(opt => (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleUpdate({ training_location: opt.id as any, equipment: [] });
                    }}
                    className={`w-full flex items-center p-4 rounded-2xl border-2 text-left transition-all ${
                      data.training_location === opt.id ? "border-[#ADFF00] bg-[#ADFF00]/10" : "border-[#1A2619] bg-[#0D150D] hover:border-[#233522]"
                    }`}
                  >
                    <div className={`text-2xl mr-4 ${data.training_location === opt.id ? "" : "opacity-70 grayscale"}`}>
                      {opt.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${data.training_location === opt.id ? "text-[#ADFF00]" : "text-gray-200"}`}>{opt.id}</h3>
                    </div>
                    {data.training_location === opt.id && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#ADFF00] ml-4">
                        <Check size={24} />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {data.training_location && data.training_location !== "Outdoor" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 32 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-sm font-semibold text-gray-300 mb-3">Available Equipment</label>
                    <div className="flex flex-wrap gap-3">
                      {(data.training_location === "Gym" || data.training_location === "Combination" ? [
                        "Dumbbells", "Barbells", "Machines", "Cable", "Bench", "Squat Rack"
                      ] : [
                        "Dumbbells", "Resistance Bands", "Pull-up Bar", "Mat", "No Equipment"
                      ]).map(opt => {
                        const isSelected = data.equipment?.includes(opt) || false;
                        return (
                          <button
                            key={opt}
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
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                              isSelected 
                                ? "bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]" 
                                : "bg-[#121E12] border-[#1A2619] text-gray-400 hover:border-[#ADFF00]/50 hover:text-gray-200"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <BottomBar 
              canProceed={!!data.training_location && (data.training_location === "Outdoor" || (data.equipment && data.equipment.length > 0))} 
              onProceed={handleNext} 
            />
          </div>
        );

      case 8:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Training Schedule" subtitle="How much time can you commit?" />
            <div className="space-y-8">
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
              canProceed={!!(data.workout_duration_minutes && data.preferred_training_time)} 
              onProceed={handleNext} 
            />
          </div>
        );
      case 9:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Nutrition Profile" subtitle="Help us understand your eating habits." />
            <div className="space-y-8">
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Food Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "Vegetarian", emoji: "🥗" },
                    { id: "Eggetarian", emoji: "🥚" },
                    { id: "Non-Vegetarian", emoji: "🍗" },
                    { id: "Vegan", emoji: "🌱" }
                  ].map(opt => (
                    <motion.button
                      key={opt.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUpdate({ food_type: opt.id as any })}
                      className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all border-2 ${
                        data.food_type === opt.id 
                          ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' 
                          : 'border-[#1A2619] bg-[#0D150D] text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <span className="text-3xl mb-2">{opt.emoji}</span>
                      <span className="font-semibold text-sm">{opt.id}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Meal Frequency</label>
                <div className="grid grid-cols-4 gap-2">
                  {["2 meals", "3 meals", "4 meals", "5+ meals"].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleUpdate({ meals_per_day: opt as any })}
                      className={`py-3 rounded-xl flex items-center justify-center font-bold transition-all border ${
                        data.meals_per_day === opt ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-[#1A2619] bg-[#0D150D] text-gray-400 hover:border-[#ADFF00]/50 hover:text-white'
                      }`}
                    >
                      <span className="text-xs">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Food Environment</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "Home", emoji: "🏠" },
                    { id: "PG", emoji: "🏢" },
                    { id: "Hostel", emoji: "🎓" },
                    { id: "Office/Canteen", emoji: "🍱" },
                    { id: "I Cook", emoji: "🍳" },
                    { id: "Mixed", emoji: "🔄" }
                  ].map(opt => (
                    <button 
                      key={opt.id}
                      onClick={() => handleUpdate({ food_environment: opt.id as any })}
                      className={`p-3 rounded-xl flex items-center gap-3 font-bold transition-all border text-left ${
                        data.food_environment === opt.id ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-[#1A2619] bg-[#0D150D] text-gray-400 hover:border-[#ADFF00]/50 hover:text-white'
                      }`}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="text-sm">{opt.id}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
            <BottomBar canProceed={!!(data.food_type && data.meals_per_day && data.food_environment)} onProceed={handleNext} />
          </div>
        );

      case 10:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Lifestyle Profile" subtitle="How do you spend your days?" />
            <div className="space-y-8">
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Activity</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Mostly sitting",
                    "Lightly active",
                    "Moderately active",
                    "Very active"
                  ].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleUpdate({ activity_level: opt as any })}
                      className={`p-3 rounded-xl flex flex-col items-center text-center justify-center font-bold transition-all border ${
                        data.activity_level === opt ? 'bg-[#ADFF00] border-[#ADFF00] text-black shadow-[0_0_15px_rgba(173,255,0,0.3)]' : 'border-[#1A2619] bg-[#0D150D] text-gray-400 hover:border-[#ADFF00]/50 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Daily Steps</label>
                <div className="grid grid-cols-4 gap-2">
                  {["<3k", "3–5k", "5–10k", "10k+"].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleUpdate({ daily_steps: opt as any })}
                      className={`py-3 rounded-xl flex items-center justify-center font-bold transition-all border ${
                        data.daily_steps === opt ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-[#1A2619] bg-[#0D150D] text-gray-400 hover:border-[#ADFF00]/50 hover:text-white'
                      }`}
                    >
                      <span className="text-xs">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Sleep</label>
                <div className="flex flex-wrap gap-2">
                  {["<5h", "5–6h", "6–7h", "7–8h", "8h+"].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleUpdate({ sleep_duration: opt as any })}
                      className={`flex-1 min-w-[60px] py-3 rounded-xl flex items-center justify-center font-bold transition-all border ${
                        data.sleep_duration === opt ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-[#1A2619] bg-[#0D150D] text-gray-400 hover:border-[#ADFF00]/50 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#1A2619]">
                <button 
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="w-full flex items-center justify-between py-2 text-left"
                >
                  <div>
                    <h3 className="font-semibold text-gray-200">Daily Schedule (Optional)</h3>
                    <p className="text-xs text-gray-500 mt-1">Allows the AI to create plans that fit your life.</p>
                  </div>
                  <div className={`p-2 rounded-full transition-colors ${showSchedule ? "bg-[#ADFF00]/20 text-[#ADFF00]" : "bg-[#121E12] text-gray-400"}`}>
                    <ChevronRight size={18} className={`transition-transform duration-300 ${showSchedule ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {showSchedule && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-2">Wake-up</label>
                          <input 
                            type="time" 
                            value={data.wake_time || ""} 
                            onChange={e => handleUpdate({ wake_time: e.target.value })}
                            className="w-full p-3 rounded-xl border border-[#1A2619] bg-[#121E12] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-2">Workout time</label>
                          <input 
                            type="time" 
                            value={data.workout_time || ""} 
                            onChange={e => handleUpdate({ workout_time: e.target.value })}
                            className="w-full p-3 rounded-xl border border-[#1A2619] bg-[#121E12] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-2">Work/College</label>
                          <input 
                            type="time" 
                            value={data.work_time || ""} 
                            onChange={e => handleUpdate({ work_time: e.target.value })}
                            className="w-full p-3 rounded-xl border border-[#1A2619] bg-[#121E12] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-2">Sleep time</label>
                          <input 
                            type="time" 
                            value={data.sleep_time || ""} 
                            onChange={e => handleUpdate({ sleep_time: e.target.value })}
                            className="w-full p-3 rounded-xl border border-[#1A2619] bg-[#121E12] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none" 
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
            <BottomBar canProceed={!!(data.activity_level && data.daily_steps && data.sleep_duration)} onProceed={handleNext} />
          </div>
        );

            case 11:
        return (
          <div className="flex flex-col h-[85vh] justify-center px-6 relative text-center">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex-1 flex flex-col justify-center items-center">
              <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/30 rounded-3xl flex items-center justify-center mb-8 text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                <AlertTriangle size={36} strokeWidth={1.5} />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-5">
                Anything we should know about your body?
              </h1>
              <p className="text-lg text-gray-400 mb-6">
                Help your AI coach understand your limitations, previous injuries, and physical concerns so it can create a safer training plan for you.
              </p>
              
              <div className="flex items-center gap-2 bg-[#121E12] px-4 py-2 rounded-full border border-[#1E2E1D] mx-auto text-sm font-semibold text-gray-300">
                <span className="text-xl">🧍</span>
                <span>Your body comes first</span>
              </div>
              
              <p className="text-sm text-gray-500 mt-6">This takes about 1 minute.</p>
            </motion.div>
            <div className="pb-8 space-y-4">
              <button 
                onClick={handleNext} 
                className="w-full py-4 bg-[#ADFF00] text-black rounded-full font-extrabold text-lg shadow-[0_0_30px_rgba(173,255,0,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group hover:bg-[#c4ff33]"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 12:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Physical Concerns" subtitle="Help us build a safe plan for you." />
            <div className="space-y-8">
              
              {/* 2. Current Physical Problems */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Do you currently have any physical problems? <span className="text-xs text-gray-500 font-normal ml-2">Select all that apply</span></label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Back pain", "Neck pain", "Shoulder pain", "Knee pain", "Hip pain", 
                    "Ankle/foot pain", "Wrist pain", "Elbow pain", "Muscle/joint pain", 
                    "Mobility limitation", "None", "Other"
                  ].map(opt => {
                    const isSelected = data.physical_problems?.includes(opt) || false;
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          let newProbs = [...(data.physical_problems || [])];
                          if (opt === "None") {
                            newProbs = ["None"];
                          } else {
                            newProbs = newProbs.filter(e => e !== "None");
                            if (isSelected) {
                              newProbs = newProbs.filter(e => e !== opt);
                            } else {
                              newProbs.push(opt);
                            }
                          }
                          handleUpdate({ physical_problems: newProbs });
                          // Reset current pain severity if they say None
                          if (opt === "None" || newProbs.length === 0) {
                            handleUpdate({ current_pain_severity: undefined, current_pain_triggers: [] });
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                          isSelected 
                            ? "bg-red-500/10 border-red-500 text-red-500" 
                            : (opt === "None" && isSelected) ? "bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]" : "bg-[#121E12] border-[#1A2619] text-gray-400 hover:border-gray-500 hover:text-gray-200"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Current Pain (Conditional based on step 2) */}
              <AnimatePresence>
                {data.physical_problems && data.physical_problems.length > 0 && !data.physical_problems.includes("None") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 32 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-2xl space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-red-400 mb-4">How severe is the pain right now?</label>
                        <div className="flex justify-between text-xs text-gray-500 font-semibold mb-2">
                          <span>No pain</span>
                          <span>Severe</span>
                        </div>
                        <div className="flex justify-between gap-1">
                          {[0,1,2,3,4,5,6,7,8,9,10].map(val => (
                            <button
                              key={val}
                              onClick={() => handleUpdate({ current_pain_severity: val })}
                              className={`flex-1 aspect-square rounded flex items-center justify-center font-bold text-xs transition-colors ${
                                data.current_pain_severity === val 
                                  ? (val > 6 ? "bg-red-600 text-white" : val > 3 ? "bg-orange-500 text-white" : "bg-yellow-500 text-white") 
                                  : "bg-[#1A2619] text-gray-500 hover:bg-[#233522]"
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-red-400 mb-3">When do you usually feel it?</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "During exercise", "After exercise", "While walking", 
                            "While sitting", "During daily activities", "All the time", "Other"
                          ].map(opt => {
                            const isSelected = data.current_pain_triggers?.includes(opt) || false;
                            return (
                              <button
                                key={opt}
                                onClick={() => {
                                  let newTriggers = [...(data.current_pain_triggers || [])];
                                  if (isSelected) newTriggers = newTriggers.filter(e => e !== opt);
                                  else newTriggers.push(opt);
                                  handleUpdate({ current_pain_triggers: newTriggers });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                  isSelected ? "bg-red-500/20 border-red-500 text-red-400" : "bg-[#121E12] border-[#1A2619] text-gray-400"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3. Previous Injuries */}
              <div className="pt-4 border-t border-[#1A2619]">
                <label className="block text-sm font-semibold text-gray-300 mb-3">Have you had any previous injuries?</label>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleUpdate({ previous_injuries: false, previous_injury_areas: [], previous_injury_timeline: undefined })}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all border ${
                      data.previous_injuries === false ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-[#1A2619] bg-[#0D150D] text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    No
                  </button>
                  <button 
                    onClick={() => handleUpdate({ previous_injuries: true })}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all border ${
                      data.previous_injuries === true ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'border-[#1A2619] bg-[#0D150D] text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {data.previous_injuries && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden space-y-6"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-3">Which area?</label>
                      <div className="flex flex-wrap gap-2">
                        {["Shoulder", "Knee", "Back", "Ankle", "Wrist", "Elbow", "Hip", "Other"].map(opt => {
                          const isSelected = data.previous_injury_areas?.includes(opt) || false;
                          return (
                            <button
                              key={opt}
                              onClick={() => {
                                let newAreas = [...(data.previous_injury_areas || [])];
                                if (isSelected) newAreas = newAreas.filter(e => e !== opt);
                                else newAreas.push(opt);
                                handleUpdate({ previous_injury_areas: newAreas });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                isSelected ? "bg-orange-500/20 border-orange-500 text-orange-400" : "bg-[#121E12] border-[#1A2619] text-gray-400"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-3">When did it happen?</label>
                      <div className="flex flex-col gap-2">
                        {["Recently", "Within the last year", "More than 1 year ago"].map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleUpdate({ previous_injury_timeline: opt })}
                            className={`p-3 rounded-xl text-sm font-semibold transition-all border text-left ${
                              data.previous_injury_timeline === opt ? "bg-orange-500/10 border-orange-500 text-orange-500" : "bg-[#121E12] border-[#1A2619] text-gray-400"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 5. Exercise Limitations */}
              <div className="pt-4 border-t border-[#1A2619]">
                <label className="block text-sm font-semibold text-gray-300 mb-3">Are there any movements you cannot comfortably perform?</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Squatting", "Running", "Jumping", "Bending", "Overhead movements", 
                    "Push-ups", "Pull-ups", "Lunges", "None", "Other"
                  ].map(opt => {
                    const isSelected = data.exercise_limitations?.includes(opt) || false;
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          let newLims = [...(data.exercise_limitations || [])];
                          if (opt === "None") {
                            newLims = ["None"];
                          } else {
                            newLims = newLims.filter(e => e !== "None");
                            if (isSelected) {
                              newLims = newLims.filter(e => e !== opt);
                            } else {
                              newLims.push(opt);
                            }
                          }
                          handleUpdate({ exercise_limitations: newLims });
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                          isSelected 
                            ? "bg-yellow-500/10 border-yellow-500 text-yellow-500" 
                            : "bg-[#121E12] border-[#1A2619] text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Medical Guidance & 7. Additional Notes */}
              <div className="pt-4 border-t border-[#1A2619] space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Has a healthcare professional ever advised you to avoid certain exercises or activities?</label>
                  <input 
                    type="text" 
                    value={data.medical_guidance || ""}
                    onChange={e => handleUpdate({ medical_guidance: e.target.value })}
                    placeholder="If yes, what should you avoid?"
                    className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors outline-none placeholder:text-gray-600" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Anything else your AI coach should know? (Optional)</label>
                  <textarea 
                    value={data.additional_health_notes || ""}
                    onChange={e => handleUpdate({ additional_health_notes: e.target.value })}
                    placeholder="Example: 'I sometimes get lower-back discomfort after sitting for long hours.'"
                    className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600 min-h-[100px] resize-none"
                  />
                </div>
              </div>

            </div>
            <BottomBar 
              canProceed={
                data.physical_problems !== undefined && data.physical_problems.length > 0 &&
                data.previous_injuries !== undefined &&
                data.exercise_limitations !== undefined && data.exercise_limitations.length > 0
              } 
              onProceed={handleNext} 
            />
          </div>
        );

      case 13:
        return (
          <div className="flex flex-col h-[85vh] justify-center px-6 relative">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-[#121E12] border border-[#1E2E1D] rounded-full flex items-center justify-center mb-6 text-gray-400">
                <Stethoscope size={28} />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-4">Your safety comes first</h2>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Your answers help personalize your fitness recommendations. The AI cannot diagnose injuries or medical conditions.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                If you have significant pain, a serious injury, or have been advised by a healthcare professional to restrict exercise, follow professional guidance before starting or changing your workout.
              </p>
              
              <button 
                onClick={() => handleUpdate({ safety_acknowledged: !data.safety_acknowledged })}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  data.safety_acknowledged ? "border-[#ADFF00] bg-[#ADFF00]/10" : "border-[#1A2619] bg-[#0D150D]"
                }`}
              >
                <div className={`w-6 h-6 rounded flex items-center justify-center border ${
                  data.safety_acknowledged ? "bg-[#ADFF00] border-[#ADFF00] text-black" : "border-gray-600"
                }`}>
                  {data.safety_acknowledged && <Check size={16} strokeWidth={3} />}
                </div>
                <span className={`font-semibold text-left ${data.safety_acknowledged ? "text-[#ADFF00]" : "text-gray-300"}`}>
                  I understand
                </span>
              </button>
            </motion.div>
            <div className="pb-8">
              <button 
                onClick={handleNext} 
                disabled={!data.safety_acknowledged}
                className="w-full py-4 bg-[#ADFF00] text-black rounded-full font-extrabold text-lg shadow-[0_0_30px_rgba(173,255,0,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:bg-[#c4ff33]"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );

case 14:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Review Your Profile" subtitle="Make sure everything looks good." />
            <div className="space-y-4">
              {[
                { label: "Personal", value: `${data.name}, ${data.age} yrs, ${data.country}`, stepIndex: 2 },
                { label: "Body Details", value: [
                    data.height ? `${data.height}cm` : null,
                    data.weight ? `${data.weight}kg` : null,
                    data.waist_cm ? `W:${data.waist_cm}cm` : null,
                    data.chest_cm ? `C:${data.chest_cm}cm` : null,
                    data.arm_cm ? `A:${data.arm_cm}cm` : null,
                    data.thigh_cm ? `T:${data.thigh_cm}cm` : null
                  ].filter(Boolean).join(", "), stepIndex: 3 },
                { label: "Goal", value: data.goal ? `${data.goal} (Target: ${data.target_weight}kg)` : null, stepIndex: 4 },
                { label: "Target Physique", value: data.target_physique, stepIndex: 5 },
                { label: "Experience", value: data.fitness_level ? `${data.fitness_level} (${data.training_days_per_week} days/wk)` : null, stepIndex: 6 },
                { label: "Environment", value: data.training_location ? `${data.training_location}${data.equipment?.length ? ` (${data.equipment.join(", ")})` : ''}` : null, stepIndex: 7 },
                { label: "Schedule", value: data.workout_duration_minutes ? `${data.workout_duration_minutes} min, ${data.preferred_training_time}` : null, stepIndex: 8 },
                { label: "Nutrition", value: `${data.food_type || "Not set"}, ${data.meals_per_day || "Not set"}, ${data.food_environment || "Not set"}`, stepIndex: 9 },
                { label: "Health & Safety", value: data.physical_problems?.includes("None") && data.previous_injuries === false ? "No concerns" : "Concerns noted", stepIndex: 12 },
                { label: "Lifestyle", value: `${data.activity_level || "Not set"}, ${data.daily_steps || "Not set"} steps, ${data.sleep_duration || "Not set"} sleep`, stepIndex: 10 }
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
      case 15:
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
          {step > 1 && step < 15 && (
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
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
