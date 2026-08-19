"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";

import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function FitnessChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I'm your elite AI Fitness Coach. What's on your mind? You can ask me about your workouts, nutrition, or overall progress.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/fitness-ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: "Sorry, I'm having trouble analyzing your progress right now. Please try again later." },
        ]);
      }
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Network error. Please check your connection and try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[110px] right-[24px] p-3 rounded-full border-2 border-[#ADFF00] bg-[#0A1108] text-[#ADFF00] shadow-[0_0_15px_rgba(173,255,0,0.4)] z-[60] hover:scale-105 transition-transform"
          >
            <Bot className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end" style={{ height: '100dvh' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full h-[85dvh] max-h-[100%] bg-[#0A1108] rounded-t-[32px] z-[101] flex flex-col border-t border-white/10 shadow-2xl"
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
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full bg-white/5 text-white/60 hover:text-white transition-colors">
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
                        : "bg-[#111A10] text-white/90 border border-white/5 rounded-tl-sm prose prose-sm prose-invert prose-p:leading-relaxed prose-strong:text-[#ADFF00] max-w-none"
                    }`}>
                      {msg.role === "user" ? (
                        msg.content
                      ) : (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      )}
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
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={sendMessage} className="p-4 sm:p-5 border-t border-white/5 bg-[#0A1108] shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-5">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your progress..."
                    className="w-full bg-[#111A10] border border-white/10 rounded-full py-4 pl-5 pr-14 text-sm font-medium text-white placeholder:text-white/30 focus:outline-none focus:border-[#ADFF00]/50 transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-2 bottom-2 w-10 bg-[#ADFF00] rounded-full flex items-center justify-center text-black disabled:opacity-50 disabled:bg-white/10 disabled:text-white/40 transition-all"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
