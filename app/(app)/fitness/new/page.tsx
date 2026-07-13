"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Dumbbell, Activity, Timer, Flame, Save } from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";

const WORKOUT_TYPES = [
  { id: "strength", label: "Strength", icon: Dumbbell, color: "text-[#007AFF]", bg: "bg-[#007AFF]/10", activeBg: "bg-[#007AFF]" },
  { id: "cardio", label: "Cardio", icon: Activity, color: "text-[#FF2D55]", bg: "bg-[#FF2D55]/10", activeBg: "bg-[#FF2D55]" },
  { id: "yoga", label: "Yoga", icon: Flame, color: "text-[#FF9500]", bg: "bg-[#FF9500]/10", activeBg: "bg-[#FF9500]" },
];

export default function LogWorkoutPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("strength");
  const [duration, setDuration] = useState("45");
  const [calories, setCalories] = useState("300");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Mock save delay
    setTimeout(() => {
      setIsSaving(false);
      router.back();
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">
      {/* Header */}
      <div className="safe-top px-5 pb-4 pt-4 flex items-center justify-between sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-md">
        <button 
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-transform active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-black text-[var(--color-text-primary)]">Log Workout</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 px-5 py-6 flex flex-col gap-8">
        
        {/* Workout Type */}
        <section>
          <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-4 uppercase tracking-wider">Workout Type</h2>
          <div className="grid grid-cols-3 gap-3">
            {WORKOUT_TYPES.map((type) => {
              const Icon = type.icon;
              const isActive = selectedType === type.id;
              
              return (
                <motion.button
                  key={type.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-2xl p-4 transition-all duration-300",
                    isActive 
                      ? `${type.activeBg} shadow-md shadow-${type.activeBg}/30` 
                      : "bg-[var(--color-bg-secondary)]"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300",
                    isActive ? "bg-white/20 text-white" : cn(type.bg, type.color)
                  )}>
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <span className={cn(
                    "text-[13px] font-bold transition-colors duration-300",
                    isActive ? "text-white" : "text-[var(--color-text-primary)]"
                  )}>
                    {type.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Metrics */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Metrics</h2>
          
          <div className="flex items-center rounded-2xl bg-[var(--color-bg-secondary)] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF] mr-4">
              <Timer className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[var(--color-text-secondary)]">Duration</p>
              <input 
                type="number" 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-transparent text-xl font-black text-[var(--color-text-primary)] outline-none"
                placeholder="0"
              />
            </div>
            <span className="text-sm font-bold text-[var(--color-text-tertiary)]">min</span>
          </div>

          <div className="flex items-center rounded-2xl bg-[var(--color-bg-secondary)] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF9500]/10 text-[#FF9500] mr-4">
              <Flame className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[var(--color-text-secondary)]">Calories</p>
              <input 
                type="number" 
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-transparent text-xl font-black text-[var(--color-text-primary)] outline-none"
                placeholder="0"
              />
            </div>
            <span className="text-sm font-bold text-[var(--color-text-tertiary)]">kcal</span>
          </div>
        </section>

      </div>

      {/* Save Button */}
      <div className="safe-bottom px-5 pb-6 pt-4 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-text-primary)] py-4 text-[15px] font-bold text-[var(--color-bg-primary)] shadow-lg shadow-black/10 transition-opacity disabled:opacity-70"
        >
          {isSaving ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-bg-primary)] border-t-transparent" />
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Workout
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
