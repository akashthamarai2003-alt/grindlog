"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sprout } from "lucide-react";
import { springs } from "@/animations/springs";

export default function SplashPage() {
  const [stage, setStage] = useState<"seed" | "sprout" | "text" | "done">(
    "seed"
  );

  useEffect(() => {
    const t1 = setTimeout(() => setStage("sprout"), 300);
    const t2 = setTimeout(() => setStage("text"), 900);
    const t3 = setTimeout(() => setStage("done"), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    if (stage === "done") {
      const timer = setTimeout(() => {
        window.location.href = "/onboarding";
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="relative flex flex-col items-center gap-8">
        {/* Animated Icon */}
        <div className="relative flex h-32 w-32 items-center justify-center">
          {/* Glow */}
          <AnimatePresence>
            {stage !== "done" && (
              <motion.div
                className="absolute inset-0 rounded-full bg-[var(--color-accent-green)]/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: [0.8, 1.3, 0.8],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </AnimatePresence>

          {/* Seed → Sprout */}
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{
              scale: stage === "done" ? 1 : 1,
              rotate: stage === "seed" ? 360 : 0,
            }}
            transition={{
              scale: springs.bouncy,
              rotate: { duration: 1.2, ease: "easeOut" },
            }}
            className="relative z-10"
          >
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-accent-green-light), var(--color-accent-green))",
                boxShadow: "var(--shadow-glow-green)",
              }}
            >
              <motion.div
                animate={{
                  scale: stage === "sprout" ? [1, 1.15, 1] : 1,
                }}
                transition={{ duration: 0.5, ...springs.bouncy }}
              >
                <Sprout className="h-12 w-12 text-white" strokeWidth={1.5} />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={stage !== "seed" ? { opacity: 1, y: 0 } : {}}
            transition={springs.default}
            className="text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)]"
          >
            GrindLog
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={stage === "text" || stage === "done" ? { opacity: 1 } : {}}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-sm font-medium tracking-wide text-[var(--color-text-tertiary)]"
          >
            Personal Growth OS
          </motion.p>
        </div>

        {/* Loading dots */}
        <motion.div
          className="flex gap-1.5"
          initial={{ opacity: 0 }}
          animate={
            stage === "text" || stage === "done" ? { opacity: 1 } : {}
          }
          transition={{ delay: 0.3 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-green)]"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
