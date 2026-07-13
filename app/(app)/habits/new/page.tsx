"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/services/supabase/client";
import { useAuthStore } from "@/store/auth-store";

export default function CreateHabitPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💧");
  const [targetCount, setTargetCount] = useState(1);
  const [targetUnit, setTargetUnit] = useState("times");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required");
    if (!user) return setError("Not authenticated");

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("habits").insert({
        user_id: user.id,
        name: name.trim(),
        emoji,
        target_count: targetCount,
        target_unit: targetUnit.trim() || "times",
        color: "#34c759",
      } as any);

      if (insertError) throw insertError;

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create habit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh px-5 pb-8 pt-4 safe-top bg-[var(--color-bg-primary)]">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">New Habit</h1>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500 font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-[var(--color-text-secondary)]">Habit Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Drink Water"
            className="rounded-2xl border-none bg-[var(--color-bg-secondary)] p-4 text-[16px] font-semibold text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--color-accent-green)]"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-2 w-1/3">
            <label className="text-sm font-bold text-[var(--color-text-secondary)]">Emoji</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="rounded-2xl border-none bg-[var(--color-bg-secondary)] p-4 text-[16px] font-semibold text-[var(--color-text-primary)] text-center outline-none focus:ring-2 focus:ring-[var(--color-accent-green)]"
            />
          </div>
          
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-bold text-[var(--color-text-secondary)]">Target</label>
            <div className="flex rounded-2xl bg-[var(--color-bg-secondary)] focus-within:ring-2 focus-within:ring-[var(--color-accent-green)] overflow-hidden">
              <input
                type="number"
                min="1"
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                className="w-16 border-none bg-transparent p-4 text-[16px] font-semibold text-[var(--color-text-primary)] outline-none text-center"
              />
              <input
                type="text"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                placeholder="times"
                className="flex-1 border-none bg-transparent p-4 text-[16px] font-semibold text-[var(--color-text-primary)] outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent-green)] p-4 font-bold text-white transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Habit
            </>
          )}
        </button>
      </form>
    </div>
  );
}
