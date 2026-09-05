"use client";

import { useState, useRef, useEffect } from "react";
import { CoachMessage } from "./coach-message";
import { CoachInput } from "./coach-input";
import { CoachSuggestions } from "./coach-suggestions";
import { CoachLoading } from "./coach-loading";
import { AlertCircle } from "lucide-react";

export function CoachChat() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (message: string) => {
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
    <div className="flex flex-col flex-1 relative bg-gray-50 overflow-hidden h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center pt-10 pb-20 opacity-60">
            <p className="text-center text-sm font-medium text-gray-500 mb-6">
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
              <div className="flex items-center gap-2 p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>

      <div className="shrink-0 z-10 w-full max-w-[600px] mx-auto">
        {messages.length > 0 && !isLoading && !error && (
          <div className="px-4">
             <CoachSuggestions onSelect={handleSendMessage} />
          </div>
        )}
        <CoachInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
