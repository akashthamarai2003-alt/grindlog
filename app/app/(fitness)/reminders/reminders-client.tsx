"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Loader2, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Bell, 
  BellRing, 
  BellOff, 
  Droplets, 
  Check, 
  Sparkles,
  Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateRemindersAction } from "@/app/actions/fitness";
import { requestFirebaseNotificationPermission } from "@/lib/firebase/client";
import { ReminderTypeSheet, REMINDER_TYPES } from "@/components/fitness/reminders/reminder-type-sheet";
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

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function formatDaysSummary(days?: number[]): string {
  if (!days || days.length === 7) return "Every day";
  if (days.length === 0) return "No days selected";
  const weekdays = [1, 2, 3, 4, 5];
  const weekends = [0, 6];
  if (days.length === 5 && weekdays.every((d) => days.includes(d))) return "Weekdays (Mon - Fri)";
  if (days.length === 2 && weekends.every((d) => days.includes(d))) return "Weekends (Sat & Sun)";
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return [...days].sort().map((d) => dayNames[d]).join(", ");
}

function getEmojiForType(type: string): string {
  const found = REMINDER_TYPES.find((r) => r.id === type);
  return found?.icon || "⏰";
}

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
  const [devicePermission, setDevicePermission] = useState<NotificationPermission | "default">("default");
  const [isRegisteringDevice, setIsRegisteringDevice] = useState(false);

  // Check device notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setDevicePermission(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsRegisteringDevice(true);
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
          setDevicePermission("granted");
          toast.success("Device registered for push notifications! 🔔");
        } else {
          toast.error("Failed to register device token.");
        }
      } else {
        if (typeof Notification !== "undefined" && Notification.permission === "denied") {
          setDevicePermission("denied");
          toast.error("Notifications blocked in browser settings.");
        }
      }
    } catch (err: any) {
      console.error("Failed to request notification permission:", err);
      toast.error(err.message || "Failed to enable notifications.");
    } finally {
      setIsRegisteringDevice(false);
    }
  };

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

  // Separate interval water reminders from custom user reminders
  const waterReminders = useMemo(() => {
    return reminders.filter((r) => r.isWaterSchedule || (r.type === "Hydration" && Boolean(waterSchedule)));
  }, [reminders, waterSchedule]);

  const customReminders = useMemo(() => {
    return reminders.filter((r) => !r.isWaterSchedule && !(r.type === "Hydration" && Boolean(waterSchedule)));
  }, [reminders, waterSchedule]);

  const activeWaterCount = waterReminders.length;

  const waterScheduleSummary = useMemo(() => {
    if (waterSchedule && activeWaterCount > 0) {
      return `Every ${waterSchedule.interval} hr${waterSchedule.interval > 1 ? "s" : ""} · ${formatTo12Hour(waterSchedule.startTime)} - ${formatTo12Hour(waterSchedule.endTime)}`;
    }
    if (activeWaterCount > 0) {
      return `${activeWaterCount} reminders active · tap to edit`;
    }
    return "Every 2 hrs · set start & end";
  }, [waterSchedule, activeWaterCount]);

  const persistReminders = async (updatedReminders: ReminderItem[], nextEnabled?: boolean) => {
    setIsSaving(true);
    const targetEnabled = nextEnabled !== undefined ? nextEnabled : enabled;
    const res = await updateRemindersAction(targetEnabled, updatedReminders);
    setIsSaving(false);
    return res;
  };

  const handleToggleMaster = async () => {
    const next = !enabled;
    setEnabled(next);
    if (next && devicePermission === "default") {
      handleEnableNotifications();
    }
    await persistReminders(reminders, next);
    toast.success(next ? "Reminders enabled! 🔔" : "Reminders muted 🔕");
  };

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

    // Keep all custom non-water reminders
    const updated = [...customReminders, ...newWaterReminders].sort((a, b) => a.time.localeCompare(b.time));

    setReminders(updated);
    const config: WaterScheduleConfig = { startTime, endTime, interval };
    setWaterSchedule(config);

    try {
      localStorage.setItem("grindlog_water_schedule", JSON.stringify(config));
    } catch {}

    const res = await persistReminders(updated);
    if (res.success) {
      toast.success(`Water schedule updated! ${times.length} hydration check-ins set.`);
    } else {
      toast.error(res.error || "Failed to update reminders.");
    }
  };

  const handleClearWaterSchedule = async () => {
    setReminders(customReminders);
    setWaterSchedule(null);
    try {
      localStorage.removeItem("grindlog_water_schedule");
    } catch {}

    const res = await persistReminders(customReminders);
    if (res.success) {
      toast.success("Water reminder schedule turned off.");
    } else {
      toast.error(res.error || "Failed to update reminders.");
    }
  };

  const handleAddReminder = async () => {
    const newId = `custom_${Date.now()}`;
    const newReminder: ReminderItem = {
      id: newId,
      type: "Workout",
      time: "18:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      isWaterSchedule: false,
    };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    setEditingId(newId);
    await persistReminders(updated);
    toast.success("Added new reminder!");
  };

  const handleRemoveReminder = async (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    await persistReminders(updated);
    toast.success("Reminder removed.");
  };

  const handleTimeChange = async (id: string, newTime: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, time: newTime } : r));
    setReminders(updated);
    await persistReminders(updated);
  };

  const handleTypeSelect = async (newType: string) => {
    if (editingId) {
      const updated = reminders.map((r) => (r.id === editingId ? { ...r, type: newType } : r));
      setReminders(updated);
      await persistReminders(updated);
      toast.success(`Reminder set to ${newType}!`);
    }
  };

  const handleToggleDay = async (id: string, dayIndex: number) => {
    const updated = reminders.map((r) => {
      if (r.id !== id) return r;
      const currentDays = r.days ?? [0, 1, 2, 3, 4, 5, 6];
      const newDays = currentDays.includes(dayIndex)
        ? currentDays.filter((d) => d !== dayIndex)
        : [...currentDays, dayIndex];
      return { ...r, days: newDays };
    });
    setReminders(updated);
    await persistReminders(updated);
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    const res = await updateRemindersAction(enabled, reminders);
    setIsSaving(false);
    if (res.success) {
      toast.success("All reminder settings saved!");
    } else {
      toast.error(res.error || "Failed to update reminders.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1108] text-white selection:bg-[#ADFF00] selection:text-black">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-[#0A1108]/90 backdrop-blur-md border-b border-white/5 px-4 py-3.5 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-white font-black text-lg hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Set Reminders</span>
        </button>

        <button
          onClick={handleUpdate}
          disabled={isSaving}
          className="px-4 py-1.5 rounded-full bg-[#ADFF00] hover:bg-[#9BE600] active:scale-95 text-black font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(173,255,0,0.2)] disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
          <span>{isSaving ? "Saving..." : "Save"}</span>
        </button>
      </header>

      <main className="px-4 sm:px-5 py-5 max-w-md mx-auto space-y-6 pb-24">
        {/* Permission Banner if device notifications not granted */}
        {devicePermission !== "granted" && (
          <div className="bg-[#182313] border border-[#ADFF00]/30 rounded-2xl p-4 flex items-start gap-3.5 shadow-[0_0_20px_rgba(173,255,0,0.06)]">
            <div className="w-10 h-10 rounded-xl bg-[#ADFF00]/15 border border-[#ADFF00]/30 flex items-center justify-center shrink-0 text-[#ADFF00]">
              {devicePermission === "denied" ? <BellOff className="w-5 h-5 text-red-400" /> : <BellRing className="w-5 h-5 text-[#ADFF00]" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-sm">
                {devicePermission === "denied" ? "Device Notifications Blocked" : "Enable Device Notifications"}
              </h4>
              <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
                {devicePermission === "denied" 
                  ? "Notifications are blocked in browser settings. Tap the tune/lock icon in your address bar to allow alerts."
                  : "Allow push notifications so this device receives workout and water schedule alerts."}
              </p>
              {devicePermission !== "denied" && (
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  disabled={isRegisteringDevice}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#ADFF00] hover:bg-[#9BE600] active:scale-95 text-black font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(173,255,0,0.2)] cursor-pointer"
                >
                  {isRegisteringDevice && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Allow Notifications
                </button>
              )}
            </div>
          </div>
        )}

        {/* Master Notifications Toggle Card */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${enabled ? "bg-[#ADFF00]/15 text-[#ADFF00]" : "bg-white/5 text-gray-500"}`}>
              {enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-[15px]">Reminders</span>
                {devicePermission === "granted" && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#ADFF00]/15 text-[#ADFF00] px-2 py-0.5 rounded-full border border-[#ADFF00]/30">
                    Push Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {enabled ? "Active for scheduled workout & habit alerts" : "All reminder notifications muted"}
              </p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={handleToggleMaster}
            className={`w-12 h-7 rounded-full flex items-center transition-colors px-1 cursor-pointer shrink-0 ${enabled ? "bg-[#ADFF00]" : "bg-gray-700"}`}
            title={enabled ? "Turn reminders off" : "Turn reminders on"}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform shadow-md ${enabled ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        {/* SECTION 1: Automated Water Reminder Schedule Card */}
        <div className="bg-[#081F24] border border-[#00D2FF]/30 hover:border-[#00D2FF]/50 rounded-2xl p-4 sm:p-5 transition-all shadow-[0_0_24px_rgba(0,210,255,0.08)]">
          <div className="flex items-start justify-between gap-2.5">
            <div 
              onClick={() => setIsWaterModalOpen(true)}
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
            >
              <div className="w-10 h-10 rounded-xl bg-[#00D2FF]/15 border border-[#00D2FF]/30 flex items-center justify-center shrink-0 text-[#00D2FF]">
                <Droplets className="w-5 h-5 text-[#00D2FF]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-extrabold text-sm tracking-tight truncate">
                    Water reminder schedule
                  </h4>
                  {activeWaterCount > 0 ? (
                    <span className="text-[10px] font-black tracking-wider bg-[#00D2FF]/20 text-[#00D2FF] px-2 py-0.5 rounded-full border border-[#00D2FF]/30 shrink-0">
                      {activeWaterCount} Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400">Off</span>
                  )}
                </div>
                <p className="text-xs text-[#00D2FF]/85 font-medium truncate mt-0.5">
                  {waterScheduleSummary}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsWaterModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#00D2FF]/15 hover:bg-[#00D2FF]/25 active:scale-95 text-[#00D2FF] font-black text-xs transition-all border border-[#00D2FF]/30 shrink-0 cursor-pointer"
            >
              {activeWaterCount > 0 ? "Edit" : "Set"}
            </button>
          </div>

          {/* Horizontal Active Times Pill Preview */}
          {activeWaterCount > 0 && (
            <div className="mt-4 pt-3.5 border-t border-[#00D2FF]/15">
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <span className="text-[11px] font-semibold text-gray-400">Scheduled Check-ins</span>
                <span className="text-[11px] font-black text-[#00D2FF]">{activeWaterCount} times daily</span>
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {waterReminders.map((wr) => (
                    <span
                      key={wr.id}
                      className="text-[11px] font-black px-3 py-1.5 rounded-xl bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/25 shrink-0 shadow-sm"
                    >
                      {formatTo12Hour(wr.time)}
                    </span>
                  ))}
                </div>
                {/* Subtle Edge Fade to hint at horizontal swipe */}
                <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-[#081F24] to-transparent" />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Custom Daily Reminders (Workouts, Meals & Habits) */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Custom Daily Reminders</h3>
              {customReminders.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                  {customReminders.length}
                </span>
              )}
            </div>

            <button 
              type="button"
              onClick={handleAddReminder}
              className="flex items-center gap-1 text-[#ADFF00] hover:text-[#9BE600] font-extrabold text-xs bg-[#1A2619] hover:bg-[#202E25] px-3 py-1.5 rounded-full border border-[#ADFF00]/25 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Reminder</span>
            </button>
          </div>

          {/* Empty State */}
          {customReminders.length === 0 && (
            <div className="bg-[#121E12]/60 border border-dashed border-white/10 rounded-2xl p-6 text-center">
              <div className="w-11 h-11 rounded-xl bg-white/5 mx-auto flex items-center justify-center text-gray-400 mb-2.5">
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-white font-bold text-sm">No custom reminders yet</p>
              <p className="text-gray-400 text-xs mt-1 max-w-xs mx-auto">
                Schedule your workout, breakfast, lunch, or bedtime check-ins.
              </p>
              <button
                type="button"
                onClick={handleAddReminder}
                className="mt-4 px-4 py-2 rounded-xl bg-[#ADFF00] hover:bg-[#9BE600] text-black font-black text-xs transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                Add Your First Reminder
              </button>
            </div>
          )}

          {/* Custom Reminders List */}
          <div className="space-y-3">
            {customReminders.map((reminder) => (
              <div 
                key={reminder.id} 
                className="bg-[#121E12] border border-[#1A2619] hover:border-[#ADFF00]/30 rounded-2xl p-4 transition-all shadow-sm"
              >
                {/* Top Row: Type & Time Picker */}
                <div className="flex items-center justify-between gap-2.5">
                  {/* Type Selector Button */}
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingId(reminder.id);
                      setIsSheetOpen(true);
                    }}
                    className="flex items-center gap-2.5 hover:opacity-85 transition-opacity text-left min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="text-2xl shrink-0">{getEmojiForType(reminder.type)}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-white font-bold text-sm truncate">{reminder.type}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      </div>
                      <span className="text-gray-400 text-xs block truncate mt-0.5">
                        {formatDaysSummary(reminder.days)}
                      </span>
                    </div>
                  </button>

                  {/* Time Chip with Native Time Picker & Trash */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative bg-[#1A2619] hover:bg-[#202E25] border border-white/5 hover:border-[#ADFF00]/40 rounded-xl px-3 py-2 flex items-center gap-2 transition-all cursor-pointer group">
                      <Clock className="w-3.5 h-3.5 text-[#ADFF00]" />
                      <span className="text-white font-black text-sm tracking-wide">
                        {formatTo12Hour(reminder.time)}
                      </span>
                      <input 
                        type="time" 
                        value={reminder.time}
                        onChange={(e) => handleTimeChange(reminder.id, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleRemoveReminder(reminder.id)}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Days of Week Selection Row */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  {WEEK_DAYS.map((dayLabel, dayIndex) => {
                    const isSelected = (reminder.days ?? [0, 1, 2, 3, 4, 5, 6]).includes(dayIndex);
                    return (
                      <button
                        key={dayIndex}
                        type="button"
                        onClick={() => handleToggleDay(reminder.id, dayIndex)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-[#ADFF00] text-black shadow-[0_0_8px_rgba(173,255,0,0.25)]" 
                            : "bg-[#172318] text-gray-400 hover:text-white border border-white/5"
                        }`}
                        title={`Toggle ${dayLabel}`}
                      >
                        {dayLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grounded Save Button at end of content (Never overlaps cards) */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isSaving}
            className="w-full py-4 bg-[#ADFF00] hover:bg-[#9BE600] active:scale-[0.98] text-black font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(173,255,0,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving settings...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save All Reminders</span>
              </>
            )}
          </button>
        </div>
      </main>

      {/* Reminder Type Selection Bottom Sheet */}
      <ReminderTypeSheet 
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSelect={handleTypeSelect}
      />

      {/* Water Reminder Schedule Modal Bottom Sheet */}
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
