"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import {
  ChevronLeft,
  Check,
  Zap,
  Target,
  Flame,
  ShoppingCart,
  Activity,
  Brain,
  ShieldCheck,
  Dumbbell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSafeRedirect } from "@/lib/utils/redirect";
import { createRazorpayOrder, verifyRazorpayPayment, checkUserPremiumStatusAction, getUserPremiumDetailsAction } from "@/app/actions/payment";
import { getPlanPricesAction } from "@/app/actions/admin-pricing";
import { DEFAULT_PRICING, PlanPricingConfig } from "@/lib/constants/pricing";

const features = [
  { icon: Target, label: "Personalized 7-day plan", core: true, pro: true },
  { icon: Dumbbell, label: "Basic exercise guidance", core: true, pro: "Full AI guidance" },
  { icon: Flame, label: "Calorie & protein targets", core: true, pro: "Full meal plan" },
  { icon: ShoppingCart, label: "Smart grocery add-ons", core: false, pro: true },
  { icon: Activity, label: "Basic dashboard", core: true, pro: "Advanced progress" },
  { icon: Activity, label: "Water and calorie logging", core: false, pro: true },
  { icon: Brain, label: "AI coach support", core: false, pro: true },
  { icon: ShieldCheck, label: "Weekly AI reviews", core: false, pro: true },
  { icon: Target, label: "AI plan adjustments", core: false, pro: true },
  { icon: Activity, label: "Advanced progress analysis", core: false, pro: true },
];

const basePlans = [
  {
    id: "monthly",
    name: "Monthly",
    emoji: "🔥",
    basePrices: { core: 29, pro: 99 },
    period: "/month",
    originalPrice: null,
    badge: null,
  }
];

