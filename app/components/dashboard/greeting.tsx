"use client";

import { motion } from "motion/react";
import { springs } from "@/animations/springs";

interface GreetingProps {
  greeting: {
    greeting: string;
    emoji: string;
    subtitle: string;
  };
}

export function Greeting({ greeting }: GreetingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.default}
      className="flex flex-col gap-1 pt-2"
    >
      <div className="flex items-center gap-2">
        <motion.span
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ ...springs.bouncy, delay: 0.2 }}
          className="text-2xl"
        >
          {greeting.emoji}
        </motion.span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          {greeting.greeting}
          <span className="text-[var(--color-text-tertiary)]">,</span>
        </h1>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-sm font-medium text-[var(--color-text-secondary)]"
      >
        {greeting.subtitle}
      </motion.p>
    </motion.div>
  );
}
