/**
 * Wake Lock Hook — keeps screen on during active workout.
 * Uses the browser Screen Wake Lock API (available in all modern browsers).
 * No dependency on openGym code.
 */
"use client";

import { useEffect, useRef } from "react";

export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active) {
      // Release lock if not active
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
      return;
    }

    // Acquire wake lock
    const acquire = async () => {
      if (!("wakeLock" in navigator)) return; // Not supported
      try {
        lockRef.current = await navigator.wakeLock.request("screen");
      } catch {
        // Silently ignore — wake lock can fail if document not visible
      }
    };

    acquire();

    // Re-acquire lock when page becomes visible again (e.g. after switching tabs)
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && active) {
        acquire();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
    };
  }, [active]);
}
