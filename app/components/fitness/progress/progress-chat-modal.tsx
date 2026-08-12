"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Loader2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface ProgressChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProgressChatModal({ isOpen, onClose }: ProgressChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hey! I'm your AI Coach. I'm looking at your latest progress data right now. What would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/fitness-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch response");

      setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I had trouble connecting. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 h-[85vh] bg-[#0A1108] rounded-t-[32px] z-[101] flex flex-col border-t border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ADFF00]/10 flex items-center justify-center border border-[#ADFF00]/20">
                  <Bot className="w-5 h-5 text-[#ADFF00]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">AI Progress Coach</h3>
                  <p className="text-[#ADFF00] text-[10px] font-black tracking-widest uppercase">Online</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-white/5 text-white/60 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-start gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-white/10" : "bg-[#ADFF00]/10 border border-[#ADFF00]/20"}`}>
                    {msg.role === "user" ? <User className="w-4 h-4 text-white/80" /> : <Bot className="w-4 h-4 text-[#ADFF00]" />}
                  </div>
                  <div className={`p-4 rounded-[20px] text-[13px] leading-relaxed font-medium ${
                    msg.role === "user" 
                      ? "bg-[#ADFF00] text-black rounded-tr-sm" 
                      : "bg-[#111A10] text-white/90 border border-white/5 rounded-tl-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-[#ADFF00]" />
                  </div>
                  <div className="p-4 rounded-[20px] rounded-tl-sm bg-[#111A10] border border-white/5 text-white/60 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#ADFF00]" />
                    <span className="text-[13px] font-medium">Analyzing data...</span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-white/5 bg-[#0A1108] shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about your progress..."
                  className="w-full bg-[#111A10] border border-white/10 rounded-full py-4 pl-5 pr-14 text-sm font-medium text-white placeholder:text-white/30 focus:outline-none focus:border-[#ADFF00]/50 transition-colors"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-2 bottom-2 w-10 bg-[#ADFF00] rounded-full flex items-center justify-center text-black disabled:opacity-50 disabled:bg-white/10 disabled:text-white/40 transition-all"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
