"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Droplets } from "lucide-react";

export function formatTo12Hour(time24: string): string {
  if (!time24) return "9:00 AM";
  const [hStr, mStr] = time24.split(":");
  let hour = parseInt(hStr, 10);
  if (isNaN(hour)) return "9:00 AM";
  const minute = mStr ? mStr.padStart(2, "0") : "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
}

export function calculateReminders(startTime: string, endTime: string, intervalHours: number): string[] {
  if (!startTime || !endTime || !intervalHours || intervalHours <= 0) return [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const startMinutes = (startH || 0) * 60 + (startM || 0);
  let endMinutes = (endH || 0) * 60 + (endM || 0);

  // If end time is before or equal to start time, assume next day
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  const times: string[] = [];
  const stepMinutes = intervalHours * 60;

  for (let m = startMinutes; m <= endMinutes; m += stepMinutes) {
    const totalM = m % (24 * 60);
    const h = Math.floor(totalM / 60).toString().padStart(2, "0");
    const min = (totalM % 60).toString().padStart(2, "0");
    times.push(`${h}:${min}`);
  }

  return times;
}

export interface WaterScheduleConfig {
  startTime: string;
  endTime: string;
  interval: number;
}

interface WaterReminderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentSchedule?: WaterScheduleConfig | null;
  hasActiveSchedule?: boolean;
  onSaveSchedule: (config: { startTime: string; endTime: string; interval: number; times: string[] }) => void;
  onClearSchedule?: () => void;
}

const INTERVAL_OPTIONS = [
  { label: "Every 1 hour", value: 1 },
  { label: "Every 2 hours", value: 2 },
  { label: "Every 3 hours", value: 3 },
];

export function WaterReminderSheet({
  isOpen,
  onClose,
  currentSchedule,
  hasActiveSchedule = false,
  onSaveSchedule,
  onClearSchedule,
}: WaterReminderSheetProps) {
  const [startTime, setStartTime] = useState<string>(currentSchedule?.startTime || "09:00");
  const [endTime, setEndTime] = useState<string>(currentSchedule?.endTime || "21:00");
  const [interval, setInterval] = useState<number>(currentSchedule?.interval || 2);

  // Sync state whenever opened with existing schedule
  useEffect(() => {
    if (isOpen) {
      if (currentSchedule) {
        setStartTime(currentSchedule.startTime || "09:00");
        setEndTime(currentSchedule.endTime || "21:00");
        setInterval(currentSchedule.interval || 2);
      }
    }
  }, [isOpen, currentSchedule]);

  const generatedTimes = useMemo(() => {
    return calculateReminders(startTime, endTime, interval);
  }, [startTime, endTime, interval]);

  const handleCreate = () => {
    onSaveSchedule({
      startTime,
      endTime,
      interval,
      times: generatedTimes,
    });
    onClose();
  };

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
            className="fixed inset-0 bg-black/75 z-[100] backdrop-blur-sm"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-[#121915] border-t border-white/10 rounded-t-[32px] max-w-md mx-auto p-6 text-white shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  Water reminder schedule
                  <Droplets className="w-4 h-4 text-[#00D2FF]" />
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  Reminders from start to end at your chosen interval.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-gray-300 hover:text-white transition-all ml-2 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs Container */}
            <div className="mt-6 space-y-4">
              {/* Start Time Row */}
              <div className="space-y-1.5">
                <label className="text-gray-400 text-xs font-semibold px-1">
                  Start time
                </label>
                <div className="relative bg-[#1A251E] hover:bg-[#202E25] border border-white/5 hover:border-[#00D2FF]/40 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer group shadow-sm">
                  <span className="text-white font-bold text-[15px] tracking-wide">
                    {formatTo12Hour(startTime)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#00D2FF] group-hover:translate-x-0.5 transition-transform" />

                  {/* Native invisible time picker covering the card */}
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              {/* End Time Row */}
              <div className="space-y-1.5">
                <label className="text-gray-400 text-xs font-semibold px-1">
                  End time
                </label>
                <div className="relative bg-[#1A251E] hover:bg-[#202E25] border border-white/5 hover:border-[#00D2FF]/40 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer group shadow-sm">
                  <span className="text-white font-bold text-[15px] tracking-wide">
                    {formatTo12Hour(endTime)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#00D2FF] group-hover:translate-x-0.5 transition-transform" />

                  {/* Native invisible time picker covering the card */}
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              {/* Repeat Every Interval */}
              <div className="space-y-2.5 pt-1">
                <label className="text-gray-400 text-xs font-semibold px-1">
                  Repeat every
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {INTERVAL_OPTIONS.map((opt) => {
                    const isSelected = interval === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setInterval(opt.value)}
                        className={`py-3 px-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all text-center ${
                          isSelected
                            ? "border-2 border-[#00D2FF] bg-[#00D2FF]/10 text-[#00D2FF] shadow-[0_0_15px_rgba(0,210,255,0.25)]"
                            : "bg-[#1A251E] border border-white/5 text-gray-400 hover:text-white hover:bg-[#202E25]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Reminders Count Note */}
                <p className="text-gray-500 text-xs font-medium px-1">
                  About {generatedTimes.length} reminder{generatedTimes.length === 1 ? "" : "s"} will be created
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-7">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl bg-[#1D2620] hover:bg-[#26332A] active:scale-[0.98] text-white font-bold text-sm transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreate}
                className="flex-1 py-3.5 rounded-2xl bg-[#00D2FF] hover:bg-[#00BCE6] active:scale-[0.98] text-black font-black text-sm transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)]"
              >
                Create
              </button>
            </div>

            {/* Optional Clear Schedule Option */}
            {hasActiveSchedule && onClearSchedule && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClearSchedule();
                    onClose();
                  }}
                  className="text-xs font-semibold text-red-400/80 hover:text-red-400 transition-colors py-1"
                >
                  Turn off water schedule
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
