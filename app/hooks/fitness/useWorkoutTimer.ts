import { useState, useEffect, useRef, useCallback } from "react";

// Maximum realistic workout duration (4 hours = 14,400 seconds)
export const MAX_WORKOUT_SECONDS = 4 * 3600;

// Maximum idle gap before treating an open tab as abandoned (2 hours)
export const MAX_IDLE_GAP_SECONDS = 2 * 3600;

/**
 * Cleanly format seconds into MM:SS (under 1 hour) or HH:MM:SS (1 hour or more).
 * Guaranteed to never display runaway uncapped minutes like 1615:01.
 */
export function formatWorkoutTime(seconds: number): string {
  const clamped = Math.max(0, Math.min(Math.floor(seconds), MAX_WORKOUT_SECONDS));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${pad(minutes)}:${pad(secs)}`;
}

/**
 * Remove local storage timer data for a workout when finished or discarded.
 */
export function clearWorkoutTimer(workoutId: string) {
  if (typeof window === "undefined" || !workoutId) return;
  try {
    localStorage.removeItem(`workout_timer_${workoutId}`);
  } catch (e) {
    console.error("Failed to clear workout timer from localStorage", e);
  }
}

export function useWorkoutTimer(
  workoutId?: string,
  startedAt?: string | null,
  isPaused?: boolean,
  sessionId?: string,
  onVisibilityPause?: () => void,
  onVisibilityResume?: () => void
) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hiddenAtRef = useRef<number | null>(null);

  // Save current elapsed to localStorage as paused
  const saveAsPaused = useCallback((currentElapsed: number) => {
    if (!workoutId) return;
    const storageKey = `workout_timer_${workoutId}`;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ elapsed: currentElapsed, lastTick: Date.now(), isPaused: true })
      );
    } catch { /* ignore */ }
  }, [workoutId]);

  // Handle page visibility change — auto-pause when user leaves, auto-resume when they return
  useEffect(() => {
    if (!workoutId || !startedAt || !sessionId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page hidden → pause the timer and notify parent to pause session in DB
        hiddenAtRef.current = Date.now();
        
        // Stop the interval immediately
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Save current elapsed as paused in localStorage
        setElapsed(prev => {
          saveAsPaused(prev);
          return prev;
        });

        // Notify parent component to pause the session in DB
        if (onVisibilityPause && !isPaused) {
          onVisibilityPause();
        }
      } else {
        // Page visible again → resume
        hiddenAtRef.current = null;

        // Notify parent component to resume the session in DB
        if (onVisibilityResume && isPaused) {
          onVisibilityResume();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [workoutId, startedAt, sessionId, isPaused, onVisibilityPause, onVisibilityResume, saveAsPaused]);

  useEffect(() => {
    if (!workoutId || !startedAt) return;

    const storageKey = `workout_timer_${workoutId}`;
    const startedAtMs = new Date(startedAt).getTime();
    const nowMs = Date.now();
    const rawElapsedSinceStart = Math.floor((nowMs - startedAtMs) / 1000);

    // Stale check: If startedAt is older than 4 hours, purge stale cache and reset
    if (rawElapsedSinceStart > MAX_WORKOUT_SECONDS || rawElapsedSinceStart < 0) {
      clearWorkoutTimer(workoutId);
      setElapsed(0);
      return;
    }

    let currentElapsed = 0;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const lastTick = parsed.lastTick || nowMs;
        const idleDiff = Math.floor((nowMs - lastTick) / 1000);

        // If the tab was suspended for more than 2 hours or saved elapsed exceeds max, discard stale cache
        if (idleDiff > MAX_IDLE_GAP_SECONDS || (parsed.elapsed || 0) > MAX_WORKOUT_SECONDS) {
          clearWorkoutTimer(workoutId);
          currentElapsed = Math.min(rawElapsedSinceStart, MAX_WORKOUT_SECONDS);
        } else {
          currentElapsed = parsed.elapsed || 0;
          // Don't add idle time if timer was paused — this is the key fix
          // When user left the page, we saved as paused, so idleDiff should NOT accumulate
          if (!parsed.isPaused && !isPaused) {
            currentElapsed += Math.max(0, idleDiff);
          }
        }
      } catch {
        currentElapsed = Math.max(0, Math.min(rawElapsedSinceStart, MAX_WORKOUT_SECONDS));
      }
    } else {
      currentElapsed = Math.max(0, Math.min(rawElapsedSinceStart, MAX_WORKOUT_SECONDS));
    }

    currentElapsed = Math.min(currentElapsed, MAX_WORKOUT_SECONDS);
    setElapsed(currentElapsed);

    if (isPaused) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ elapsed: currentElapsed, lastTick: Date.now(), isPaused: true })
      );
      // Clear any running interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Clear previous interval before starting new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev >= MAX_WORKOUT_SECONDS) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return MAX_WORKOUT_SECONDS;
        }
        const next = prev + 1;
        localStorage.setItem(
          storageKey,
          JSON.stringify({ elapsed: next, lastTick: Date.now(), isPaused: false })
        );
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [workoutId, startedAt, isPaused]);

  return { 
    elapsed, 
    formattedTime: formatWorkoutTime(elapsed) 
  };
}
