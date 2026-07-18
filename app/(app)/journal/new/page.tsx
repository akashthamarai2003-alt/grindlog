"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Mic,
  Image as ImageIcon,
  Sparkles,
  Save,
  Loader2,
} from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";
import { MOODS } from "@/lib/constants";
import { useJournal } from "@/features/journal/hooks/use-journal";

export default function NewJournalPage() {
  const router = useRouter();
  const { todayEntry, createEntry } = useJournal();
  const [mood, setMood] = useState<number | null>(todayEntry?.mood ?? null);
  const [energy, setEnergy] = useState<number | null>(todayEntry?.energy ?? null);
  const [focus, setFocus] = useState<number | null>(todayEntry?.focus ?? null);
  const [content, setContent] = useState(todayEntry?.content ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    await createEntry({ content: content.trim(), mood, energy, focus });
    setIsSaving(false);
    router.push("/journal");
  };

  return (
  <div className="flex min-h-dvh flex-col safe-top">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]"
        >
          <ChevronLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </button>
        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </span>
        <button
          onClick={handleSave}
          disabled={!content.trim() || isSaving}
          className="text-sm font-semibold text-[var(--color-accent-green)] disabled:opacity-40"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save"
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="flex flex-1 flex-col gap-6 px-5 pt-6"
      >
        {/* Mood */}
        <div>
          <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
            How are you feeling?
          </p>
          <div className="flex justify-between">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(mood === m.value ? null : m.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-all",
                  mood === m.value
                    ? "scale-110 bg-[var(--color-accent-green-light)]"
                    : "bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]",
                )}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div>
          <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
            Energy Level
          </p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setEnergy(energy === lvl ? null : lvl)}
                className={cn(
                  "h-11 w-11 rounded-2xl text-lg transition-all",
                  energy && energy >= lvl
                    ? "scale-105 bg-[var(--color-xp)]/20"
                    : "bg-[var(--color-bg-secondary)]",
                )}
              >
                ⚡
              </button>
            ))}
          </div>
        </div>

        {/* Focus */}
        <div>
          <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
            Focus
          </p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFocus(focus === lvl ? null : lvl)}
                className={cn(
                  "h-11 w-11 rounded-2xl text-lg transition-all",
                  focus && focus >= lvl
                    ? "scale-105 bg-[var(--color-accent-green)]/20"
                    : "bg-[var(--color-bg-secondary)]",
                )}
              >
                🟢
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
            What&apos;s on your mind?
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Today was..."
            className="h-40 w-full resize-none rounded-2xl border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] p-4 text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none transition-colors focus:border-[var(--color-accent-green)]"
          />
        </div>

        {/* Media buttons */}
        <div className="flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--color-bg-secondary)] py-3.5 text-sm font-semibold text-[var(--color-text-secondary)]">
            <ImageIcon className="h-4 w-4" /> Add Photo
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--color-bg-secondary)] py-3.5 text-sm font-semibold text-[var(--color-text-secondary)]">
            <Mic className="h-4 w-4" /> Record Voice
          </button>
        </div>

        {/* AI Summary hint */}
        <div className="rounded-2xl border border-[var(--color-accent-blue)]/10 bg-gradient-to-br from-[var(--color-accent-blue-light)] to-[var(--color-bg-secondary)] p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--color-accent-blue)]" />
            <span className="text-xs font-semibold text-[var(--color-accent-blue)]">
              {todayEntry?.ai_summary
                ? todayEntry.ai_summary
                : "AI summary will be generated when you save"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Save button */}
      <div className="px-5 pb-8 safe-bottom pt-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSave}
          disabled={!content.trim() || isSaving}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent-green)] text-base font-semibold text-white shadow-lg shadow-[var(--color-accent-green)]/25 transition-all disabled:opacity-40"
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Entry
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
