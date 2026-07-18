"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Dumbbell,
  Activity,
  Timer,
  Flame,
  Save,
  Footprints,
  Bike,
  Waves,
  Zap,
  Calendar,
  Gauge,
  Repeat,
  MapPin,
  Check,
  StickyNote,
  Sparkles,
} from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";

import { createClient } from "@/lib/services/supabase/client";

const WORKOUT_TYPES = [
  { id: "strength", label: "Strength", icon: Dumbbell, color: "text-[#007AFF]", bg: "bg-[#007AFF]/10", hex: "#007AFF" },
  { id: "cardio", label: "Cardio", icon: Activity, color: "text-[#FF2D55]", bg: "bg-[#FF2D55]/10", hex: "#FF2D55" },
  { id: "yoga", label: "Yoga", icon: Flame, color: "text-[#FF9500]", bg: "bg-[#FF9500]/10", hex: "#FF9500" },
  { id: "walking", label: "Walking", icon: Footprints, color: "text-[#34C759]", bg: "bg-[#34C759]/10", hex: "#34C759" },
  { id: "cycling", label: "Cycling", icon: Bike, color: "text-[#5856D6]", bg: "bg-[#5856D6]/10", hex: "#5856D6" },
  { id: "swimming", label: "Swimming", icon: Waves, color: "text-[#00C7BE]", bg: "bg-[#00C7BE]/10", hex: "#00C7BE" },
  { id: "hiit", label: "HIIT", icon: Zap, color: "text-[#FFD60A]", bg: "bg-[#FFD60A]/10", hex: "#FFD60A" },
];

const INTENSITY_LEVELS = [
  { id: "low", label: "Low", multiplier: 0.7 },
  { id: "medium", label: "Medium", multiplier: 1 },
  { id: "high", label: "High", multiplier: 1.4 },
];

const DURATION_PRESETS = [15, 30, 45, 60, 90];

// rough MET-based calorie estimate per minute (assuming ~70kg person)
const MET_BASE: Record<string, number> = {
  strength: 6,
  cardio: 8,
  yoga: 3,
  walking: 4,
  cycling: 7,
  swimming: 9,
  hiit: 10,
};

const DATE_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
];

function estimateCalories(type: string, minutes: number, intensityMultiplier: number) {
  const met = MET_BASE[type] || 6;
  return Math.round(met * minutes * intensityMultiplier);
}

