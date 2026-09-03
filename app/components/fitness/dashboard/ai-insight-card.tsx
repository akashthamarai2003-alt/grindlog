import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProgressReview } from "@/types/fitness/progress";

export function AIInsightCard({ review }: { review: ProgressReview | null }) {
  if (!review || !review.ai_summary) {
    return (
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[24px] p-5 relative overflow-hidden shadow-sm flex items-center justify-between">
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-[12px] font-bold text-emerald-400 uppercase tracking-wider">AI Coach</span>
          </div>
          <p className="text-[14px] font-medium text-white/90">
            Complete a few workouts and your AI Coach will analyze your progress.
          </p>
        </div>
        <Link href="/coach" prefetch={true} className="relative z-10 ml-4 flex-shrink-0 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
          <ArrowRight className="w-5 h-5 text-white" />
        </Link>
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
      </div>
    );
  }

  // Pick a highlight if available, else first sentence of summary
  const highlight = (review.ai_highlights && review.ai_highlights.length > 0) 
    ? review.ai_highlights[0] 
    : review.ai_summary.split('.')[0] + '.';

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-[24px] p-5 relative overflow-hidden shadow-lg shadow-emerald-500/20 flex items-center justify-between">
      <div className="relative z-10 flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-emerald-100" />
          <span className="text-[12px] font-bold text-emerald-100 uppercase tracking-wider">Weekly Insight</span>
        </div>
        <p className="text-[14px] font-medium text-white">
          "{highlight}"
        </p>
      </div>
      <Link href="/coach" prefetch={true} className="relative z-10 ml-4 flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors shadow-sm">
        <ArrowRight className="w-5 h-5 text-white" />
      </Link>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full" />
    </div>
  );
}
