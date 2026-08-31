"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Camera,
  Dumbbell,
  Utensils,
  TrendingUp,
  Target,
  Bot,
  ArrowRight,
  CheckCircle2,
  Users,
  Star,
  Trophy,
  Flame,
  ShieldCheck,
  ChevronRight,
  Zap,
  Play
} from "lucide-react";

export function FitnessLandingPage() {
  const [activeFlowStep, setActiveFlowStep] = useState(0);

  const flowSteps = [
    {
      step: "01",
      title: "CURRENT BODY",
      icon: Camera,
      badge: "Front / Side / Back",
      desc: "Upload 2-3 body photos for instant AI computer vision assessment.",
      color: "from-emerald-500/20 to-lime-500/10",
      accent: "#A3E635"
    },
    {
      step: "02",
      title: "AI ANALYSIS",
      icon: Bot,
      badge: "Groq Vision Engine",
      desc: "Detects posture, muscle distribution, body fat %, and biomechanics.",
      color: "from-lime-500/20 to-emerald-500/10",
      accent: "#C7F000"
    },
    {
      step: "03",
      title: "WORKOUT + DIET",
      icon: Utensils,
      badge: "Macros + Split",
      desc: "Generates budget-friendly meal plan & custom training split.",
      color: "from-green-500/20 to-lime-500/10",
      accent: "#84CC16"
    },
    {
      step: "04",
      title: "TARGET PHYSIQUE",
      icon: Target,
      badge: "Goal Achieved",
      desc: "Follow the 12-week AI roadmap to achieve your ideal physique.",
      color: "from-lime-400/20 to-emerald-400/10",
      accent: "#A3E635"
    }
  ];

  const features = [
    {
      icon: Bot,
      title: "AI Personal Coach",
      badge: "Adaptive Intelligence",
      description:
        "Your AI coach monitors your check-ins daily and automatically recalculates macros & volume whenever you plateau.",
      tag: "Real-time adjustments"
    },
    {
      icon: Camera,
      title: "AI Body Analysis",
      badge: "Computer Vision",
      description:
        "Instant visual scanner analyzes muscle asymmetry, posture tilt, and body fat without expensive DEXA scans.",
      tag: "Private & Auto-deleted"
    },
    {
      icon: Dumbbell,
      title: "Personalized Workout",
      badge: "Custom Split",
      description:
        "Tailored for home, hostel, or commercial gym equipment with exercise swap suggestions and progressive overload tracking.",
      tag: "Hyper-personalized"
    },
    {
      icon: Utensils,
      title: "Personalized Diet",
      badge: "Budget & Hostel Friendly",
      description:
        "Custom high-protein meal plans aligned with your regional food budget, dietary choices (Veg/Non-Veg), and kitchen access.",
      tag: "Macro-calculated"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      badge: "Live Analytics",
      description:
        "Track lift velocity, weight trends, consistency streaks, and visual physique comparison over time.",
      tag: "Weekly Insights"
    },
    {
      icon: Target,
      title: "Goal Physique",
      badge: "Visual Roadmap",
      description:
        "Select your dream physique baseline and get exact weekly milestones required to transform your body frame.",
      tag: "Milestone Driven"
    }
  ];

  const stats = [
    { label: "Active Members", value: "14,800+", icon: Users },
    { label: "Plans Generated", value: "45,000+", icon: Zap },
    { label: "User Rating", value: "4.9 / 5.0", icon: Star },
    { label: "Goal Adherence", value: "98.4%", icon: ShieldCheck }
  ];

  const transformations = [
    {
      name: "Alex R.",
      timeframe: "12 Weeks",
      result: "-8.5kg Fat, +4.2kg Lean Muscle",
      tag: "Hostel Student Diet",
      quote: "The budget diet planner was a game-changer. I saved money while hitting 150g protein daily!"
    },
    {
      name: "Priya S.",
      timeframe: "16 Weeks",
      result: "Posture Correction & Toned Core",
      tag: "Home Workout Split",
      quote: "The AI Scanner caught my forward head posture on day 1 and adjusted my back routines."
    },
    {
      name: "Rahul M.",
      timeframe: "8 Weeks",
      result: "+6kg Muscle Gain",
      tag: "Gym Hypertrophy",
      quote: "No generic templates. The Groq AI coach adapts my split whenever I miss a session."
    }
  ];

  return (
    <div className="min-h-screen bg-[#070C07] text-white selection:bg-[#ADFF00] selection:text-black font-sans relative overflow-x-hidden">
      {/* Glow Orbs background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#ADFF00]/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[160px] pointer-events-none rounded-full" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070C07]/80 border-b border-[#1A2619]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#ADFF00] text-black flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(173,255,0,0.4)] group-hover:scale-105 transition-transform">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight leading-none text-white">
                GRINDLOG<span className="text-[#ADFF00]">.AI</span>
              </span>
              <span className="text-[10px] text-gray-400 tracking-widest font-semibold uppercase mt-0.5">
                Fitness AI OS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/signin?redirect=/"
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup?redirect=/onboarding"
              className="relative group px-5 py-2.5 rounded-full text-sm font-bold text-black bg-[#ADFF00] hover:bg-[#c4ff33] transition-all shadow-[0_0_25px_rgba(173,255,0,0.35)] flex items-center gap-2"
            >
              <span>Start Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#121E12] border border-[#273B25] text-[#ADFF00] text-xs font-semibold uppercase tracking-wider mb-8 shadow-inner"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#ADFF00]" />
          <span>Next-Gen AI Fitness OS</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.08] text-white"
        >
          Your Body. Your Goal. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ADFF00] via-lime-300 to-emerald-400 drop-shadow-[0_0_35px_rgba(173,255,0,0.3)]">
            Your AI Coach.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto font-normal leading-relaxed"
        >
          Upload your current body, choose the physique you want, and get a personalized workout, nutrition and transformation plan powered by AI.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/auth/signup?redirect=/onboarding"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-extrabold text-black bg-[#ADFF00] hover:bg-[#c6ff47] transition-all shadow-[0_0_35px_rgba(173,255,0,0.45)] hover:scale-105 flex items-center justify-center gap-3 group"
          >
            <span>Start My Transformation</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold text-gray-200 bg-[#121A12] border border-[#233522] hover:bg-[#1A261A] hover:border-[#ADFF00]/40 transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Features</span>
          </a>
        </motion.div>

        {/* Login text link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-sm text-gray-400"
        >
          Already have an account?{" "}
          <Link href="/auth/signin?redirect=/" className="text-[#ADFF00] font-semibold underline underline-offset-4 hover:text-white transition-colors">
            Log in
          </Link>
        </motion.div>

        {/* HERO VISUAL: Transformation Pipeline Flow */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 sm:mt-24 p-6 sm:p-8 rounded-3xl bg-[#0D150D]/90 border border-[#1E2E1D] shadow-[0_20px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-between border-b border-[#1B291A] pb-6 mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#ADFF00] animate-ping" />
              <span className="text-sm font-bold tracking-wider uppercase text-gray-300">
                AI Transformation Engine Visualizer
              </span>
            </div>
            <div className="flex gap-2">
              {flowSteps.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveFlowStep(idx)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    activeFlowStep === idx
                      ? "bg-[#ADFF00] text-black"
                      : "bg-[#142014] text-gray-400 hover:text-white"
                  }`}
                >
                  Step {s.step}
                </button>
              ))}
            </div>
          </div>

          {/* Diagram Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {flowSteps.map((stepItem, index) => {
              const Icon = stepItem.icon;
              const isActive = activeFlowStep === index;
              return (
                <div
                  key={index}
                  onClick={() => setActiveFlowStep(index)}
                  className={`cursor-pointer p-6 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                    isActive
                      ? "bg-[#142214] border-[#ADFF00] shadow-[0_0_30px_rgba(173,255,0,0.2)]"
                      : "bg-[#091009] border-[#182617] hover:border-[#2C442B]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold tracking-widest text-[#ADFF00]">
                      {stepItem.step}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-black/40 text-gray-400 border border-[#233522]">
                      {stepItem.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-[#1A2E19] text-[#ADFF00] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-extrabold text-white tracking-tight">
                    {stepItem.title}
                  </h3>
                  <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                    {stepItem.desc}
                  </p>

                  {/* Connecting indicator */}
                  {index < 3 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight className="w-6 h-6 text-[#ADFF00]/40" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom active detail highlight */}
          <div className="mt-8 p-4 rounded-xl bg-[#121F12] border border-[#213520] flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#ADFF00]" />
              <span>
                <strong>Flow Step:</strong> {flowSteps[activeFlowStep].title} — {flowSteps[activeFlowStep].desc}
              </span>
            </div>
            <Link
              href="/auth/signup?redirect=/onboarding"
              className="text-[#ADFF00] hover:underline font-bold flex items-center gap-1"
            >
              <span>Test Flow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Counter Bar */}
      <section className="border-y border-[#182617] bg-[#0A120A]/60 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((st, i) => {
            const Icon = st.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center">
                <Icon className="w-6 h-6 text-[#ADFF00] mb-2" />
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {st.value}
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold mt-1">
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Cards Grid Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121E12] border border-[#273B25] text-[#ADFF00] text-xs font-semibold uppercase tracking-wider mb-4">
            <Bot className="w-4 h-4" />
            <span>Built Differently</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Not Another Generic Workout Tracker
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-400">
            Powered by Groq AI, GrindLog combines computer vision body scans with hyper-personalized nutrition and training splits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -6 }}
                className="p-8 rounded-3xl bg-[#0D150D] border border-[#1C2C1B] hover:border-[#ADFF00]/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#142314] text-[#ADFF00] flex items-center justify-center border border-[#233822] group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-[#162416] text-[#ADFF00] border border-[#283D26]">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white group-hover:text-[#ADFF00] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-3 text-sm text-gray-400 leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#162316] flex items-center justify-between text-xs text-gray-500">
                  <span>{feat.tag}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#ADFF00]" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Social Proof / Transformations Section */}
      <section className="py-20 bg-[#0B120B] border-t border-[#192718]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121E12] border border-[#273B25] text-[#ADFF00] text-xs font-semibold uppercase tracking-wider mb-4">
              <Trophy className="w-4 h-4" />
              <span>Verified Results</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Real Transformations. Real AI Impact.
            </h2>
            <p className="mt-4 text-gray-400 text-base">
              See how our AI Coach helps athletes, students, and busy professionals hit their target physiques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {transformations.map((tf, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#101910] border border-[#1F301E] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-white text-base">{tf.name}</span>
                    <span className="text-xs px-2.5 py-1 rounded bg-[#162616] text-[#ADFF00] font-semibold">
                      {tf.timeframe}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[#ADFF00] mb-2 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#ADFF00]" />
                    <span>{tf.result}</span>
                  </div>
                  <p className="text-xs text-gray-400 italic leading-relaxed mt-3">
                    "{tf.quote}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#182718] flex items-center justify-between text-[11px] text-gray-500">
                  <span>Category: {tf.tag}</span>
                  <span className="text-emerald-400 font-bold">Verified User</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-24 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ADFF00]/5 to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Ready to Build Your <br />
            <span className="text-[#ADFF00]">Ultimate Physique?</span>
          </h2>
          <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto">
            Join thousands of users transforming their bodies with AI guidance, budget nutrition, and adaptive training.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup?redirect=/onboarding"
              className="w-full sm:w-auto px-10 py-5 rounded-full text-lg font-black text-black bg-[#ADFF00] hover:bg-[#c6ff47] transition-all shadow-[0_0_40px_rgba(173,255,0,0.5)] hover:scale-105 flex items-center justify-center gap-3 group"
            >
              <span>Start My Transformation Now</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-[#182617] py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 GrindLog AI OS. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/auth/signup?redirect=/onboarding" className="hover:text-[#ADFF00] transition-colors font-bold">Body Scanner</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
