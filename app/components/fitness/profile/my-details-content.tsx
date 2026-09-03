"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/services/supabase/client";
import { updateFitnessProfilePartialAction } from "@/app/actions/fitness";
import { 
  ArrowLeft, 
  User, 
  Sparkles, 
  Crown, 
  Zap, 
  Target, 
  Dumbbell, 
  Utensils, 
  Flame, 
  Activity, 
  Scale, 
  Ruler, 
  Globe, 
  LogOut, 
  ChevronRight, 
  RefreshCw, 
  CreditCard, 
  ShieldCheck, 
  X,
  Check,
  Edit3,
  Clock,
  Bell,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface ProfileContentProps {
  user: {
    id: string;
    email?: string;
    created_at?: string;
  };
  fitnessProfile: any;
  mainProfile: any;
  activePlan: any;
  aiLimitInfo: {
    allowed: boolean;
    limit: number;
    used: number;
    remaining: number;
  };
}

export function MyDetailsContent({
  user,
  fitnessProfile: initialFitnessProfile,
  mainProfile,
  activePlan,
  aiLimitInfo
}: ProfileContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [fitnessProfile, setFitnessProfile] = useState(initialFitnessProfile);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit Modal Form State
  const [formData, setFormData] = useState({
    weight: initialFitnessProfile?.weight || "",
    target_weight: initialFitnessProfile?.target_weight || "",
    height: initialFitnessProfile?.height || "",
    fitness_level: initialFitnessProfile?.fitness_level || "Intermediate",
    training_days_per_week: initialFitnessProfile?.training_days_per_week || 4,
    goal: initialFitnessProfile?.goal || "Lose Fat + Build Muscle",
    waist_cm: initialFitnessProfile?.waist_cm || "",
    chest_cm: initialFitnessProfile?.chest_cm || "",
    arm_cm: initialFitnessProfile?.arm_cm || "",
    thigh_cm: initialFitnessProfile?.thigh_cm || ""
  });

  const name = fitnessProfile?.name || mainProfile?.display_name || mainProfile?.name || user.email?.split("@")[0] || "Athlete";
  const email = user.email || "";
  const joinedDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recent Member";

  const isPremium = Boolean(fitnessProfile?.fitness_is_premium);
  const premiumLevel = fitnessProfile?.fitness_premium_level || (isPremium ? "core" : "free");
  const isPro = premiumLevel === "pro";

  // Calculate BMI
  const heightM = fitnessProfile?.height ? fitnessProfile.height / 100 : null;
  const weight = fitnessProfile?.weight || null;
  const bmi = (heightM && weight) ? (weight / (heightM * heightM)).toFixed(1) : null;

  const getBmiCategory = (bmiVal: number) => {
    if (bmiVal < 18.5) return { text: "Underweight", color: "text-yellow-400" };
    if (bmiVal < 25) return { text: "Optimal", color: "text-[#ADFF00]" };
    if (bmiVal < 30) return { text: "Overweight", color: "text-orange-400" };
    return { text: "High", color: "text-red-400" };
  };

  const bmiStatus = bmi ? getBmiCategory(parseFloat(bmi)) : null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/auth/signin?redirect=/");
      router.refresh();
    } catch (err) {
      toast.error("Failed to sign out");
      setIsSigningOut(false);
    }
  };

  const handleSavePhysicals = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      weight: formData.weight ? parseFloat(String(formData.weight)) : null,
      target_weight: formData.target_weight ? parseFloat(String(formData.target_weight)) : null,
      height: formData.height ? parseFloat(String(formData.height)) : null,
      fitness_level: formData.fitness_level,
      training_days_per_week: formData.training_days_per_week ? parseInt(String(formData.training_days_per_week)) : null,
      goal: formData.goal,
      waist_cm: formData.waist_cm ? parseFloat(String(formData.waist_cm)) : null,
      chest_cm: formData.chest_cm ? parseFloat(String(formData.chest_cm)) : null,
      arm_cm: formData.arm_cm ? parseFloat(String(formData.arm_cm)) : null,
      thigh_cm: formData.thigh_cm ? parseFloat(String(formData.thigh_cm)) : null,
    };

    const res = await updateFitnessProfilePartialAction(payload);
    setIsSaving(false);

    if (res.success) {
      toast.success("Details updated!");
      setFitnessProfile((prev: any) => ({ ...prev, ...payload }));
      setShowEditModal(false);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update profile details");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1108] text-white pb-32">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-72 bg-[radial-gradient(ellipse_at_top,#1A2619_0%,transparent_70%)] pointer-events-none opacity-70 z-0" />

      <div className="relative z-10 max-w-md mx-auto px-5 pt-6 space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link 
            href="/profile" 
            className="w-10 h-10 rounded-full bg-[#121E12] border border-[#1A2619] flex items-center justify-center text-gray-300 hover:text-white hover:border-[#ADFF00]/50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121E12] border border-[#1A2619]">
            <User className="w-4 h-4 text-[#ADFF00]" />
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">My Details</span>
          </div>
          <div className="w-10 h-10" />
        </div>

        {/* Physical Body Metrics Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#ADFF00]" />
              <span>Physical Baseline</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Weight Card */}
            <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Weight</span>
                <Scale className="w-4 h-4 text-[#ADFF00]" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{weight ? `${weight} kg` : "--"}</div>
                {fitnessProfile?.target_weight && (
                  <p className="text-[11px] text-[#ADFF00] font-semibold mt-0.5">
                    Target: {fitnessProfile.target_weight} kg
                  </p>
                )}
              </div>
            </div>

            {/* Height Card */}
            <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Height & BMI</span>
                <Ruler className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">
                  {fitnessProfile?.height ? `${fitnessProfile.height} cm` : "--"}
                </div>
                {bmi && bmiStatus && (
                  <p className={`text-[11px] font-semibold mt-0.5 ${bmiStatus.color}`}>
                    BMI {bmi} ({bmiStatus.text})
                  </p>
                )}
              </div>
            </div>

            {/* Measurements Grid */}
            <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl flex flex-col justify-between col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#ADFF00]" />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Body Measurements</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-[#0A1108] p-2 rounded-xl border border-[#1A2619] text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Waist</p>
                  <p className="text-sm font-black text-white">{fitnessProfile?.waist_cm ? `${fitnessProfile.waist_cm}cm` : "-"}</p>
                </div>
                <div className="bg-[#0A1108] p-2 rounded-xl border border-[#1A2619] text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Chest</p>
                  <p className="text-sm font-black text-white">{fitnessProfile?.chest_cm ? `${fitnessProfile.chest_cm}cm` : "-"}</p>
                </div>
                <div className="bg-[#0A1108] p-2 rounded-xl border border-[#1A2619] text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Arms</p>
                  <p className="text-sm font-black text-white">{fitnessProfile?.arm_cm ? `${fitnessProfile.arm_cm}cm` : "-"}</p>
                </div>
                <div className="bg-[#0A1108] p-2 rounded-xl border border-[#1A2619] text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Thighs</p>
                  <p className="text-sm font-black text-white">{fitnessProfile?.thigh_cm ? `${fitnessProfile.thigh_cm}cm` : "-"}</p>
                </div>
              </div>
            </div>

            {/* Activity Level Card */}
            <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl flex flex-col justify-between col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#ADFF00]" />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Training Routine</span>
                </div>
                <span className="text-xs font-bold text-[#ADFF00] bg-[#ADFF00]/10 px-2.5 py-0.5 rounded-full border border-[#ADFF00]/20">
                  {fitnessProfile?.fitness_level || "Standard"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-sm font-extrabold text-white">
                    {fitnessProfile?.training_location || "Gym"} Training
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {fitnessProfile?.training_days_per_week || 4} Days / week • {fitnessProfile?.workout_duration_minutes || 45} mins per session
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Strategy & Targets Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#ADFF00]" />
            <span>AI Strategy & Targets</span>
          </h2>

          <div className="bg-[#121E12] border border-[#1A2619] p-5 rounded-3xl space-y-4">
            {/* Primary Goal */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1A2619]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1A2619] flex items-center justify-center text-[#ADFF00]">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Primary Goal</p>
                  <p className="text-sm font-extrabold text-white">{fitnessProfile?.goal || "Fat Loss & Muscle Building"}</p>
                </div>
              </div>
              {fitnessProfile?.target_physique && (
                <span className="text-xs font-bold text-[#ADFF00] bg-[#ADFF00]/10 px-3 py-1 rounded-full border border-[#ADFF00]/30">
                  {fitnessProfile.target_physique}
                </span>
              )}
            </div>
            
            {fitnessProfile?.target_deadline_days && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Target Deadline: <strong className="text-white">{fitnessProfile.target_deadline_days} days</strong></span>
              </div>
            )}

            {/* Nutrition Specs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#0A1108] p-3 rounded-2xl border border-[#1A2619]">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Utensils className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-bold uppercase tracking-wider text-[10px]">Diet Profile</span>
                </div>
                <p className="text-xs font-bold text-gray-200">{fitnessProfile?.food_type || "Balanced Non-Veg"}</p>
                <p className="text-[11px] text-gray-500 font-medium">{fitnessProfile?.meals_per_day || "3 meals"}/day</p>
              </div>

              <div className="bg-[#0A1108] p-3 rounded-2xl border border-[#1A2619]">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold uppercase tracking-wider text-[10px]">Active Plan</span>
                </div>
                <p className="text-xs font-bold text-gray-200 truncate">{activePlan?.name || "AI Personal Protocol"}</p>
                <p className="text-[11px] text-[#ADFF00] font-medium">Status: Active</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Lifestyle & Nutrition Options */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#ADFF00]" />
            <span>Lifestyle & Nutrition Details</span>
          </h2>

          <div className="bg-[#121E12] border border-[#1A2619] p-5 rounded-3xl space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#1A2619]">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Food Environment</span>
              <span className="text-xs font-extrabold text-white">{fitnessProfile?.food_environment || "Not specified"}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#1A2619]">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Nutrition Budget</span>
              <span className="text-xs font-extrabold text-white">{fitnessProfile?.nutrition_budget || "Not specified"}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#1A2619]">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Activity Level</span>
              <span className="text-xs font-extrabold text-white">{fitnessProfile?.activity_level || "Not specified"}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#1A2619]">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Allergies</span>
              <span className="text-xs font-bold text-red-400 truncate max-w-[150px] text-right">{fitnessProfile?.food_allergies || "None"}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#1A2619]">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Foods Disliked</span>
              <span className="text-xs font-medium text-gray-300 truncate max-w-[150px] text-right">{fitnessProfile?.foods_disliked || "None"}</span>
            </div>
            {fitnessProfile?.daily_steps && (
              <div className="flex justify-between items-center pb-2 border-b border-[#1A2619]">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Daily Steps</span>
                <span className="text-xs font-extrabold text-white">{fitnessProfile.daily_steps}</span>
              </div>
            )}
            {fitnessProfile?.wake_time && fitnessProfile?.sleep_time && (
              <div className="flex justify-between items-center pb-2 border-b border-[#1A2619]">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Daily Schedule</span>
                <span className="text-xs font-medium text-gray-300 text-right">Wake: {fitnessProfile.wake_time} | Sleep: {fitnessProfile.sleep_time}</span>
              </div>
            )}
            {fitnessProfile?.work_time && (
              <div className="flex justify-between items-center pb-2 border-b border-[#1A2619]">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Work Hours</span>
                <span className="text-xs font-medium text-gray-300 text-right">{fitnessProfile.work_time}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Sleep Duration</span>
              <span className="text-xs font-extrabold text-white">{fitnessProfile?.sleep_duration || "Not specified"}</span>
            </div>
          </div>
        </motion.div>

        {/* Physical Limitations & Medical */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400" />
            <span>Physical & Medical Profile</span>
          </h2>

          <div className="bg-[#121E12] border border-[#1A2619] p-5 rounded-3xl space-y-3">
            <div className="flex flex-col gap-1 pb-2 border-b border-[#1A2619]">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Physical Problems</span>
              <span className="text-xs font-medium text-white">{fitnessProfile?.physical_problems?.length > 0 ? fitnessProfile.physical_problems.join(", ") : "None reported"}</span>
            </div>
            <div className="flex flex-col gap-1 pb-2 border-b border-[#1A2619]">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Exercise Limitations</span>
              <span className="text-xs font-medium text-white">{fitnessProfile?.exercise_limitations?.length > 0 ? fitnessProfile.exercise_limitations.join(", ") : "None"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Previous Injuries</span>
              <span className="text-xs font-medium text-white">{fitnessProfile?.previous_injuries || "None"}</span>
            </div>
          </div>
        </motion.div>

        {/* Equipment & Schedule */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.29 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-cyan-400" />
            <span>Equipment & Schedule</span>
          </h2>

          <div className="bg-[#121E12] border border-[#1A2619] p-5 rounded-3xl space-y-3">
            <div className="flex flex-col gap-1 pb-2 border-b border-[#1A2619]">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Available Equipment</span>
              <span className="text-xs font-medium text-white">{fitnessProfile?.equipment?.length > 0 ? fitnessProfile.equipment.join(", ") : "Not specified"}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#1A2619]">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Preferred Days</span>
              <span className="text-xs font-extrabold text-white text-right max-w-[200px] truncate">{fitnessProfile?.preferred_training_days || "Not specified"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Preferred Time</span>
              <span className="text-xs font-extrabold text-white">{fitnessProfile?.preferred_training_time || fitnessProfile?.workout_time || "Not specified"}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Details Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#121E12] border border-[#1A2619] rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1A2619]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 flex items-center justify-center text-[#ADFF00]">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-black text-white tracking-tight">Edit Physical Baseline</h2>
                </div>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="w-8 h-8 rounded-full bg-[#1A2619] flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSavePhysicals} className="space-y-4">
                
                {/* Weight & Target Weight */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Current Weight (kg)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      className="w-full p-3 rounded-xl bg-[#0A1108] border border-[#1A2619] text-white focus:border-[#ADFF00] outline-none text-sm font-bold"
                      placeholder="e.g. 70"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Target Weight (kg)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={formData.target_weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_weight: e.target.value }))}
                      className="w-full p-3 rounded-xl bg-[#0A1108] border border-[#1A2619] text-white focus:border-[#ADFF00] outline-none text-sm font-bold"
                      placeholder="e.g. 65"
                    />
                  </div>
                </div>

                {/* Height & Training Days */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Height (cm)</label>
                    <input 
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                      className="w-full p-3 rounded-xl bg-[#0A1108] border border-[#1A2619] text-white focus:border-[#ADFF00] outline-none text-sm font-bold"
                      placeholder="e.g. 175"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Training Days / Wk</label>
                    <select
                      value={formData.training_days_per_week}
                      onChange={(e) => setFormData(prev => ({ ...prev, training_days_per_week: parseInt(e.target.value) }))}
                      className="w-full p-3 rounded-xl bg-[#0A1108] border border-[#1A2619] text-white focus:border-[#ADFF00] outline-none text-sm font-bold appearance-none"
                    >
                      {[3, 4, 5, 6, 7].map(d => (
                        <option key={d} value={d} className="bg-[#0A1108] text-white">{d} Days / week</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Primary Goal */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Primary Goal</label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-[#0A1108] border border-[#1A2619] text-white focus:border-[#ADFF00] outline-none text-sm font-bold appearance-none"
                  >
                    <option value="Lose Fat" className="bg-[#0A1108] text-white">Lose Fat</option>
                    <option value="Cut" className="bg-[#0A1108] text-white">Cut</option>
                    <option value="Build Muscle" className="bg-[#0A1108] text-white">Build Muscle</option>
                    <option value="Gain Weight" className="bg-[#0A1108] text-white">Gain Weight</option>
                    <option value="Lose Fat + Build Muscle" className="bg-[#0A1108] text-white">Lose Fat + Build Muscle</option>
                    <option value="Build Strength" className="bg-[#0A1108] text-white">Build Strength</option>
                    <option value="Maintain" className="bg-[#0A1108] text-white">Maintain</option>
                  </select>
                </div>

                {/* Fitness Level */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Fitness Level</label>
                  <select
                    value={formData.fitness_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, fitness_level: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-[#0A1108] border border-[#1A2619] text-white focus:border-[#ADFF00] outline-none text-sm font-bold appearance-none"
                  >
                    <option value="Beginner" className="bg-[#0A1108] text-white">Beginner</option>
                    <option value="Intermediate" className="bg-[#0A1108] text-white">Intermediate</option>
                    <option value="Advanced" className="bg-[#0A1108] text-white">Advanced</option>
                  </select>
                </div>

                {/* Optional Body Measurements */}
                <div className="pt-2 border-t border-[#1A2619]">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Optional Measurements (cm)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold block mb-1">Waist</span>
                      <input 
                        type="number"
                        value={formData.waist_cm}
                        onChange={(e) => setFormData(prev => ({ ...prev, waist_cm: e.target.value }))}
                        className="w-full p-2.5 rounded-xl bg-[#0A1108] border border-[#1A2619] text-white text-xs font-bold"
                        placeholder="80"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold block mb-1">Chest</span>
                      <input 
                        type="number"
                        value={formData.chest_cm}
                        onChange={(e) => setFormData(prev => ({ ...prev, chest_cm: e.target.value }))}
                        className="w-full p-2.5 rounded-xl bg-[#0A1108] border border-[#1A2619] text-white text-xs font-bold"
                        placeholder="95"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-4 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3.5 bg-[#ADFF00] text-black font-extrabold text-sm rounded-xl shadow-[0_0_20px_rgba(173,255,0,0.3)] hover:bg-[#b8ff1a] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>

                  <Link
                    href="/onboarding?mode=edit"
                    className="w-full py-3 bg-[#1A2619] text-gray-300 hover:text-white font-bold text-xs rounded-xl transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Full AI Onboarding Flow</span>
                  </Link>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}




