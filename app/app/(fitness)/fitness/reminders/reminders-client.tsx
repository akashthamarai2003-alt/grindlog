"use client";

import { useState } from "react";
import { ArrowLeft, Trash2, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateRemindersAction } from "@/app/actions/fitness";
import { ReminderTypeSheet } from "@/components/fitness/reminders/reminder-type-sheet";

interface ReminderItem {
  id: string;
  type: string;
  time: string;
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

  const handleAddReminder = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setReminders([...reminders, { id: newId, type: "Breakfast", time: "08:00" }]);
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
        <div className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-5 mb-8 flex items-center justify-between">
          <span className="font-bold text-white text-[15px]">Reminders</span>
          
          <button 
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-7 rounded-full flex items-center transition-colors px-1 ${enabled ? 'bg-[#ADFF00]' : 'bg-gray-600'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

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
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0A1108] via-[#0A1108] to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            onClick={handleUpdate}
            disabled={isSaving}
            className="w-full py-4 bg-white text-black font-extrabold text-[15px] rounded-full shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
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

      {/* Sheet */}
      <ReminderTypeSheet 
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSelect={handleTypeSelect}
      />
    </div>
  );
}
