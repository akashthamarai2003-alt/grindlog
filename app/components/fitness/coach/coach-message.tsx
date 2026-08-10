"use client";

import { motion } from "motion/react";
import { User, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { CoachResponseData } from "@/lib/fitness/ai/schemas";

interface CoachMessageProps {
  role: "user" | "assistant";
  content: string; // The user message string OR the JSON string of the assistant response
}

export function CoachMessage({ role, content }: CoachMessageProps) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end mb-6"
      >
        <div className="bg-emerald-500 text-white rounded-[20px] rounded-br-[5px] px-5 py-3.5 max-w-[85%] shadow-sm shadow-emerald-500/20">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </motion.div>
    );
  }

  // Parse Assistant JSON
  let responseData: CoachResponseData | null = null;
  try {
    responseData = JSON.parse(content) as CoachResponseData;
  } catch (e) {
    // Fallback if not valid JSON
    responseData = {
      message: content,
      tone: "informative",
      recommendations: [],
      warnings: []
    };
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 mb-6"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-50 flex items-center justify-center border border-emerald-100 mt-1">
        <Sparkles className="w-4 h-4 text-emerald-600" />
      </div>
      
      <div className="flex-1 space-y-3">
        <div className="bg-white border border-gray-100 rounded-[20px] rounded-tl-[5px] p-5 shadow-sm shadow-gray-200/50">
          <p className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap">
            {responseData.message}
          </p>
        </div>

        {responseData.recommendations && responseData.recommendations.length > 0 && (
          <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-4 space-y-3 ml-2">
            <h4 className="text-[13px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Recommended Action
            </h4>
            <ul className="space-y-2">
              {responseData.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 text-[14px] font-medium text-emerald-900 leading-snug">
                  <span className="text-emerald-500 mt-0.5">•</span> {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {responseData.warnings && responseData.warnings.length > 0 && (
          <div className="bg-amber-50/50 border border-amber-100/50 rounded-xl p-4 space-y-3 ml-2">
            <h4 className="text-[13px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Safety Note
            </h4>
            <ul className="space-y-2">
              {responseData.warnings.map((warn, i) => (
                <li key={i} className="flex gap-2 text-[14px] font-medium text-amber-900 leading-snug">
                  <span className="text-amber-500 mt-0.5">•</span> {warn}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}
