"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Star, Clock, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/services/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { springs } from "@/animations/springs";

export default function SleepPage() {
  const router = useRouter();
  const [hours, setHours] = useState(8.0);
  const [quality, setQuality] = useState(80);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Not logged in");
        return;
      }

      const todayStr = new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('fitness_os_sleep_logs').insert({
        user_id: user.id,
        sleep_date: todayStr,
        duration_hours: hours,
        quality_score: quality
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Sleep logged successfully!");
      
      setTimeout(() => {
        router.push("/hub");
      }, 1500);

    } catch (err: any) {
      toast.error(err.message || "Failed to log sleep");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-dvh items-center justify-center bg-[#0A1108] px-5">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={springs.default}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-24 h-24 rounded-full bg-[#5856D6]/20 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-[#5856D6]" />
          </div>
          <h2 className="text-2xl font-black text-white">Sleep Logged</h2>
          <p className="text-sm font-semibold text-white/50">Your checklist has been updated.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh px-5 pb-28 pt-4 safe-top bg-[#0A1108]">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Moon className="w-8 h-8 text-[#5856D6]" fill="#5856D6" /> Sleep
        </h1>
        <p className="text-sm font-semibold text-white/50 mt-1">
          Log your recovery for today's goals.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Hours Slept */}
        <div className="bg-[#111A10] border border-white/5 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5856D6]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#5856D6]" />
              </div>
              <h3 className="text-lg font-bold text-white">Hours Slept</h3>
            </div>
            <span className="text-2xl font-black text-[#5856D6]">{hours.toFixed(1)}h</span>
          </div>
          
          <input
            type="range"
            min="2"
            max="14"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#5856D6]"
          />
          <div className="flex justify-between mt-2 text-xs font-bold text-white/30">
            <span>2h</span>
            <span>8h</span>
            <span>14h</span>
          </div>
        </div>

        {/* Quality Score */}
        <div className="bg-[#111A10] border border-white/5 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFD60A]/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-[#FFD60A]" />
              </div>
              <h3 className="text-lg font-bold text-white">Sleep Quality</h3>
            </div>
            <span className="text-2xl font-black text-[#FFD60A]">{quality}%</span>
          </div>
          
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FFD60A]"
          />
          <div className="flex justify-between mt-2 text-xs font-bold text-white/30">
            <span>Poor</span>
            <span>Great</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full h-14 bg-[#5856D6] hover:bg-[#6c6ad8] disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-[0_0_20px_rgba(88,86,214,0.3)] flex items-center justify-center gap-2"
        >
          {isSubmitting ? "Saving..." : "Log Recovery"}
        </button>
      </div>
    </div>
  );
}
