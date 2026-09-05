"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Trash2, Plus, Loader2, Clock, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateRemindersAction } from "@/app/actions/fitness";
import { ReminderTypeSheet } from "@/components/fitness/reminders/reminder-type-sheet";
import {
  WaterReminderSheet,
  WaterScheduleConfig,
  formatTo12Hour,
} from "@/components/fitness/reminders/water-reminder-sheet";

interface ReminderItem {
  id: string;
  type: string;
  time: string;
  days?: number[];
  isWaterSchedule?: boolean;
}

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function RemindersClient({ 
  initialEnabled, 
  initialReminders 
}: { 
  initialEnabled: boolean, 
  initialReminders: ReminderItem[] 
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [reminders, setReminders] = useState<ReminderItem[]>(initialReminders);
  
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [waterSchedule, setWaterSchedule] = useState<WaterScheduleConfig | null>(null);

  // Initialize or detect water schedule on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("grindlog_water_schedule");
      if (saved) {
        setWaterSchedule(JSON.parse(saved));
        return;
      }
    } catch {}

    const hydrationItems = initialReminders.filter((r) => r.type === "Hydration" || r.isWaterSchedule);
    if (hydrationItems.length >= 2) {
      const sorted = [...hydrationItems].sort((a, b) => a.time.localeCompare(b.time));
      const start = sorted[0].time;
      const end = sorted[sorted.length - 1].time;
      const [h1, m1] = sorted[0].time.split(":").map(Number);
      const [h2, m2] = sorted[1].time.split(":").map(Number);
      const diffHours = Math.max(1, Math.round(((h2 * 60 + m2) - (h1 * 60 + m1)) / 60));
      setWaterSchedule({
        startTime: start,
        endTime: end,
        interval: diffHours,
      });
    }
  }, [initialReminders]);

  const activeWaterCount = reminders.filter((r) => r.type === "Hydration" || r.isWaterSchedule).length;

  const waterScheduleSummary = useMemo(() => {
    if (waterSchedule && activeWaterCount > 0) {
      return `Every ${waterSchedule.interval} hrs · ${formatTo12Hour(waterSchedule.startTime)} - ${formatTo12Hour(waterSchedule.endTime)}`;
    }
    if (activeWaterCount > 0) {
      return `${activeWaterCount} reminders active · tap to adjust`;
    }
    return "Every 2 hrs · set start & end";
  }, [waterSchedule, activeWaterCount]);

  const handleSaveWaterSchedule = async ({
    startTime,
    endTime,
    interval,
    times,
  }: {
    startTime: string;
    endTime: string;
    interval: number;
    times: string[];
  }) => {
    const newWaterReminders: ReminderItem[] = times.map((t, idx) => ({
      id: `water_${Date.now()}_${idx}`,
      type: "Hydration",
      time: t,
      days: [0, 1, 2, 3, 4, 5, 6],
      isWaterSchedule: true,
    }));

    // Filter out prior hydration reminders to prevent duplicates
    const nonWater = reminders.filter((r) => r.type !== "Hydration" && !r.isWaterSchedule);
    const updated = [...nonWater, ...newWaterReminders].sort((a, b) => a.time.localeCompare(b.time));

    setReminders(updated);
    const config: WaterScheduleConfig = { startTime, endTime, interval };
    setWaterSchedule(config);

    try {
      localStorage.setItem("grindlog_water_schedule", JSON.stringify(config));
    } catch {}

    setIsSaving(true);
    const res = await updateRemindersAction(enabled, updated);
    setIsSaving(false);
    if (res.success) {
      toast.success(`Water schedule created! ${times.length} hydration reminders active.`);
    } else {
      toast.error(res.error || "Failed to update reminders.");
    }
  };

  const handleClearWaterSchedule = async () => {
    const nonWater = reminders.filter((r) => r.type !== "Hydration" && !r.isWaterSchedule);
    setReminders(nonWater);
    setWaterSchedule(null);
    try {
      localStorage.removeItem("grindlog_water_schedule");
    } catch {}

    setIsSaving(true);
    const res = await updateRemindersAction(enabled, nonWater);
    setIsSaving(false);
    if (res.success) {
      toast.success("Water schedule turned off.");
    } else {
      toast.error(res.error || "Failed to update reminders.");
    }
  };

  const handleAddReminder = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setReminders([...reminders, { id: newId, type: "Breakfast", time: "08:00", days: [0, 1, 2, 3, 4, 5, 6] }]);
  };

  const handleRemoveReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const handleTimeChange = (id: string, newTime: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, time: newTime } : r));
  };

  const handleTypeSelect = (newType: string) => {
    if (editingId) {
      setReminders(reminders.map(r => r.id === editingId ? { ...r, type: newType } : r));
    }
  };

  const handleToggleDay = (id: string, dayIndex: number) => {
    setReminders(reminders.map(r => {
      if (r.id !== id) return r;
      const currentDays = r.days ?? [0, 1, 2, 3, 4, 5, 6];
      const newDays = currentDays.includes(dayIndex) 
        ? currentDays.filter(d => d !== dayIndex)
        : [...currentDays, dayIndex];
      return { ...r, days: newDays };
    }));
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    const res = await updateRemindersAction(enabled, reminders);
    setIsSaving(false);
    if (res.success) {
      toast.success("Reminders updated successfully!");
    } else {
      toast.error(res.error || "Failed to update reminders.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      {/* Header */}
      <div className="flex items-center px-4 py-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-white font-black text-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Set Reminders
        </button>
      </div>

      <div className="px-5 pb-32 max-w-md mx-auto">
        {/* Main Toggle Card */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-5 mb-4 flex items-center justify-between">
          <span className="font-bold text-white text-[15px]">Reminders</span>
          
          <button 
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-7 rounded-full flex items-center transition-colors px-1 ${enabled ? 'bg-[#ADFF00]' : 'bg-gray-600'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Water Reminder Schedule Banner Card (as requested) */}
        <button
          type="button"
          onClick={() => setIsWaterModalOpen(true)}
          className="w-full bg-[#081F24] hover:bg-[#0C2930] border border-[#00D2FF]/30 hover:border-[#00D2FF]/60 rounded-2xl p-4 mb-7 flex items-center justify-between text-left transition-all group shadow-[0_0_24px_rgba(0,210,255,0.08)] active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#00D2FF]/15 border border-[#00D2FF]/30 flex items-center justify-center shrink-0 text-[#00D2FF] group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 text-[#00D2FF]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-white font-bold text-sm tracking-tight">Water reminder schedule</h4>
                {activeWaterCount > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#00D2FF]/20 text-[#00D2FF] px-2 py-0.5 rounded-full border border-[#00D2FF]/30">
                    {activeWaterCount} Active
                  </span>
                )}
              </div>
              <p className="text-xs text-[#00D2FF]/85 font-medium truncate mt-0.5">
                {waterScheduleSummary}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#00D2FF] shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Reminders List */}
        <div className="space-y-6">
          {reminders.map((reminder, index) => (
            <div key={reminder.id} className="space-y-2">
              <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Reminder {index + 1}</p>
              <div className="grid grid-cols-2 gap-3">
                
                {/* Type Button */}
                <button 
                  onClick={() => {
                    setEditingId(reminder.id);
                    setIsSheetOpen(true);
                  }}
                  className="bg-[#121E12] border border-[#1A2619] rounded-xl p-4 flex items-center justify-between"
                >
                  <span className="text-gray-300 font-semibold text-sm">{reminder.type}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>

                {/* Time & Delete Container */}
                <div className="bg-[#121E12] border border-[#1A2619] rounded-xl flex items-center justify-between pl-4 pr-3 py-3">
                  <input 
                    type="time" 
                    value={reminder.time}
                    onChange={(e) => handleTimeChange(reminder.id, e.target.value)}
                    className="bg-transparent border-none outline-none text-gray-300 font-semibold text-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  />
                  <button 
                    onClick={() => handleRemoveReminder(reminder.id)}
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
              
              {/* Days of Week Selection */}
              <div className="flex items-center justify-between mt-3 px-1">
                {WEEK_DAYS.map((dayLabel, dayIndex) => {
                  const isSelected = (reminder.days ?? [0, 1, 2, 3, 4, 5, 6]).includes(dayIndex);
                  return (
                    <button
                      key={dayIndex}
                      onClick={() => handleToggleDay(reminder.id, dayIndex)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        isSelected 
                          ? 'bg-[#ADFF00] text-black shadow-[0_0_10px_rgba(173,255,0,0.3)]' 
                          : 'bg-[#121E12] border border-[#1A2619] text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {dayLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Add Button */}
          <button 
            onClick={handleAddReminder}
            className="flex items-center gap-1.5 text-blue-400 font-bold text-sm mt-4 px-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-[90px] left-0 right-0 p-5 pr-20 bg-gradient-to-t from-[#0A1108] via-[#0A1108] to-transparent pointer-events-none z-40">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            onClick={handleUpdate}
            disabled={isSaving}
            className="w-full py-4 bg-[#ADFF00] text-black font-extrabold text-[15px] rounded-xl shadow-[0_0_20px_rgba(173,255,0,0.2)] hover:bg-[#9BE600] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              "Update Details"
            )}
          </button>
        </div>
      </div>

      {/* Type Sheet */}
      <ReminderTypeSheet 
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSelect={handleTypeSelect}
      />

      {/* Water Reminder Schedule Sheet Modal */}
      <WaterReminderSheet
        isOpen={isWaterModalOpen}
        onClose={() => setIsWaterModalOpen(false)}
        currentSchedule={waterSchedule}
        hasActiveSchedule={activeWaterCount > 0}
        onSaveSchedule={handleSaveWaterSchedule}
        onClearSchedule={handleClearWaterSchedule}
      />
    </div>
  );
}
