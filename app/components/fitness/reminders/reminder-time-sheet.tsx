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

  const [hourInputText, setHourInputText] = useState("");
  const [isHourFocused, setIsHourFocused] = useState(false);
  const [minuteInputText, setMinuteInputText] = useState("");
  const [isMinuteFocused, setIsMinuteFocused] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const { hour, minute, period } = parse24To12(initialTime);
      setSelectedHour(hour);
      setSelectedMinute(minute);
      setSelectedPeriod(period);
      setIsHourFocused(false);
      setIsMinuteFocused(false);
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
    setIsHourFocused(false);
    setIsMinuteFocused(false);
  };

  const handleConfirm = () => {
    const result24 = get24HourString(selectedHour, selectedMinute, selectedPeriod);
    onSave(result24);
    onClose();
  };

  const adjustMinute = (delta: number) => {
    setSelectedMinute((prev) => {
      let next = (prev + delta) % 60;
      if (next < 0) next += 60;
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

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "").slice(0, 2);
    setHourInputText(clean);
    const val = parseInt(clean, 10);
    if (!isNaN(val) && val >= 1 && val <= 12) {
      setSelectedHour(val);
    }
  };

  const handleHourBlur = () => {
    setIsHourFocused(false);
    const val = parseInt(hourInputText, 10);
    if (!isNaN(val) && val >= 1 && val <= 12) {
      setSelectedHour(val);
    } else if (val === 0 || val > 12) {
      setSelectedHour(12);
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "").slice(0, 2);
    setMinuteInputText(clean);
    const val = parseInt(clean, 10);
    if (!isNaN(val) && val >= 0 && val <= 59) {
      setSelectedMinute(val);
    }
  };

  const handleMinuteBlur = () => {
    setIsMinuteFocused(false);
    const val = parseInt(minuteInputText, 10);
    if (!isNaN(val) && val >= 0 && val <= 59) {
      setSelectedMinute(val);
    } else if (val > 59) {
      setSelectedMinute(59);
    }
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
            className="reminder-time-sheet-dialog fixed bottom-0 left-0 right-0 z-[111] bg-[#0E160D] rounded-t-[32px] border-t border-[#1F2F1C] max-w-md mx-auto p-5 pb-10 text-white shadow-2xl overflow-hidden transform-gpu will-change-transform max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#ADFF00]" />
                  <span>{title}</span>
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
              <div className="time-preview-card bg-[#142013] border border-[#1F301D] rounded-2xl p-4 text-center shadow-inner relative overflow-hidden">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                  Selected Reminder Time (Tap box to type)
                </p>

                <div className="flex items-center justify-center gap-2.5 my-2">
                  {/* Hour Box */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => adjustHour(1)}
                      className="p-1 text-white/50 hover:text-[#ADFF00] transition-colors cursor-pointer active:scale-90"
                      title="Next hour (+1h)"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={isHourFocused ? hourInputText : String(selectedHour).padStart(2, "0")}
                      onFocus={() => {
                        setIsHourFocused(true);
                        setHourInputText(String(selectedHour));
                      }}
                      onChange={handleHourChange}
                      onBlur={handleHourBlur}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
                      className="time-digit-input text-3xl sm:text-4xl font-black text-white text-center tracking-tight w-16 py-1 rounded-xl bg-black/40 border border-white/10 focus:border-[#ADFF00] focus:outline-none focus:ring-1 focus:ring-[#ADFF00] transition-all"
                      title="Tap to type exact hour (1-12)"
                    />
                    <button
                      type="button"
                      onClick={() => adjustHour(-1)}
                      className="p-1 text-white/50 hover:text-[#ADFF00] transition-colors cursor-pointer active:scale-90"
                      title="Previous hour (-1h)"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  <span className="text-3xl font-black text-[#ADFF00] animate-pulse -mt-4 select-none">:</span>

                  {/* Minute Box (Exact 1-min step + direct typing) */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => adjustMinute(1)}
                      className="p-1 text-white/50 hover:text-[#ADFF00] transition-colors cursor-pointer active:scale-90"
                      title="Next minute (+1m)"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={isMinuteFocused ? minuteInputText : String(selectedMinute).padStart(2, "0")}
                      onFocus={() => {
                        setIsMinuteFocused(true);
                        setMinuteInputText(String(selectedMinute));
                      }}
                      onChange={handleMinuteChange}
                      onBlur={handleMinuteBlur}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
                      className="time-digit-input text-3xl sm:text-4xl font-black text-white text-center tracking-tight w-16 py-1 rounded-xl bg-black/40 border border-white/10 focus:border-[#ADFF00] focus:outline-none focus:ring-1 focus:ring-[#ADFF00] transition-all"
                      title="Tap to type exact minute (0-59)"
                    />
                    <button
                      type="button"
                      onClick={() => adjustMinute(-1)}
                      className="p-1 text-white/50 hover:text-[#ADFF00] transition-colors cursor-pointer active:scale-90"
                      title="Previous minute (-1m)"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* AM / PM Segmented Switch */}
                  <div className="flex flex-col gap-1.5 ml-2 -mt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod("AM")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        selectedPeriod === "AM"
                          ? "period-btn-active bg-[#ADFF00] text-black shadow-[0_0_10px_rgba(173,255,0,0.3)] scale-105"
                          : "period-btn-inactive bg-black/30 text-white/50 hover:text-white border border-white/5"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod("PM")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        selectedPeriod === "PM"
                          ? "period-btn-active bg-[#ADFF00] text-black shadow-[0_0_10px_rgba(173,255,0,0.3)] scale-105"
                          : "period-btn-inactive bg-black/30 text-white/50 hover:text-white border border-white/5"
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
                        onClick={() => {
                          setSelectedHour(h);
                          setIsHourFocused(false);
                        }}
                        className={`time-chip-btn py-2 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? "time-chip-selected bg-[#ADFF00] text-black shadow-[0_0_10px_rgba(173,255,0,0.25)]"
                            : "bg-[#142013] border border-white/5 text-white/70 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minute Intervals Grid with Fine-Tuning Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
                    Minutes
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => adjustMinute(-5)}
                      className="time-nudge-btn px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-white/70 hover:text-white active:scale-95 transition cursor-pointer"
                      title="Minus 5 minutes"
                    >
                      -5m
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustMinute(-1)}
                      className="time-nudge-btn px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-white/70 hover:text-white active:scale-95 transition cursor-pointer"
                      title="Minus 1 minute"
                    >
                      -1m
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustMinute(1)}
                      className="time-nudge-btn px-2 py-0.5 rounded-lg bg-[#ADFF00]/15 hover:bg-[#ADFF00]/25 border border-[#ADFF00]/40 text-[10px] font-black text-[#ADFF00] active:scale-95 transition cursor-pointer"
                      title="Add 1 minute"
                    >
                      +1m
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustMinute(5)}
                      className="time-nudge-btn px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-white/70 hover:text-white active:scale-95 transition cursor-pointer"
                      title="Add 5 minutes"
                    >
                      +5m
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {MINUTE_STEPS.map((m) => {
                    const isSelected = selectedMinute === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setSelectedMinute(m);
                          setIsMinuteFocused(false);
                        }}
                        className={`time-chip-btn py-2 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? "time-chip-selected bg-[#ADFF00] text-black shadow-[0_0_10px_rgba(173,255,0,0.25)]"
                            : "bg-[#142013] border border-white/5 text-white/70 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        :{String(m).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>

                {/* Exact Minute Indicator when not a multiple of 5 (e.g. :12) */}
                {!MINUTE_STEPS.includes(selectedMinute) && (
                  <div className="flex items-center justify-between rounded-xl bg-[#ADFF00]/10 border border-[#ADFF00]/30 px-3 py-1.5 text-xs">
                    <span className="text-[11px] font-bold text-white/70">Exact Minute Selected:</span>
                    <span className="font-black text-[#ADFF00] text-sm">
                      :{String(selectedMinute).padStart(2, "0")}
                    </span>
                  </div>
                )}
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
                      className="time-preset-card p-2 rounded-xl bg-[#142013] hover:bg-[#1C2C1B] border border-white/5 hover:border-[#ADFF00]/30 transition-all text-left group cursor-pointer active:scale-95"
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
