"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Target, Calendar, Save, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewGoalPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!title || !target) return;
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
        <h1 className="text-lg font-black text-[var(--color-text-primary)]">New Objective</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 px-5 py-6 flex flex-col gap-6">
        
        {/* Title Input */}
        <section>
          <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Goal Title</h2>
          <div className="flex items-center rounded-2xl bg-[var(--color-bg-secondary)] p-4 ring-1 ring-[var(--color-bg-tertiary)] focus-within:ring-[var(--color-accent-blue)] transition-shadow">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF] mr-4">
              <Target className="h-5 w-5" />
            </div>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-lg font-bold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
              placeholder="e.g. Read 50 Books"
            />
          </div>
        </section>

        {/* Target & Unit */}
        <section className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Target</h2>
            <div className="flex items-center rounded-2xl bg-[var(--color-bg-secondary)] p-4 ring-1 ring-[var(--color-bg-tertiary)] focus-within:ring-[#FF9500] transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF9500]/10 text-[#FF9500] mr-3">
                <Hash className="h-5 w-5" />
              </div>
              <input 
                type="number" 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-transparent text-lg font-bold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
                placeholder="50"
              />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Unit</h2>
            <div className="flex items-center rounded-2xl bg-[var(--color-bg-secondary)] p-4 ring-1 ring-[var(--color-bg-tertiary)] focus-within:ring-[#34C759] transition-shadow">
              <input 
                type="text" 
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-transparent text-lg font-bold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
                placeholder="books"
              />
            </div>
          </div>
        </section>

        {/* Deadline */}
        <section>
          <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Deadline</h2>
          <div className="flex items-center rounded-2xl bg-[var(--color-bg-secondary)] p-4 ring-1 ring-[var(--color-bg-tertiary)] focus-within:ring-[#AF52DE] transition-shadow">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#AF52DE]/10 text-[#AF52DE] mr-4">
              <Calendar className="h-5 w-5" />
            </div>
            <input 
              type="date" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-transparent text-[15px] font-bold text-[var(--color-text-primary)] outline-none"
            />
          </div>
        </section>

      </div>

      {/* Save Button */}
      <div className="safe-bottom px-5 pb-6 pt-4 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={isSaving || !title || !target}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-text-primary)] py-4 text-[15px] font-bold text-[var(--color-bg-primary)] shadow-lg shadow-black/10 transition-opacity disabled:opacity-50"
        >
          {isSaving ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-bg-primary)] border-t-transparent" />
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Goal
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
