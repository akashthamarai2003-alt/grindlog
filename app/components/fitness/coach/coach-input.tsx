"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CoachInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function CoachInput({ onSendMessage, isLoading }: CoachInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="bg-white border-t border-gray-100 p-4 pb-safe flex items-end gap-2">
      <form onSubmit={handleSubmit} className="flex-1 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI coach..."
          disabled={isLoading}
          className="w-full bg-gray-50 border border-gray-200 rounded-[20px] py-3.5 pl-4 pr-12 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
        />
        <AnimatePresence>
          {input.trim() && !isLoading && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              type="submit"
              className="absolute right-2 top-1.5 bottom-1.5 aspect-square rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </motion.button>
          )}
        </AnimatePresence>
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
          </div>
        )}
      </form>
    </div>
  );
}
