"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Check,
  Infinity as InfinityIcon,
  Sparkles,
  Brain,
  BarChart3,
  Palette,
  Download,
  BellRing,
  Star,
  Crown,
} from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";

const features = [
  { icon: InfinityIcon, label: "Unlimited Habits", free: "5 habits", premium: "Unlimited" },
  { icon: Brain, label: "AI Coach", free: "10 msgs/day", premium: "Unlimited" },
  { icon: BarChart3, label: "Advanced Analytics", free: "Basic", premium: "Full suite" },
  { icon: Palette, label: "Custom Themes", free: "Light only", premium: "All themes" },
  { icon: Download, label: "Data Export", free: "Limited", premium: "Full export" },
  { icon: BellRing, label: "Smart Reminders", free: "Basic", premium: "AI-powered" },
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
    price: "₹299",
    period: "/month",
    originalPrice: null,
    badge: null,
  },
  {
    id: "annual",
    name: "Annual",
    emoji: "🌳",
    price: "₹1,999",
    period: "/year",
    originalPrice: "₹3,588",
    badge: "⭐ Most Popular",
    savings: "Save 44%",
  },
  {
    id: "lifetime",
    name: "Legend",
    emoji: "👑",
    price: "₹4,999",
    period: "one-time",
    originalPrice: null,
    badge: null,
    savings: "Best value",
  },
];

export default function PremiumPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("annual");

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
          <span className="text-xs font-semibold text-[var(--color-text-tertiary)] text-center">Free</span>
          <span className="text-xs font-semibold text-[var(--color-accent-green)] text-center">Premium</span>
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
              <f.icon className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <span className="text-xs font-medium text-[var(--color-text-primary)]">
                {f.label}
              </span>
            </div>
            <span className="text-xs text-center text-[var(--color-text-tertiary)]">
              {f.free}
            </span>
            <div className="flex justify-center">
              <Check className="h-4 w-4 text-[var(--color-accent-green)]" />
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
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3">
          Choose Your Plan
        </h3>
        <div className="flex flex-col gap-3">
          {plans.map((plan) => (
            <motion.button
              key={plan.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedPlan(plan.id)}
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
                  {plan.price}
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
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent-green)] text-base font-semibold text-white shadow-lg shadow-[var(--color-accent-green)]/25"
      >
        <Crown className="h-5 w-5" />
        Start Free Trial · 7 days free
      </motion.button>

      <p className="text-center text-xs text-[var(--color-text-tertiary)]">
        No commitments. Cancel anytime.
      </p>

      <div className="h-4" />
    </div>
  );
}
