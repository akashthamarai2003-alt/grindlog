import { useState, useEffect } from "react";
export function useWorkoutTimer(workoutId?: string, startedAt?: string | null, isPaused?: boolean) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!workoutId || !startedAt) return;

    const storageKey = `workout_timer_${workoutId}`;
    const saved = localStorage.getItem(storageKey);
    let currentElapsed = 0;
    let lastTick = Date.now();

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        currentElapsed = parsed.elapsed || 0;
        lastTick = parsed.lastTick || Date.now();
        
        if (!parsed.isPaused && !isPaused) {
          const diff = Math.floor((Date.now() - lastTick) / 1000);
          currentElapsed += diff;
        }
      } catch (e) {}
    } else {
      currentElapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    }

    setElapsed(Math.max(0, currentElapsed));

    if (isPaused) {
      localStorage.setItem(storageKey, JSON.stringify({ elapsed: currentElapsed, lastTick: Date.now(), isPaused: true }));
      return;
    }

    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        localStorage.setItem(storageKey, JSON.stringify({ elapsed: next, lastTick: Date.now(), isPaused: false }));
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [workoutId, startedAt, isPaused]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return { elapsed, formattedTime: formatTime(elapsed) };
}