export default function FitnessPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getSafeRedirect(searchParams.get("returnTo"));
  
  // In Fitness OS, the duration is always monthly, but we let them choose the tier
  const selectedPlan = "monthly";
  const [level, setLevel] = useState<"core" | "pro">("pro");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pricingConfig, setPricingConfig] = useState<PlanPricingConfig>(DEFAULT_PRICING);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [currentPremiumInfo, setCurrentPremiumInfo] = useState<{ premium_tier?: string; premium_level?: string } | null>(null);
  const [premiumStatusLoaded, setPremiumStatusLoaded] = useState(false);
  const isPlanGenerationIntent = searchParams.get("intent") === "generate_plan";

  // Fetch current premium status
  useEffect(() => {
    getUserPremiumDetailsAction("fitness_os").then((res) => {
      if (res) setCurrentPremiumInfo(res as any);
      setPremiumStatusLoaded(true);
    });
  }, []);

  // A user with an already active Fitness subscription should not pay again
  // when returning to generate a plan.
  useEffect(() => {
    if (isPlanGenerationIntent && premiumStatusLoaded && currentPremiumInfo) {
      setIsSuccess(true);
    }
  }, [currentPremiumInfo, isPlanGenerationIntent, premiumStatusLoaded]);

  // Reliable redirect effect
  useEffect(() => {
    if (isSuccess) {
      const separator = returnTo.includes("?") ? "&" : "?";
      window.location.href = `${returnTo}${separator}success=true&t=${Date.now()}`;
    }
  }, [isSuccess, returnTo]);

  // Robust polling that survives modal dismissal
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let attempts = 0;

    const pollPremiumStatus = () => {
      attempts++;
      if (!isPolling || attempts > 30) return; // Stop polling after ~2 minutes
      
      checkUserPremiumStatusAction(selectedPlan, level, "fitness_os").then((isPremium) => {
        if (isPremium) {
          setIsSuccess(true);
          setIsPolling(false);
        } else {
          timeoutId = setTimeout(pollPremiumStatus, 4000);
        }
      });
    };

    if (isPolling) {
      pollPremiumStatus();
    }

    return () => clearTimeout(timeoutId);
  }, [isPolling, selectedPlan, level]);

  // Fetch dynamic pricing on mount
  useEffect(() => {
    getPlanPricesAction("fitness").then((res) => {
      if (res) setPricingConfig(res);
      setIsLoadingPrices(false);
    });
  }, []);

  // Check if user is already premium on mount ONLY IF they initiated a payment in this session (e.g., returning from UPI)
  useEffect(() => {
    if (sessionStorage.getItem("payment_in_progress") === "true") {
      checkUserPremiumStatusAction(undefined, undefined, "fitness_os").then((isPremium) => {
        if (isPremium) {
          setIsSuccess(true);
          sessionStorage.removeItem("payment_in_progress");
        }
      });
    }
  }, []);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      sessionStorage.setItem("payment_in_progress", "true");
      setIsPolling(true);

      const orderResponse = await createRazorpayOrder(selectedPlan, level, undefined, "fitness_os");

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || "Failed to create order");
      }

      if (orderResponse.bypassRazorpay) {
        const verifyRes = await verifyRazorpayPayment(
          "bypass",
          "bypass",
          "bypass",
          selectedPlan,
          level,
          undefined,
          true,
          "fitness_os"
        );
        if (verifyRes.success) {
          setIsSuccess(true);
        } else {
          throw new Error("Failed to activate free tier");
        }
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: "Fitness OS",
        description: `Upgrade to ${level.toUpperCase()} - ${selectedPlan.replace('_', ' ').toUpperCase()}`,
        order_id: orderResponse.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await verifyRazorpayPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
                selectedPlan,
                level,
                undefined,
                false,
                "fitness_os"
              );

            if (verifyRes.success) {
              setIsSuccess(true);
              setIsPolling(false);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            setIsPolling(true);
            alert("Payment verification delayed. Please wait a moment while we confirm your payment.");
          }
        },
        prefill: {
          name: "GrindLog Athlete",
        },
        theme: {
          color: "#ADFF00",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setTimeout(() => {
              checkUserPremiumStatusAction(undefined, undefined, "fitness_os").then((isPremium) => {
                if (isPremium) {
                  setIsSuccess(true);
                }
              });
            }, 3000);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error("Payment failed event:", response.error);
        setIsProcessing(false);
      });
      
      rzp.open();
    } catch (error: any) {
      console.error("Payment Error:", error);
      alert(error.message || "Failed to initiate payment");
      setIsProcessing(false);
      setIsPolling(false);
    }
  };

  const isCurrentPlan = currentPremiumInfo?.premium_tier === selectedPlan && currentPremiumInfo?.premium_level === level;

  return (
    <div className="min-h-[100dvh] bg-[#0A1108] text-white flex flex-col relative overflow-hidden pb-[100px]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1A2619_0%,transparent_70%)] pointer-events-none opacity-60" />

      {/* Header */}
      <div className="sticky top-0 z-50 px-4 py-4 flex items-center justify-between bg-[#0A1108]/80 backdrop-blur-lg">
        <button
          onClick={() => router.push(returnTo)}
          className="w-10 h-10 rounded-full bg-[#121E12] border border-[#1A2619] flex items-center justify-center hover:bg-[#1A2619] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300" />
        </button>
        <div className="font-bold tracking-widest text-[10px] uppercase text-[#ADFF00]">
          Fitness OS Pro
        </div>
        <div className="w-10 h-10" />
      </div>

      <div className="px-6 pt-6 pb-12 z-10 max-w-lg mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
            className="w-16 h-16 bg-[#ADFF00] rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_rgba(173,255,0,0.3)]"
          >
            <Dumbbell className="text-black" size={32} />
          </motion.div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">Unlock Fitness OS</h1>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Get the ultimate AI transformation protocol. Includes full access to GrindLog Premium.
          </p>
        </div>

        {/* Features Comparison */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-6 mb-10 overflow-hidden">
          <div className="grid grid-cols-12 mb-6 border-b border-[#1A2619] pb-4 items-center">
            <h3 className="col-span-6 font-bold text-gray-200 text-sm">Feature</h3>
            <div className="col-span-3 text-center text-xs font-semibold text-gray-400">Core</div>
            <div className="col-span-3 text-center font-black text-[#ADFF00] tracking-wider uppercase text-xs">Pro</div>
          </div>
          
          <div className="space-y-5">
            {features.map((feature, i) => (
              <div key={i} className="grid grid-cols-12 items-center">
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1A2619] flex items-center justify-center text-gray-400 shrink-0">
                    <feature.icon size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-300 leading-tight pr-2">{feature.label}</span>
                </div>
                
                <div className="col-span-3 flex justify-center">
                  {typeof feature.core === "boolean" ? (
                    feature.core ? <Check size={16} className="text-gray-400" /> : <span className="text-gray-600 text-lg leading-none">&times;</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-gray-400">{feature.core}</span>
                  )}
                </div>
                
                <div className="col-span-3 flex justify-center">
                  {typeof feature.pro === "boolean" ? (
                    feature.pro ? <Check size={16} className="text-[#ADFF00]" strokeWidth={3} /> : <span className="text-gray-600 text-lg leading-none">&times;</span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#ADFF00]">{feature.pro}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Selector */}
        <div className="space-y-3 mb-10">
          {/* Core Plan */}
          <button
            onClick={() => setLevel("core")}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
              level === "core" 
                ? "border-[#ADFF00] bg-[#ADFF00]/5" 
                : "border-[#1A2619] bg-[#121E12] hover:border-gray-700"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${level === "core" ? "border-[#ADFF00]" : "border-gray-600"}`}>
                {level === "core" && <div className="w-3 h-3 rounded-full bg-[#ADFF00]" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">⚡</span>
                  <h3 className={`font-bold ${level === "core" ? "text-white" : "text-gray-300"}`}>Core</h3>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    {isLoadingPrices ? (
                      <span className="animate-pulse bg-[#1A2619] text-transparent rounded px-2 text-sm">₹00</span>
                    ) : (pricingConfig.monthly?.core?.originalPrice && pricingConfig.monthly.core.originalPrice > (pricingConfig.monthly?.core?.price || 29)) ? (
                      <span className="text-sm text-gray-500 line-through font-semibold">
                        ₹{pricingConfig.monthly.core.originalPrice}
                      </span>
                    ) : null}
                    <span className={`text-2xl font-black ${level === "core" ? "text-[#ADFF00]" : "text-white"}`}>
                      {isLoadingPrices ? (
                        <span className="animate-pulse bg-[#1A2619] text-transparent rounded px-2">₹00</span>
                      ) : (
                        `₹${pricingConfig.monthly?.core?.price || 29}`
                      )}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">/month</span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Pro Plan */}
          <button
            onClick={() => setLevel("pro")}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
              level === "pro" 
                ? "border-[#ADFF00] bg-[#ADFF00]/5" 
                : "border-[#1A2619] bg-[#121E12] hover:border-gray-700"
            }`}
          >
            <div className="absolute top-0 right-0 bg-[#ADFF00] text-black text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-wider uppercase">
              ⭐ Recommended
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${level === "pro" ? "border-[#ADFF00]" : "border-gray-600"}`}>
                {level === "pro" && <div className="w-3 h-3 rounded-full bg-[#ADFF00]" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🔥</span>
                  <h3 className={`font-bold ${level === "pro" ? "text-white" : "text-gray-300"}`}>Pro</h3>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    {isLoadingPrices ? (
                      <span className="animate-pulse bg-[#1A2619] text-transparent rounded px-2 text-sm">₹00</span>
                    ) : (pricingConfig.monthly?.pro?.originalPrice && pricingConfig.monthly.pro.originalPrice > (pricingConfig.monthly?.pro?.price || 99)) ? (
                      <span className="text-sm text-gray-500 line-through font-semibold">
                        ₹{pricingConfig.monthly.pro.originalPrice}
                      </span>
                    ) : null}
                    <span className={`text-2xl font-black ${level === "pro" ? "text-[#ADFF00]" : "text-white"}`}>
                      {isLoadingPrices ? (
                        <span className="animate-pulse bg-[#1A2619] text-transparent rounded px-2">₹00</span>
                      ) : (
                        `₹${pricingConfig.monthly?.pro?.price || 99}`
                      )}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">/month</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0A1108] via-[#0A1108] to-transparent pt-12 z-50">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handlePayment}
            disabled={isProcessing || isCurrentPlan || isPolling}
            className="w-full py-4 bg-[#ADFF00] text-black rounded-full font-extrabold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.2)] hover:bg-[#9BE600] disabled:opacity-70 disabled:shadow-none transition-all"
          >
            {isProcessing || isPolling ? (
              <span className="flex items-center gap-2 animate-pulse">
                <Zap size={20} className="animate-spin" /> Processing Payment...
              </span>
            ) : isCurrentPlan ? (
              <span className="flex items-center gap-2">
                <Check size={20} /> Current Active Plan
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Get Fitness OS Pro <ChevronLeft className="w-5 h-5 rotate-180" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


