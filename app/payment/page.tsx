"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";
import { processMockPayment } from "@/app/actions/payment";

const features = [
  { icon: InfinityIcon, label: "Unlimited Habits", core: true, pro: true },
  { icon: Calendar, label: "Smart Planner", core: true, pro: true },
  { icon: TreeDeciduous, label: "Virtual Growth Tree", core: true, pro: true },
  { icon: LayoutGrid, label: "Full Life Tracking", core: "Basic", pro: "Full Suite" },
  { icon: Trophy, label: "Gamified Quests", core: "Limited", pro: "Unlimited" },
  { icon: Notebook, label: "Daily AI Journaling", core: false, pro: "10/day" },
  { icon: BarChart3, label: "Advanced Analytics", core: false, pro: true },
  { icon: Brain, label: "Personal AI Coach", core: false, pro: "10/day" },
  { icon: BellRing, label: "Mobile Push Notifications", core: true, pro: "Smart Reminders" },
];

const reviews = [
  { text: "Changed my life. The tree visualization makes habits actually fun.", author: "Rahul", role: "28, Engineer", stars: 5 },
  { text: "Finally a habit tracker that doesn't feel like a chore. Premium is worth every rupee.", author: "Priya", role: "24, Designer", stars: 5 },
  { text: "The AI coach is surprisingly good. Better than I expected!", author: "Arjun", role: "31, Entrepreneur", stars: 5 },
];

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    emoji: "🌱",
    prices: { core: "₹49", pro: "₹69" },
    period: "/month",
    originalPrice: null,
    badge: null,
  },
  {
    id: "six_months",
    name: "6 Months",
    emoji: "🌿",
    prices: { core: "₹199", pro: "₹249" },
    period: "/6 months",
    originalPrice: "₹294",
    badge: "⭐ Most Popular",
    savings: "Save 32%",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    emoji: "👑",
    prices: { core: "₹599", pro: "₹799" },
    period: "one-time",
    originalPrice: null,
    badge: "🔥 Best Value",
    savings: null,
  },
];

export default function PaymentPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "six_months" | "lifetime">("six_months");
  const [level, setLevel] = useState<"core" | "pro">("pro");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = async () => {
    setIsProcessing(true);
    const result = await processMockPayment(selectedPlan, level);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setIsProcessing(false);
      alert("Payment failed: " + result.error);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-4 safe-top">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]"
      >
        <ChevronLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
      </button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[var(--color-accent-green-light)] via-white to-[var(--color-bg-secondary)] p-8 text-center"
      >
        <div className="absolute left-4 top-4 text-5xl opacity-20">🌱</div>
        <div className="absolute right-6 top-6 text-5xl opacity-15">🌳</div>
        <div className="absolute bottom-4 right-4 text-4xl opacity-15">✨</div>

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
              →
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
          Premium features, unlimited habits, and an AI coach that actually knows you.
        </p>
      </motion.div>

      {/* Feature Comparison */}
      <div className="rounded-2xl bg-[var(--color-bg-secondary)] overflow-hidden">
        <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-[var(--color-bg-tertiary)]">
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">Feature</span>
          <span className="text-xs font-semibold text-[var(--color-text-tertiary)] text-center">Core</span>
          <span className="text-xs font-semibold text-[var(--color-accent-green)] text-center">Pro</span>
        </div>
        {features.map((f, i) => (
          <div
            key={f.label}
            className={cn(
              "grid grid-cols-3 gap-2 px-4 py-3 items-center",
              i < features.length - 1 && "border-b border-[var(--color-bg-tertiary)]"
            )}
          >
            <div className="flex items-center gap-2">
              <f.icon className="h-4 w-4 text-[var(--color-text-secondary)] shrink-0" />
              <span className="text-xs font-medium text-[var(--color-text-primary)] leading-tight">
                {f.label}
              </span>
            </div>
            <div className="flex justify-center">
              {typeof f.core === "boolean" ? (
                f.core ? (
                  <Check className="h-4 w-4 text-[var(--color-text-primary)]" />
                ) : (
                  <X className="h-4 w-4 text-[var(--color-text-tertiary)] opacity-50" />
                )
              ) : (
                <span className="text-xs text-center text-[var(--color-text-tertiary)]">{f.core}</span>
              )}
            </div>
            <div className="flex justify-center">
              {typeof f.pro === "boolean" ? (
                f.pro ? (
                  <Check className="h-4 w-4 text-[var(--color-accent-green)]" />
                ) : (
                  <X className="h-4 w-4 text-[var(--color-text-tertiary)] opacity-50" />
                )
              ) : (
                <span className="text-xs text-center text-[var(--color-accent-green)] font-medium">{f.pro}</span>
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
            Choose Your Plan
          </h3>
          
          <div className="flex items-center rounded-full bg-[var(--color-bg-secondary)] p-0.5 border border-[var(--color-bg-tertiary)]">
            <button
              onClick={() => setLevel("core")}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                level === "core"
                  ? "bg-white text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              )}
            >
              Core
            </button>
            <button
              onClick={() => setLevel("pro")}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                level === "pro"
                  ? "bg-[var(--color-accent-green)] text-white shadow-sm shadow-[var(--color-accent-green)]/25"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              )}
            >
              Pro
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {plans.map((plan) => (
            <motion.button
              key={plan.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedPlan(plan.id as any)}
              className={cn(
                "relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                selectedPlan === plan.id
                  ? "border-[var(--color-accent-green)] bg-[var(--color-accent-green-light)] shadow-[var(--shadow-glow-green)]"
                  : "border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)]"
              )}
            >
              {plan.badge && (
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
                <p className="text-lg font-extrabold text-[var(--color-text-primary)]">
                  {plan.prices[level]}
                </p>
                <p className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
                  {plan.period}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        disabled={isProcessing}
        onClick={handleContinue}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent-green)] text-base font-semibold text-white shadow-lg shadow-[var(--color-accent-green)]/25 disabled:opacity-80 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing...
          </>
        ) : (
          <>
            <Crown className="h-5 w-5" />
            Continue with {plans.find(p => p.id === selectedPlan)?.name}
          </>
        )}
      </motion.button>

      <p className="text-center text-xs text-[var(--color-text-tertiary)]">
        No commitments. Cancel anytime.
      </p>

      <div className="h-4" />
    </div>
  );
}
