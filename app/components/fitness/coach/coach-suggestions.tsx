"use client";

import { motion } from "motion/react";

interface CoachSuggestionsProps {
  onSelect: (message: string) => void;
}

const suggestions = [
  "How did I do this week?",
  "What should I improve?",
  "Should I train today?",
  "How can I improve my workout consistency?"
];

export function CoachSuggestions({ onSelect }: CoachSuggestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4 justify-end">
      {suggestions.map((suggestion, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onSelect(suggestion)}
          className="bg-white/80 backdrop-blur border border-emerald-100 text-emerald-800 text-[13px] font-medium px-4 py-2 rounded-full hover:bg-emerald-50 hover:border-emerald-200 transition-colors shadow-sm"
        >
          {suggestion}
        </motion.button>
      ))}
    </div>
  );
}