function getDateIso(option: string) {
  const d = new Date();
  if (option === "yesterday") d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export default function LogWorkoutPage() {
  const router = useRouter();
  const supabase = createClient();

  const [selectedType, setSelectedType] = useState("strength");
  const [duration, setDuration] = useState(45);
  const [calories, setCalories] = useState("300");
  const [caloriesTouched, setCaloriesTouched] = useState(false);
  const [intensity, setIntensity] = useState("medium");
  const [dateOption, setDateOption] = useState("today");
  const [notes, setNotes] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [distance, setDistance] = useState("5");

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const activeType = WORKOUT_TYPES.find((t) => t.id === selectedType)!;
  const isDistanceType = ["cardio", "cycling", "swimming", "walking"].includes(selectedType);
  const isStrengthType = selectedType === "strength";

  const intensityMultiplier = INTENSITY_LEVELS.find((i) => i.id === intensity)!.multiplier;

  const suggestedCalories = useMemo(
    () => estimateCalories(selectedType, duration, intensityMultiplier),
    [selectedType, duration, intensityMultiplier]
  );

  function applySuggestedCalories() {
    setCalories(String(suggestedCalories));
    setCaloriesTouched(true);
  }

  function handleTypeSelect(id: string) {
    setSelectedType(id);
    if (!caloriesTouched) {
      setCalories(String(estimateCalories(id, duration, intensityMultiplier)));
    }
  }

  function handleDurationChange(val: number) {
    setDuration(val);
    if (!caloriesTouched) {
      setCalories(String(estimateCalories(selectedType, val, intensityMultiplier)));
    }
  }

  function handleIntensityChange(id: string) {
    setIntensity(id);
    const mult = INTENSITY_LEVELS.find((i) => i.id === id)!.multiplier;
    if (!caloriesTouched) {
      setCalories(String(estimateCalories(selectedType, duration, mult)));
    }
  }

  const isValid = duration > 0 && Number(calories) >= 0;

  const handleSave = async () => {
    if (!isValid) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsSaving(false);
      return;
    }

    const payload: Record<string, any> = {
      user_id: user.id,
      workout_type: selectedType,
      duration_minutes: duration,
      calories_burned: Number(calories) || 0,
      date: getDateIso(dateOption),
      intensity,
      notes: notes || null,
    };

    if (isStrengthType) {
      payload.sets = Number(sets) || null;
      payload.reps = Number(reps) || null;
    }
    if (isDistanceType) {
      payload.distance_km = Number(distance) || null;
    }

    const { error } = await supabase.from("fitness_logs").insert(payload as any);

    setIsSaving(false);

    if (!error) {
      setShowSuccess(true);
      setTimeout(() => {
        router.back();
        router.refresh();
      }, 1100);
    } else {
      console.error(error);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
  <div className="relative flex flex-col min-h-dvh ">
      {/* Ambient color wash based on selected type */}
      <motion.div
        animate={{ background: `radial-gradient(circle at 50% 0%, ${activeType.hex}22, transparent 60%)` }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none absolute inset-x-0 top-0 h-72 z-0"
      />

      {/* Header */}
      <div className="relative z-10 safe-top px-5 pb-4 pt-4 flex items-center justify-between sticky top-0 bg-[var(--color-bg-primary)]/80 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-transform active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-black text-[var(--color-text-primary)]">Log Workout</h1>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex-1 px-5 py-6 flex flex-col gap-8 overflow-y-auto">
        {/* Workout Type */}
        <section>
          <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-4 uppercase tracking-wider">
            Workout Type
          </h2>
          <div className="grid grid-cols-4 gap-2.5">
            {WORKOUT_TYPES.map((type, i) => {
              const Icon = type.icon;
              const isActive = selectedType === type.id;

              return (
                <motion.button
                  key={type.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...springs.default, delay: i * 0.04 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => handleTypeSelect(type.id)}
                  className="relative flex flex-col items-center justify-center gap-2 rounded-2xl p-3 overflow-hidden"
                >
                  {isActive && (
                    <motion.div
                      layoutId="typeBg"
                      transition={springs.default}
                      className="absolute inset-0 rounded-2xl"
                      style={{ backgroundColor: type.hex }}
                    />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-[var(--color-bg-secondary)]" />
                  )}
                  <div
                    className={cn(
                      "relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300",
                      isActive ? "bg-white/20 text-white" : cn(type.bg, type.color)
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" strokeWidth={2.5} />
                  </div>
                  <span
                    className={cn(
                      "relative z-10 text-[11px] font-bold transition-colors duration-300",
                      isActive ? "text-white" : "text-[var(--color-text-primary)]"
                    )}
                  >
                    {type.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Date */}
        <section>
          <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-4 uppercase tracking-wider">
            Date
          </h2>
          <div className="flex gap-2">
            {DATE_OPTIONS.map((opt) => {
              const isActive = dateOption === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDateOption(opt.id)}
                  className={cn(
                    "relative flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-colors duration-300",
                    isActive
                      ? "bg-[var(--color-text-primary)] text-[var(--color-bg-primary)]"
                      : "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  {opt.label}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Intensity */}
        <section>
          <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-4 uppercase tracking-wider">
            Intensity
          </h2>
          <div className="flex items-center gap-1 rounded-full bg-[var(--color-bg-secondary)] p-1">
            {INTENSITY_LEVELS.map((level) => {
              const isActive = intensity === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => handleIntensityChange(level.id)}
                  className="relative flex-1 rounded-full py-2.5 text-xs font-bold transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="intensityPill"
                      transition={springs.default}
                      className="absolute inset-0 rounded-full shadow-sm"
                      style={{ backgroundColor: activeType.hex }}
                    />
                  )}
                  <span className={cn("relative z-10", isActive ? "text-white" : "text-[var(--color-text-secondary)]")}>
                    {level.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Duration slider + presets */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Duration
            </h2>
            <span className="text-sm font-black text-[var(--color-text-primary)]">{duration} min</span>
          </div>

          <div className="rounded-2xl bg-[var(--color-bg-secondary)] p-4 mb-3">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${activeType.hex}1A`, color: activeType.hex }}
              >
                <Timer className="h-5 w-5" />
              </div>
              <div className="relative h-2 flex-1 rounded-full bg-[var(--color-bg-tertiary)]">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: activeType.hex }}
                  animate={{ width: `${Math.min((duration / 120) * 100, 100)}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <input
                  type="range"
                  min={0}
                  max={120}
                  step={5}
                  value={duration}
                  onChange={(e) => handleDurationChange(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
                <motion.div
                  className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-md ring-2"
                  style={{ borderColor: activeType.hex } as any}
                  animate={{ left: `calc(${Math.min((duration / 120) * 100, 100)}% - 10px)` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              {DURATION_PRESETS.map((preset) => (
                <motion.button
                  key={preset}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleDurationChange(preset)}
                  className={cn(
                    "flex-1 rounded-xl py-2 text-xs font-bold transition-colors duration-200",
                    duration === preset
                      ? "text-white"
                      : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]"
                  )}
                  style={duration === preset ? { backgroundColor: activeType.hex } : undefined}
                >
                  {preset}m
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Type-specific fields */}
        <AnimatePresence mode="wait">
          {isStrengthType && (
            <motion.section
              key="strength-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={springs.default}
              className="overflow-hidden"
            >
              <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-4 uppercase tracking-wider">
                Sets & Reps
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center rounded-2xl bg-[var(--color-bg-secondary)] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF] mr-3">
                    <Repeat className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[var(--color-text-secondary)]">Sets</p>
                    <input
                      type="number"
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                      className="w-full bg-transparent text-lg font-black text-[var(--color-text-primary)] outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center rounded-2xl bg-[var(--color-bg-secondary)] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF] mr-3">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[var(--color-text-secondary)]">Reps</p>
                    <input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="w-full bg-transparent text-lg font-black text-[var(--color-text-primary)] outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {isDistanceType && (
            <motion.section
              key="distance-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={springs.default}
              className="overflow-hidden"
            >
              <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-4 uppercase tracking-wider">
                Distance
              </h2>
              <div className="flex items-center rounded-2xl bg-[var(--color-bg-secondary)] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5856D6]/10 text-[#5856D6] mr-4">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[var(--color-text-secondary)]">Distance</p>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full bg-transparent text-xl font-black text-[var(--color-text-primary)] outline-none"
                    placeholder="0"
                  />
                </div>
                <span className="text-sm font-bold text-[var(--color-text-tertiary)]">km</span>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Calories */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Calories
          </h2>

          <div className="flex items-center rounded-2xl bg-[var(--color-bg-secondary)] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF9500]/10 text-[#FF9500] mr-4">
              <Flame className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[var(--color-text-secondary)]">Burned</p>
              <input
                type="number"
                value={calories}
                onChange={(e) => {
                  setCalories(e.target.value);
                  setCaloriesTouched(true);
                }}
                className="w-full bg-transparent text-xl font-black text-[var(--color-text-primary)] outline-none"
                placeholder="0"
              />
            </div>
            <span className="text-sm font-bold text-[var(--color-text-tertiary)]">kcal</span>
          </div>

          <AnimatePresence>
            {Number(calories) !== suggestedCalories && (
              <motion.button
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={springs.default}
                onClick={applySuggestedCalories}
                className="flex items-center gap-1.5 self-start rounded-full bg-[var(--color-bg-tertiary)] px-3 py-1.5 text-xs font-bold text-[var(--color-text-secondary)]"
              >
                <Sparkles className="h-3.5 w-3.5" style={{ color: activeType.hex }} />
                Suggest {suggestedCalories} kcal
              </motion.button>
            )}
          </AnimatePresence>
        </section>

        {/* Notes */}
        <section>
          <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-4 uppercase tracking-wider">
            Notes
          </h2>
          <div className="flex items-start rounded-2xl bg-[var(--color-bg-secondary)] p-4">
            <StickyNote className="h-5 w-5 text-[var(--color-text-tertiary)] mr-3 mt-0.5 shrink-0" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it feel? Any PRs?"
              rows={3}
              className="w-full resize-none bg-transparent text-sm font-medium text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
          </div>
        </section>
      </div>

      {/* Save Button */}
      <div className="relative z-10 safe-bottom px-5 pb-6 pt-4 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent">
        <motion.button
          animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
          transition={shake ? { duration: 0.4 } : springs.default}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold text-white shadow-lg transition-opacity disabled:opacity-70"
          style={{ backgroundColor: activeType.hex, boxShadow: `0 10px 30px -10px ${activeType.hex}66` }}
        >
          {isSaving ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Workout
            </>
          )}
        </motion.button>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-primary)]/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 15 }}
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: activeType.hex }}
              >
                <motion.div
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                >
                  <Check className="h-10 w-10 text-white" strokeWidth={3} />
                </motion.div>
              </motion.div>
              <p className="text-base font-black text-[var(--color-text-primary)]">Workout logged!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}