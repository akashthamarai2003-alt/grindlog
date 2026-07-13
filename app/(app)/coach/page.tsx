"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Brain, Send, Mic, Sparkles } from "lucide-react";

export default function CoachPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! I noticed you hit your 3-day streak for drinking water, but you missed your workout yesterday. How are you feeling today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: "That makes sense. Rest is just as important as the grind. Want to do a light 15-minute stretching routine instead today?" }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">
      {/* Header */}
      <div className="safe-top px-5 pb-4 pt-4 flex items-center gap-3 border-b border-[var(--color-bg-tertiary)] bg-[var(--color-bg-primary)]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] shadow-sm">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-[var(--color-text-primary)]">AI Coach</h1>
          <p className="text-[11px] font-bold text-[var(--color-accent-blue)] flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Online
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4 pb-32">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[85%] rounded-[20px] px-4 py-3 text-[14px] font-medium leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--color-accent-blue)] text-white rounded-br-[4px]"
                  : "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] ring-1 ring-[var(--color-bg-tertiary)] rounded-bl-[4px]"
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[85px] left-1/2 w-full max-w-[430px] -translate-x-1/2 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)] to-transparent px-5 pb-4 pt-10">
        <div className="flex items-center gap-2 rounded-full bg-[var(--color-bg-elevated)] p-1.5 shadow-md ring-1 ring-[var(--color-bg-tertiary)]">
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] transition-colors">
            <Mic className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask your coach anything..."
            className="flex-1 bg-transparent px-2 text-[14px] font-medium text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
          />
          <button 
            onClick={handleSend}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-blue)] text-white shadow-sm transition-transform active:scale-95"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
