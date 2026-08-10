"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trophy, CalendarDays, Clock, Activity, Loader2, CheckCircle2 } from "lucide-react";
import { ProgressReview, WeeklyWorkoutStats } from "@/types/fitness/progress";

interface ProgressViewProps {
  stats: WeeklyWorkoutStats;
  latestReview: ProgressReview | null;
}

export function ProgressView({ stats, latestReview }: ProgressViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [review, setReview] = useState<ProgressReview | null>(latestReview);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/fitness-ai/weekly-review", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate review.");
      setReview(data.review);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto pb-32">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-[28px] font-black text-gray-900 tracking-tight">Progress</h1>
        <p className="text-[14px] font-medium text-gray-500 mt-1">Your weekly snapshot</p>
      </div>

      <div className="px-5 space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <CalendarDays className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-[22px] font-black text-gray-900 leading-none mb-1">
              {stats.workoutsCompleted} <span className="text-[14px] font-medium text-gray-400">/ {stats.workoutsPlanned}</span>
            </div>
            <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Workouts</div>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-[22px] font-black text-gray-900 leading-none mb-1">
              {stats.totalMinutes} <span className="text-[14px] font-medium text-gray-400">min</span>
            </div>
            <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Time Active</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-3">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-[22px] font-black text-gray-900 leading-none mb-1">
              {stats.setsCompleted}
            </div>
            <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Sets Done</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-[22px] font-black text-gray-900 leading-none mb-1">
              {stats.workoutsPlanned > 0 ? Math.round((stats.workoutsCompleted / stats.workoutsPlanned) * 100) : 0}%
            </div>
            <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Consistency</div>
          </div>
        </div>

        {/* AI Review Section */}
        <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <h2 className="text-[16px] font-bold text-white">Weekly AI Review</h2>
            </div>
          </div>
          
          <div className="p-5">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            {!review ? (
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-500 mb-6">
                  {stats.workoutsCompleted > 0 
                    ? "You have enough data! Generate your personalized weekly review to see your progress insights."
                    : "Complete some workouts this week to get an AI review."}
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || stats.workoutsCompleted === 0}
                  className="w-full bg-gray-900 hover:bg-black text-white text-[15px] font-bold py-3.5 rounded-[16px] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGenerating ? "Analyzing..." : "Generate Review"}
                </button>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <div>
                    <p className="text-[15px] leading-relaxed text-gray-800 font-medium">
                      {review.ai_summary}
                    </p>
                  </div>

                  {review.ai_highlights && review.ai_highlights.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[12px] font-bold text-emerald-600 uppercase tracking-wider">Highlights</h3>
                      <ul className="space-y-2">
                        {review.ai_highlights.map((h, i) => (
                          <li key={i} className="flex gap-2 text-[14px] text-gray-700 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {review.ai_recommendations && review.ai_recommendations.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h3 className="text-[12px] font-bold text-teal-600 uppercase tracking-wider">Focus Areas</h3>
                      <ul className="space-y-2">
                        {review.ai_recommendations.map((r, i) => (
                          <li key={i} className="flex gap-2 text-[14px] text-gray-700 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
