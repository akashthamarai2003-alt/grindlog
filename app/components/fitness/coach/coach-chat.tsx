"use client";

import { useState, useRef, useEffect } from "react";
import { CoachMessage } from "./coach-message";
import { CoachInput } from "./coach-input";
import { CoachSuggestions } from "./coach-suggestions";
import { CoachLoading } from "./coach-loading";
import { AlertCircle } from "lucide-react";

export function CoachChat({ isPro = true }: { isPro?: boolean }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>(
    isPro ? [] : [
      {
        role: "assistant",
        content: JSON.stringify({
          message: "Hey! I'm Luna, your 24/7 AI Coach. Upgrade to Pro to get real-time exercise feedback, progressive overload recommendations, recovery scoring, and instant nutrition guidance.",
          tone: "motivational",
          recommendations: [
            "Upgrade to Pro for 24/7 AI chat support",
            "Get personalized daily workout volume analysis",
            "Receive dynamic meal swaps and macro recalculations"
          ]
        })
      }
    ]
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (message: string) => {
    if (!isPro) {
      window.location.href = "/payment?returnTo=/coach&intent=upgrade_pro";
      return;
    }
    setError(null);
    setMessages(prev => [...prev, { role: "user", content: message }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/fitness-ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get coach response.");
      }

      setSessionId(data.sessionId);
      
      const aiContent = JSON.stringify({
        message: data.message,
        tone: data.tone,
        recommendations: data.recommendations,
        warnings: data.warnings
      });

      if (typeof data.remaining === "number") {
        window.dispatchEvent(
          new CustomEvent("fitness_ai_usage_updated", {
            detail: { remaining: data.remaining, limit: data.limit, used: data.used },
          }),
        );
      }

      setMessages(prev => [...prev, { role: "assistant", content: aiContent }]);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 relative bg-[#0A1108] text-white overflow-hidden h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        {!isPro && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-[#ADFF00]/15 via-[#ADFF00]/5 to-transparent border border-[#ADFF00]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(173,255,0,0.1)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#ADFF00] text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Pro Feature Preview
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium leading-relaxed">
                Upgrade to Pro to chat 24/7 with Luna for personalized training adjustments and form cues.
              </p>
            </div>
            <a
              href="/payment?returnTo=/coach&intent=upgrade_pro"
              className="shrink-0 px-3.5 py-2 bg-[#ADFF00] hover:bg-[#c4ff33] text-black text-xs font-black rounded-xl uppercase tracking-wider transition-colors shadow-sm"
            >
              Unlock Pro ⚡
            </a>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center pt-10 pb-20 opacity-60">
            <p className="text-center text-sm font-medium text-gray-400 mb-6">
              Ask your AI Coach about your progress, training plan, or recovery.
            </p>
            <CoachSuggestions onSelect={handleSendMessage} />
          </div>
        ) : (
          <div className="pb-10 space-y-2">
            {messages.map((m, i) => (
              <CoachMessage key={i} role={m.role} content={m.content} />
            ))}
            {isLoading && <CoachLoading />}
            {error && (
              <div className="flex items-center gap-2 p-4 mb-4 text-sm text-red-400 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>

      <div className="shrink-0 z-10 w-full max-w-[600px] mx-auto p-4 bg-[#0A1108] border-t border-white/10">
        {isPro ? (
          <>
            {messages.length > 0 && !isLoading && !error && (
              <div className="px-4 mb-2">
                 <CoachSuggestions onSelect={handleSendMessage} />
              </div>
            )}
            <CoachInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </>
        ) : (
          <a
            href="/payment?returnTo=/coach&intent=upgrade_pro"
            className="w-full py-3.5 px-5 bg-[#111A10] border border-[#ADFF00]/30 hover:border-[#ADFF00] rounded-full text-xs font-bold text-white/70 flex items-center justify-between transition-all group"
          >
            <span className="text-white/50 group-hover:text-white transition-colors truncate pr-2">
              Upgrade to Pro to chat with Luna...
            </span>
            <span className="shrink-0 px-3.5 py-1.5 bg-[#ADFF00] text-black text-[10px] font-black uppercase rounded-full tracking-wider group-hover:bg-[#c4ff33] flex items-center gap-1">
              Upgrade ⚡
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
