"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const PREPARATION_MS = 12_000;

export function GeneratePlanButton() {
  const router = useRouter();
  const [isPreparing, setIsPreparing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const handleClick = () => {
    if (isPreparing) return;

    setIsPreparing(true);
    setProgress(0);
    const startedAt = Date.now();
    const tick = window.setInterval(() => {
      setProgress(Math.min(100, ((Date.now() - startedAt) / PREPARATION_MS) * 100));
    }, 100);
    intervalRef.current = tick;

    timeoutRef.current = setTimeout(() => {
      window.clearInterval(tick);
      intervalRef.current = null;
      setProgress(100);
      router.push("/payment?returnTo=/plan-setup&intent=generate_plan");
    }, PREPARATION_MS);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPreparing}
      className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#ADFF00] py-4 text-lg font-extrabold text-black shadow-[0_0_30px_rgba(173,255,0,0.35)] transition-transform hover:bg-[#c4ff33] active:scale-[0.98] disabled:cursor-wait disabled:opacity-90"
    >
      {isPreparing && (
        <motion.span
          className="absolute inset-y-0 left-0 bg-white/20"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      )}
      <span className="relative flex items-center gap-2">
        {isPreparing ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Preparing your personalized plan… {Math.ceil((PREPARATION_MS * (100 - progress)) / 100 / 1000)}s
          </>
        ) : (
          <>
            Generate My Plan
            <ArrowRight size={20} />
          </>
        )}
      </span>
    </button>
  );
}
