import { Sparkles, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { FitnessPlanConfig, FitnessSubscriptionStatus } from "@/lib/fitness/subscription/types";

interface ProfileSubscriptionProps {
  planConfig: FitnessPlanConfig | null;
  status: FitnessSubscriptionStatus | null;
  aiLimitInfo: {
    allowed: boolean;
    limit: number;
    used: number;
    remaining: number;
  };
}

export function ProfileSubscription({ planConfig, status, aiLimitInfo }: ProfileSubscriptionProps) {
  
  if (!planConfig || status !== "active") {
    return (
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm w-full max-w-md mx-auto text-center mt-6">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-[16px] font-bold text-gray-900 mb-1">No Active Plan</h3>
        <p className="text-[14px] text-gray-500 font-medium mb-6">You need a subscription to access Fitness AI features.</p>
        <Link 
          href="/fitness/pro"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-[15px] font-bold py-3.5 rounded-2xl transition-colors shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          View Plans
        </Link>
      </div>
    );
  }

  const isPro = planConfig.id === "pro";
  
  return (
    <div className={`rounded-3xl p-6 border shadow-sm w-full max-w-md mx-auto mt-6 ${isPro ? 'bg-gradient-to-br from-emerald-600 to-teal-500 border-emerald-500' : 'bg-white border-gray-100'}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className={`text-[11px] font-black uppercase tracking-wider mb-1 ${isPro ? 'text-emerald-100' : 'text-gray-500'}`}>
            FITNESS AI {planConfig.name}
          </div>
          <div className={`text-[28px] font-black tracking-tight leading-none ${isPro ? 'text-white' : 'text-gray-900'}`}>
            ₹{planConfig.priceInPaise / 100}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-[12px] font-bold ${isPro ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Active
        </div>
      </div>

      <div className={`rounded-2xl p-4 mb-6 ${isPro ? 'bg-white/10' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-1.5 text-[13px] font-bold ${isPro ? 'text-emerald-50' : 'text-gray-700'}`}>
            <Zap className="w-4 h-4" />
            AI Usage Today
          </div>
          <div className={`text-[13px] font-bold ${aiLimitInfo.remaining === 0 ? 'text-red-500' : isPro ? 'text-white' : 'text-emerald-600'}`}>
            {aiLimitInfo.remaining} / {aiLimitInfo.limit} remaining
          </div>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden bg-black/10">
          <div 
            className={`h-full rounded-full transition-all ${isPro ? 'bg-white' : 'bg-emerald-500'} ${aiLimitInfo.remaining === 0 ? '!bg-red-500' : ''}`}
            style={{ width: `${Math.min(100, Math.max(0, (aiLimitInfo.used / aiLimitInfo.limit) * 100))}%` }}
          />
        </div>
      </div>

      {!isPro && (
        <Link 
          href="/fitness/pro"
          className="w-full bg-gray-900 hover:bg-black text-white text-[15px] font-bold py-3.5 rounded-2xl transition-colors shadow-md flex items-center justify-center gap-2 group"
        >
          Upgrade to Pro
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}
