"use client";

import { useState } from "react";
import { Tag, Save, Loader2, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { updatePlanPricesAction } from "@/app/actions/admin-pricing";
import { PlanPricingConfig } from "@/lib/constants/pricing";

export default function PricingClientForm({ 
  grindlogPricing, 
  fitnessPricing 
}: { 
  grindlogPricing: PlanPricingConfig;
  fitnessPricing: PlanPricingConfig;
}) {
  const [appFilter, setAppFilter] = useState<"grindlog" | "fitness">("fitness");
  const [pricing, setPricing] = useState<PlanPricingConfig>(fitnessPricing);
  const [spinDiscount, setSpinDiscount] = useState<number>(fitnessPricing.spinDiscountPercentage ?? 50);
  const [isSaving, setIsSaving] = useState(false);

  // Sync pricing state when filter changes
  const handleFilterChange = (filter: "grindlog" | "fitness") => {
    setAppFilter(filter);
    const target = filter === "grindlog" ? grindlogPricing : fitnessPricing;
    setPricing(target);
    setSpinDiscount(target.spinDiscountPercentage ?? 50);
  };

  const handleDiscountPercentChange = (newPercent: number) => {
    const clamped = Math.max(5, Math.min(95, newPercent));
    setSpinDiscount(clamped);

    // Automatically recalculate offer prices from original prices
    setPricing((prev) => {
      const coreOrig = prev.monthly.core.originalPrice ?? prev.monthly.core.price ?? 59;
      const proOrig = prev.monthly.pro.originalPrice ?? prev.monthly.pro.price ?? 199;
      const coreOffer = Math.max(1, Math.round(coreOrig * (1 - clamped / 100)));
      const proOffer = Math.max(1, Math.round(proOrig * (1 - clamped / 100)));

      return {
        ...prev,
        spinDiscountPercentage: clamped,
        monthly: {
          ...prev.monthly,
          core: {
            ...prev.monthly.core,
            originalPrice: coreOrig,
            price: coreOffer,
          },
          pro: {
            ...prev.monthly.pro,
            originalPrice: proOrig,
            price: proOffer,
          },
        },
      };
    });
  };

  const handlePriceChange = (
    tier: "monthly" | "six_months" | "lifetime",
    level: "core" | "pro",
    field: "price" | "originalPrice",
    value: string
  ) => {
    const num = value === "" ? null : parseFloat(value);
    setPricing((prev) => {
      const updated = {
        ...prev,
        [tier]: {
          ...prev[tier],
          [level]: {
            ...prev[tier][level],
            [field]: num,
          },
        },
      };

      // When setting originalPrice for monthly Fitness OS, automatically compute offer price
      if (appFilter === "fitness" && tier === "monthly" && field === "originalPrice" && num != null) {
        updated.monthly[level].price = Math.max(1, Math.round(num * (1 - spinDiscount / 100)));
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload: PlanPricingConfig = {
        ...pricing,
        spinDiscountPercentage: spinDiscount,
      };

      const res = await updatePlanPricesAction(payload, appFilter);
      if (res.success) {
        toast.success("Plan pricing & Spin Wheel discount saved successfully!");
      } else {
        toast.error(res.error || "Failed to save plan prices");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred while saving prices");
    } finally {
      setIsSaving(false);
    }
  };

  const ALL_PLANS = [
    { key: "monthly" as const, title: "Monthly Plan", emoji: "🌱", period: "/month" },
    { key: "six_months" as const, title: "6 Months Plan", emoji: "🌿", period: "/6 months" },
    { key: "lifetime" as const, title: "Lifetime Access", emoji: "🌳", period: "one-time" },
  ];

  const PLAN_METADATA = ALL_PLANS.filter(p => p.key === "monthly");

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

        <div className="flex flex-col sm:flex-row items-center gap-4">


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
      </div>

      {/* Spin Wheel Discount Controller (Fitness OS) */}
      {appFilter === "fitness" && (
        <div className="bg-gradient-to-br from-[#0F1D11] via-[#142616] to-[#0D180E] border-2 border-green-500/40 rounded-2xl p-6 shadow-md text-white space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                🎡
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  Lucky Spin Wheel Discount Percentage
                  <span className="text-[10px] bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Gamified Offer
                  </span>
                </h3>
                <p className="text-xs text-gray-300">
                  Controls the jackpot discount percentage that athletes win when spinning the wheel on <span className="font-bold text-green-400 underline">/payment</span>.
                </p>
              </div>
            </div>

            {/* Discount Input & Preset Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {[30, 40, 50, 60, 70].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleDiscountPercentChange(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    spinDiscount === preset
                      ? "bg-green-500 text-black shadow-lg shadow-green-500/30 scale-105"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                  }`}
                >
                  {preset}%
                </button>
              ))}

              <div className="relative w-24">
                <input
                  type="number"
                  min="5"
                  max="95"
                  value={spinDiscount}
                  onChange={(e) => handleDiscountPercentChange(Number(e.target.value) || 0)}
                  className="w-full pl-3 pr-7 py-1.5 text-xs font-black bg-black/50 border border-green-500/50 rounded-xl text-green-300 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-right"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-green-400">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Live Discount Calculation Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Core Tier ({spinDiscount}% OFF)
                </span>
                <span className="text-xs text-gray-300">
                  Base: ₹{pricing.monthly.core.originalPrice || pricing.monthly.core.price || 59}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-green-400 block">
                  ₹{pricing.monthly.core.price ?? Math.max(1, Math.round((pricing.monthly.core.originalPrice || 59) * (1 - spinDiscount / 100)))} /mo
                </span>
                <span className="text-[10px] text-gray-400">
                  Save ₹{(pricing.monthly.core.originalPrice || 59) - (pricing.monthly.core.price ?? Math.max(1, Math.round((pricing.monthly.core.originalPrice || 59) * (1 - spinDiscount / 100))))}
                </span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Pro Tier ({spinDiscount}% OFF)
                </span>
                <span className="text-xs text-gray-300">
                  Base: ₹{pricing.monthly.pro.originalPrice || pricing.monthly.pro.price || 199}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-green-400 block">
                  ₹{pricing.monthly.pro.price ?? Math.max(1, Math.round((pricing.monthly.pro.originalPrice || 199) * (1 - spinDiscount / 100)))} /mo
                </span>
                <span className="text-[10px] text-gray-400">
                  Save ₹{(pricing.monthly.pro.originalPrice || 199) - (pricing.monthly.pro.price ?? Math.max(1, Math.round((pricing.monthly.pro.originalPrice || 199) * (1 - spinDiscount / 100))))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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

              {/* Core Tier Section - Only show for fitness */}
              {appFilter === "fitness" && (
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
              )}

              {/* Pro Tier Section */}
              <div className="p-5 space-y-3 bg-purple-50/30 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    {appFilter === "grindlog" ? "Plan Price" : "Pro Tier"}
                  </span>
                  {appFilter === "fitness" && (
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">AI Unlocked</span>
                  )}
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
