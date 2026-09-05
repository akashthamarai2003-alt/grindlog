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
  const [vvh, setVvh] = useState("100dvh");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    const updateHeight = () => {
      if (window.visualViewport) {
        setVvh(`${window.visualViewport.height}px`);
      }
    };
    
    updateHeight();
    window.visualViewport?.addEventListener("resize", updateHeight);
    window.visualViewport?.addEventListener("scroll", updateHeight);
    
    return () => {
      window.visualViewport?.removeEventListener("resize", updateHeight);
      window.visualViewport?.removeEventListener("scroll", updateHeight);
    };
  }, []);

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

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open_fitness_chatbot", handleOpen);
    return () => window.removeEventListener("open_fitness_chatbot", handleOpen);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-28 right-0 z-40 flex items-center gap-1.5 pl-3 pr-2.5 py-2.5 bg-[#111A10]/95 backdrop-blur-md border-y border-l border-[#ADFF00]/40 rounded-l-full text-[#ADFF00] shadow-[0_0_20px_rgba(173,255,0,0.25)] hover:translate-x-[-2px] active:scale-95 transition-all cursor-pointer group"
            title="Open AI Fitness Coach"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#ADFF00] group-hover:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ADFF00] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ADFF00]" />
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-white/90 group-hover:text-[#ADFF00] transition-colors pr-0.5 select-none hidden min-[360px]:inline">
              AI Coach
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
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
              className="fixed bottom-0 left-0 right-0 z-[101] flex flex-col bg-[#0A1108] sm:rounded-t-[32px] shadow-2xl overflow-hidden sm:!h-auto sm:!max-h-[85dvh]"
              style={{ height: vvh }}
            >
              {/* Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-5 pt-[calc(1rem+env(safe-area-inset-top))] sm:pt-5 border-b border-white/5 shrink-0 bg-[#0A1108]">
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
                    <div className={`px-4 py-2.5 rounded-[20px] text-[14px] leading-relaxed font-medium ${
                      msg.role === "user" 
                        ? "bg-[#ADFF00] text-black rounded-tr-[4px]" 
                        : "bg-[#111A10] text-white/90 border border-white/5 rounded-tl-[4px] prose prose-sm prose-invert prose-p:leading-relaxed prose-strong:text-[#ADFF00] max-w-none"
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
                      className="w-full bg-[#111A10] border border-white/10 rounded-full py-4 pl-5 pr-14 text-[16px] font-medium text-white placeholder:text-white/30 focus:outline-none focus:border-[#ADFF00]/50 transition-colors"
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
