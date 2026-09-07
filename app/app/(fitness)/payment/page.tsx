"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  Dumbbell,
  Timer,
  Sparkles,
  Lock,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSafeRedirect } from "@/lib/utils/redirect";
import { createRazorpayOrder, verifyRazorpayPayment, checkUserPremiumStatusAction, getUserPremiumDetailsAction } from "@/app/actions/payment";
import { getPlanPricesAction } from "@/app/actions/admin-pricing";
import { DEFAULT_PRICING, PlanPricingConfig } from "@/lib/constants/pricing";
import { LuckyWheelModal } from "@/components/fitness/subscription/lucky-wheel-modal";

const features = [
  { icon: Target, label: "Personalized 7-day plan", core: true, pro: true },
  { icon: Zap, label: "AI Daily Generations", core: "3 / day", pro: "20 / day" },
  { icon: Dumbbell, label: "Basic exercise guidance", core: true, pro: "Full AI guidance" },
  { icon: Dumbbell, label: "Full exercise library", core: false, pro: true },
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
  const requestedPlan = searchParams.get("plan") || (searchParams.get("intent") === "upgrade_core" ? "core" : null);
  const [level, setLevel] = useState<"core" | "pro">(requestedPlan === "core" ? "core" : "pro");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pricingConfig, setPricingConfig] = useState<PlanPricingConfig>(DEFAULT_PRICING);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [currentPremiumInfo, setCurrentPremiumInfo] = useState<{ premium_tier?: string; premium_level?: string } | null>(null);
  const [premiumStatusLoaded, setPremiumStatusLoaded] = useState(false);
  const isPlanGenerationIntent = searchParams.get("intent") === "generate_plan";
  const isUpgradeIntent = searchParams.get("intent") === "upgrade_pro";

  // Lucky Wheel & 50% discount state
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [discountToken, setDiscountToken] = useState<string | null>(null);
  const [discountExpiresAt, setDiscountExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isDiscountExpired, setIsDiscountExpired] = useState(false);

  // Current membership checks
  const isCurrentCore = Boolean(
    currentPremiumInfo?.premium_level === "core" && 
    (currentPremiumInfo as any)?.is_premium
  );

  // Initialize Lucky Wheel and load active discount session
  useEffect(() => {
    if (!premiumStatusLoaded) return;
    
    // Core subscribers never see the wheel; their Pro upgrade is permanently locked at ₹99!
    if (isCurrentCore) {
      setShowSpinModal(false);
      setLevel("pro");
      return;
    }

    const savedToken = sessionStorage.getItem("fitness_spin_discount_token");
    const savedExpiresAt = sessionStorage.getItem("fitness_spin_discount_expires_at");
    const hasSeenSpin = sessionStorage.getItem("fitness_spin_completed_or_dismissed");

    if (savedToken && savedExpiresAt) {
      const expiresAtNum = parseInt(savedExpiresAt, 10);
      const now = Date.now();
      if (now < expiresAtNum) {
        setDiscountToken(savedToken);
        setDiscountExpiresAt(expiresAtNum);
        setRemainingSeconds(Math.max(0, Math.floor((expiresAtNum - now) / 1000)));
      } else {
        setIsDiscountExpired(true);
        sessionStorage.removeItem("fitness_spin_discount_token");
      }
    } else if (!hasSeenSpin) {
      // Auto-trigger spinner modal after 1.2s for returning free users
      const timer = setTimeout(() => {
        setShowSpinModal(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [premiumStatusLoaded, isCurrentCore]);

  // 1-second countdown ticker for active discount
  useEffect(() => {
    if (!discountExpiresAt || isDiscountExpired || isCurrentCore) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((discountExpiresAt - now) / 1000);

      if (diff <= 0) {
        setRemainingSeconds(0);
        setIsDiscountExpired(true);
        setDiscountToken(null);
        sessionStorage.removeItem("fitness_spin_discount_token");
        clearInterval(interval);
      } else {
        setRemainingSeconds(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [discountExpiresAt, isDiscountExpired, isCurrentCore]);

  const handleClaimDiscount = (data: {
    token: string;
    expiresAt: number;
    prices: { core: number; pro: number };
    regularPrices: { core: number; pro: number };
  }) => {
    setDiscountToken(data.token);
    setDiscountExpiresAt(data.expiresAt);
    setRemainingSeconds(Math.max(0, Math.floor((data.expiresAt - Date.now()) / 1000)));
    setIsDiscountExpired(false);
    sessionStorage.setItem("fitness_spin_discount_token", data.token);
    sessionStorage.setItem("fitness_spin_discount_expires_at", data.expiresAt.toString());
    sessionStorage.setItem("fitness_spin_completed_or_dismissed", "true");
  };

  const handleCloseSpinModal = () => {
    setShowSpinModal(false);
    sessionStorage.setItem("fitness_spin_completed_or_dismissed", "true");
  };

  const isDiscountActive = isCurrentCore || (Boolean(discountToken) && !isDiscountExpired && remainingSeconds > 0);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
    if (isPlanGenerationIntent && !isUpgradeIntent && premiumStatusLoaded && currentPremiumInfo) {
      setIsSuccess(true);
    }
  }, [currentPremiumInfo, isPlanGenerationIntent, isUpgradeIntent, premiumStatusLoaded]);

  // Reliable redirect effect
  useEffect(() => {
    if (isSuccess) {
      const separator = returnTo.includes("?") ? "&" : "?";
      window.location.href = `${returnTo}${separator}success=true&t=${Date.now()}`;
    }
  }, [isSuccess, returnTo]);

  // Robust polling that survives modal dismissal or external redirect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let attempts = 0;

    const pollPremiumStatus = () => {
      attempts++;
      if (attempts > 20) {
        setIsPolling(false);
        setIsProcessing(false);
        sessionStorage.removeItem("payment_in_progress");
        return;
      }
      
      checkUserPremiumStatusAction(selectedPlan, level, "fitness_os").then((isPremium) => {
        if (isPremium) {
          setIsSuccess(true);
          setIsPolling(false);
          setIsProcessing(false);
          sessionStorage.removeItem("payment_in_progress");
        } else if (isPolling) {
          timeoutId = setTimeout(pollPremiumStatus, 4000);
        }
      }).catch(() => {
        setIsPolling(false);
        setIsProcessing(false);
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

      const orderResponse = await createRazorpayOrder(
        selectedPlan, 
        level, 
        undefined, 
        "fitness_os",
        discountToken || undefined
      );

      if (!orderResponse.success) {
        if (orderResponse.error?.includes("expired")) {
          setIsDiscountExpired(true);
          setDiscountToken(null);
          sessionStorage.removeItem("fitness_spin_discount_token");
        }
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
          setIsProcessing(false);
          sessionStorage.removeItem("payment_in_progress");
        } else {
          throw new Error("Failed to activate free tier");
        }
        return;
      }

      if (typeof window === "undefined" || !(window as any).Razorpay) {
        throw new Error("Payment gateway is initializing. Please tap again in a moment.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: "Fitness OS",
        description: `Upgrade to ${level.toUpperCase()} - ${selectedPlan.replace('_', ' ').toUpperCase()}`,
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAEeklEQVR4nO2dz8sVVRjHj29oFmUulLBFaUFZWZIS1wyXWu3SMIoWUYL7MogrGhaVC1f1TwTJu6mlP9biSkuooCLblBZ5M1B4+/GRU2dgut73zDl3zrznzsz3s77nuTPf7/kx55mZZ4wRQgghhBBCCCFyAywD7gY2AduA9cBtuY+r0wB3Aq8B88AfTOY88CGwJffxdgZgBbAf+Jk4TsiImgAbgW+Ynr+Bw3bKqnssvQN4FhiRhk+1RkQA7AEWSItdOzQSMolfcKjyAPoMsLtB8Ys14fHc59kV8f8ELgBngcsR7T7Lfa4zB/B8hPi/AweA1WMbs+3A6cAY/dgnELDoAeuAa4HC/Qg84ok1B3wcEOd903WA291maF/Ab18C/goQ//6AWHMBI+Gc6YH4p0oLX10TgsQvxXqqwoB/gJWmB+KTwIQo8UtrQlXqYr3pifh1TIgWvxTnDH4GpkfiT2PC99OK72J8iZ9Npmfil014MiDmv3M08DCwPPJ4Vgdc1q4xPRTfcjQi9sAl5OZjTHD7hKq9RPvzQiyN+AVBJrgUthXYx3HTEfFPRoh/LCL2VuC3CTG8JgD3urWjildNmyGP+F4TIsT/BVhl2gp5xZ9oQoT4ljdMm+G/Xeb1JZjzfYyKnJB7IuKHwHZfd2IHDOwMSKA10fML8QdT9PyrvkRe6wB2eUZCkz2/EP9W4NvAdnZP8JzpGkweCY33/FL7ve7GjA+b1njZdBX+b8KSiR9oQnvFB26JnI7ea3raicyi2mnnBdPyS81hA7GT9PyKkdDqnj9+nT+cdfHHTLjedvEn5XbeTBA76bTj+Z97TEd3uMNZ7fmtJyK9MJwitsRPnFLeMWvTTmuZkcSaReIHcEziq+e3H007GZH4mQGecHnxEI5GxNXVToRY2wOeGtCCm9EEiZ/RBImf0QSJnwPgaeBIxO8HSi9kAqUX8oHETyLiuinbDTTtpHkD3d6ueyWy3VZlNdOIv1C6YR1kAhK/sdoLlSZI/OYLXyxqgsRfuqojN5kg8dMVOwqtvfCdfdDVtdPVTl2Ah4ArgeLb93AfcO10tVMXW5YrosbaRWCDa6een4KA1zNvEt+1OxjYbtS7R0dCAe4ALsVMO2Ptj0j8GgCvTyt+gAkj9fxqA+YDpo+NAXHelfiRuCJFV1O9nlkyYaSeHybY2grx7Z7grkhTh+UX4mLa9g7gsQoDvqgRe4PbrL2Y9qg7hLuO93GmhvgXXQz7+o9M8Ajl46fY8ixj4hfIBM8OuIptNcUvkAmLiGY/XuDDvgcwV1P8ApkwQbgPqOYjnwmuPFiV+AXXpr3H3ElcNjOEU67iybKxGmtvBTwzWr6s3ZP3jGcQ4HPCueRKO14IqLdQRuJ7DNjsqhI2xYJ6fvUoeKdB8XenHrWdw5Xt/UTi538VyX64JgVXgGdynk+bR8LhmmvCV8CDuc+l1QCPutFgS7aH8ivwtj79lNaILW6zdm4R0e0e4Lgtampvb6b8bzGGLd0I3Oc+hGk/iLlWIgkhhBBCCCGEMLPADQSR7/UMayFBAAAAAElFTkSuQmCC",
        order_id: orderResponse.orderId,
        handler: async function (response: any) {
          try {
            setIsProcessing(true);
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
              setIsProcessing(false);
              sessionStorage.removeItem("payment_in_progress");
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
            // User cancelled or exited Razorpay checkout
            setIsProcessing(false);
            setIsPolling(false);
            sessionStorage.removeItem("payment_in_progress");

            // Quick check in case webhook or external UPI completed in background
            checkUserPremiumStatusAction(undefined, undefined, "fitness_os").then((isPremium) => {
              if (isPremium) {
                setIsSuccess(true);
              }
            }).catch(() => {});
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error("Payment failed event:", response.error);
        setIsProcessing(false);
        setIsPolling(false);
        sessionStorage.removeItem("payment_in_progress");
      });
      
      rzp.open();
    } catch (error: any) {
      console.error("Payment Error:", error);
      alert(error.message || "Failed to initiate payment");
      setIsProcessing(false);
      setIsPolling(false);
      sessionStorage.removeItem("payment_in_progress");
    }
  };

  const isCurrentPlan = currentPremiumInfo?.premium_tier === selectedPlan && currentPremiumInfo?.premium_level === level;

  return (
    <div className="min-h-[100dvh] bg-[#0A1108] text-white flex flex-col relative overflow-hidden pb-[180px]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Lucky Wheel Modal */}
      <LuckyWheelModal
        isOpen={showSpinModal}
        onClose={handleCloseSpinModal}
        onClaimDiscount={handleClaimDiscount}
      />

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
          Fitness OS {level === "pro" ? "Pro" : "Core"}
        </div>
        <div className="w-10 h-10" />
      </div>

      {/* Urgency / Active Discount Sticky Banner */}
      {isCurrentCore ? (
        <div className="sticky top-[72px] z-40 bg-gradient-to-r from-[#0E1A0F] via-[#162B17] to-[#0E1A0F] border-b border-[#ADFF00]/40 py-2.5 px-4 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-black text-white truncate">
              <span className="text-base shrink-0">⭐</span>
              <span className="truncate uppercase tracking-wide text-[#ADFF00]">Core Member Privilege: Pro Locked at ₹99/mo</span>
            </div>
            <div className="bg-[#ADFF00] text-black font-black text-[10px] uppercase px-2.5 py-1 rounded-full shrink-0 shadow-[0_0_10px_rgba(173,255,0,0.3)]">
              Save ₹100/mo
            </div>
          </div>
        </div>
      ) : isDiscountActive ? (
        <div className="sticky top-[72px] z-40 bg-gradient-to-r from-[#0E1A0F] via-[#162B17] to-[#0E1A0F] border-b border-[#ADFF00]/40 py-2.5 px-4 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-black text-white truncate">
              <span className="text-base shrink-0">🔥</span>
              <span className="truncate uppercase tracking-wide text-[#ADFF00]">50% OFF Locked In For All Months</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/70 border border-[#ADFF00]/60 rounded-full px-2.5 py-1 text-[#ADFF00] font-mono font-black text-xs shrink-0 shadow-[0_0_10px_rgba(173,255,0,0.2)]">
              <Timer size={13} className="animate-spin text-[#ADFF00]" />
              <span>{formatTime(remainingSeconds)}</span>
            </div>
          </div>
        </div>
      ) : isDiscountExpired ? (
        <div className="sticky top-[72px] z-40 bg-red-950/60 border-b border-red-500/30 py-2 px-4 backdrop-blur-md text-center">
          <span className="text-xs font-semibold text-red-300">
            ⚠️ 50% discount offer has expired. Standard prices restored.
          </span>
        </div>
      ) : null}

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

        {/* Prominent On-Page Lucky Wheel Banner (Visible before claiming discount) */}
        {!isDiscountActive && !isCurrentCore && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-3xl bg-gradient-to-br from-[#122413] via-[#0E1A0F] to-[#142615] border-2 border-[#ADFF00]/40 shadow-[0_0_30px_rgba(173,255,0,0.15)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#ADFF00]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#ADFF00] text-black flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(173,255,0,0.4)] shrink-0">
                🎡
              </div>
              <div>
                <div className="text-[10px] font-black text-[#ADFF00] uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={11} /> Exclusive Athlete Reward
                </div>
                <h3 className="text-lg font-black text-white leading-tight">
                  Spin & Win Up to 50% OFF!
                </h3>
              </div>
            </div>
            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              Don't pay full price! Every athlete gets 1 free spin to unlock a permanent Lifetime Price Lock discount.
            </p>
            <button
              type="button"
              onClick={() => setShowSpinModal(true)}
              className="w-full py-3.5 px-4 bg-[#ADFF00] text-black rounded-2xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#c6ff47] active:scale-[0.98] shadow-[0_0_20px_rgba(173,255,0,0.25)] transition-all cursor-pointer"
            >
              <span>Spin The Lucky Wheel 🎰</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}

        {/* Plan Selector */}
        <div className="space-y-3 mb-6">
          {/* Core Plan */}
          <button
            onClick={() => {
              if (!isCurrentCore) setLevel("core");
            }}
            disabled={isCurrentCore}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
              isCurrentCore
                ? "border-gray-700/50 bg-[#121E12]/50 opacity-80 cursor-default"
                : level === "core" 
                  ? "border-[#ADFF00] bg-[#ADFF00]/5 cursor-pointer" 
                  : "border-[#1A2619] bg-[#121E12] hover:border-gray-700 cursor-pointer"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isCurrentCore ? "border-gray-500 bg-gray-500/20" : level === "core" ? "border-[#ADFF00]" : "border-gray-600"}`}>
                {isCurrentCore ? (
                  <Check size={14} className="text-gray-300" />
                ) : level === "core" ? (
                  <div className="w-3 h-3 rounded-full bg-[#ADFF00]" />
                ) : null}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <h3 className={`font-bold ${level === "core" && !isCurrentCore ? "text-white" : "text-gray-300"}`}>Core</h3>
                  </div>
                  {isCurrentCore ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 text-gray-300 border border-white/20 px-2 py-0.5 rounded-full">
                      Current Plan
                    </span>
                  ) : isDiscountActive ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#ADFF00]/15 text-[#ADFF00] border border-[#ADFF00]/30 px-2 py-0.5 rounded-full">
                      50% OFF • ALL MONTHS
                    </span>
                  ) : null}
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    {isCurrentCore ? (
                      <span className="text-xs text-gray-400 font-medium">Active Subscription</span>
                    ) : isDiscountActive ? (
                      <>
                        <span className="text-sm text-gray-500 line-through font-semibold">₹59</span>
                        <span className={`text-2xl font-black ${level === "core" ? "text-[#ADFF00]" : "text-white"}`}>₹29</span>
                        <span className="text-xs text-gray-500 font-medium">/month</span>
                      </>
                    ) : (
                      <>
                        <span className={`text-2xl font-black ${level === "core" ? "text-[#ADFF00]" : "text-white"}`}>₹59</span>
                        <span className="text-xs text-gray-500 font-medium">/month</span>
                      </>
                    )}
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
            } cursor-pointer`}
          >
            <div className="absolute top-0 right-0 bg-[#ADFF00] text-black text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-wider uppercase">
              {isCurrentCore ? "⭐ Upgrade Here" : "⭐ Recommended"}
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${level === "pro" ? "border-[#ADFF00]" : "border-gray-600"}`}>
                {level === "pro" && <div className="w-3 h-3 rounded-full bg-[#ADFF00]" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1 pr-24">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <h3 className={`font-bold ${level === "pro" ? "text-white" : "text-gray-300"}`}>Pro</h3>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    {isCurrentCore || isDiscountActive ? (
                      <>
                        <span className="text-sm text-gray-500 line-through font-semibold">₹199</span>
                        <span className={`text-2xl font-black ${level === "pro" ? "text-[#ADFF00]" : "text-white"}`}>₹99</span>
                        <span className="text-xs text-gray-500 font-medium">/month</span>
                        <span className="ml-auto text-[10px] font-black uppercase tracking-wider bg-[#ADFF00]/15 text-[#ADFF00] border border-[#ADFF00]/30 px-2 py-0.5 rounded-full">
                          {isCurrentCore ? "LOCKED UPGRADE RATE" : "50% OFF • ALL MONTHS"}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`text-2xl font-black ${level === "pro" ? "text-[#ADFF00]" : "text-white"}`}>₹199</span>
                        <span className="text-xs text-gray-500 font-medium">/month</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Lifetime Price Lock Guarantee Pill */}
        {isCurrentCore ? (
          <div className="bg-[#121E12] border border-[#1F331F] rounded-2xl p-3.5 flex items-center gap-3 text-left mb-6 shadow-[0_0_20px_rgba(173,255,0,0.1)]">
            <ShieldCheck className="text-[#ADFF00] shrink-0" size={24} />
            <div className="text-xs text-gray-300 leading-snug">
              <span className="font-bold text-white">Core Member Upgrade:</span> Pay only <span className="text-[#ADFF00] font-bold">₹99 today</span> to unlock all Pro features for 30 full days. Your ₹99/mo rate is permanently locked for all future renewals.
            </div>
          </div>
        ) : isDiscountActive ? (
          <div className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-3.5 flex items-center gap-3 text-left mb-6">
            <ShieldCheck className="text-[#ADFF00] shrink-0" size={22} />
            <div className="text-xs text-gray-300 leading-snug">
              <span className="font-bold text-white">Lifetime Price Lock Active:</span> You will pay <span className="text-[#ADFF00] font-bold">{level === "pro" ? "₹99" : "₹29"}/mo</span> every month on all renewals as long as your plan remains active.
            </div>
          </div>
        ) : null}
      </div>

      {/* Floating CTA with Nested Spin & Win Badge (Zero Overlap) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(env(safe-area-inset-bottom),16px)] bg-gradient-to-t from-[#0A1108] via-[#0A1108]/95 to-transparent pt-8 z-50 pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto flex flex-col">
          {/* Spin & Win Quick Trigger Badge (Cleanly positioned above the button, zero overlap) */}
          {!isDiscountActive && !isCurrentCore && !showSpinModal && (
            <div className="flex justify-end mb-2.5">
              <motion.button
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                onClick={() => setShowSpinModal(true)}
                className="bg-[#0E1A0F] border-2 border-[#ADFF00] text-white py-1.5 px-3.5 rounded-full shadow-[0_0_20px_rgba(173,255,0,0.35)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              >
                <span className="text-sm animate-bounce">🎡</span>
                <span className="text-xs font-black text-[#ADFF00] group-hover:underline">Spin & Win 50% OFF</span>
              </motion.button>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={isProcessing || isCurrentPlan || isPolling}
            className="w-full py-4 bg-[#ADFF00] text-black rounded-full font-extrabold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.2)] hover:bg-[#9BE600] disabled:opacity-70 disabled:shadow-none transition-all cursor-pointer"
          >
            {isProcessing || isPolling ? (
              <span className="flex items-center gap-2 animate-pulse">
                <Zap size={20} className="animate-spin" /> Processing Payment...
              </span>
            ) : isCurrentPlan ? (
              <span className="flex items-center gap-2">
                <Check size={20} /> Current Active Plan
              </span>
            ) : isCurrentCore ? (
              <span className="flex items-center gap-2">
                Upgrade to Fitness OS Pro (₹99) <ChevronLeft className="w-5 h-5 rotate-180" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Get Fitness OS {level === "pro" ? "Pro" : "Core"} ({isDiscountActive ? (level === "pro" ? "₹99/mo" : "₹29/mo") : (level === "pro" ? "₹199/mo" : "₹59/mo")}) <ChevronLeft className="w-5 h-5 rotate-180" />
              </span>
            )}
          </button>

          <div className="mt-3 text-center">
            {isCurrentCore ? (
              <Link
                href="/"
                className="text-xs font-bold text-white/50 hover:text-[#ADFF00] transition-colors inline-flex items-center gap-1 py-1 cursor-pointer"
              >
                Keep Core Plan (Back to Dashboard) →
              </Link>
            ) : (
              <Link
                href="/"
                className="text-xs font-bold text-white/50 hover:text-[#ADFF00] transition-colors inline-flex items-center gap-1 py-1 cursor-pointer"
              >
                Continue with Free →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


