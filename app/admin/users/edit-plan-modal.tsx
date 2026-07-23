"use client";

import { useState } from "react";
import { Edit3, X, Check, Loader2, DollarSign, Crown, Shield, Clock } from "lucide-react";
import { toast } from "sonner";
import { updateUserPlanAdminAction } from "@/app/actions/admin-users";
import { useRouter } from "next/navigation";

interface EditPlanModalProps {
  user: {
    id: string;
    display_name?: string;
    email?: string;
    is_premium?: boolean;
    premium_level?: string;
    premium_tier?: string;
    actualPaidAmount?: number;
  };
  onClose: () => void;
}

export default function EditPlanModal({ user, onClose }: EditPlanModalProps) {
  const router = useRouter();

  const [isPremium, setIsPremium] = useState<boolean>(!!user.is_premium);
  const [premiumLevel, setPremiumLevel] = useState<"pro" | "core">((user.premium_level as any) || "pro");
  const [premiumTier, setPremiumTier] = useState<"monthly" | "six_months" | "lifetime">((user.premium_tier as any) || "lifetime");
  const [customPaidAmount, setCustomPaidAmount] = useState<string>(user.actualPaidAmount ? String(user.actualPaidAmount) : "0");
  const [isSaving, setIsSaving] = useState(false);

  // Preset prices for convenience
  const PRESET_AMOUNTS = [
    { label: "₹30 (Top-Up)", value: 30 },
    { label: "₹49 (Core 1M)", value: 49 },
    { label: "₹69 (Pro 1M)", value: 69 },
    { label: "₹199 (Core 6M)", value: 199 },
    { label: "₹249 (Pro 6M)", value: 249 },
    { label: "₹599 (Core Lifetime)", value: 599 },
    { label: "₹799 (Pro Lifetime)", value: 799 },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const paidNum = parseFloat(customPaidAmount) || 0;
      const res = await updateUserPlanAdminAction({
        userId: user.id,
        isPremium,
        premiumLevel,
        premiumTier,
        customPaidAmount: paidNum,
      });

      if (res.success) {
        toast.success(`Updated plan for ${user.display_name || user.email || "user"}!`);
        router.refresh();
        onClose();
      } else {
        toast.error(res.error || "Failed to update plan");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Modify User Plan & Payment</h3>
              <p className="text-xs text-gray-500">{user.display_name || "User"} ({user.email})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Membership Status Switch */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-gray-500" />
              Membership Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPremium(false)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  !isPremium
                    ? "bg-red-50 border-red-300 text-red-700 ring-2 ring-red-500/20"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>Unpaid / Free</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPremium(true)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isPremium
                    ? "bg-purple-50 border-purple-300 text-purple-700 ring-2 ring-purple-500/20"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Paid / Premium</span>
              </button>
            </div>
          </div>

          {/* Plan Level (Pro vs Core) */}
          {isPremium && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-purple-500" />
                Plan Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPremiumLevel("pro")}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    premiumLevel === "pro"
                      ? "bg-purple-100 border-purple-400 text-purple-900 ring-2 ring-purple-500/20"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  ⚡ Pro Tier
                </button>
                <button
                  type="button"
                  onClick={() => setPremiumLevel("core")}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    premiumLevel === "core"
                      ? "bg-indigo-100 border-indigo-400 text-indigo-900 ring-2 ring-indigo-500/20"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  🚀 Core Tier
                </button>
              </div>
            </div>
          )}

          {/* Plan Duration / Tier */}
          {isPremium && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Plan Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPremiumTier("monthly")}
                  className={`px-2.5 py-2 rounded-xl border text-xs font-bold transition-all text-center ${
                    premiumTier === "monthly"
                      ? "bg-blue-100 border-blue-400 text-blue-900 ring-2 ring-blue-500/20"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setPremiumTier("six_months")}
                  className={`px-2.5 py-2 rounded-xl border text-xs font-bold transition-all text-center ${
                    premiumTier === "six_months"
                      ? "bg-blue-100 border-blue-400 text-blue-900 ring-2 ring-blue-500/20"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  6 Months
                </button>
                <button
                  type="button"
                  onClick={() => setPremiumTier("lifetime")}
                  className={`px-2.5 py-2 rounded-xl border text-xs font-bold transition-all text-center ${
                    premiumTier === "lifetime"
                      ? "bg-blue-100 border-blue-400 text-blue-900 ring-2 ring-blue-500/20"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Lifetime
                </button>
              </div>
            </div>
          )}

          {/* Custom Paid Amount */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-green-600" />
              Paid Amount (₹)
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">₹</span>
              <input
                type="number"
                value={customPaidAmount}
                onChange={(e) => setCustomPaidAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 text-xs font-bold bg-white border border-gray-300 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Amount Presets Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap">Presets:</span>
              {PRESET_AMOUNTS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setCustomPaidAmount(String(p.value))}
                  className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-gray-700 whitespace-nowrap transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Plan Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
