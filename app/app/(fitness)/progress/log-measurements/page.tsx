"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Ruler, AlertCircle, Calendar, History } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface FieldConfig {
  field: "waist" | "chest" | "hip" | "neck" | "left_arm" | "right_arm" | "left_thigh" | "right_thigh";
  label: string;
  min: number;
  max: number;
  hint: string;
}

const FIELD_CONFIGS: FieldConfig[] = [
  { field: "waist", label: "Waist", min: 40, max: 200, hint: "40 – 200 cm" },
  { field: "chest", label: "Chest", min: 50, max: 220, hint: "50 – 220 cm" },
  { field: "hip", label: "Hip", min: 50, max: 220, hint: "50 – 220 cm" },
  { field: "neck", label: "Neck", min: 20, max: 70, hint: "20 – 70 cm" },
  { field: "left_arm", label: "Left Arm", min: 15, max: 75, hint: "15 – 75 cm" },
  { field: "right_arm", label: "Right Arm", min: 15, max: 75, hint: "15 – 75 cm" },
  { field: "left_thigh", label: "Left Thigh", min: 25, max: 120, hint: "25 – 120 cm" },
  { field: "right_thigh", label: "Right Thigh", min: 25, max: 120, hint: "25 – 120 cm" },
];

export default function LogMeasurementsPage() {
  const [measurements, setMeasurements] = useState<Record<string, string>>({
    waist: "",
    chest: "",
    hip: "",
    neck: "",
    left_arm: "",
    right_arm: "",
    left_thigh: "",
    right_thigh: ""
  });

  const [previous, setPrevious] = useState<Record<string, number | null>>({});
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const router = useRouter();

  // Load previous measurements
  useEffect(() => {
    let mounted = true;
    async function loadLatest() {
      try {
        const res = await fetch("/api/fitness/log-measurements");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data.success && data.latest) {
          setPrevious(data.latest);
        }
      } catch (err) {
        console.error("Failed to load latest measurements:", err);
      } finally {
        if (mounted) setIsFetching(false);
      }
    }
    loadLatest();
    return () => { mounted = false; };
  }, []);

  // Validation map
  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    for (const config of FIELD_CONFIGS) {
      const val = measurements[config.field]?.trim();
      if (val) {
        const num = Number(val);
        if (isNaN(num)) {
          errors[config.field] = "Must be a valid number";
        } else if (num < config.min || num > config.max) {
          errors[config.field] = `Must be between ${config.min} and ${config.max} cm`;
        } else if (val.includes(".") && val.split(".")[1]?.length > 1) {
          errors[config.field] = "Max 1 decimal place allowed";
        }
      }
    }
    return errors;
  }, [measurements]);

  const hasAnyFilled = Object.values(measurements).some(val => val.trim().length > 0);
  const hasErrors = Object.keys(fieldErrors).length > 0;
  const isValid = hasAnyFilled && !hasErrors;

  // Pre-fill from previous button
  const handleCopyPrevious = () => {
    const populated: Record<string, string> = {};
    for (const config of FIELD_CONFIGS) {
      const prevVal = previous[config.field];
      populated[config.field] = prevVal !== null && prevVal !== undefined ? String(prevVal) : "";
    }
    setMeasurements(populated);
    toast.info("Copied previous measurements. Adjust as needed!");
  };

  const handleSave = async () => {
    if (!isValid || isSaving) return;
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/fitness/log-measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...measurements,
          date: selectedDate
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save measurements");
      }

      toast.success("Measurements saved successfully!");
      router.push("/progress");
      router.refresh();
    } catch (err: any) {
      console.error("Save measurements error:", err);
      toast.error(err.message || "Failed to save measurements");
      setIsSaving(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

  const hasPreviousData = Object.values(previous).some(v => v !== null && v !== undefined && v > 0);

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#0A1108] p-5 pb-28 overflow-y-auto relative">
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
            <h2 className="text-xl font-black text-white uppercase tracking-widest">Saving Measurements...</h2>
            <p className="text-sm text-white/50 mt-2 font-medium">Updating your body recomposition metrics</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <Link href="/progress" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-black tracking-widest text-white uppercase">Measurements</h1>
        <div className="w-10" />
      </div>

      <div className="flex flex-col items-center mb-6 text-center max-w-sm mx-auto w-full">
        <div className="w-16 h-16 rounded-full bg-[#ADFF00]/10 flex items-center justify-center mb-3 border border-[#ADFF00]/20">
          <Ruler className="w-8 h-8 text-[#ADFF00]" />
        </div>
        <p className="text-xs font-medium text-white/50 mb-6">
          Log tape measurements in centimeters to track body fat reduction and muscle development.
        </p>

        {/* Date Selector Pills */}
        <div className="flex items-center gap-2 mb-4 bg-white/5 p-1 rounded-xl border border-white/5">
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

        {/* Quick Fill Button if previous measurements exist */}
        {hasPreviousData && (
          <button
            type="button"
            onClick={handleCopyPrevious}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#ADFF00] hover:underline mb-2 py-1 px-3 rounded-lg bg-[#ADFF00]/10 border border-[#ADFF00]/20 transition-colors"
          >
            <History className="w-3 h-3" />
            Fill from previous check-in
          </button>
        )}
      </div>

      {/* Input List */}
      <div className="flex flex-col max-w-sm mx-auto w-full gap-3">
        {FIELD_CONFIGS.map((config) => {
          const error = fieldErrors[config.field];
          const prevVal = previous[config.field];
          const hasError = !!error;

          return (
            <div
              key={config.field}
              className={`p-4 rounded-2xl transition-all border ${
                hasError 
                  ? "bg-red-500/10 border-red-500/30" 
                  : "bg-white/5 border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white/90 uppercase tracking-widest">
                    {config.label}
                  </span>
                  {prevVal !== null && prevVal !== undefined && prevVal > 0 && (
                    <span className="text-[10px] text-white/40 font-medium mt-0.5">
                      Previous: {prevVal} cm
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min={config.min}
                    max={config.max}
                    inputMode="decimal"
                    value={measurements[config.field]}
                    onChange={(e) => setMeasurements({ ...measurements, [config.field]: e.target.value })}
                    placeholder={prevVal ? String(prevVal) : "—"}
                    className="bg-transparent text-xl font-black text-[#ADFF00] outline-none w-24 text-right placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs font-bold text-white/40">cm</span>
                </div>
              </div>

              {hasError && (
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-red-500/20 text-red-400 text-[11px] font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Global Action Button */}
        <button 
          onClick={handleSave}
          disabled={isSaving || !isValid || isFetching}
          className="w-full h-14 mt-4 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-[0_0_25px_rgba(173,255,0,0.15)]"
        >
          {isSaving ? "Saving..." : "Save Measurements"}
        </button>
      </div>
    </div>
  );
}
