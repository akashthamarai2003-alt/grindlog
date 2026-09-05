"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/services/supabase/client";
import { updateFitnessProfilePartialAction, toggleRemindersEnabledAction } from "@/app/actions/fitness";
import { requestFirebaseNotificationPermission } from "@/lib/firebase/client";
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
  BellOff,
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
  subscriptionPlan: { id: "starter" | "pro" } | null;
  aiLimitInfo: {
    allowed: boolean;
    limit: number;
    used: number;
    remaining: number;
  };
}

export function ProfileContent({
  user,
  fitnessProfile: initialFitnessProfile,
  mainProfile,
  activePlan,
  subscriptionPlan,
  aiLimitInfo
}: ProfileContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [fitnessProfile, setFitnessProfile] = useState(initialFitnessProfile);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    initialFitnessProfile?.reminders_enabled ?? true
  );
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);

  const handleToggleNotifications = async () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    setIsTogglingNotifications(true);

    // If turning ON, trigger push permission request if not granted yet
    if (next && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        try {
          const token = await requestFirebaseNotificationPermission();
          if (token) {
            const oldToken = localStorage.getItem("fcm_token");
            const res = await fetch("/api/fcm/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, oldToken }),
            });
            if (res.ok) {
              localStorage.setItem("fcm_token", token);
              localStorage.setItem("fcm_registered", "true");
            }
          }
        } catch (err) {
          console.warn("Could not register push token during toggle:", err);
        }
      }
    }

    const res = await toggleRemindersEnabledAction(next);
    setIsTogglingNotifications(false);

    if (res.success) {
      toast.success(next ? "Notifications turned ON 🔔" : "Notifications turned OFF 🔕");
      setFitnessProfile((prev: any) => ({ ...prev, reminders_enabled: next }));
    } else {
      setNotificationsEnabled(!next);
      toast.error(res.error || "Failed to update notification setting.");
    }
  };

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

  // Use the canonical active Fitness subscription first. The fitness profile
  // fields remain a fallback for accounts created before subscriptions were
  // moved to fitness_os_subscriptions.
  const activeSubscriptionLevel = subscriptionPlan?.id === "pro"
    ? "pro"
    : subscriptionPlan?.id === "starter"
    ? "core"
    : null;
  const isPremium = Boolean(activeSubscriptionLevel || fitnessProfile?.fitness_is_premium);
  const premiumLevel = activeSubscriptionLevel || fitnessProfile?.fitness_premium_level || (isPremium ? "core" : "free");
  const isPro = premiumLevel === "pro";
  const membershipLabel = isPro ? "Pro" : premiumLevel === "core" ? "Core" : "Free";

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
      training_days_per_week: parseInt(String(formData.training_days_per_week)),
      goal: formData.goal,
      waist_cm: formData.waist_cm ? parseFloat(String(formData.waist_cm)) : null,
      chest_cm: formData.chest_cm ? parseFloat(String(formData.chest_cm)) : null,
      arm_cm: formData.arm_cm ? parseFloat(String(formData.arm_cm)) : null,
      thigh_cm: formData.thigh_cm ? parseFloat(String(formData.thigh_cm)) : null,
    };

    const res = await updateFitnessProfilePartialAction(payload);
    setIsSaving(false);

    if (res.success) {
      toast.success("Profile baseline updated successfully!");
      setFitnessProfile((prev: any) => ({ ...prev, ...payload }));
      setShowEditModal(false);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update profile details");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1108] text-white pb-48">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-72 bg-[radial-gradient(ellipse_at_top,#1A2619_0%,transparent_70%)] pointer-events-none opacity-70 z-0" />

      <div className="relative z-10 max-w-md mx-auto px-5 pt-6 space-y-6">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pt-2 pb-1">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Your Profile
          </h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121E12] border border-[#1A2619]">
            <User className="w-4 h-4 text-[#ADFF00]" />
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">Account</span>
          </div>
        </div>

        {/* User Hero Avatar Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-[#121E12] border border-[#1A2619] rounded-3xl p-6 shadow-xl overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#ADFF00]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center relative z-10">
            {/* Avatar Circle with Neon Ring */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1A2619] via-[#0A1108] to-[#121E12] border-2 border-[#ADFF00] p-1 flex items-center justify-center shadow-[0_0_20px_rgba(173,255,0,0.25)]">
                {mainProfile?.avatar_url || (user as any).user_metadata?.avatar_url ? (
                  <img 
                    src={mainProfile?.avatar_url || (user as any).user_metadata?.avatar_url} 
                    alt={name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#121E12] flex items-center justify-center text-3xl font-black text-[#ADFF00] tracking-wider uppercase">
                    {name.charAt(0)}
                  </div>
                )}
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
              
              {(fitnessProfile?.age || fitnessProfile?.gender) && (
                <div className="px-3 py-1 rounded-full bg-[#1A2619] border border-gray-800 text-[11px] font-semibold text-gray-300 flex items-center gap-1">
                  <span>{fitnessProfile.age ? `${fitnessProfile.age} yrs` : ""} {fitnessProfile.gender ? `• ${fitnessProfile.gender}` : ""}</span>
                </div>
              )}
            </div>
            
            <p className="text-[11px] text-gray-500 font-medium mt-3">Member since {joinedDate}</p>
          </div>
        </motion.div>

        {/* Your Saved AI Plan Card */}
        {activePlan ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative bg-[#121E12] border border-[#1A2619] hover:border-[#ADFF00]/30 rounded-3xl p-5 shadow-xl transition-all overflow-hidden"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center text-[#ADFF00] shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#ADFF00]">
                    Your Saved AI Plan
                  </p>
                  <Link
                    href="/workout"
                    prefetch={true}
                    className="text-[10px] font-bold text-[#ADFF00] hover:underline flex items-center gap-0.5"
                  >
                    View Workouts →
                  </Link>
                </div>
                <h2 className="mt-1 text-lg font-black text-white tracking-tight leading-snug truncate">
                  {activePlan.name || "Saved Workout Plan"}
                </h2>
                {activePlan.description && (
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-400 font-medium">
                    {activePlan.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-white/5 flex flex-wrap gap-2">
              {fitnessProfile?.goal && (
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-bold text-gray-200">
                  Goal: {fitnessProfile.goal}
                </span>
              )}
              {fitnessProfile?.target_physique && (
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-bold text-gray-200">
                  Physique: {fitnessProfile.target_physique}
                </span>
              )}
              {fitnessProfile?.training_location && (
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-bold text-gray-200 capitalize">
                  {fitnessProfile.training_location}
                </span>
              )}
              {fitnessProfile?.training_days_per_week && (
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-bold text-gray-200">
                  {fitnessProfile.training_days_per_week} days/week
                </span>
              )}
              {fitnessProfile?.workout_duration_minutes && (
                <span className="flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-bold text-gray-200">
                  <Dumbbell className="h-3 w-3 text-[#ADFF00]" /> {fitnessProfile.workout_duration_minutes} min/session
                </span>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-[#121E12] border border-[#1A2619] p-5 rounded-3xl flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ADFF00]">AI Workout Plan</p>
              <h3 className="font-bold text-white text-sm mt-0.5">No Active Plan</h3>
              <p className="text-xs text-gray-400 mt-0.5">Generate your personalized AI strategy.</p>
            </div>
            <Link
              href="/report"
              prefetch={true}
              className="px-4 py-2 bg-[#ADFF00] text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(173,255,0,0.25)] hover:bg-[#b8ff1a] transition-all"
            >
              Generate
            </Link>
          </motion.div>
        )}

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
                  Fitness AI {membershipLabel} Plan
                </h3>
              </div>
              <Link 
                href="/payment"
                prefetch={true}
                className="px-4 py-2 bg-[#ADFF00] text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(173,255,0,0.25)] hover:bg-[#b8ff1a] transition-all active:scale-90 flex items-center gap-1.5"
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
            
            {/* My Details */}
            <Link 
              href="/profile/details"
              prefetch={true}
              className="p-4 flex items-center justify-between hover:bg-white/5 active:bg-white/10 active:scale-[0.99] transition-all group duration-75"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1A2619] flex items-center justify-center text-[#ADFF00]">
                  <User className="w-4.5 h-4.5 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">My Details</p>
                  <p className="text-xs text-gray-400">View physical baseline, measurements, and training routine</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#ADFF00] transition-colors" />
            </Link>

            {/* Notification ON/OFF Option */}
            <div className="p-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${notificationsEnabled ? 'bg-[#1A2619] text-[#ADFF00]' : 'bg-[#1C201A] text-gray-500'}`}>
                  {notificationsEnabled ? (
                    <Bell className="w-4.5 h-4.5" />
                  ) : (
                    <BellOff className="w-4.5 h-4.5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">Notifications</p>
                    <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                      notificationsEnabled 
                        ? 'bg-[#ADFF00]/15 text-[#ADFF00] border border-[#ADFF00]/30' 
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {notificationsEnabled ? "ON" : "OFF"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Workout and hydration push alerts</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleToggleNotifications}
                disabled={isTogglingNotifications}
                className={`w-12 h-7 rounded-full flex items-center transition-colors px-1 cursor-pointer ${
                  notificationsEnabled ? "bg-[#ADFF00]" : "bg-gray-700"
                }`}
                title={notificationsEnabled ? "Turn notifications OFF" : "Turn notifications ON"}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-md ${
                    notificationsEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Set Reminders */}
            <Link 
              href="/reminders"
              prefetch={true}
              className="p-4 flex items-center justify-between hover:bg-white/5 active:bg-white/10 active:scale-[0.99] transition-all group duration-75"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1A2619] flex items-center justify-center text-[#ADFF00]">
                  <Bell className="w-4.5 h-4.5 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Set Reminders</p>
                  <p className="text-xs text-gray-400">Configure your daily fitness & nutrition alerts</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#ADFF00] transition-colors" />
            </Link>

            {/* Billing */}
            <Link 
              href="/payment"
              prefetch={true}
              className="p-4 flex items-center justify-between hover:bg-white/5 active:bg-white/10 active:scale-[0.99] transition-all group duration-75"
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
              className="w-full p-4 flex items-center justify-between hover:bg-red-500/10 transition-colors text-left group cursor-pointer"
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



