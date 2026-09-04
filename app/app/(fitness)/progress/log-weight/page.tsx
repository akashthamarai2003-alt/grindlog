"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Weight, AlertCircle, Calendar, Target, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

interface RecentLog {
  id: string;
  weight: number;
  recorded_at: string;
}

export default function LogWeightPage() {
  const [weight, setWeight] = useState<string>("");
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const router = useRouter();

  // Load existing weight & targets on mount
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const res = await fetch("/api/fitness/log-weight");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data.success) {
          if (data.currentWeight) {
            setWeight(String(data.currentWeight));
          }
          if (data.targetWeight) {
            setTargetWeight(data.targetWeight);
          }
          if (data.recentLogs && Array.isArray(data.recentLogs)) {
            setRecentLogs(data.recentLogs);
          }
        }
      } catch (err) {
        console.error("Failed to load current weight info:", err);
      } finally {
        if (mounted) setIsFetching(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  // Validation logic
  const validationError = useMemo(() => {
    if (!weight.trim()) {
      return hasInteracted ? "Please enter your weight" : null;
    }
    const num = Number(weight);
    if (isNaN(num)) {
      return "Please enter a valid number";
    }
    if (num < 20) {
      return "Weight must be at least 20 kg";
    }
    if (num > 350) {
      return "Weight cannot exceed 350 kg";
    }
    if (weight.includes(".") && weight.split(".")[1]?.length > 2) {
      return "Maximum 2 decimal places allowed";
    }
    return null;
  }, [weight, hasInteracted]);

  const isValid = !validationError && weight.trim().length > 0 && !isNaN(Number(weight));

  // Quick adjust nudge
  const handleAdjust = (delta: number) => {
    setHasInteracted(true);
    const current = parseFloat(weight) || 70.0;
    const updated = Math.round((current + delta) * 10) / 10;
    if (updated >= 20 && updated <= 350) {
      setWeight(updated.toString());
    }
  };

  // Save handler with true async network flow
  const handleSave = async () => {
    setHasInteracted(true);
    if (!isValid || isSaving) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/fitness/log-weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(weight),
          date: selectedDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save weight");
      }

      toast.success(`Weight logged: ${data.weight} kg`);
      router.push("/progress");
      router.refresh();
    } catch (err: any) {
      console.error("Log weight save failed:", err);
      toast.error(err.message || "Failed to save weight. Please check your network.");
      setIsSaving(false);
    }
  };

  // Format date helper
  const formatDateLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = parseInt(parts[2], 10);
        const monthIdx = parseInt(parts[1], 10) - 1;
        return `${day} ${months[monthIdx] || ""}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#0A1108] p-5 relative overflow-y-auto pb-12">
      {/* Saving Overlay */}
      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0A1108]/90 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <Loader2 className="w-12 h-12 text-[#ADFF00]" />
            </motion.div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest">Saving Weight...</h2>
            <p className="text-sm text-white/50 mt-2 font-medium">Updating your transformation analytics</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <Link 
          href="/progress" 
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-black tracking-widest text-white uppercase">Log Weight</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        {/* Icon & Heading */}
        <div className="w-20 h-20 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center mb-4">
          <Weight className="w-10 h-10 text-[#ADFF00]" />
        </div>
        
        <h2 className="text-white/60 text-xs font-black mb-6 uppercase tracking-widest">
          Body Weight
        </h2>

        {/* Date Selector Pills */}
        <div className="flex items-center gap-2 mb-8 bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              selectedDate === todayStr 
                ? "bg-[#ADFF00] text-black shadow-sm" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(yesterdayStr)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              selectedDate === yesterdayStr 
                ? "bg-[#ADFF00] text-black shadow-sm" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Yesterday
          </button>
          <div className="relative flex items-center">
            <Calendar className="w-3.5 h-3.5 text-white/40 absolute left-2 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={todayStr}
              className="bg-transparent pl-7 pr-2 py-1 text-xs font-bold text-white/70 outline-none rounded-lg border border-transparent hover:border-white/10"
            />
          </div>
        </div>

        {/* Main Weight Input Card */}
        <div className="w-full bg-[#111A10] border border-white/5 rounded-3xl p-6 flex flex-col items-center mb-4 shadow-xl">
          <div className="flex items-baseline justify-center gap-2">
            <input
              type="number"
              step="0.1"
              min="20"
              max="350"
              inputMode="decimal"
              value={weight}
              onChange={(e) => {
                setHasInteracted(true);
                setWeight(e.target.value);
              }}
              placeholder="00.0"
              autoFocus
              className="bg-transparent text-6xl font-black text-white outline-none w-48 text-center placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none tracking-tight"
            />
            <span className="text-2xl font-black text-[#ADFF00]">kg</span>
          </div>

          {/* Quick Adjust Pills */}
          <div className="grid grid-cols-4 gap-2 w-full mt-6">
            <button
              type="button"
              onClick={() => handleAdjust(-1.0)}
              className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-black text-xs transition-all active:scale-95 border border-white/5"
            >
              -1.0
            </button>
            <button
              type="button"
              onClick={() => handleAdjust(-0.1)}
              className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#ADFF00] font-black text-xs transition-all active:scale-95 border border-white/5"
            >
              -0.1
            </button>
            <button
              type="button"
              onClick={() => handleAdjust(+0.1)}
              className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#ADFF00] font-black text-xs transition-all active:scale-95 border border-white/5"
            >
              +0.1
            </button>
            <button
              type="button"
              onClick={() => handleAdjust(+1.0)}
              className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-black text-xs transition-all active:scale-95 border border-white/5"
            >
              +1.0
            </button>
          </div>

          {/* Target Goal Insight */}
          {targetWeight && !validationError && !isNaN(Number(weight)) && Number(weight) > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5 w-full flex items-center justify-center gap-1.5 text-xs text-white/60">
              <Target className="w-3.5 h-3.5 text-[#ADFF00]" />
              <span>Target: <strong className="text-white font-bold">{targetWeight} kg</strong></span>
              <span className="text-white/30">•</span>
              {Number(weight) > targetWeight ? (
                <span className="text-[#ADFF00] font-medium">
                  {Math.round((Number(weight) - targetWeight) * 10) / 10} kg left to lose
                </span>
              ) : Number(weight) < targetWeight ? (
                <span className="text-[#ADFF00] font-medium">
                  {Math.round((targetWeight - Number(weight)) * 10) / 10} kg left to gain
                </span>
              ) : (
                <span className="text-[#ADFF00] font-bold flex items-center gap-1">
                  Goal reached! <CheckCircle2 className="w-3 h-3 inline" />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Validation Error Banner */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2 text-xs font-semibold text-red-400 mb-4 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 w-full"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{validationError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          disabled={isSaving || !isValid || isFetching}
          className="w-full h-14 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-[0_0_25px_rgba(173,255,0,0.15)]"
        >
          {isSaving ? "Saving..." : "Save Weight"}
        </button>

        {/* Recent Weight Logs */}
        {recentLogs.length > 0 && (
          <div className="w-full mt-8 flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Recent Logs
            </span>
            <div className="w-full bg-white/5 rounded-2xl p-3 border border-white/5 divide-y divide-white/5">
              {recentLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 first:pt-1 last:pb-1">
                  <span className="text-xs text-white/60 font-medium">
                    {formatDateLabel(log.recorded_at.split("T")[0])}
                  </span>
                  <span className="text-xs font-black text-white">
                    {Number(log.weight).toFixed(1)} <span className="text-[10px] text-white/40 font-bold">kg</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
