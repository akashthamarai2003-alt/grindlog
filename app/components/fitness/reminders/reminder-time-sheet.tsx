"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Check, X, Sparkles, ChevronUp, ChevronDown } from "lucide-react";

interface ReminderTimeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialTime: string; // "HH:mm" in 24-hr format
  onSave: (newTime: string) => void;
  title?: string;
}

const COMMON_PRESETS = [
  { label: "7:00 AM", sub: "Morning", time: "07:00" },
  { label: "8:30 AM", sub: "Breakfast", time: "08:30" },
  { label: "1:00 PM", sub: "Lunch", time: "13:00" },
  { label: "5:30 PM", sub: "Pre-Workout", time: "17:30" },
  { label: "7:00 PM", sub: "Workout", time: "19:00" },
  { label: "8:30 PM", sub: "Dinner", time: "20:30" },
  { label: "9:35 PM", sub: "Night Habit", time: "21:35" },
  { label: "10:30 PM", sub: "Bedtime", time: "22:30" },
];

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTE_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export function ReminderTimeSheet({
  isOpen,
  onClose,
  initialTime = "18:00",
  onSave,
  title = "Set Reminder Time",
}: ReminderTimeSheetProps) {
  // Parse initial 24-hour time to 12-hour format
  const parse24To12 = (t: string) => {
    const [hStr, mStr] = (t || "18:00").split(":");
    let h = parseInt(hStr || "18", 10);
    const m = parseInt(mStr || "00", 10);
    if (isNaN(h)) h = 18;
    const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    return { hour: hour12, minute: isNaN(m) ? 0 : m, period };
  };

  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("PM");

  useEffect(() => {
    if (isOpen) {
      const { hour, minute, period } = parse24To12(initialTime);
      setSelectedHour(hour);
      setSelectedMinute(minute);
      setSelectedPeriod(period);
    }
  }, [isOpen, initialTime]);

  // Convert 12-hour state back to 24-hour string "HH:mm"
  const get24HourString = (hour: number, minute: number, period: "AM" | "PM"): string => {
    let h24 = hour;
    if (period === "PM" && hour < 12) h24 = hour + 12;
    if (period === "AM" && hour === 12) h24 = 0;
    const hPadded = String(h24).padStart(2, "0");
    const mPadded = String(minute).padStart(2, "0");
    return `${hPadded}:${mPadded}`;
  };

  const handleApplyPreset = (presetTime: string) => {
    const { hour, minute, period } = parse24To12(presetTime);
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
  };

  const handleConfirm = () => {
    const result24 = get24HourString(selectedHour, selectedMinute, selectedPeriod);
    onSave(result24);
    onClose();
  };

  const adjustMinute = (delta: number) => {
    setSelectedMinute((prev) => {
      let next = prev + delta;
      if (next >= 60) next = 0;
      if (next < 0) next = 59;
      return next;
    });
  };

  const adjustHour = (delta: number) => {
    setSelectedHour((prev) => {
      let next = prev + delta;
      if (next > 12) next = 1;
      if (next < 1) next = 12;
      return next;
    });
  };

  const formattedDisplay = `${String(selectedHour).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")} ${selectedPeriod}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110]"
          />

          {/* Modal Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[111] bg-[#0E160D] rounded-t-[32px] border-t border-[#1F2F1C] max-w-md mx-auto p-5 pb-10 text-white shadow-2xl overflow-hidden transform-gpu will-change-transform max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#ADFF00]" />
                  {title}
                </h3>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                className="px-3.5 py-1.5 rounded-full bg-[#ADFF00] hover:bg-[#9BE600] active:scale-95 text-black font-extrabold text-xs transition-all shadow-[0_0_12px_rgba(173,255,0,0.3)] cursor-pointer"
              >
                Done
              </button>
            </div>

            <div className="overflow-y-auto space-y-5 pt-4 scrollbar-none">
              {/* Digital Time Preview & Stepper */}
              <div className="bg-[#142013] border border-[#1F301D] rounded-2xl p-4 text-center shadow-inner relative overflow-hidden">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                  Selected Reminder Time
                </p>

                <div className="flex items-center justify-center gap-3 my-2">
                  {/* Hour Box */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => adjustHour(1)}
                      className="p-1 text-white/40 hover:text-[#ADFF00] transition-colors"
                      title="Next hour"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <span className="text-4xl font-black text-white tracking-tight w-16 py-1 rounded-xl bg-black/30 border border-white/5">
                      {String(selectedHour).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustHour(-1)}
                      className="p-1 text-white/40 hover:text-[#ADFF00] transition-colors"
                      title="Previous hour"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-3xl font-black text-[#ADFF00] animate-pulse -mt-4">:</span>

                  {/* Minute Box */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => adjustMinute(5)}
                      className="p-1 text-white/40 hover:text-[#ADFF00] transition-colors"
                      title="Add 5 minutes"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <span className="text-4xl font-black text-white tracking-tight w-16 py-1 rounded-xl bg-black/30 border border-white/5">
                      {String(selectedMinute).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustMinute(-5)}
                      className="p-1 text-white/40 hover:text-[#ADFF00] transition-colors"
                      title="Minus 5 minutes"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* AM / PM Segmented Switch */}
                  <div className="flex flex-col gap-1.5 ml-2 -mt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod("AM")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        selectedPeriod === "AM"
                          ? "bg-[#ADFF00] text-black shadow-[0_0_10px_rgba(173,255,0,0.3)] scale-105"
                          : "bg-black/30 text-white/50 hover:text-white border border-white/5"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod("PM")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        selectedPeriod === "PM"
                          ? "bg-[#ADFF00] text-black shadow-[0_0_10px_rgba(173,255,0,0.3)] scale-105"
                          : "bg-black/30 text-white/50 hover:text-white border border-white/5"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Hours Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider px-1">
                  Hour
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {HOURS.map((h) => {
                    const isSelected = selectedHour === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setSelectedHour(h)}
                        className={`py-2 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? "bg-[#ADFF00] text-black shadow-[0_0_10px_rgba(173,255,0,0.25)]"
                            : "bg-[#142013] border border-white/5 text-white/70 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minute Intervals Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider px-1">
                  Minutes
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {MINUTE_STEPS.map((m) => {
                    const isSelected = selectedMinute === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMinute(m)}
                        className={`py-2 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? "bg-[#ADFF00] text-black shadow-[0_0_10px_rgba(173,255,0,0.25)]"
                            : "bg-[#142013] border border-white/5 text-white/70 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        :{String(m).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Presets Carousel */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider px-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#ADFF00]" />
                  Popular Daily Times
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {COMMON_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p.time)}
                      className="p-2 rounded-xl bg-[#142013] hover:bg-[#1C2C1B] border border-white/5 hover:border-[#ADFF00]/30 transition-all text-left group cursor-pointer active:scale-95"
                    >
                      <div className="text-[10px] font-bold text-white/40 group-hover:text-[#ADFF00] transition-colors">
                        {p.sub}
                      </div>
                      <div className="text-xs font-black text-white mt-0.5">
                        {p.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full py-3.5 bg-[#ADFF00] hover:bg-[#9BE600] active:scale-[0.98] text-black font-black text-sm rounded-2xl shadow-[0_0_15px_rgba(173,255,0,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Set Time to {formattedDisplay}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
