"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { OnboardingData, OnboardingSchema } from "@/types/fitness/onboarding";
import { saveFitnessOnboardingAction } from "@/app/actions/fitness";
import { ArrowLeft, Check, Loader2, Dumbbell, Scale, Target, Flame, Heart, Info, ChevronRight, ChevronDown, Clock, ListChecks, ArrowRight, User, AlertTriangle, Stethoscope, Activity, Frown, Sparkles, Trash2, Calendar, Globe, Languages, Users, Ruler, CircleDashed, Shirt, BicepsFlexed } from "lucide-react";
import { BodySilhouette } from "./body-silhouette";
import { toast } from "sonner";
import frontImg from "../../../assets/images/placeholder-front.png";
import backImg from "../../../assets/images/placeholder-back.png";
import leftImg from "../../../assets/images/placeholder-left.png";
import rightImg from "../../../assets/images/placeholder-right.png";
import goalImg from "../../../assets/images/placeholder-goal.png";
import frontImgFemale from "../../../assets/images/placeholder-front-female.jpg";
import backImgFemale from "../../../assets/images/placeholder-back-female.jpg";
import leftImgFemale from "../../../assets/images/placeholder-left-female.jpg";
import rightImgFemale from "../../../assets/images/placeholder-right-female.jpg";
import frontImgMaleFat from "../../../assets/images/placeholder-front-male-fat.jpg";
import backImgMaleFat from "../../../assets/images/placeholder-back-male-fat.jpg";
import leftImgMaleFat from "../../../assets/images/placeholder-left-male-fat.jpg";
import rightImgMaleFat from "../../../assets/images/placeholder-right-male-fat.jpg";

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export function OnboardingFlow({ initialData = {}, sessionId }: { initialData?: Partial<OnboardingData>, sessionId?: string }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [showGenderSheet, setShowGenderSheet] = useState(false);
  const [showLanguageSheet, setShowLanguageSheet] = useState(false);
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
    router.push("/report");
    router.refresh();
  };

  const variants = {
    enter: (direction: number) => ({
      x: step === 1 ? 0 : (direction > 0 ? 20 : -20),
      opacity: step === 1 ? 1 : 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
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

  const StepHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => {
    const words = title.split(" ");
    const firstWord = words[0];
    const rest = words.slice(1).join(" ");
    return (
      <div className="mb-8 mt-2">
        <h2 style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[38px] leading-[1.05] font-bold italic uppercase tracking-tight flex flex-wrap gap-x-2">
          <span className="text-[#ADFF00]">{firstWord}</span>
          {rest && <span className="text-white">{rest}</span>}
        </h2>
        {subtitle && <p className="text-gray-400 mt-2 font-medium">{subtitle}</p>}
      </div>
    );
  };

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
    if (typeof data.name === 'string' && (!data.name.trim() || data.name.trim().length < 2)) {
      errs.name = "Name must be at least 2 characters.";
    }
    if (data.age !== undefined && data.age !== null && (isNaN(data.age) || data.age < 16 || data.age > 120)) {
      errs.age = "Age must be between 16 and 120.";
    }
    if (typeof data.country === 'string' && (!data.country.trim() || data.country.trim().length < 2)) {
      errs.country = "Please enter a valid country.";
    }
    if (typeof data.preferred_language === 'string' && (!data.preferred_language.trim() || data.preferred_language.trim().length < 2)) {
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
    if (data.height !== undefined && data.height !== null && (isNaN(data.height) || data.height < 50 || data.height > 250)) {
      errs.height = "Height must be between 50 and 250 cm.";
    }
    if (data.weight !== undefined && data.weight !== null && (isNaN(data.weight) || data.weight < 30 || data.weight > 350)) {
      errs.weight = "Weight must be between 30 and 350 kg.";
    }
    if (data.waist_cm !== undefined && data.waist_cm !== null && (isNaN(data.waist_cm) || data.waist_cm < 40 || data.waist_cm > 200)) {
      errs.waist_cm = "Waist must be between 40 and 200 cm.";
    }
    if (data.chest_cm !== undefined && data.chest_cm !== null && (isNaN(data.chest_cm) || data.chest_cm < 40 || data.chest_cm > 200)) {
      errs.chest_cm = "Chest must be between 40 and 200 cm.";
    }
    if (data.arm_cm !== undefined && data.arm_cm !== null && (isNaN(data.arm_cm) || data.arm_cm < 15 || data.arm_cm > 80)) {
      errs.arm_cm = "Arm must be between 15 and 80 cm.";
    }
    if (data.thigh_cm !== undefined && data.thigh_cm !== null && (isNaN(data.thigh_cm) || data.thigh_cm < 20 || data.thigh_cm > 120)) {
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
    if (data.target_weight !== undefined && data.target_weight !== null && (isNaN(data.target_weight) || data.target_weight < 30 || data.target_weight > 350)) {
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
          <div className="absolute inset-0 flex flex-col bg-[#0A1108] z-50 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image 
                src="/images/onboarding-bg.png" 
                alt="Background" 
                fill 
                className="object-cover object-center" 
                priority
              />
            </div>
            
            {/* Dark Gradient Overlay - Only on bottom 75% so the top stays bright */}
            <div className="absolute bottom-0 left-0 right-0 h-[75%] z-10 bg-gradient-to-t from-[#0A1108] via-[#0A1108]/90 to-transparent" />
            
            {/* Interactive Content Layer */}
            <div className="relative z-20 w-full h-full flex flex-col px-8 pb-8 pt-[12dvh]">
              
              {/* Quote Block (Top Left) */}
              <motion.div initial={{ x: -30, y: 10, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} className="flex gap-3">
                <div className="w-[3px] bg-[#ADFF00] rounded-full" />
                <div className="flex flex-col gap-1.5 py-0.5">
                  <p className="text-white font-bold text-[13px] leading-[1.3] max-w-[160px]">
                    Discipline today builds the stronger you tomorrow.
                  </p>
                  <p className="text-gray-400 font-bold text-[9px] tracking-widest uppercase mt-0.5">
                    — GRINDLOG
                  </p>
                </div>
              </motion.div>

              {/* Flex Spacer to dynamically push the rest to the bottom */}
              <div className="flex-1 min-h-[20px]" />
              
              <div className="flex flex-col mb-6">
                <h1 className="text-[3.25rem] leading-[0.85] font-black uppercase tracking-tighter drop-shadow-lg">
                  <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }} className="block text-[#ADFF00]">PUSH</motion.span>
                  <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }} className="block text-[#ADFF00]">YOURSELF</motion.span>
                  <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.7 }} className="block text-white">HARDER</motion.span>
                </h1>
                
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.9 }} className="mt-4 text-gray-200 text-[14px] max-w-[260px] font-medium leading-snug drop-shadow-md">
                  Achieve your fitness goals with our innovative fitness app.
                </motion.p>
              </div>

              <motion.button 
                initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.1 }}
                onClick={handleNext} 
                className="w-full py-4 bg-[#ADFF00] text-black rounded-full font-black text-[14px] tracking-wider uppercase shadow-[0_0_30px_rgba(173,255,0,0.15)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-6"
              >
                <span>GET STARTED</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </motion.button>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.3 }} className="flex items-start justify-between px-1 text-center font-medium border-t border-white/10 pt-5">
                
                <div className="flex flex-col items-center gap-2 w-1/3">
                  <Clock className="w-5 h-5 text-[#ADFF00] font-light" strokeWidth={1.5} />
                  <div className="flex flex-col gap-0.5">
                    <span className="block text-white font-bold text-[10px] tracking-wide">5-7 MINUTES</span>
                    <span className="text-gray-500 text-[9px] font-medium">Quick & Easy</span>
                  </div>
                </div>

                <div className="w-px h-10 bg-white/10 mt-1" />

                <div className="flex flex-col items-center gap-2 w-1/3">
                  <ListChecks className="w-5 h-5 text-[#ADFF00] font-light" strokeWidth={1.5} />
                  <div className="flex flex-col gap-0.5">
                    <span className="block text-white font-bold text-[10px] tracking-wide">12-14 STEPS</span>
                    <span className="text-gray-500 text-[9px] font-medium">Personalized Plan</span>
                  </div>
                </div>

                <div className="w-px h-10 bg-white/10 mt-1" />

                <div className="flex flex-col items-center gap-2 w-1/3">
                  <Target className="w-5 h-5 text-[#ADFF00] font-light" strokeWidth={1.5} />
                  <div className="flex flex-col gap-0.5">
                    <span className="block text-white font-bold text-[10px] tracking-wide">YOUR GOALS</span>
                    <span className="text-gray-500 text-[9px] font-medium">Our Priority</span>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col min-h-[100dvh] bg-[#050905]">
            
            {/* Background Image - Sticky to stay fixed while scrolling */}
            <div className="sticky top-0 h-[100dvh] w-full z-0 pointer-events-none overflow-hidden">
              <Image 
                src="/images/profile-bg-2.png" 
                alt="Background" 
                fill 
                className="object-cover object-top opacity-100 -translate-y-[70px] scale-[1.05]" 
                priority
                unoptimized
              />
              {/* Simple gradient from solid black at bottom to transparent at top */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050905] via-[#050905]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050905] via-transparent to-transparent opacity-80" />
            </div>

            <div className="relative z-10 w-full flex flex-col px-6 pb-32 min-h-[100dvh] -mt-[100dvh]">
              
              {/* Top Navigation */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-[env(safe-area-inset-top)] h-16 flex items-center relative z-10 -mx-2">
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-full bg-[#121E12] border border-[#1E2E1D] hover:bg-[#1A2619] active:scale-95 transition-all text-gray-300"
                >
                  <ArrowLeft size={20} />
                </button>
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
              </motion.div>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }} className="mb-8 mt-4">
              <h2 style={{ fontFamily: "Oswald, sans-serif" }} className="text-[42px] leading-none font-bold italic uppercase tracking-tight flex gap-2">
                <span className="text-[#ADFF00]">PERSONAL</span>
                <span className="text-white">PROFILE</span>
              </h2>
              <p className="text-[16px] font-[500] text-[#91A0B5] mt-2">Tell us a bit about yourself.</p>
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }} className="flex flex-col gap-[24px]">
              
              {/* Name */}
              <div>
                <label className="block text-[14px] font-[700] text-white mb-2 transition-colors focus-within:text-[#A8FF00]">Name</label>
                <input 
                  type="text" 
                  value={data.name || ""} 
                  onChange={e => handleUpdate({ name: e.target.value })}
                  className={`w-full h-[58px] px-4 rounded-[14px] bg-[#0A130B] text-white text-[16px] transition-all duration-200 outline-none placeholder:text-[#53657A] font-[500] ${
                    step2Errors.name ? 'border border-red-500/80 focus:border-red-500' : 'border border-[rgba(168,255,0,0.13)] focus:border-[#A8FF00] focus:shadow-[0_0_12px_rgba(168,255,0,0.1)]'
                  }`} 
                  placeholder="Your Name"
                />
                <FieldError error={step2Errors.name} />
              </div>

              {/* Age & Gender Grid */}
              <div className="grid grid-cols-2 gap-[14px]">
                <div>
                  <label className="block text-[14px] font-[700] text-white mb-2 transition-colors focus-within:text-[#A8FF00]">Age</label>
                  <input 
                    type="number" 
                    min={16} max={120}
                    value={data.age || ""} 
                    onChange={e => handleUpdate({ age: parseInt(e.target.value) || undefined })}
                    className={`w-full h-[58px] px-4 rounded-[14px] bg-[#0A130B] text-white text-[16px] transition-all duration-200 outline-none placeholder:text-[#53657A] font-[500] ${
                      step2Errors.age ? 'border border-red-500/80 focus:border-red-500' : 'border border-[rgba(168,255,0,0.13)] focus:border-[#A8FF00] focus:shadow-[0_0_12px_rgba(168,255,0,0.1)]'
                    }`} 
                    placeholder="25"
                  />
                  <FieldError error={step2Errors.age} />
                </div>
                <div>
                  <label className="block text-[14px] font-[700] text-white mb-2">Gender</label>
                  <button 
                      onClick={() => setShowGenderSheet(true)}
                      className="w-full h-[58px] px-4 rounded-[14px] bg-[#0A130B] text-left text-[16px] transition-all duration-200 outline-none border border-[rgba(168,255,0,0.13)] focus:border-[#A8FF00] font-[500]"
                    >
                      <span className={data.gender ? "text-white" : "text-[#53657A]"}>{data.gender || "Select"}</span>
                    </button>
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-[14px] font-[700] text-white mb-2 transition-colors focus-within:text-[#A8FF00]">Country</label>
                <input 
                  type="text" 
                  value={data.country || ""} 
                  onChange={e => handleUpdate({ country: e.target.value })}
                  className={`w-full h-[58px] px-4 rounded-[14px] bg-[#0A130B] text-white text-[16px] transition-all duration-200 outline-none placeholder:text-[#53657A] font-[500] ${
                    step2Errors.country ? 'border border-red-500/80 focus:border-red-500' : 'border border-[rgba(168,255,0,0.13)] focus:border-[#A8FF00] focus:shadow-[0_0_12px_rgba(168,255,0,0.1)]'
                  }`} 
                  placeholder="e.g. United States"
                />
                <FieldError error={step2Errors.country} />
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-[14px] font-[700] text-white mb-2">Preferred Language</label>
                <button 
                    onClick={() => setShowLanguageSheet(true)}
                    className="w-full h-[58px] px-4 rounded-[14px] bg-[#0A130B] text-left text-[16px] transition-all duration-200 outline-none border border-[rgba(168,255,0,0.13)] focus:border-[#A8FF00] font-[500]"
                  >
                    <span className={data.preferred_language ? "text-white" : "text-[#53657A]"}>{data.preferred_language || "e.g. English"}</span>
                  </button>
                <FieldError error={step2Errors.preferred_language} />
              </div>

            </motion.div>
            </div> {/* End of inner content wrapper */}

            {/* Continue Button (Fixed bottom) */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }} className="fixed bottom-0 left-0 right-0 z-30 max-w-[480px] mx-auto pb-[max(env(safe-area-inset-bottom),24px)] pt-8 px-4 bg-gradient-to-t from-[#050905] via-[#050905]/90 to-transparent pointer-events-none">
               <div className="pointer-events-auto flex justify-center">
                 <button 
                   disabled={!isStep2Valid}
                   onClick={handleNext}
                   className={`w-full max-w-[calc(100%-16px)] sm:max-w-[calc(100%-32px)] h-[60px] rounded-full font-[800] text-[16px] transition-all duration-200 active:scale-[0.98] ${
                     isStep2Valid 
                       ? "bg-[#A8FF00] text-[#050505] shadow-[0_8px_30px_rgba(168,255,0,0.16)]" 
                       : "bg-[#1C2920] text-[#687A70] cursor-not-allowed"
                   }`}
                 >
                   Continue
                 </button>
               </div>
            </motion.div>

            {/* Gender Sheet */}
            <AnimatePresence>
              {showGenderSheet && (
                <motion.div key="gender-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGenderSheet(false)} className="fixed inset-0 bg-black/60 z-[60]" />
              )}
              {showGenderSheet && (
                <motion.div key="gender-sheet" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-[#0A130B] border-t border-[rgba(168,255,0,0.13)] rounded-t-[24px] z-[70] p-6 pb-[max(env(safe-area-inset-bottom),24px)]">
                  <h3 className="text-white font-[800] text-[20px] mb-6">Select Gender</h3>
                  <div className="space-y-3">
                    {["Male", "Female", "Other", "Prefer not to say"].map(g => (
                      <button key={g} onClick={() => { handleUpdate({ gender: g as any }); setShowGenderSheet(false); }} className={`w-full p-4 rounded-[14px] text-left font-[500] flex justify-between items-center transition-colors ${data.gender === g ? "bg-[rgba(168,255,0,0.1)] border border-[#A8FF00] text-[#A8FF00]" : "bg-[#050905] border border-transparent text-white"}`}>
                        <span>{g}</span>
                        {data.gender === g && <Check className="w-5 h-5 text-[#A8FF00]" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Language Sheet */}
            <AnimatePresence>
              {showLanguageSheet && (
                <motion.div key="lang-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLanguageSheet(false)} className="fixed inset-0 bg-black/60 z-[60]" />
              )}
              {showLanguageSheet && (
                <motion.div key="lang-sheet" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-[#0A130B] border-t border-[rgba(168,255,0,0.13)] rounded-t-[24px] z-[70] p-6 pb-[max(env(safe-area-inset-bottom),24px)] max-h-[70vh] overflow-y-auto">
                  <h3 className="text-white font-[800] text-[20px] mb-6">Preferred Language</h3>
                  <div className="space-y-3">
                    {["English", "Tamil", "Hindi", "Telugu", "Malayalam", "Kannada", "Spanish", "French", "German"].map(l => (
                      <button key={l} onClick={() => { handleUpdate({ preferred_language: l }); setShowLanguageSheet(false); }} className={`w-full p-4 rounded-[14px] text-left font-[500] flex justify-between items-center transition-colors ${data.preferred_language === l ? "bg-[rgba(168,255,0,0.1)] border border-[#A8FF00] text-[#A8FF00]" : "bg-[#050905] border border-transparent text-white"}`}>
                        <span>{l}</span>
                        {data.preferred_language === l && <Check className="w-5 h-5 text-[#A8FF00]" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        );
                  case 3:
        return (
          <div className="flex flex-col min-h-[100dvh] bg-[#050905]">
            
            {/* Background Image - Sticky to stay fixed while scrolling */}
            <div className="sticky top-0 h-[100dvh] w-full z-0 pointer-events-none overflow-hidden">
              <Image 
                src="/images/body-details-bg.png" 
                alt="Background" 
                fill 
                className="object-cover object-top opacity-100 -translate-y-[80px] scale-[1.1]" 
                priority
                unoptimized
              />
              {/* Simple gradient from solid black at bottom to transparent at top */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050905] via-[#050905]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050905]/30 to-transparent opacity-60" />
            </div>

            <div className="relative z-10 w-full flex flex-col px-6 pb-32 min-h-[100dvh] -mt-[100dvh]">
              
              {/* Top Navigation */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-[env(safe-area-inset-top)] h-16 flex items-center relative z-10 -mx-2">
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-full bg-[#121E12] border border-[#1E2E1D] hover:bg-[#1A2619] active:scale-95 transition-all text-gray-300"
                >
                  <ArrowLeft size={20} />
                </button>
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
              </motion.div>

              <div className="pt-2 pb-36">
                
                {/* Styled Header */}
                <div className="mb-8 mt-4">
                  <h2 style={{ fontFamily: "Oswald, sans-serif" }} className="text-[42px] leading-none font-bold italic uppercase tracking-tight flex gap-2">
                    <span className="text-[#ADFF00]">BODY</span>
                    <span className="text-white">DETAILS</span>
                  </h2>
                  <p className="text-gray-400 mt-2 text-sm font-medium">Let's understand your starting point.</p>
                </div>
                
                <div className="mb-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl p-4 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-[#ADFF00] shrink-0" />
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Why Honest Details Matter</h4>
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed font-medium">
                    Please enter your exact measurements honestly. We calculate an estimated body-fat range using an established formula based on your metrics.
                  </p>
                  <div className="pt-2 border-t border-white/10 text-[11px] text-gray-300 leading-relaxed flex items-start gap-1.5">
                    <span className="mt-[1px]">📸</span>
                    <span><b>Photos & Goal Physique:</b> Photos can be used for visual progress comparison and AI Goal Physique photo analysis.</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                        <Ruler size={16} className="text-[#ADFF00]" />
                        Height (cm)
                      </label>
                      <input 
                        type="number" 
                        value={data.height || ""} 
                        onChange={e => handleUpdate({ height: parseFloat(e.target.value) || undefined })}
                        className={`w-full p-4 rounded-xl border bg-white/5 backdrop-blur-md text-white transition-colors outline-none placeholder:text-gray-600 ${
                          step3Errors.height ? 'border-red-500/80 focus:border-red-500' : 'border-[#ADFF00]/30 focus:border-[#ADFF00]'
                        }`}
                        placeholder="173"
                      />
                      <FieldError error={step3Errors.height} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                        <Scale size={16} className="text-[#ADFF00]" />
                        Weight (kg)
                      </label>
                      <input 
                        type="number" 
                        value={data.weight || ""} 
                        onChange={e => handleUpdate({ weight: parseFloat(e.target.value) || undefined })}
                        className={`w-full p-4 rounded-xl border bg-white/5 backdrop-blur-md text-white transition-colors outline-none placeholder:text-gray-600 ${
                          step3Errors.weight ? 'border-red-500/80 focus:border-red-500' : 'border-[#ADFF00]/30 focus:border-[#ADFF00]'
                        }`}
                        placeholder="73"
                      />
                      <FieldError error={step3Errors.weight} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex flex-col gap-0.5 text-sm font-bold text-white mb-2">
                        <div className="flex items-center gap-2">
                          <WaistIcon size={16} className="text-[#ADFF00]" />
                          <span>Waist (cm) <span className="text-gray-500 font-normal text-xs ml-1">Optional</span></span>
                        </div>
                      </label>
                      <input 
                        type="number" 
                        value={data.waist_cm || ""} 
                        onChange={e => handleUpdate({ waist_cm: parseFloat(e.target.value) || undefined })}
                        className={`w-full p-4 rounded-xl border bg-white/5 backdrop-blur-md text-white transition-colors outline-none placeholder:text-gray-600 ${
                          step3Errors.waist_cm ? 'border-red-500/80 focus:border-red-500' : 'border-[#ADFF00]/30 focus:border-[#ADFF00]'
                        }`}
                        placeholder="80"
                      />
                      <FieldError error={step3Errors.waist_cm} />
                    </div>
                    <div>
                      <label className="flex flex-col gap-0.5 text-sm font-bold text-white mb-2">
                        <div className="flex items-center gap-2">
                          <ChestIcon size={16} className="text-[#ADFF00]" />
                          <span>Chest (cm) <span className="text-gray-500 font-normal text-xs ml-1">Optional</span></span>
                        </div>
                      </label>
                      <input 
                        type="number" 
                        value={data.chest_cm || ""} 
                        onChange={e => handleUpdate({ chest_cm: parseFloat(e.target.value) || undefined })}
                        className={`w-full p-4 rounded-xl border bg-white/5 backdrop-blur-md text-white transition-colors outline-none placeholder:text-gray-600 ${
                          step3Errors.chest_cm ? 'border-red-500/80 focus:border-red-500' : 'border-[#ADFF00]/30 focus:border-[#ADFF00]'
                        }`}
                        placeholder="95"
                      />
                      <FieldError error={step3Errors.chest_cm} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex flex-col gap-0.5 text-sm font-bold text-white mb-2">
                        <div className="flex items-center gap-2">
                          <BicepsFlexed size={16} className="text-[#ADFF00]" />
                          <span>Arm (cm) <span className="text-gray-500 font-normal text-xs ml-1">Optional</span></span>
                        </div>
                      </label>
                      <input 
                        type="number" 
                        value={data.arm_cm || ""} 
                        onChange={e => handleUpdate({ arm_cm: parseFloat(e.target.value) || undefined })}
                        className={`w-full p-4 rounded-xl border bg-white/5 backdrop-blur-md text-white transition-colors outline-none placeholder:text-gray-600 ${
                          step3Errors.arm_cm ? 'border-red-500/80 focus:border-red-500' : 'border-[#ADFF00]/30 focus:border-[#ADFF00]'
                        }`}
                        placeholder="35"
                      />
                      <FieldError error={step3Errors.arm_cm} />
                    </div>
                    <div>
                      <label className="flex flex-col gap-0.5 text-sm font-bold text-white mb-2">
                        <div className="flex items-center gap-2">
                          <ThighIcon size={16} className="text-[#ADFF00]" />
                          <span>Thigh (cm) <span className="text-gray-500 font-normal text-xs ml-1">Optional</span></span>
                        </div>
                      </label>
                      <input 
                        type="number" 
                        value={data.thigh_cm || ""} 
                        onChange={e => handleUpdate({ thigh_cm: parseFloat(e.target.value) || undefined })}
                        className={`w-full p-4 rounded-xl border bg-white/5 backdrop-blur-md text-white transition-colors outline-none placeholder:text-gray-600 ${
                          step3Errors.thigh_cm ? 'border-red-500/80 focus:border-red-500' : 'border-[#ADFF00]/30 focus:border-[#ADFF00]'
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
            </div>
          </div>
        );
        case 4:
          return (
            <div className="flex flex-col min-h-[100dvh] bg-[#050905]">
              {/* Background Image - Sticky to stay fixed while scrolling */}
              <div className="sticky top-0 h-[100dvh] w-full z-0 pointer-events-none overflow-hidden">
                <Image 
                  src="/images/goals-bg.png" 
                  alt="Background" 
                  fill 
                  className="object-cover object-top opacity-100 scale-[1.05]" 
                  priority
                  unoptimized
                />
                {/* Simple gradient from solid black at bottom to transparent at top */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050905] via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050905]/40 to-transparent" />
              </div>

              {/* Scrollable Content overlay */}
              <div className="relative z-10 w-full flex flex-col px-6 pb-32 min-h-[100dvh] -mt-[100dvh]">
                
                {/* Top Navigation */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-[env(safe-area-inset-top)] h-16 flex items-center relative z-10 -mx-2">
                  <button 
                    onClick={handleBack}
                    className="p-2 rounded-full bg-[#121E12] border border-[#1E2E1D] hover:bg-[#1A2619] active:scale-95 transition-all text-gray-300"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex-1 px-8 flex justify-center">
                    <div className="w-full bg-[#1A2619] h-2 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[#ADFF00]" 
                        initial={{ width: "0%" }} 
                        animate={{ width: `${((step - 1) / 14) * 100}%` }} 
                        transition={{ ease: "easeInOut" }} 
                      />
                    </div>
                  </div>
                  <div className="w-9" />
                </motion.div>

                <div className="mt-6">
                  <StepHeader title="What do you want to achieve?" />
                </div>
                <div className="space-y-3">
                {[
                  { id: "Lose Fat", img: "/images/goals/goal-1.png", desc: "Reduce body fat & get lean" },
                  { id: "Build Muscle", img: "/images/goals/goal-2.png", desc: "Build size & muscular definition" },
                  { id: "Gain Weight", img: "/images/goals/goal-3.png", desc: "Increase healthy body weight" },
                  { id: "Lose Fat + Build Muscle", img: "/images/goals/goal-4.png", desc: "Get lean while building muscle" },
                  { id: "Build Strength", img: "/images/goals/goal-5.png", desc: "Increase power & lifting performance" },
                  { id: "Improve Fitness", img: "/images/goals/goal-6.png", desc: "Improve endurance & overall fitness" },
                  { id: "Maintain", img: "/images/goals/goal-7.png", desc: "Stay strong & maintain your physique" }
                ].map((opt, i) => {
                  const isSelected = data.goal === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleUpdate({ goal: opt.id as any })}
                      className={`w-full flex items-center p-3 rounded-2xl border-[1.5px] text-left transition-all ${
                        isSelected ? "border-[#ADFF00] shadow-[0_0_20px_rgba(173,255,0,0.15)] bg-gradient-to-r from-[#ADFF00]/10 to-transparent" : "border-[#1A2619] bg-[#0A1108] hover:border-[#233522]"
                      }`}
                    >
                      <div className={`relative w-[60px] h-[60px] rounded-full overflow-hidden mr-4 border-2 ${isSelected ? "border-[#ADFF00]" : "border-[#1A2619]"}`}>
                        <Image src={opt.img} alt={opt.id} fill className="object-cover" unoptimized />
                        {!isSelected && <div className="absolute inset-0 bg-black/40" />}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`font-bold text-[17px] tracking-tight ${isSelected ? "text-white" : "text-gray-200"}`}>{opt.id}</h3>
                        <p className={`text-[13px] leading-snug mt-0.5 ${isSelected ? "text-gray-300" : "text-gray-500"}`}>{opt.desc}</p>
                      </div>
                      
                      <div className="ml-4 mr-2">
                        <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? "border-[#ADFF00]" : "border-gray-600"
                        }`}>
                          {isSelected && <div className="w-[10px] h-[10px] rounded-full bg-[#ADFF00]" />}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
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
                  placeholder="Custom days (e.g. 45)"
                />
                <FieldError error={step4Errors.target_deadline_days} />
              </div>
            </div>

            <BottomBar canProceed={isStep4Valid} onProceed={handleNext} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col min-h-[100dvh] bg-[#050905]">
            
            {/* Background Image - Sticky to stay fixed while scrolling */}
            <div className="sticky top-0 h-[100dvh] w-full z-0 pointer-events-none overflow-hidden">
              <Image 
                src="/images/wan2.7-image_b_make_thi_man_to_x_me.png" 
                alt="Background" 
                fill 
                className="object-cover object-top opacity-100 -translate-y-[110px] scale-[1.05]" 
                priority
                unoptimized
              />
              {/* Simple gradient from solid black at bottom to transparent at top */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050905] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050905] via-[#050905]/80 to-transparent w-[85%]" />
            </div>

            <div className="relative z-10 w-full flex flex-col px-6 pb-32 min-h-[100dvh] -mt-[100dvh]">
              
              {/* Top Navigation */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-[env(safe-area-inset-top)] h-16 flex items-center relative z-10 -mx-2">
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-full bg-[#121E12] border border-[#1E2E1D] hover:bg-[#1A2619] active:scale-95 transition-all text-gray-300"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1 px-8 flex justify-center">
                  <div className="w-full bg-[#1A2619] h-2 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[#ADFF00]" initial={{ width: "0%" }} animate={{ width: `${((step - 1) / (totalSteps - 2)) * 100}%` }} transition={{ ease: "easeInOut" }} />
                  </div>
                </div>
                <div className="w-9" />
              </motion.div>

              <div className="pt-6">
                <StepHeader title="What's your training experience?" />
                <div className="space-y-8">
                  <div className="pr-[32%]">
                    <label className="block text-sm font-semibold text-gray-300 mb-3">Experience Level</label>
                    <div className="space-y-4">
                      {[
                        { id: "Beginner", desc: "0-6 months" },
                        { id: "Intermediate", desc: "6 months-2 years" },
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
                            data.training_days_per_week === d ? 'bg-[#ADFF00] border-[#ADFF00] text-black shadow-[0_0_15px_rgba(173,255,0,0.3)]' : 'border-white/10 bg-black/40 text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-black/50 hover:text-white'
                          }`}
                        >
                          <span className="text-xl">{d}</span>
                          <span className="text-xs uppercase tracking-wider mt-1 opacity-70 font-semibold">days</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <BottomBar canProceed={!!data.fitness_level && !!data.training_days_per_week} onProceed={handleNext} />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col min-h-[100dvh] bg-[#050905]">
            {/* Background Image - Sticky to stay fixed while scrolling */}
            <div className="sticky top-0 h-[100dvh] w-full z-0 pointer-events-none overflow-hidden">
              <Image 
                src="/images/a_make_this_man_to_thi.png" 
                alt="Background" 
                fill 
                className="object-cover object-top opacity-100 -translate-y-[110px] scale-[1.05]" 
                priority
                unoptimized
              />
              {/* Simple gradient from solid black at bottom to transparent at top */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050905] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050905] via-[#050905]/80 to-transparent w-[85%]" />
            </div>

            <div className="relative z-10 w-full flex flex-col px-6 pb-32 min-h-[100dvh] -mt-[100dvh]">
              {/* Top Navigation */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-[env(safe-area-inset-top)] h-16 flex items-center relative z-10 -mx-2">
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-full bg-[#121E12] border border-[#1E2E1D] hover:bg-[#1A2619] active:scale-95 transition-all text-gray-300"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1 px-8 flex justify-center">
                  <div className="w-full bg-[#1A2619] h-2 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[#ADFF00]" initial={{ width: "0%" }} animate={{ width: `${((step - 1) / (totalSteps - 2)) * 100}%` }} transition={{ ease: "easeInOut" }} />
                  </div>
                </div>
                <div className="w-9" />
              </motion.div>

              <div className="pt-6">
                <StepHeader title="Workout Environment" subtitle="Where will you train?" />
                <div className="space-y-8 ">
              <div className="space-y-2 pr-[32%]">
                {[
                  { 
                    id: "Gym", 
                    emoji: "🏋️", 
                    desc: "Commercial Gym (Barbells, Dumbbells, Machines, Cables & Cardio)",
                    defaultEq: ["Full Commercial Gym", "Barbells", "Dumbbells", "Cable Machines", "Machines", "Squat Rack", "Bench", "Treadmill / Cardio"]
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
                        setTimeout(() => {
                          const el = document.getElementById("equipment-options");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 150);
                      }}
                      className={`w-full p-3 rounded-2xl border-2 text-left transition-all ${isSelected ? "border-[#ADFF00] bg-[#ADFF00]/10" : "border-[#1A2619] bg-[#0D150D] hover:border-[#233522]"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl ${isSelected ? "" : "opacity-70 grayscale"}`}>
                            {opt.emoji}
                          </div>
                          <div>
                            <h3 className={`font-extrabold text-base ${isSelected ? "text-[#ADFF00]" : "text-gray-100"}`}>{opt.id}</h3>
                            <p className={`text-xs mt-0.5 font-medium leading-relaxed ${isSelected ? "text-[#ADFF00]/80" : "text-gray-400"}`}>{opt.desc}</p>
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
                    id="equipment-options"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden bg-black/40 border border-white/10 backdrop-blur-sm p-4 rounded-2xl space-y-3"
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
                                  if (opt === "Full Commercial Gym") {
                                    newEq = [];
                                  }
                                } else {
                                  newEq.push(opt);
                                  if (opt === "Full Commercial Gym") {
                                    newEq = ["Full Commercial Gym", "Barbells", "Dumbbells", "Cable Machines", "Machines", "Squat Rack", "Bench", "Treadmill / Cardio"];
                                  }
                                }
                              }
                              if (newEq.length === 0 && opt !== "Full Commercial Gym") {
                                newEq = [opt];
                              }
                              handleUpdate({ equipment: Array.from(new Set(newEq)) });
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                              isSelected 
                                ? "bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]" 
                                : "bg-black/30 border-white/10 text-gray-400 backdrop-blur-sm hover:border-white/20 hover:text-gray-200"
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
            </div>
          </div>
        );

      case 7:
        return (
          <div className="flex flex-col min-h-[100dvh] bg-[#050905]">
            {/* Background Image - Sticky to stay fixed while scrolling */}
            <div className="sticky top-0 h-[100dvh] w-full z-0 pointer-events-none overflow-hidden">
              <Image 
                src="/images/training-schedule-bg.png" 
                alt="Background" 
                fill 
                className="object-cover object-top opacity-100 scale-[1.05] -translate-y-[100px]" 
                priority
                unoptimized
              />
              {/* Simple gradient from solid black at bottom to transparent at top */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050905] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050905] via-[#050905]/80 to-transparent w-[85%]" />
            </div>

            <div className="relative z-10 w-full flex flex-col px-6 pb-32 min-h-[100dvh] -mt-[100dvh]">
              {/* Top Navigation */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-[env(safe-area-inset-top)] h-16 flex items-center relative z-10 -mx-2">
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-full bg-[#121E12] border border-[#1E2E1D] hover:bg-[#1A2619] active:scale-95 transition-all text-gray-300"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1 px-8 flex justify-center">
                  <div className="w-full bg-[#1A2619] h-2 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[#ADFF00]" initial={{ width: "0%" }} animate={{ width: `${((step - 1) / (totalSteps - 2)) * 100}%` }} transition={{ ease: "easeInOut" }} />
                  </div>
                </div>
                <div className="w-9" />
              </motion.div>

              <div className="pt-6">
                <div className="mb-8 mt-2">
                  <h2 style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[42px] leading-[1.05] font-bold italic uppercase tracking-tight flex flex-col">
                    <span className="text-[#ADFF00]">TRAINING</span>
                    <span className="text-white">SCHEDULE</span>
                  </h2>
                  <p className="text-gray-400 mt-2 font-medium">How much time can you commit?</p>
                </div>
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Preferred Workout Duration</label>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 20, 30, 45, 60, 90].map(m => (
                    <button 
                      key={m}
                      onClick={() => handleUpdate({ workout_duration_minutes: m })}
                      className={`py-3 rounded-xl flex flex-col items-center justify-center transition-all border ${
                        data.workout_duration_minutes === m ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-white/10 bg-black/40 text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-black/50 hover:text-white'
                      }`}
                    >
                      <span className="font-bold text-xl">{m}</span>
                      <span className="text-xs uppercase tracking-wider font-semibold mt-0.5">min</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Preferred Time of Day</label>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {["Morning", "Afternoon", "Evening", "Night"].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleUpdate({ preferred_training_time: opt })}
                      className={`py-3 rounded-xl flex items-center justify-center font-bold transition-all border ${
                        data.preferred_training_time === opt ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-white/10 bg-black/40 text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-black/50 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{opt}</span>
                    </button>
                  ))}
                  <button 
                      onClick={() => handleUpdate({ preferred_training_time: "Anytime" })}
                      className={`col-span-2 py-3 rounded-xl flex items-center justify-center font-bold transition-all border ${
                        data.preferred_training_time === "Anytime" ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-white/10 bg-black/40 text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-black/50 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">Anytime</span>
                  </button>
                </div>

                <label className="block text-sm font-semibold text-gray-300 mb-1">Exact Auto-Reminder <span className="text-gray-500 font-normal">(Optional)</span></label>
                <p className="text-xs text-gray-500 mb-3">We'll remind you exactly at this time to crush your workout.</p>
                <div className="relative">
                  <input 
                    type="time"
                    value={data.workout_time || ""} 
                    onChange={e => handleUpdate({ workout_time: e.target.value })}
                    className="w-full p-4 rounded-xl border border-[#1A2619] bg-[#0D150D] text-white focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>
            </div>
          </div>
          <BottomBar 
            canProceed={!!(data.workout_duration_minutes && data.preferred_training_time)} 
            onProceed={handleNext} 
          />
        </div>
      </div>
    );
      case 8:
        return (
          <div className="flex flex-col min-h-[100dvh] bg-[#050905]">
            {/* Background Image - Sticky to stay fixed while scrolling */}
            <div className="sticky top-0 h-[100dvh] w-full z-0 pointer-events-none overflow-hidden">
              <Image 
                src="/images/food.png" 
                alt="Background" 
                fill 
                className="object-cover object-center opacity-100" 
                priority
                unoptimized
              />
              {/* Simple gradient from solid black at bottom to transparent at top */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050905] via-[#050905]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050905] via-[#050905]/60 to-transparent w-[70%]" />
            </div>

            <div className="relative z-10 w-full flex flex-col px-6 pb-32 min-h-[100dvh] -mt-[100dvh]">
              {/* Top Navigation */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-[env(safe-area-inset-top)] h-16 flex items-center relative z-10 -mx-2">
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-full bg-[#121E12] border border-[#1E2E1D] hover:bg-[#1A2619] active:scale-95 transition-all text-gray-300"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1 px-8 flex justify-center">
                  <div className="w-full bg-[#1A2619] h-2 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[#ADFF00]" initial={{ width: "0%" }} animate={{ width: `${((step - 1) / (totalSteps - 2)) * 100}%` }} transition={{ ease: "easeInOut" }} />
                  </div>
                </div>
                <div className="w-9" />
              </motion.div>

              <div className="pt-6">
                <div className="mb-8 mt-2">
                  <h2 style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[42px] leading-[1.05] font-bold italic uppercase tracking-tight flex flex-col">
                    <span className="text-[#ADFF00]">NUTRITION</span>
                    <span className="text-white">PROFILE</span>
                  </h2>
                  <p className="text-gray-400 mt-2 font-medium">Help us understand your eating habits.</p>
                </div>
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
                        data.meals_per_day === opt ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-white/10 bg-black/40 text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-black/50 hover:text-white'
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
                        data.food_environment === opt.id ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-white/10 bg-black/40 text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-black/50 hover:text-white'
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
        </div>
      </div>
    );

      case 9:
        return (
          <div className="flex flex-col min-h-[100dvh] bg-[#050905]">
            {/* Background Image - Sticky to stay fixed while scrolling */}
            <div className="sticky top-0 h-[100dvh] w-full z-0 pointer-events-none overflow-hidden">
              <Image 
                src="/images/food-budget-bg.png" 
                alt="Background" 
                fill 
                className="object-cover object-center opacity-100" 
                priority
                unoptimized
              />
              {/* Simple gradient from solid black at bottom to transparent at top */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050905] via-[#050905]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050905] via-[#050905]/60 to-transparent w-[70%]" />
            </div>

            <div className="relative z-10 w-full flex flex-col px-6 pb-32 min-h-[100dvh] -mt-[100dvh]">
              {/* Top Navigation */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-[env(safe-area-inset-top)] h-16 flex items-center relative z-10 -mx-2">
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-full bg-[#121E12] border border-[#1E2E1D] hover:bg-[#1A2619] active:scale-95 transition-all text-gray-300"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1 px-8 flex justify-center">
                  <div className="w-full bg-[#1A2619] h-2 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[#ADFF00]" initial={{ width: "0%" }} animate={{ width: `${((step - 1) / (totalSteps - 2)) * 100}%` }} transition={{ ease: "easeInOut" }} />
                  </div>
                </div>
                <div className="w-9" />
              </motion.div>

              <div className="pt-6">
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
                        data.nutrition_budget === opt ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-white/10 bg-black/40 text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-black/50 hover:text-white'
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
            </div>
            <BottomBar canProceed={!!data.nutrition_budget} onProceed={handleNext} />
          </div>
        </div>
    );

      case 10:
        return (
          <div className="flex flex-col min-h-[100dvh] bg-[#050905]">
            {/* Background Image - Sticky to stay fixed while scrolling */}
            <div className="sticky top-0 h-[100dvh] w-full z-0 pointer-events-none overflow-hidden">
              <Image 
                src="/images/lifestyle-bg.png" 
                alt="Background" 
                fill 
                className="object-cover object-center opacity-100" 
                priority
                unoptimized
              />
              {/* Simple gradient from solid black at bottom to transparent at top */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050905] via-[#050905]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050905] via-[#050905]/60 to-transparent w-[70%]" />
            </div>

            <div className="relative z-10 w-full flex flex-col px-6 pb-32 min-h-[100dvh] -mt-[100dvh]">
              {/* Top Navigation */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-[env(safe-area-inset-top)] h-16 flex items-center relative z-10 -mx-2">
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-full bg-[#121E12] border border-[#1E2E1D] hover:bg-[#1A2619] active:scale-95 transition-all text-gray-300"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1 px-8 flex justify-center">
                  <div className="w-full bg-[#1A2619] h-2 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[#ADFF00]" initial={{ width: "0%" }} animate={{ width: `${((step - 1) / (totalSteps - 2)) * 100}%` }} transition={{ ease: "easeInOut" }} />
                  </div>
                </div>
                <div className="w-9" />
              </motion.div>

              <div className="pt-6">
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
                        data.activity_level === opt ? 'bg-[#ADFF00] border-[#ADFF00] text-black shadow-[0_0_15px_rgba(173,255,0,0.3)]' : 'border-white/10 bg-black/40 text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-black/50 hover:text-white'
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
                        data.daily_steps === opt ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-white/10 bg-black/40 text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-black/50 hover:text-white'
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
                        data.sleep_duration === opt ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'border-white/10 bg-black/40 text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-black/50 hover:text-white'
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
            </div>
            <BottomBar canProceed={!!(data.activity_level && data.daily_steps && data.sleep_duration)} onProceed={handleNext} />
          </div>
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
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    "Back pain", "Neck pain", "Shoulder pain", "Knee pain", "Hip pain", 
                    "Ankle/foot pain", "Wrist pain", "Elbow pain", "Muscle/joint pain", 
                    "Mobility limitation", "None", "Other"
                  ].map(opt => {
                    const isSelected = opt === "Other" 
                      ? data.physical_problems?.some(p => p.startsWith("Other")) 
                      : data.physical_problems?.includes(opt) || false;
                      
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          let newProbs = [...(data.physical_problems || [])];
                          if (opt === "None") {
                            newProbs = ["None"];
                          } else {
                            newProbs = newProbs.filter(e => e !== "None");
                            if (opt === "Other") {
                              if (isSelected) {
                                newProbs = newProbs.filter(e => !e.startsWith("Other"));
                              } else {
                                newProbs.push("Other: ");
                              }
                            } else {
                              if (isSelected) {
                                newProbs = newProbs.filter(e => e !== opt);
                              } else {
                                newProbs.push(opt);
                              }
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
                
                <AnimatePresence>
                  {data.physical_problems?.some(p => p.startsWith("Other")) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <input 
                        type="text" 
                        value={data.physical_problems.find(p => p.startsWith("Other"))?.replace("Other: ", "") || ""}
                        onChange={e => {
                          const newProbs = (data.physical_problems || []).filter(p => !p.startsWith("Other"));
                          newProbs.push(`Other: ${e.target.value}`);
                          handleUpdate({ physical_problems: newProbs });
                        }}
                        placeholder="Please specify your physical problem..."
                        className="w-full p-4 rounded-xl border border-red-500/50 bg-red-950/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors outline-none placeholder:text-red-400/50" 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
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
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    "Squatting", "Running", "Jumping", "Bending", "Overhead movements", 
                    "Push-ups", "Pull-ups", "Lunges", "None", "Other"
                  ].map(opt => {
                    const isSelected = opt === "Other"
                      ? data.exercise_limitations?.some(p => p.startsWith("Other"))
                      : data.exercise_limitations?.includes(opt) || false;
                      
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          let newLims = [...(data.exercise_limitations || [])];
                          if (opt === "None") {
                            newLims = ["None"];
                          } else {
                            newLims = newLims.filter(e => e !== "None");
                            if (opt === "Other") {
                              if (isSelected) {
                                newLims = newLims.filter(e => !e.startsWith("Other"));
                              } else {
                                newLims.push("Other: ");
                              }
                            } else {
                              if (isSelected) {
                                newLims = newLims.filter(e => e !== opt);
                              } else {
                                newLims.push(opt);
                              }
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

                <AnimatePresence>
                  {data.exercise_limitations?.some(p => p.startsWith("Other")) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <input 
                        type="text" 
                        value={data.exercise_limitations.find(p => p.startsWith("Other"))?.replace("Other: ", "") || ""}
                        onChange={e => {
                          const newLims = (data.exercise_limitations || []).filter(p => !p.startsWith("Other"));
                          newLims.push(`Other: ${e.target.value}`);
                          handleUpdate({ exercise_limitations: newLims });
                        }}
                        placeholder="Please specify your limitation..."
                        className="w-full p-4 rounded-xl border border-yellow-500/50 bg-yellow-950/10 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors outline-none placeholder:text-yellow-400/50" 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
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
                (data.physical_problems.includes("None") || (
                  data.current_pain_severity !== undefined &&
                  data.current_pain_triggers !== undefined && data.current_pain_triggers.length > 0
                )) &&
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
              <h2 className="text-3xl font-black text-white tracking-tight mb-4">Assumption of Risk</h2>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                This app generates workouts using Artificial Intelligence. It is not a doctor, physical therapist, or medical professional. The AI cannot diagnose injuries or provide medical treatment.
              </p>
              {(data.current_pain_severity ?? 0) >= 7 ? (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl mb-8">
                  <p className="text-red-400 font-bold text-sm mb-2">⚠️ CRITICAL MEDICAL WARNING</p>
                  <p className="text-red-400/80 text-xs leading-relaxed">
                    You indicated that you have severe/debilitating pain. You must consult a doctor or physical therapist. The AI will strictly refuse to generate exercises for injured areas.
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                  If you have significant pain, a serious injury, or have been advised by a healthcare professional to restrict exercise, follow professional guidance before starting or changing your workout.
                </p>
              )}
              
              <button 
                onClick={() => handleUpdate({ safety_acknowledged: !data.safety_acknowledged })}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  data.safety_acknowledged ? "border-[#ADFF00] bg-[#ADFF00]/10" : "border-[#1A2619] bg-[#0D150D]"
                }`}
              >
                <div className={`w-6 h-6 rounded flex items-center justify-center border shrink-0 ${
                  data.safety_acknowledged ? "bg-[#ADFF00] border-[#ADFF00] text-black" : "border-gray-600"
                }`}>
                  {data.safety_acknowledged && <Check size={16} strokeWidth={3} />}
                </div>
                <span className={`font-semibold text-left text-sm ${data.safety_acknowledged ? "text-[#ADFF00]" : "text-gray-300"}`}>
                  I Accept All Risks & Release Liability
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
            <div className="mb-8 mt-2">
              <h2 style={{ fontFamily: 'Oswald, sans-serif' }} className="text-[38px] leading-[1.05] font-bold italic uppercase tracking-tight flex flex-col">
                <span className="text-[#ADFF00]">AI BODY SCAN</span>
                <span className="text-white">& GOAL PHYSIQUE</span>
              </h2>
              <p className="text-gray-400 mt-2 font-medium">Show your AI coach where you're starting and choose your dream physique.</p>
              
              <div className="mt-4 flex items-center gap-2 bg-[#121E12] px-3 py-2 rounded-lg border border-[#1E2E1D] inline-flex">
                <Info size={14} className="text-[#ADFF00] shrink-0" />
                <span className="text-xs font-semibold text-gray-300">Your photos are 100% private, encrypted & safe.</span>
              </div>
            </div>

            
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
                      <div className={`relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${(data as any)[item.field] ? 'border-[#ADFF00] bg-[#ADFF00]/10' : 'border-[#1A2619] bg-[#0D150D] hover:border-[#ADFF00]/50'}`}>
                        <input type="file" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressedBase64 = await compressImage(file);
                              handleUpdate({ [item.field]: compressedBase64 });
                            } catch (err) {
                              console.error("Compression failed", err);
                            }
                          }
                        }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        {(data as any)[item.field] ? (
                          <img src={(data as any)[item.field]} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <>
                        <div className="absolute inset-0 z-0 overflow-hidden rounded-xl">
                          <img 
                            src={(() => {
                              const isFemale = data.gender === 'Female';
                              const isMaleFat = !isFemale && data.goal && data.goal.includes('Fat');
                              const imgMap: Record<string, any> = {
                                body_scan_front: isFemale ? frontImgFemale : (isMaleFat ? frontImgMaleFat : frontImg),
                                body_scan_back: isFemale ? backImgFemale : (isMaleFat ? backImgMaleFat : backImg),
                                body_scan_left: isFemale ? leftImgFemale : (isMaleFat ? leftImgMaleFat : leftImg),
                                body_scan_right: isFemale ? rightImgFemale : (isMaleFat ? rightImgMaleFat : rightImg),
                              };
                              const img = imgMap[item.field];
                              return typeof img === 'string' ? img : (img as any).src;
                            })()}
                            alt={`${item.label} Reference`}
                            className="w-full h-full object-cover object-top opacity-60 transition-opacity hover:opacity-100"
                          />
                        </div>
                        <div className="absolute bottom-4 z-10 flex flex-col items-center justify-center px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/20 shadow-xl transition-all hover:bg-white/10">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-[#ADFF00] rounded-full flex items-center justify-center text-black shadow-[0_0_10px_rgba(173,255,0,0.4)]">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[11px] font-black text-white uppercase tracking-wider">+ Upload</span>
                          </div>
                        </div>
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
                  <div className={`relative w-full sm:w-2/3 md:w-1/2 mx-auto aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${data.body_scan_inspiration || data.goal_physique_image ? 'border-[#ADFF00] bg-[#ADFF00]/10' : 'border-[#1A2619] bg-[#0D150D] hover:border-[#ADFF00]/50'}`}>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressedBase64 = await compressImage(file);
                          handleUpdate({ body_scan_inspiration: compressedBase64, goal_physique_image: compressedBase64, target_physique: undefined });
                        } catch (err) {
                          console.error("Compression failed", err);
                        }
                      }
                    }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {data.body_scan_inspiration || data.goal_physique_image ? (
                      <>
                        <img src={data.body_scan_inspiration || data.goal_physique_image} className="w-full h-full object-cover" />
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdate({ body_scan_inspiration: undefined, goal_physique_image: undefined }); }}
                          className="absolute top-2 right-2 z-20 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors"
                        >
                          <Trash2 size={14} className="text-white" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 z-0 overflow-hidden">
                          <img 
                            src={typeof goalImg === 'string' ? goalImg : (goalImg as any).src}
                            alt="Goal Reference"
                            className="w-full h-full object-cover object-top opacity-60 transition-opacity hover:opacity-100"
                          />
                        </div>
                        <div className="absolute bottom-4 z-10 flex flex-col items-center justify-center px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/20 shadow-xl transition-all hover:bg-white/10">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-[#ADFF00] rounded-full flex items-center justify-center text-black shadow-[0_0_10px_rgba(173,255,0,0.4)]">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[11px] font-black text-white uppercase tracking-wider">+ Upload Goal</span>
                          </div>
                        </div>
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
                      { id: "Lean Athletic", image: "/images/physiques/physique_lean_athletic.png", tag: "Low Fat & Toned", desc: "Low body fat, defined core & lean athletic conditioning" },
                      { id: "Muscular", image: "/images/physiques/physique_muscular.png", tag: "High Muscle Mass", desc: "Solid muscle mass, broad chest, biceps & powerful build" },
                      { id: "Six Pack", image: "/images/physiques/physique_six_pack.png", tag: "Shredded Core", desc: "Defined 6-pack abs, tight waist & sculpted upper body" },
                      { id: "Men's Physique", image: "/images/physiques/physique_mens_physique.png", tag: "Aesthetic V-Taper", desc: "Classic V-taper, wide lats & aesthetic proportions" },
                      { id: "Bodybuilder", image: "/images/physiques/physique_bodybuilder.png", tag: "Maximum Mass", desc: "Maximum muscle volume, thickness & hyper-density" },
                      { id: "Sporty", image: "/images/physiques/physique_sporty.png", tag: "Agile & Active", desc: "Functional, energetic, fit & overall athletic endurance" },
                      { id: "Strong & Functional", image: "/images/physiques/physique_strong.png", tag: "Power & Strength", desc: "Thick core, heavy lifting build & functional strength" }

                    ].map(opt => {
                      const isSelected = data.target_physique === opt.id;
                      return (
                        <motion.button
                          key={opt.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleUpdate({ target_physique: opt.id as any, body_scan_inspiration: undefined, goal_physique_image: undefined })}
                          className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                            isSelected 
                              ? "border-[#ADFF00] bg-[#ADFF00]/10 shadow-[0_0_20px_rgba(173,255,0,0.15)]" 
                              : "border-[#1A2619] bg-[#0D150D] hover:border-[#233522]"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 ${
                              isSelected ? "border-[#ADFF00]" : "border-[#1A2619]"
                            }`}>
                              <Image src={opt.image} alt={opt.id} fill className="object-cover" unoptimized />
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
        return <AIAnalysisScreen onComplete={handleComplete} data={data} sessionId={sessionId} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#0A1108] selection:bg-[#ADFF00] selection:text-black">
      <div className="max-w-[480px] mx-auto min-h-[100dvh] flex flex-col relative overflow-hidden bg-[#0A1108] shadow-2xl shadow-black/50 border-x border-[#121E12]">
        {/* Top Nav (Progress & Back) */}
        <div className={step === 1 || step === 2 || step === 3 || step === 4 || step === 5 || step === 6 || step === 7 || step === 8 || step === 9 || step === 10 ? "hidden" : "h-16 flex items-center px-4 relative z-10"}>
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
          <AnimatePresence mode="wait" initial={true} custom={direction}>
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


let lastSubmissionSessionId: string | null = null;
let lastSubmissionPromise: Promise<any> | null = null;

const AIAnalysisScreen = ({ onComplete, data, sessionId }: { onComplete: () => void, data: any, sessionId?: string }) => {
  const [phase, setPhase] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2000);
    const t2 = setTimeout(() => setPhase(2), 3500);
    const t3 = setTimeout(() => setPhase(3), 5500);
    const t4 = setTimeout(() => setPhase(4), 7500);

    let isMounted = true;

    // Use sessionId for deduping if provided, otherwise fallback to always fetching
    // Strict Mode / re-mounts with the same sessionId will reuse the promise.
    if (sessionId && lastSubmissionSessionId === sessionId && lastSubmissionPromise) {
      // Reuse existing promise
    } else {
      if (sessionId) {
        lastSubmissionSessionId = sessionId;
      }
      lastSubmissionPromise = fetch('/api/fitness/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json());
    }

    lastSubmissionPromise
    .then(res => {
      if (isMounted) {
        if (res.success) {
          setIsDone(true);
        } else {
          lastSubmissionSessionId = null;
          lastSubmissionPromise = null;
          setError(res.error || "Analysis failed");
        }
      }
    })
    .catch(err => {
      if (isMounted) {
        lastSubmissionSessionId = null;
        lastSubmissionPromise = null;
        setError(err.message);
      }
    });

    return () => { 
      isMounted = false;
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); 
    };
  }, [data]);

  const handleCompleteClick = () => {
    setIsNavigating(true);
    onComplete();
  };

  return (
    <div className="flex flex-col min-h-[100dvh] justify-center px-6 relative overflow-hidden bg-[#0A1108]">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[300px] h-[300px] bg-[#ADFF00] rounded-full blur-[100px] animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm mx-auto py-8 text-center"
      >
        <div className="flex justify-center mb-10 h-16">
          {phase < 4 ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-16 h-16 border-4 border-[#1A2619] border-t-[#ADFF00] rounded-full"
            />
          ) : (
            <motion.div
              initial={{ scale: 0.65, opacity: 0 }}
              animate={{ scale: [0.65, 1.1, 1], opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-16 h-16 bg-[#ADFF00] rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(173,255,0,0.5)]"
            >
              <Check size={32} strokeWidth={3} />
            </motion.div>
          )}
        </div>

        <div className="space-y-7 min-h-[280px] w-full max-w-[310px] mx-auto text-left">
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
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <button 
                  onClick={handleCompleteClick} 
                  disabled={(!isDone && !error) || isNavigating}
                  className={`w-full py-4 rounded-full font-extrabold text-lg transition-all flex items-center justify-center ${error ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-[#ADFF00] text-black shadow-[0_0_30px_rgba(173,255,0,0.35)] hover:bg-[#c4ff33]'} disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {error ? (
                    "Open Report to Try Again"
                  ) : !isDone ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin w-5 h-5" />
                      <span>Finalizing Strategy...</span>
                    </div>
                  ) : isNavigating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin w-5 h-5" />
                      <span>Loading Plan...</span>
                    </div>
                  ) : (
                    "View Transformation Plan"
                  )}
                </button>
                {error && (
                  <p className="mt-3 text-center text-sm leading-relaxed text-red-300">
                    {error}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};


const AnalysisBlock = ({ title, items, isActive, isComplete }: { title: string, items: string[], isActive: boolean, isComplete: boolean }) => {
  if (!isActive) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full space-y-3 text-left"
    >
      <h3 className={`font-black text-sm transition-colors duration-500 ${isComplete ? 'text-gray-400' : 'text-white'}`}>{title}</h3>
      <div className="space-y-2 flex flex-col items-stretch">
        {items.map((item, i) => (
          <motion.div 
            key={item} 
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.11, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex items-center gap-3"
          >
            <motion.div
              animate={{ scale: isComplete ? [0.8, 1.12, 1] : 1 }}
              transition={{ delay: i * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`w-5 h-5 rounded-full flex flex-shrink-0 items-center justify-center border-2 transition-colors duration-500 ${
              isComplete ? 'border-[#ADFF00] bg-[#ADFF00]/10 text-[#ADFF00]' : 'border-gray-600 bg-transparent text-transparent'
            }`}
            >
              <Check size={12} strokeWidth={3} className={isComplete ? "opacity-100" : "opacity-0"} />
            </motion.div>
            <span className={`text-sm font-semibold transition-colors duration-500 ${isComplete ? 'text-gray-300' : 'text-gray-500'}`}>{item}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
const WaistIcon = ({ className, size = 16 }: { className?: string, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="10" height="10" rx="3" />
    <circle cx="7" cy="12" r="2" />
    <path d="M12 9h10v6h-10" />
    <path d="M15 9v2" />
    <path d="M18 9v2" />
  </svg>
);

const ChestIcon = ({ className, size = 16 }: { className?: string, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 4h10" />
    <path d="M7 4c-3 0-5 2-5 5v2c1 1 2 2 4 2" />
    <path d="M17 4c3 0 5 2 5 5v2c-1 1-2 2-4 2" />
    <path d="M6 13c1 3 2 8 2 8h8c0 0 1-5 2-8" />
    <path d="M8 9c2 2 6 2 8 0" />
  </svg>
);

const ThighIcon = ({ className, size = 16 }: { className?: string, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 2c-2 2-3 5-3 9 0 2 1 4 1 4" />
    <path d="M8 15c0 2-1 4-1 6h4" />
    <path d="M11 21l2-4c1-2 2-4 2-5" />
    <path d="M15 12c0-3-1-7-1-10" />
  </svg>
);


