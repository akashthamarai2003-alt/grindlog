"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Plus, Mic, Image as ImageIcon, BookOpen } from "lucide-react";
import { springs } from "@/animations/springs";
import { formatDate } from "@/lib/utils";
import { useJournal } from "@/features/journal/hooks/use-journal";
import { cn } from "@/lib/utils";

const MOOD_EMOJIS: Record<number, string> = {
  1: "😢",
  2: "😔",
  3: "😐",
  4: "😊",
  5: "😍",
};

export default function JournalPage() {
  const router = useRouter();
  const { entries, isLoading } = useJournal();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-5 px-5 pb-32 pt-4 safe-top">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="flex w-full items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            Journal
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {entries.length > 0
              ? `${entries.length} entries`
              : "Capture your thoughts & feelings"}
          </p>
        </div>
        <button
          onClick={() => router.push("/journal/new")}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent-green)] to-[#34C759] text-white shadow-lg shadow-[var(--color-accent-green)]/25 active:scale-90 transition-transform"
        >
          <Plus className="h-5 w-5" />
        </button>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-[var(--color-bg-secondary)]"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[32px] bg-gradient-to-br from-[var(--color-accent-green)] to-[#34C759] shadow-xl shadow-[var(--color-accent-green)]/20">
            <BookOpen className="h-10 w-10 text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black tracking-tight text-[var(--color-text-primary)]">
            No entries yet
          </h3>
          <p className="mt-2 text-[13px] font-bold text-[var(--color-text-secondary)]">
            Start journaling to track your journey
          </p>
          <button
            onClick={() => router.push("/journal/new")}
            className="mt-8 flex items-center gap-2 rounded-[20px] bg-gradient-to-br from-[var(--color-accent-green)] to-[#34C759] px-8 py-3.5 text-[13px] font-black text-white shadow-lg shadow-[var(--color-accent-green)]/25 transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={3} />
            Write First Entry
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry, i) => {
            const isExpanded = expandedId === entry.id;
            const isToday = entry.date === new Date().toISOString().split("T")[0];

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.default, delay: 0.1 + i * 0.04 }}
                className="flex flex-col gap-3 rounded-2xl bg-[var(--color-bg-secondary)] p-4 text-left shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                onClick={() => toggleExpand(entry.id)}
              >
                <div className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {formatDate(entry.date)}
                  </span>
                  <div className="flex items-center gap-2">
                    {entry.mood && (
                      <span className="text-sm">{MOOD_EMOJIS[entry.mood]}</span>
                    )}
                    {entry.energy && (
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        {Array.from({ length: 5 })
                          .map((_, j) => (j < entry.energy! ? "⚡" : "○"))
                          .join("")}
                      </span>
                    )}
                    {entry.focus && (
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        {Array.from({ length: 5 })
                          .map((_, j) => (j < entry.focus! ? "🟢" : "○"))
                          .join("")}
                      </span>
                    )}
                  </div>
                </div>

                <p className={cn("text-sm leading-relaxed text-[var(--color-text-secondary)]", !isExpanded && "line-clamp-2")}>
                  {entry.content || "No content"}
                </p>

                {isExpanded && entry.ai_summary && (
                  <div className="mt-2 rounded-xl bg-[var(--color-accent-blue)]/10 p-3">
                    <p className="text-xs font-medium leading-relaxed text-[var(--color-accent-blue)]">
                      <span className="font-bold">AI Insight:</span> {entry.ai_summary}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    {entry.photo_urls && entry.photo_urls.length > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-[var(--color-bg-tertiary)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">
                        <ImageIcon className="h-3 w-3" /> Photo
                      </span>
                    )}
                    {entry.voice_note_url && (
                      <span className="flex items-center gap-1 rounded-full bg-[var(--color-bg-tertiary)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">
                        <Mic className="h-3 w-3" /> Voice
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isExpanded && isToday && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push("/journal/new");
                        }}
                        className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-green)]"
                      >
                        Edit
                      </button>
                    )}
                    {entry.ai_sentiment && (
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          entry.ai_sentiment === "positive" && "text-[var(--color-accent-green)]",
                          entry.ai_sentiment === "neutral" && "text-[var(--color-warning)]",
                          entry.ai_sentiment === "negative" && "text-[var(--color-error)]",
                        )}
                      >
                        {entry.ai_sentiment}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* AI Insight Card */}
      {entries.length > 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.3 }}
          className="rounded-2xl border border-[var(--color-accent-blue)]/10 bg-gradient-to-br from-[var(--color-accent-blue-light)] to-[var(--color-bg-secondary)] p-5"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-blue)]">
              AI Insight
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
            Your mood has been trending upward this week. Morning runs correlate with your
            happiest days — keep that streak alive!
          </p>
        </motion.div>
      )}

      <div className="h-4" />
    </div>
  );
}
