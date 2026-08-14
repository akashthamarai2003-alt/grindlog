"use client";

import { useState, useEffect } from "react";
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
  const [showRestrictions, setShowRestrictions] = useState(false);
  const router = useRouter();

  const totalSteps = 16;
  const showProgress = step > 1 && step < 16;

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

  const handleComplete = () => {
    router.push("/fitness/report");
    router.refresh();
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

  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <p className="text-xs text-red-400 font-semibold mt-1.5 flex items-center gap-1">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
        <span>{error}</span>
      </p>
    );
  };

  // Step 2 validation helper
  const step2Errors = (() => {
    const errs: Record<string, string> = {};
    if (data.name !== undefined && (!data.name.trim() || data.name.trim().length < 2)) {
      errs.name = "Name must be at least 2 characters.";
    }
    if (data.age !== undefined && (isNaN(data.age) || data.age < 16 || data.age > 120)) {
      errs.age = "Age must be between 16 and 120.";
    }
    if (data.country !== undefined && (!data.country.trim() || data.country.trim().length < 2)) {
      errs.country = "Please enter a valid country.";
    }
    if (data.preferred_language !== undefined && (!data.preferred_language.trim() || data.preferred_language.trim().length < 2)) {
      errs.preferred_language = "Please enter your preferred language.";
    }
    return errs;
  })();

  const isStep2Valid = Boolean(
    data.name && data.name.trim().length >= 2 &&
    data.age && data.age >= 16 && data.age <= 120 &&
    data.gender &&
    data.country && data.country.trim().length >= 2 &&
    data.preferred_language && data.preferred_language.trim().length >= 2 &&
    Object.keys(step2Errors).length === 0
  );

  // Step 3 validation helper
  const step3Errors = (() => {
    const errs: Record<string, string> = {};
    if (data.height !== undefined && (isNaN(data.height) || data.height < 50 || data.height > 250)) {
      errs.height = "Height must be between 50 and 250 cm.";
    }
    if (data.weight !== undefined && (isNaN(data.weight) || data.weight < 30 || data.weight > 350)) {
      errs.weight = "Weight must be between 30 and 350 kg.";
    }
    if (data.waist_cm !== undefined && (isNaN(data.waist_cm) || data.waist_cm < 40 || data.waist_cm > 200)) {
      errs.waist_cm = "Waist must be between 40 and 200 cm.";
    }
    if (data.chest_cm !== undefined && (isNaN(data.chest_cm) || data.chest_cm < 40 || data.chest_cm > 200)) {
      errs.chest_cm = "Chest must be between 40 and 200 cm.";
    }
    if (data.arm_cm !== undefined && (isNaN(data.arm_cm) || data.arm_cm < 15 || data.arm_cm > 80)) {
      errs.arm_cm = "Arm must be between 15 and 80 cm.";
    }
    if (data.thigh_cm !== undefined && (isNaN(data.thigh_cm) || data.thigh_cm < 20 || data.thigh_cm > 120)) {
      errs.thigh_cm = "Thigh must be between 20 and 120 cm.";
    }
    return errs;
  })();

  const isStep3Valid = Boolean(
    data.height && data.height >= 50 && data.height <= 250 &&
    data.weight && data.weight >= 30 && data.weight <= 350 &&
    Object.keys(step3Errors).length === 0
  );

  // Step 4 validation helper
  const step4Errors = (() => {
    const errs: Record<string, string> = {};
    if (data.target_weight !== undefined && (isNaN(data.target_weight) || data.target_weight < 30 || data.target_weight > 350)) {
      errs.target_weight = "Target weight must be between 30 and 350 kg.";
    }
    if (data.target_deadline_days !== undefined && data.target_deadline_days !== null && !isNaN(data.target_deadline_days)) {
      if (data.target_deadline_days < 7 || data.target_deadline_days > 365) {
        errs.target_deadline_days = "Deadline must be between 7 and 365 days (or leave blank).";
      }
    }
    return errs;
  })();

  const isStep4Valid = Boolean(
    data.goal &&
    data.target_weight && data.target_weight >= 30 && data.target_weight <= 350 &&
    (data.target_deadline_days === undefined || data.target_deadline_days === null || (data.target_deadline_days >= 7 && data.target_deadline_days <= 365)) &&
    Object.keys(step4Errors).length === 0
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
                  className={`w-full p-4 rounded-xl border bg-[#0D150D] text-white transition-colors outline-none placeholder:text-gray-600 ${
                    step2Errors.name ? 'border-red-500/80 focus:border-red-500' : 'border-[#1A2619] focus:border-[#ADFF00]'
                  }`} 
                  placeholder="Your Name"
                />
                <FieldError error={step2Errors.name} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Age</label>
                  <input 
                    type="number" 
                    min={16} max={120}
                    value={data.age || ""} 
                    onChange={e => handleUpdate({ age: parseInt(e.target.value) || undefined })}
                    className={`w-full p-4 rounded-xl border bg-[#0D150D] text-white transition-colors outline-none placeholder:text-gray-600 ${
                      step2Errors.age ? 'border-red-500/80 focus:border-red-500' : 'border-[#1A2619] focus:border-[#ADFF00]'
                    }`} 
                    placeholder="25"
                  />
                  <FieldError error={step2Errors.age} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Gender</label>
                  <select 
                    value={data.gender || ""} 
                    onChange={e => handleUpdate({ gender: e.target.value as any })}
                    className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] transition-colors outline-none appearance-none"
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
                  className={`w-full p-4 rounded-xl border bg-[#0D150D] text-white transition-colors outline-none placeholder:text-gray-600 ${
                    step2Errors.country ? 'border-red-500/80 focus:border-red-500' : 'border-[#1A2619] focus:border-[#ADFF00]'
                  }`} 
                  placeholder="e.g. United States"
                />
                <FieldError error={step2Errors.country} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Preferred Language</label>
                <input 
                  type="text" 
                  value={data.preferred_language || ""} 
                  onChange={e => handleUpdate({ preferred_language: e.target.value })}
                  className={`w-full p-4 rounded-xl border bg-[#0D150D] text-white transition-colors outline-none placeholder:text-gray-600 ${
                    step2Errors.preferred_language ? 'border-red-500/80 focus:border-red-500' : 'border-[#1A2619] focus:border-[#ADFF00]'
                  }`} 
                  placeholder="e.g. English"
                />
                <FieldError error={step2Errors.preferred_language} />
              </div>
            </div>
            <BottomBar 
              canProceed={isStep2Valid} 
              onProceed={handleNext} 
            />
          </div>
        );
      case 3:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Body Details" subtitle="Let's understand your starting point." />
            
            <div className="mb-6 bg-[#0D150D] border border-[#1A2619] p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-[#ADFF00] shrink-0" />
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Why Honest Details Matter</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Please enter your exact measurements honestly. We calculate an estimated body-fat range using an established formula based on your metrics.
              </p>
              <div className="pt-2 border-t border-[#1A2619] text-[11px] text-gray-400 leading-relaxed flex items-start gap-1.5">
                <span>📸</span>
                <span><b>Photos & Goal Physique:</b> Photos can be used for visual progress comparison and AI Goal Physique photo analysis.</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Height (cm)</label>
                  <input 
                    type="number" 
                    value={data.height || ""} 
                    onChange={e => handleUpdate({ height: parseFloat(e.target.value) || undefined })}
                    className={`w-full p-4 rounded-xl border bg-[#0D150D] text-white transition-colors outline-none placeholder:text-gray-600 ${
                      step3Errors.height ? 'border-red-500/80 focus:border-red-500' : 'border-[#1A2619] focus:border-[#ADFF00]'
                    }`}
                    placeholder="173"
                  />
                  <FieldError error={step3Errors.height} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={data.weight || ""} 
                    onChange={e => handleUpdate({ weight: parseFloat(e.target.value) || undefined })}
                    className={`w-full p-4 rounded-xl border bg-[#0D150D] text-white transition-colors outline-none placeholder:text-gray-600 ${
                      step3Errors.weight ? 'border-red-500/80 focus:border-red-500' : 'border-[#1A2619] focus:border-[#ADFF00]'
                    }`}
                    placeholder="73"
                  />
                  <FieldError error={step3Errors.weight} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Waist (cm) <span className="text-gray-500 font-normal block text-xs">Optional</span></label>
                  <input 
                    type="number" 
                    value={data.waist_cm || ""} 
                    onChange={e => handleUpdate({ waist_cm: parseFloat(e.target.value) || undefined })}
                    className={`w-full p-4 rounded-xl border bg-[#0D150D] text-white transition-colors outline-none placeholder:text-gray-600 ${
                      step3Errors.waist_cm ? 'border-red-500/80 focus:border-red-500' : 'border-[#1A2619] focus:border-[#ADFF00]'
                    }`}
                    placeholder="80"
                  />
                  <FieldError error={step3Errors.waist_cm} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Chest (cm) <span className="text-gray-500 font-normal block text-xs">Optional</span></label>
                  <input 
                    type="number" 
                    value={data.chest_cm || ""} 
                    onChange={e => handleUpdate({ chest_cm: parseFloat(e.target.value) || undefined })}
                    className={`w-full p-4 rounded-xl border bg-[#0D150D] text-white transition-colors outline-none placeholder:text-gray-600 ${
                      step3Errors.chest_cm ? 'border-red-500/80 focus:border-red-500' : 'border-[#1A2619] focus:border-[#ADFF00]'
                    }`}
                    placeholder="95"
                  />
                  <FieldError error={step3Errors.chest_cm} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Arm (cm) <span className="text-gray-500 font-normal block text-xs">Optional</span></label>
                  <input 
                    type="number" 
                    value={data.arm_cm || ""} 
                    onChange={e => handleUpdate({ arm_cm: parseFloat(e.target.value) || undefined })}
                    className={`w-full p-4 rounded-xl border bg-[#0D150D] text-white transition-colors outline-none placeholder:text-gray-600 ${
                      step3Errors.arm_cm ? 'border-red-500/80 focus:border-red-500' : 'border-[#1A2619] focus:border-[#ADFF00]'
                    }`}
                    placeholder="35"
                  />
                  <FieldError error={step3Errors.arm_cm} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Thigh (cm) <span className="text-gray-500 font-normal block text-xs">Optional</span></label>
                  <input 
                    type="number" 
                    value={data.thigh_cm || ""} 
                    onChange={e => handleUpdate({ thigh_cm: parseFloat(e.target.value) || undefined })}
                    className={`w-full p-4 rounded-xl border bg-[#0D150D] text-white transition-colors outline-none placeholder:text-gray-600 ${
                      step3Errors.thigh_cm ? 'border-red-500/80 focus:border-red-500' : 'border-[#1A2619] focus:border-[#ADFF00]'
                    }`}
                    placeholder="55"
                  />
                  <FieldError error={step3Errors.thigh_cm} />
                </div>
              </div>
            </div>
            <BottomBar 
              canProceed={isStep3Valid} 
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
                { id: "Gain Weight", emoji: "📈" },
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
              <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Target & Deadline</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
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
                    className={`w-full p-4 rounded-xl border bg-[#ADFF00]/5 text-white transition-colors outline-none placeholder:text-gray-600 font-bold ${
                      step4Errors.target_weight ? 'border-red-500/80 focus:border-red-500' : 'border-[#ADFF00]/30 focus:border-[#ADFF00]'
                    }`}
                    placeholder={data.weight ? `${Math.round(data.weight * 0.9)}` : "68"}
                  />
                  <FieldError error={step4Errors.target_weight} />
                </div>
              </div>

              <div className="w-full mt-4">
                <label className="block text-xs font-semibold text-[#ADFF00] mb-2 flex items-center justify-between">
                  <span>Days to Achieve Goal <span className="text-gray-500 font-normal ml-1">(Optional)</span></span>
                  <span className="text-gray-500 font-medium">{data.target_deadline_days ? `${data.target_deadline_days} Days` : 'Not specified'}</span>
                </label>
                <div className="flex gap-2 mb-3">
                  {[30, 60, 90, 180].map(days => (
                    <button
                      key={days}
                      onClick={() => handleUpdate({ target_deadline_days: data.target_deadline_days === days ? undefined : days })}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                        data.target_deadline_days === days
                          ? "bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]"
                          : "bg-[#121E12] border-[#1A2619] text-gray-400 hover:border-gray-700"
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  value={data.target_deadline_days || ""} 
                  onChange={e => handleUpdate({ target_deadline_days: parseInt(e.target.value) || undefined })}
                  className={`w-full p-3 rounded-xl border bg-[#121E12] text-white transition-colors outline-none placeholder:text-gray-600 font-bold ${
                    step4Errors.target_deadline_days ? 'border-red-500/80 focus:border-red-500' : 'border-[#1A2619] focus:border-[#ADFF00]/50'
                  }`}
                  placeholder="Or enter custom days (e.g. 45, or leave blank)"
                />
                <FieldError error={step4Errors.target_deadline_days} />
              </div>
            </div>

            <BottomBar canProceed={isStep4Valid} onProceed={handleNext} />
          </div>
        );
      case 5:
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
      case 6:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Workout Environment" subtitle="Where will you train?" />
            <div className="space-y-8">
              <div className="space-y-3">
                {[
                  { 
                    id: "Gym", 
                    emoji: "🏋️", 
                    desc: "Commercial Gym (Barbells, Dumbbells, Machines, Cables & Cardio)",
                    defaultEq: ["Full Commercial Gym", "Barbells", "Dumbbells", "Cable Machines", "Squat Rack", "Treadmill / Cardio"]
                  },
                  { 
                    id: "Home", 
                    emoji: "🏠", 
                    desc: "Home workouts (Bodyweight / Calisthenics or personal equipment)",
                    defaultEq: ["No Equipment / Bodyweight"]
                  },
                  { 
                    id: "Outdoor", 
                    emoji: "🌳", 
                    desc: "Parks & Track (Bodyweight calisthenics, running & sprint drills)",
                    defaultEq: ["Bodyweight & Outdoor Running"]
                  },
                  { 
                    id: "Combination", 
                    emoji: "🔄", 
                    desc: "Hybrid plan — Mix of Gym lifting + Home bodyweight / Outdoor sessions",
                    defaultEq: ["Hybrid Gym & Home Equipment"]
                  }
                ].map(opt => {
                  const isSelected = data.training_location === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        handleUpdate({ 
                          training_location: opt.id as any, 
                          equipment: opt.defaultEq 
                        });
                      }}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        isSelected ? "border-[#ADFF00] bg-[#ADFF00]/10 shadow-[0_0_15px_rgba(173,255,0,0.15)]" : "border-[#1A2619] bg-[#0D150D] hover:border-[#233522]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl ${isSelected ? "" : "opacity-70 grayscale"}`}>
                            {opt.emoji}
                          </div>
                          <div>
                            <h3 className={`font-extrabold text-base ${isSelected ? "text-[#ADFF00]" : "text-gray-100"}`}>{opt.id}</h3>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium leading-relaxed">{opt.desc}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#ADFF00] ml-2 shrink-0">
                            <Check size={22} strokeWidth={3} />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {data.training_location && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden bg-[#0D150D] border border-[#1A2619] p-4 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                        {data.training_location === "Gym" && "Gym Equipment Options"}
                        {data.training_location === "Home" && "Home Equipment Available"}
                        {data.training_location === "Outdoor" && "Outdoor Facilities"}
                        {data.training_location === "Combination" && "Combination Equipment"}
                      </label>
                      <span className="text-[10px] text-gray-500">Tap to toggle</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(data.training_location === "Gym" ? [
                        "Full Commercial Gym", "Barbells", "Dumbbells", "Cable Machines", "Machines", "Squat Rack", "Bench", "Treadmill / Cardio"
                      ] : data.training_location === "Home" ? [
                        "No Equipment / Bodyweight", "Dumbbells", "Adjustable Bench", "Kettlebell", "Pull-up Bar", "Resistance Bands", "Home Barbell", "Treadmill / Exercise Bike", "Yoga Mat"
                      ] : data.training_location === "Outdoor" ? [
                        "Bodyweight & Outdoor Running", "Park Benches & Bars", "Sprinting Track"
                      ] : [
                        "Hybrid Gym & Home Equipment", "Full Commercial Gym", "No Equipment / Bodyweight", "Dumbbells", "Treadmill / Cardio"
                      ]).map(opt => {
                        const isSelected = data.equipment?.includes(opt) || false;
                        return (
                          <button
                            key={opt}
                            onClick={() => {
                              let newEq = [...(data.equipment || [])];
                              if (opt === "No Equipment / Bodyweight") {
                                newEq = ["No Equipment / Bodyweight"];
                              } else {
                                newEq = newEq.filter(e => e !== "No Equipment / Bodyweight");
                                if (isSelected) {
                                  newEq = newEq.filter(e => e !== opt);
                                } else {
                                  newEq.push(opt);
                                }
                              }
                              if (newEq.length === 0) newEq = [opt];
                              handleUpdate({ equipment: newEq });
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                              isSelected 
                                ? "bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]" 
                                : "bg-[#121E12] border-[#1A2619] text-gray-400 hover:border-[#ADFF00]/50 hover:text-gray-200"
                            }`}
                          >
                            {isSelected ? `✓ ${opt}` : opt}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <BottomBar 
              canProceed={Boolean(data.training_location && data.equipment && data.equipment.length > 0)} 
              onProceed={handleNext} 
            />
          </div>
        );

      case 7:
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
      case 8:
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

            case 9:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Food & Budget" subtitle="Let's make sure the plan fits your wallet." />
            <div className="space-y-8">
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">How much can you spend on additional fitness food each month?</label>
                <div className="grid grid-cols-2 gap-3">
                  {["₹0–1,000", "₹1,000–2,000", "₹2,000–5,000", "₹5,000+"].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleUpdate({ nutrition_budget: opt as any })}
                      className={`py-4 rounded-xl flex items-center justify-center font-bold transition-all border ${
                        data.nutrition_budget === opt ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-[#1A2619] bg-[#0D150D] text-gray-400 hover:border-[#ADFF00]/50 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Available foods <span className="text-xs text-gray-500 font-normal ml-2">Select all you eat</span></label>
                <div className="flex flex-wrap gap-2">
                  {["Eggs", "Milk", "Curd", "Paneer", "Soya", "Chana", "Peanuts", "Oats", "Chicken", "Fish"].map(opt => {
                    const isSelected = data.available_foods?.includes(opt) || false;
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          let newFoods = [...(data.available_foods || [])];
                          if (isSelected) newFoods = newFoods.filter(e => e !== opt);
                          else newFoods.push(opt);
                          handleUpdate({ available_foods: newFoods });
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                          isSelected 
                            ? "bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]" 
                            : "bg-[#121E12] border-[#1A2619] text-gray-400 hover:border-[#ADFF00]/50 hover:text-gray-200"
                        }`}
                      >
                        {isSelected ? `☑ ${opt}` : `☐ ${opt}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-[#1A2619]">
                <button 
                  onClick={() => setShowRestrictions(!showRestrictions)}
                  className="w-full flex items-center justify-between py-2 text-left"
                >
                  <div>
                    <h3 className="font-semibold text-gray-200">Restrictions (Optional)</h3>
                    <p className="text-xs text-gray-500 mt-1">Allergies, dislikes, or foods you avoid.</p>
                  </div>
                  <div className={`p-2 rounded-full transition-colors ${showRestrictions ? "bg-red-500/20 text-red-500" : "bg-[#121E12] text-gray-400"}`}>
                    <ChevronRight size={18} className={`transition-transform duration-300 ${showRestrictions ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {showRestrictions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Food allergies</label>
                        <input 
                          type="text" 
                          value={data.food_allergies || ""} 
                          onChange={e => handleUpdate({ food_allergies: e.target.value })}
                          placeholder="e.g., Peanut, Lactose"
                          className="w-full p-3 rounded-xl border border-[#1A2619] bg-[#121E12] text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors outline-none placeholder:text-gray-600" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Foods you dislike</label>
                        <input 
                          type="text" 
                          value={data.foods_disliked || ""} 
                          onChange={e => handleUpdate({ foods_disliked: e.target.value })}
                          placeholder="e.g., Broccoli"
                          className="w-full p-3 rounded-xl border border-[#1A2619] bg-[#121E12] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Foods you don't eat</label>
                        <input 
                          type="text" 
                          value={data.foods_avoided || ""} 
                          onChange={e => handleUpdate({ foods_avoided: e.target.value })}
                          placeholder="e.g., Pork, Beef"
                          className="w-full p-3 rounded-xl border border-[#1A2619] bg-[#121E12] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none placeholder:text-gray-600" 
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
            <BottomBar canProceed={!!data.nutrition_budget} onProceed={handleNext} />
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
                (data.previous_injuries === false || (
                  data.previous_injury_areas !== undefined && data.previous_injury_areas.length > 0 &&
                  Boolean(data.previous_injury_timeline)
                )) &&
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
            <StepHeader 
              title="AI Body Scan & Goal Physique" 
              subtitle="Show your AI coach where you're starting and choose what you want to achieve." 
            />
            
            <div className="space-y-8">
              {/* 1. CURRENT BODY SCAN PHOTOS */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-[#ADFF00] bg-[#ADFF00]/10 px-2.5 py-0.5 rounded-full border border-[#ADFF00]/20 uppercase tracking-wider">Step 1</span>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Current Body Scan Photos</h3>
                </div>
                <p className="text-xs text-gray-400 mb-4">Upload photos for AI body fat, posture, and muscle distribution analysis.</p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "FRONT VIEW", field: "body_scan_front" },
                    { label: "LEFT SIDE", field: "body_scan_left" },
                    { label: "RIGHT SIDE", field: "body_scan_right" },
                    { label: "BACK VIEW", field: "body_scan_back" },
                  ].map(item => (
                    <div key={item.field} className="relative">
                      <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider text-center">{item.label}</label>
                      <div className={`w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${(data as any)[item.field] ? 'border-[#ADFF00] bg-[#ADFF00]/10' : 'border-[#1A2619] bg-[#0D150D] hover:border-[#ADFF00]/50'}`}>
                        <input type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => handleUpdate({ [item.field]: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        {(data as any)[item.field] ? (
                          <img src={(data as any)[item.field]} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <>
                            <div className="w-9 h-9 bg-[#1A2619] rounded-full flex items-center justify-center mb-2 text-[#ADFF00]">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-gray-300">+ Upload</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. GOAL PHYSIQUE TARGET SECTION */}
              <div className="pt-6 border-t border-[#1A2619] space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-[#ADFF00] bg-[#ADFF00]/10 px-2.5 py-0.5 rounded-full border border-[#ADFF00]/20 uppercase tracking-wider">Step 2</span>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Your Goal Physique Target</h3>
                  </div>
                  <p className="text-xs text-gray-400">Upload your goal inspiration photo <b>OR</b> select a target physique model below.</p>
                </div>

                {/* Option A: Inspiration Photo Upload */}
                <div className="bg-[#0D150D] border border-[#1A2619] p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <span>📸</span> Goal Inspiration Photo <span className="text-gray-500 font-normal">(Optional)</span>
                    </span>
                    {(data.body_scan_inspiration || data.goal_physique_image) && (
                      <span className="text-[10px] font-bold text-[#ADFF00] bg-[#ADFF00]/10 px-2 py-0.5 rounded-full border border-[#ADFF00]/30">Uploaded</span>
                    )}
                  </div>
                  <div className={`relative w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${data.body_scan_inspiration || data.goal_physique_image ? 'border-[#ADFF00] bg-[#ADFF00]/10' : 'border-[#1A2619] bg-[#121E12] hover:border-[#ADFF00]/50'}`}>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => handleUpdate({ body_scan_inspiration: ev.target?.result as string, goal_physique_image: ev.target?.result as string });
                        reader.readAsDataURL(file);
                      }
                    }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {data.body_scan_inspiration || data.goal_physique_image ? (
                      <img src={data.body_scan_inspiration || data.goal_physique_image} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-[#1A2619] rounded-full flex items-center justify-center mb-2 text-[#ADFF00]">
                          <User className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-300">+ Click to Upload Goal Inspiration Photo</span>
                        <span className="text-[10px] text-gray-500 mt-0.5">Celebrity, athlete, or physique model photo</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-[#1A2619]" />
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">OR SELECT A MODEL PRESET</span>
                  <div className="flex-1 h-px bg-[#1A2619]" />
                </div>

                {/* Option B: Target Physique Picture Cards */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Select Target Physique Type</label>
                  <div className="space-y-3">
                    {[
                      { id: "Lean Athletic", icon: "⚡", tag: "Low Fat & Toned", desc: "Low body fat, defined core & lean athletic conditioning" },
                      { id: "Muscular", icon: "💪", tag: "High Muscle Mass", desc: "Solid muscle mass, broad chest, biceps & powerful build" },
                      { id: "Six Pack", icon: "🔥", tag: "Shredded Core", desc: "Defined 6-pack abs, tight waist & sculpted upper body" },
                      { id: "Men's Physique", icon: "🏆", tag: "Aesthetic V-Taper", desc: "Classic V-taper, wide lats & aesthetic proportions" },
                      { id: "Bodybuilder", icon: "🏋️", tag: "Maximum Mass", desc: "Maximum muscle volume, thickness & hyper-density" },
                      { id: "Sporty", icon: "🏃", tag: "Agile & Active", desc: "Functional, energetic, fit & overall athletic endurance" },
                      { id: "Strong & Functional", icon: "⚙️", tag: "Power & Strength", desc: "Thick core, heavy lifting build & functional strength" }
                    ].map(opt => {
                      const isSelected = data.target_physique === opt.id;
                      return (
                        <motion.button
                          key={opt.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleUpdate({ target_physique: opt.id as any })}
                          className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                            isSelected 
                              ? "border-[#ADFF00] bg-[#ADFF00]/10 shadow-[0_0_20px_rgba(173,255,0,0.15)]" 
                              : "border-[#1A2619] bg-[#0D150D] hover:border-[#233522]"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                              isSelected ? "bg-[#ADFF00] text-black font-black" : "bg-[#121E12] border border-[#1A2619] text-gray-300"
                            }`}>
                              {opt.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`font-extrabold text-base ${isSelected ? "text-[#ADFF00]" : "text-white"}`}>{opt.id}</h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  isSelected ? "bg-[#ADFF00]/20 text-[#ADFF00] border-[#ADFF00]/30" : "bg-[#1A2619] text-gray-400 border-gray-800"
                                }`}>
                                  {opt.tag}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 font-medium leading-normal">{opt.desc}</p>
                            </div>
                          </div>

                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                            isSelected ? "bg-[#ADFF00] border-[#ADFF00] text-black" : "border-gray-700"
                          }`}>
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Photo Privacy Note */}
              <div className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-300">
                  <Info size={14} className="text-[#ADFF00]" />
                  <span>Your photos are encrypted & private</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Used solely by Groq Vision AI to analyze body composition, posture, and timeframe projections.
                </p>
                <button 
                  onClick={handleNext}
                  className="text-xs font-bold text-[#ADFF00] hover:underline block mx-auto pt-1"
                >
                  Skip photos and analyze profile →
                </button>
              </div>

            </div>

            <BottomBar 
              canProceed={Boolean(data.target_physique || data.goal_physique_image || data.body_scan_inspiration || data.body_scan_front)} 
              onProceed={handleNext} 
              label="Analyze & Generate Plan" 
            />
          </div>
        );

      case 15:
        return (
          <div className="px-6 pt-6 pb-36">
            <StepHeader title="Review Your Profile" subtitle="Make sure everything looks good." />
            <div className="space-y-4">
              {[
                { label: "Personal Profile", value: data.name ? `${data.name}, ${data.age} yrs, ${data.country}` : null, stepIndex: 2 },
                { label: "Body Details", value: [
                    data.height ? `${data.height}cm` : null,
                    data.weight ? `${data.weight}kg` : null,
                    data.waist_cm ? `W:${data.waist_cm}cm` : null,
                    data.chest_cm ? `C:${data.chest_cm}cm` : null,
                    data.arm_cm ? `A:${data.arm_cm}cm` : null,
                    data.thigh_cm ? `T:${data.thigh_cm}cm` : null
                  ].filter(Boolean).join(", "), stepIndex: 3 },
                { label: "Goal & Target", value: data.goal ? `${data.goal} (Target: ${data.target_weight}kg)` : null, stepIndex: 4 },
                { label: "Experience", value: data.fitness_level ? `${data.fitness_level} (${data.training_days_per_week} days/wk)` : null, stepIndex: 5 },
                { label: "Environment", value: data.training_location ? `${data.training_location}${data.equipment?.length ? ` (${data.equipment.join(", ")})` : ''}` : null, stepIndex: 6 },
                { label: "Schedule", value: data.workout_duration_minutes ? `${data.workout_duration_minutes} min, ${data.preferred_training_time}` : null, stepIndex: 7 },
                { label: "Nutrition", value: `${data.food_type || "Not set"}, ${data.meals_per_day || "Not set"}, ${data.food_environment || "Not set"}`, stepIndex: 8 },
                { label: "Food & Budget", value: data.nutrition_budget ? `${data.nutrition_budget}, ${data.available_foods?.length || 0} foods` : null, stepIndex: 9 },
                { label: "Lifestyle", value: `${data.activity_level || "Not set"}, ${data.daily_steps || "Not set"} steps, ${data.sleep_duration || "Not set"} sleep`, stepIndex: 10 },
                { label: "Health & Safety", value: data.physical_problems?.includes("None") && data.previous_injuries === false ? "No concerns" : "Concerns noted", stepIndex: 12 },
                { label: "Target Physique & Scan", value: data.target_physique ? `${data.target_physique} (${data.body_scan_front ? 'Photos uploaded' : 'No photos'})` : "Not set", stepIndex: 14 }
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

      case 16:
        return <AIAnalysisScreen onComplete={handleComplete} data={data} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#0A1108] selection:bg-[#ADFF00] selection:text-black">
      <div className="max-w-[480px] mx-auto min-h-[100dvh] flex flex-col relative overflow-hidden bg-[#0A1108] shadow-2xl shadow-black/50 border-x border-[#121E12]">
        {/* Top Nav (Progress & Back) */}
        <div className="h-16 flex items-center px-4 relative z-10">
          {step > 1 && step < 16 && (
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


const AIAnalysisScreen = ({ onComplete, data }: { onComplete: () => void, data: any }) => {
  const [phase, setPhase] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2000);
    const t2 = setTimeout(() => setPhase(2), 3500);
    const t3 = setTimeout(() => setPhase(3), 5500);
    const t4 = setTimeout(() => setPhase(4), 7500);

    let isMounted = true;
    fetch('/api/fitness/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(res => {
      if (isMounted) {
        if (res.success) {
          setIsDone(true);
        } else {
          setError(res.error || "Analysis failed");
        }
      }
    })
    .catch(err => {
      if (isMounted) {
        setError(err.message);
      }
    });

    return () => { 
      isMounted = false;
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); 
    };
  }, [data]);

  return (
    <div className="flex flex-col min-h-[100dvh] justify-center px-6 relative overflow-hidden bg-[#0A1108]">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[300px] h-[300px] bg-[#ADFF00] rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto py-12">
        <div className="flex justify-center mb-10 h-16">
          {phase < 4 ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-16 h-16 border-4 border-[#1A2619] border-t-[#ADFF00] rounded-full"
            />
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-[#ADFF00] rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(173,255,0,0.5)]">
              <Check size={32} strokeWidth={3} />
            </motion.div>
          )}
        </div>

        <div className="space-y-8 min-h-[280px]">
          <AnalysisBlock 
            title="Understanding your profile..." 
            items={["Body information", "Fitness goal", "Training experience", "Lifestyle", "Nutrition preferences"]}
            isActive={phase >= 0}
            isComplete={phase >= 1}
          />
          <AnalysisBlock 
            title="Analyzing your uploaded photos..." 
            items={["Visual assessment"]}
            isActive={phase >= 1}
            isComplete={phase >= 2}
          />
          <AnalysisBlock 
            title="Building your transformation strategy..." 
            items={["Training strategy", "Nutrition strategy", "Progress roadmap"]}
            isActive={phase >= 2}
            isComplete={phase >= 3}
          />
        </div>

        <div className="mt-8 h-16">
          <AnimatePresence>
            {phase >= 4 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
              >
                <button 
                  onClick={onComplete} 
                  disabled={!isDone && !error}
                  className={`w-full py-4 rounded-full font-extrabold text-lg transition-all flex items-center justify-center ${error ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-[#ADFF00] text-black shadow-[0_0_30px_rgba(173,255,0,0.35)] hover:bg-[#c4ff33]'} disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {error ? (
                    "Analysis Error"
                  ) : !isDone ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin w-5 h-5" />
                      <span>Finalizing Strategy...</span>
                    </div>
                  ) : (
                    "View Transformation Plan"
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};


const AnalysisBlock = ({ title, items, isActive, isComplete }: { title: string, items: string[], isActive: boolean, isComplete: boolean }) => {
  if (!isActive) return null;
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <h3 className={`font-black text-sm transition-colors duration-500 ${isComplete ? 'text-gray-400' : 'text-white'}`}>{title}</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div 
            key={item} 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3"
          >
            <div className={`w-5 h-5 rounded-full flex flex-shrink-0 items-center justify-center border-2 transition-colors duration-500 ${
              isComplete ? 'border-[#ADFF00] bg-[#ADFF00]/10 text-[#ADFF00]' : 'border-gray-600 bg-transparent text-transparent'
            }`}>
              <Check size={12} strokeWidth={3} className={isComplete ? "opacity-100" : "opacity-0"} />
            </div>
            <span className={`text-sm font-semibold transition-colors duration-500 ${isComplete ? 'text-gray-300' : 'text-gray-500'}`}>{item}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
