"use client";

import { useState } from "react";
import { Tag, Save, Loader2, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PlanPricingConfig, updatePlanPricesAction } from "@/app/actions/admin-pricing";

export default function PricingClientForm({ initialPricing }: { initialPricing: PlanPricingConfig }) {
  const [pricing, setPricing] = useState<PlanPricingConfig>(initialPricing);
  const [isSaving, setIsSaving] = useState(false);

  const handlePriceChange = (
    tier: "monthly" | "six_months" | "lifetime",
    level: "core" | "pro",
    field: "price" | "originalPrice",
    value: string
  ) => {
    const num = value === "" ? null : parseFloat(value);
    setPricing((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [level]: {
          ...prev[tier][level],
          [field]: num,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await updatePlanPricesAction(pricing);
      if (res.success) {
        toast.success("Plan offer prices saved successfully!");
      } else {
        toast.error(res.error || "Failed to save plan prices");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred while saving prices");
    } finally {
      setIsSaving(false);
    }
  };

  const PLAN_METADATA = [
    { key: "monthly" as const, title: "Monthly Plan", emoji: "🌱", period: "/month" },
    { key: "six_months" as const, title: "6 Months Plan", emoji: "🌿", period: "/6 months" },
    { key: "lifetime" as const, title: "Lifetime Access", emoji: "🌳", period: "one-time" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-5 h-5" />
            <h2 className="text-lg font-extrabold">Plan & Offer Pricing Manager</h2>
          </div>
          <p className="text-xs text-green-100 max-w-xl">
            Set custom offer prices and crossed-out original prices for Core and Pro plans. These live prices update immediately on the <span className="font-bold underline">grindlog.in/payment</span> page.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-green-700 font-bold text-xs hover:bg-green-50 active:scale-95 shadow-sm transition-all disabled:opacity-50 shrink-0"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Pricing & Offers</span>
            </>
          )}
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLAN_METADATA.map((plan) => {
          const coreData = pricing[plan.key].core;
          const proData = pricing[plan.key].pro;

          return (
            <div key={plan.key} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              {/* Card Header */}
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{plan.emoji}</span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{plan.title}</h3>
                    <p className="text-[10px] text-gray-500 font-medium">{plan.period}</p>
                  </div>
                </div>
              </div>

              {/* Core Tier Section */}
              <div className="p-5 border-b border-gray-100 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    Core Tier
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400">Base Features</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">
                      Original Price (~~₹~~)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                      <input
                        type="number"
                        value={coreData.originalPrice ?? ""}
                        onChange={(e) => handlePriceChange(plan.key, "core", "originalPrice", e.target.value)}
                        placeholder="e.g. 99"
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg text-gray-500 line-through outline-none focus:border-green-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-green-700 block mb-1">
                      Offer Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-green-600">₹</span>
                      <input
                        type="number"
                        value={coreData.price ?? ""}
                        onChange={(e) => handlePriceChange(plan.key, "core", "price", e.target.value)}
                        placeholder="e.g. 49"
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-extrabold bg-green-50/50 border border-green-300 rounded-lg text-green-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Core Live Preview Badge */}
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-500">Preview (Core):</span>
                  <div className="flex items-center gap-1.5">
                    {coreData.originalPrice && coreData.originalPrice > coreData.price && (
                      <span className="text-[10px] font-bold text-gray-400 line-through">
                        ₹{coreData.originalPrice}
                      </span>
                    )}
                    <span className="text-xs font-extrabold text-green-600">
                      ₹{coreData.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pro Tier Section */}
              <div className="p-5 space-y-3 bg-purple-50/30 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Pro Tier
                  </span>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">AI Unlocked</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">
                      Original Price (~~₹~~)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                      <input
                        type="number"
                        value={proData.originalPrice ?? ""}
                        onChange={(e) => handlePriceChange(plan.key, "pro", "originalPrice", e.target.value)}
                        placeholder="e.g. 149"
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg text-gray-500 line-through outline-none focus:border-purple-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-purple-800 block mb-1">
                      Offer Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-600">₹</span>
                      <input
                        type="number"
                        value={proData.price ?? ""}
                        onChange={(e) => handlePriceChange(plan.key, "pro", "price", e.target.value)}
                        placeholder="e.g. 69"
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-extrabold bg-purple-50 border border-purple-300 rounded-lg text-purple-950 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Pro Live Preview Badge */}
                <div className="bg-white rounded-xl p-2.5 border border-purple-100 flex items-center justify-between shadow-2xs">
                  <span className="text-[10px] font-semibold text-purple-700">Preview (Pro):</span>
                  <div className="flex items-center gap-1.5">
                    {proData.originalPrice && proData.originalPrice > proData.price && (
                      <span className="text-[10px] font-bold text-gray-400 line-through">
                        ₹{proData.originalPrice}
                      </span>
                    )}
                    <span className="text-xs font-extrabold text-purple-700">
                      ₹{proData.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button Footer Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Changes take effect immediately on checkout and razorpay order generation.</span>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs active:scale-95 shadow-sm transition-all disabled:opacity-50 shrink-0"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Pricing & Offers</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
