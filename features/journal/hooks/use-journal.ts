"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/services/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import type { JournalEntry } from "@/types";

export function useJournal() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const userId = useAuthStore((s) => s.user?.id);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const { data, error: err } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(30);

    if (err) setError(err.message);
    if (data) setEntries(data as JournalEntry[]);
    setIsLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = async (entry: {
    content: string;
    mood: number | null;
    energy: number | null;
    focus: number | null;
  }) => {
    if (!userId) return null;
    const today = new Date().toISOString().split("T")[0];

    const { data, error: err } = await supabase
      .from("journal_entries")
      .upsert({
        user_id: userId,
        date: today,
        content: entry.content,
        mood: entry.mood,
        energy: entry.energy,
        focus: entry.focus,
      } as any)
      .select()
      .single();

    if (err) {
      setError(err.message);
      return null;
    }

    await fetchEntries();
    return data as JournalEntry;
  };

  const getTodayEntry = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return entries.find((e) => e.date === today) || null;
  }, [entries]);

  return {
    entries,
    todayEntry: getTodayEntry(),
    isLoading,
    error,
    createEntry,
    refetch: fetchEntries,
  };
}
