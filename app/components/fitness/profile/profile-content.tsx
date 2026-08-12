"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/services/supabase/client";
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
  Heart,
  CheckCircle2
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

export function ProfileContent({
  user,
  fitnessProfile,
  mainProfile,
  activePlan,
  aiLimitInfo
}: ProfileContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const name = fitnessProfile?.name || mainProfile?.name || user.email?.split("@")[0] || "Athlete";
  const email = user.email || "";
  const joinedDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recent Member";

  const isPremium = Boolean(mainProfile?.is_premium);
  const premiumLevel = mainProfile?.premium_level || (isPremium ? "core" : "free");
  const isPro = premiumLevel === "pro";

  // Calculate BMI if height and weight exist
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
      router.push("/auth/signin");
      router.refresh();
    } catch (err) {
      toast.error("Failed to sign out");
      setIsSigningOut(false);
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
            href="/fitness" 
            className="w-10 h-10 rounded-full bg-[#121E12] border border-[#1A2619] flex items-center justify-center text-gray-300 hover:text-white hover:border-[#ADFF00]/50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121E12] border border-[#1A2619]">
            <User className="w-4 h-4 text-[#ADFF00]" />
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">Profile & Account</span>
          </div>
          <Link 
            href="/fitness/onboarding" 
            className="w-10 h-10 rounded-full bg-[#121E12] border border-[#1A2619] flex items-center justify-center text-gray-300 hover:text-[#ADFF00] hover:border-[#ADFF00]/50 transition-all active:scale-95"
            title="Retake Onboarding"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </Link>
        </div>

        {/* User Hero Avatar Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-[#121E12] border border-[#1A2619] rounded-3xl p-6 shadow-xl overflow-hidden"
        >
          {/* Subtle card glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#ADFF00]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center relative z-10">
            {/* Avatar Circle with Neon Ring */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1A2619] via-[#0A1108] to-[#121E12] border-2 border-[#ADFF00] p-1 flex items-center justify-center shadow-[0_0_20px_rgba(173,255,0,0.25)]">
                <div className="w-full h-full rounded-full bg-[#121E12] flex items-center justify-center text-3xl font-black text-[#ADFF00] tracking-wider uppercase">
                  {name.charAt(0)}
                </div>
              </div>
              <div className="absolute -bottom-1 right-0 p-1.5 rounded-full bg-[#0A1108] border border-[#ADFF00]/50 text-[#ADFF00]">
                {isPro ? <Crown className="w-4 h-4 fill-[#ADFF00]" /> : <Sparkles className="w-4 h-4" />}
              </div>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white">{name}</h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{email}</p>

            {/* Badges */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                isPro 
                  ? "bg-[#ADFF00]/15 border-[#ADFF00] text-[#ADFF00] shadow-[0_0_12px_rgba(173,255,0,0.2)]" 
                  : isPremium 
                  ? "bg-cyan-500/15 border-cyan-400 text-cyan-400" 
                  : "bg-amber-500/15 border-amber-400 text-amber-400"
              }`}>
                {isPro ? <Crown className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>{isPro ? "PRO Member" : isPremium ? "CORE Member" : "Free Account"}</span>
              </div>

              {fitnessProfile?.country && (
                <div className="px-3 py-1 rounded-full bg-[#1A2619] border border-gray-800 text-[11px] font-semibold text-gray-300 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <span>{fitnessProfile.country}</span>
                </div>
              )}
            </div>
            
            <p className="text-[11px] text-gray-500 font-medium mt-3">Member since {joinedDate}</p>
          </div>
        </motion.div>

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
            <Link href="/fitness/onboarding" className="text-xs font-semibold text-[#ADFF00] hover:underline">
              Edit Details
            </Link>
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

        {/* Subscription & AI Usage Meter */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ADFF00]" />
            <span>Subscription & AI Credits</span>
          </h2>

          <div className="bg-[#121E12] border border-[#1A2619] p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Current Membership</p>
                <h3 className="text-xl font-black text-white capitalize mt-0.5">
                  Fitness AI {premiumLevel} Plan
                </h3>
              </div>
              <Link 
                href="/fitness/payment"
                className="px-4 py-2 bg-[#ADFF00] text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(173,255,0,0.25)] hover:bg-[#b8ff1a] transition-all active:scale-95 flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{isPremium ? "Manage Plan" : "Upgrade Pro"}</span>
              </Link>
            </div>

            {/* AI Usage Bar */}
            <div className="bg-[#0A1108] p-4 rounded-2xl border border-[#1A2619]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-gray-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#ADFF00]" />
                  AI Daily Generations
                </span>
                <span className={`font-bold ${aiLimitInfo.remaining === 0 ? "text-red-400" : "text-[#ADFF00]"}`}>
                  {aiLimitInfo.remaining} / {aiLimitInfo.limit} remaining
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1A2619] overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    aiLimitInfo.remaining === 0 ? "bg-red-500" : "bg-[#ADFF00] shadow-[0_0_10px_rgba(173,255,0,0.5)]"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, (aiLimitInfo.used / aiLimitInfo.limit) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Settings & Actions List */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">
            Account Options
          </h2>

          <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl overflow-hidden divide-y divide-[#1A2619]">
            
            {/* Re-take Onboarding */}
            <Link 
              href="/fitness/onboarding"
              className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1A2619] flex items-center justify-center text-[#ADFF00]">
                  <RefreshCw className="w-4.5 h-4.5 group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Re-generate AI Plan</p>
                  <p className="text-xs text-gray-400">Re-take questionnaire to update your strategy</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#ADFF00] transition-colors" />
            </Link>

            {/* Billing */}
            <Link 
              href="/fitness/payment"
              className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1A2619] flex items-center justify-center text-cyan-400">
                  <CreditCard className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Billing & Payment</p>
                  <p className="text-xs text-gray-400">View pricing, invoices, or upgrade membership</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
            </Link>

            {/* Sign Out Button */}
            <button 
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full p-4 flex items-center justify-between hover:bg-red-500/10 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <LogOut className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-400">Sign Out</p>
                  <p className="text-xs text-gray-400">Log out of your Fitness OS account</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" />
            </button>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
