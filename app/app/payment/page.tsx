"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import Image from "next/image";
import {
  ChevronLeft,
  Check,
  Infinity as InfinityIcon,
  Sparkles,
  TreeDeciduous,
  LayoutGrid,
  Trophy,
  Notebook,
  Calendar,
  BarChart3,
  Brain,
  Star,
  Crown,
  X,
  BellRing,
  Ticket,
  Table,
} from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";
import { createRazorpayOrder, verifyRazorpayPayment, validateCouponAction, checkUserPremiumStatusAction, getUserPremiumDetailsAction } from "@/app/actions/payment";
import { getPlanPricesAction } from "@/app/actions/admin-pricing";
import { DEFAULT_PRICING, PlanPricingConfig } from "@/lib/constants/pricing";

const features = [
  { icon: InfinityIcon, label: "Unlimited Active Habits", value: "" },
  { icon: Calendar, label: "Smart Planner", value: "" },
  { icon: TreeDeciduous, label: "Virtual Growth Tree", value: "" },
  { icon: LayoutGrid, label: "Full Life Tracking", value: "Full Suite" },
  { icon: Trophy, label: "Gamified Quests", value: "Unlimited" },
  { icon: BarChart3, label: "Advanced Analytics", value: "" },
  { icon: BellRing, label: "Smart Reminders", value: "" },
  { icon: Table, label: "Smart Track Sheet", value: "" },
];

const reviews = [
  { text: "Bro, this app is exactly what I needed. The tree visualization makes tracking habits so much fun!", author: "Karthik", role: "21", stars: 5 },
  { text: "Finally a habit tracker that doesn't feel like a chore. Premium is worth every rupee. Super ah irukku!", author: "Divya", role: "24", stars: 5 },
  { text: "The AI coach works surprisingly well. Very useful for staying consistent with my daily routine.", author: "Surya", role: "22", stars: 5 },
];

const basePlans = [
  {
    id: "monthly",
    name: "Monthly",
    emoji: "🌱",
    basePrices: { core: 49, pro: 69 },
    period: "/month",
    originalPrice: null,
    badge: null,
    savings: null,
  }
];

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "six_months" | "lifetime">("monthly");
  const [level, setLevel] = useState<"core" | "pro">("pro");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pricingConfig, setPricingConfig] = useState<PlanPricingConfig>(DEFAULT_PRICING);
  const [currentPremiumInfo, setCurrentPremiumInfo] = useState<{ premium_tier?: string; premium_level?: string } | null>(null);

  // Fetch current premium status
  useEffect(() => {
    getUserPremiumDetailsAction().then((res) => {
      if (res) setCurrentPremiumInfo(res as any);
    });
  }, []);

  // Reliable redirect effect
  useEffect(() => {
    if (isSuccess) {
      if (returnTo) {
        window.location.href = `${returnTo}?success=true&t=${Date.now()}`;
      } else {
        window.location.href = "/dashboard?success=true&t=" + Date.now();
      }
    }
  }, [isSuccess, returnTo]);

  // Robust polling that survives modal dismissal
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let attempts = 0;

    const pollPremiumStatus = () => {
      attempts++;
      if (!isPolling || attempts > 30) return; // Stop polling after ~2 minutes
      
      checkUserPremiumStatusAction(selectedPlan, level).then((isPremium) => {
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
    getPlanPricesAction().then((res) => {
      if (res) setPricingConfig(res);
    });
  }, []);

  // Check if user is already premium on mount ONLY IF they initiated a payment in this session (e.g., returning from UPI)
  useEffect(() => {
    if (sessionStorage.getItem("payment_in_progress") === "true") {
      checkUserPremiumStatusAction().then((isPremium) => {
        if (isPremium) {
          sessionStorage.removeItem("payment_in_progress");
          setIsSuccess(true);
        }
      });
    }
  }, []);
  
  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; discount: number; allowed_plan?: string | null; allowed_level?: string | null } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    
    const res = await validateCouponAction(couponInput);
    
    if (res.success && res.discount && res.id) {
      if (res.allowed_plan && res.allowed_plan !== "any" && res.allowed_plan !== selectedPlan) {
        setCouponError(`This coupon is only valid for the ${basePlans.find(p => p.id === res.allowed_plan)?.name} plan`);
        setAppliedCoupon(null);
      } else if (res.allowed_level && res.allowed_level !== "any" && res.allowed_level !== level) {
        setCouponError(`This coupon is only valid for ${res.allowed_level} level`);
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({ id: res.id, discount: res.discount, allowed_plan: res.allowed_plan, allowed_level: res.allowed_level });
      }
    } else {
      setCouponError(res.error || "Invalid coupon");
      setAppliedCoupon(null);
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const handlePlanChange = (planId: "monthly" | "six_months" | "lifetime") => {
    setSelectedPlan(planId);
    if (appliedCoupon?.allowed_plan && appliedCoupon.allowed_plan !== "any" && appliedCoupon.allowed_plan !== planId) {
      removeCoupon();
    }
  };

  const handleLevelChange = (newLevel: "core" | "pro") => {
    setLevel(newLevel);
    if (appliedCoupon?.allowed_level && appliedCoupon.allowed_level !== "any" && appliedCoupon.allowed_level !== newLevel) {
      removeCoupon();
    }
  };

  const isCouponValidForPlan = (planId: string, currentLevel: string) => {
    if (!appliedCoupon) return false;
    if (appliedCoupon.allowed_plan && appliedCoupon.allowed_plan !== "any" && appliedCoupon.allowed_plan !== planId) return false;
    if (appliedCoupon.allowed_level && appliedCoupon.allowed_level !== "any" && appliedCoupon.allowed_level !== currentLevel) return false;
    return true;
  };

  const handleContinue = async () => {
    setIsProcessing(true);
    setIsPolling(true); // Start polling when they initiate
    sessionStorage.setItem("payment_in_progress", "true");
    
    // 1. Create Order
    const orderRes = await createRazorpayOrder(selectedPlan, level, appliedCoupon?.id);
    
    if (!orderRes.success) {
      setIsProcessing(false);
      alert(orderRes.error || "Failed to initiate payment");
      return;
    }

    // 2. Handle 100% discount bypass
    if (orderRes.bypassRazorpay) {
      const verifyRes = await verifyRazorpayPayment(
        "", "", "", 
        selectedPlan, level, appliedCoupon?.id, true
      );
      
      if (verifyRes.success) {
        setIsSuccess(true);
      } else {
        setIsProcessing(false);
        alert(verifyRes.error || "Failed to process free tier");
      }
      return;
    }

    // 3. Open Razorpay Checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderRes.amount,
      currency: orderRes.currency,
      name: "GrindLog Premium",
      description: `Upgrade to ${level.toUpperCase()} - ${selectedPlan}`,
      order_id: orderRes.orderId,
      callback_url: `${window.location.origin}/api/payment/callback`,
      redirect: true,
      handler: function (response: any) {
        setIsProcessing(true); // Ensure UI stays in processing state until redirect
        verifyRazorpayPayment(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature,
          selectedPlan,
          level,
          appliedCoupon?.id,
          false
        )
        .then((verifyRes) => {
          if (verifyRes.success) {
            sessionStorage.removeItem("payment_in_progress");
            setIsSuccess(true);
          } else {
            sessionStorage.removeItem("payment_in_progress");
            setIsProcessing(false);
            alert(verifyRes.error || "Payment verification failed");
          }
        })
        .catch((err: any) => {
          sessionStorage.removeItem("payment_in_progress");
          console.error("Verification error:", err);
          setIsProcessing(false);
          alert(err?.message || "Payment completed, but verification encountered an error. Please refresh your dashboard.");
        });
      },
      prefill: {
        name: "", // Can be prefilled if we have user profile
        email: "",
      },
      theme: {
        color: "#22c55e",
      },
      modal: {
        ondismiss: function () {
          sessionStorage.removeItem("payment_in_progress");
          setIsProcessing(false);
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      sessionStorage.removeItem("payment_in_progress");
      setIsProcessing(false);
      alert(response.error.description || "Payment failed");
    });
    rzp.open();
  };

  // Calculate discounted price safely
  const calculatePrice = (base: number, planId: string, currentLevel: string) => {
    if (!isCouponValidForPlan(planId, currentLevel)) return `₹${base}`;
    const discount = (base * appliedCoupon!.discount) / 100;
    const final = Math.round(base - discount);
    return final <= 0 ? "Free" : `₹${final}`;
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="flex flex-col gap-4 px-5 pb-8 pt-0 safe-top">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[var(--color-accent-green-light)] via-white to-[var(--color-bg-secondary)] p-6 pt-10 text-center"
      >
        {/* Integrated Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/60 backdrop-blur-md shadow-sm"
        >
          <ChevronLeft className="h-5 w-5 text-[var(--color-text-primary)]" />
        </button>

        <div className="absolute left-16 top-4 text-5xl opacity-20">🌱</div>
        <div className="absolute right-6 top-6 text-5xl opacity-15">🌿</div>
        <div className="absolute bottom-4 right-4 text-4xl opacity-15">🌳</div>

        <motion.div
          className="mx-auto mb-4"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center justify-center gap-2 text-5xl">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              🌱
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              🌿
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              🌳
            </motion.span>
          </div>
        </motion.div>

        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Unlock Your
          <br />
          Full Potential
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-xs mx-auto">
          Premium features, unlimited habits, and everything you need to hit your goals.
        </p>
      </motion.div>

      {/* Feature List */}
      <div className="rounded-2xl bg-[var(--color-bg-secondary)] overflow-hidden py-1 border border-[var(--color-bg-tertiary)]">
        {features.map((f, i) => (
          <div
            key={f.label}
            className={cn(
              "flex items-center justify-between gap-2 px-5 py-3.5",
              i < features.length - 1 && "border-b border-[var(--color-bg-tertiary)]"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-green)]/10 text-[var(--color-accent-green)]">
                <f.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">
                {f.label}
              </span>
            </div>
            <div className="flex justify-center">
              {f.value ? (
                <span className="text-xs font-bold text-[var(--color-accent-green)] bg-[var(--color-accent-green)]/10 px-2 py-1 rounded-md">{f.value}</span>
              ) : (
                <Check className="h-5 w-5 text-[var(--color-accent-green)]" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reviews */}
      <div>
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3">
          What Users Say
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {reviews.map((review) => (
            <div
              key={review.author}
              className="min-w-[220px] rounded-2xl bg-[var(--color-bg-secondary)] p-4"
            >
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: review.stars }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[var(--color-xp)] text-[var(--color-xp)]" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
                &ldquo;{review.text}&rdquo;
              </p>
              <p className="mt-2 text-xs font-semibold text-[var(--color-text-secondary)]">
                — {review.author}, {review.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Your Plan
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {basePlans.map((plan) => {
            const planPricing = pricingConfig[plan.id as keyof PlanPricingConfig]?.[level] || { price: plan.basePrices[level] };
            const offerPrice = planPricing.price;
            const originalPrice = planPricing.originalPrice;
            const isCurrentPlan = currentPremiumInfo?.premium_tier === plan.id && currentPremiumInfo?.premium_level === level;

            return (
              <motion.button
                key={plan.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePlanChange(plan.id as any)}
                className={cn(
                  "relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                  selectedPlan === plan.id
                    ? "border-[var(--color-accent-green)] bg-[var(--color-accent-green-light)] shadow-[var(--shadow-glow-green)]"
                    : "border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)]"
                )}
              >
                {isCurrentPlan ? (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-0.5">
                    <span className="text-[10px] font-bold text-white">✓ Current Plan</span>
                  </div>
                ) : plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-accent-green)] px-3 py-0.5">
                    <span className="text-[10px] font-bold text-white">{plan.badge}</span>
                  </div>
                )}
                <span className="text-2xl">{plan.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">
                    {plan.name}
                  </p>
                  {plan.savings && (
                    <p className="text-[10px] font-semibold text-[var(--color-accent-green)]">
                      {plan.savings}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {appliedCoupon && isCouponValidForPlan(plan.id, level) ? (
                      <span className="text-[10px] text-gray-400 line-through font-semibold">
                        ₹{offerPrice}
                      </span>
                    ) : (
                      originalPrice && originalPrice > offerPrice && (
                        <span className="text-[10px] text-gray-400 line-through font-semibold">
                          ₹{originalPrice}
                        </span>
                      )
                    )}
                    <p className="text-lg font-extrabold text-[var(--color-text-primary)]">
                      {calculatePrice(offerPrice, plan.id, level)}
                    </p>
                  </div>
                  <p className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
                    {plan.period}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Coupon Section */}
      <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-4 border border-[var(--color-bg-tertiary)]">
        {appliedCoupon ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--color-accent-green)]">
              <Ticket className="w-4 h-4" />
              <span className="text-sm font-bold">{appliedCoupon.discount}% OFF APPLIED</span>
            </div>
            <button 
              onClick={removeCoupon}
              className="text-xs text-[var(--color-text-tertiary)] hover:text-red-500 font-semibold"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Ticket className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">Have a promo code?</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 px-3 py-2 text-sm uppercase rounded-xl border border-[var(--color-bg-tertiary)] outline-none focus:border-[var(--color-accent-green)]"
              />
              <button 
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponInput.trim()}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
              >
                {couponLoading ? "..." : "Apply"}
              </button>
            </div>
            {couponError && <p className="mt-2 text-xs text-red-500 font-medium">{couponError}</p>}
          </div>
        )}
      </div>

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        disabled={isProcessing || (currentPremiumInfo?.premium_tier === selectedPlan && currentPremiumInfo?.premium_level === level)}
        onClick={handleContinue}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent-green)] text-base font-semibold text-white shadow-lg shadow-[var(--color-accent-green)]/25 disabled:opacity-80 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing...
          </>
        ) : currentPremiumInfo?.premium_tier === selectedPlan && currentPremiumInfo?.premium_level === level ? (
          <>
            <Check className="h-5 w-5" />
            This is your current plan
          </>
        ) : (
          <>
            <Crown className="h-5 w-5" />
            {appliedCoupon && isCouponValidForPlan(selectedPlan, level) && appliedCoupon.discount === 100 ? "Get it for Free" : `Continue with ${basePlans.find(p => p.id === selectedPlan)?.name}`}
          </>
        )}
      </motion.button>

      <div className="h-4" />
      
      {/* Full screen overlay */}
      {(isProcessing || isSuccess) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-xl">
            {isSuccess ? (
              <>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-[var(--color-text-primary)]">
                  Payment Successful! Redirecting...
                </p>
              </>
            ) : (
              <>
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-accent-green)] border-t-transparent" />
                <p className="text-sm font-bold text-[var(--color-text-primary)]">
                  Processing Payment...
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
