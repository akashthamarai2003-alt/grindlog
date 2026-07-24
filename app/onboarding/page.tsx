"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sprout,
  Dumbbell,
  Brain,
  BookOpen,
  Palette,
  DollarSign,
  Sparkles,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: "welcome",
    emoji: null,
    image: "/tree-3d.png",
    title: "Grow Into Your\nBest Self",
    description:
      "Every habit is a drop of water. Your tree grows with you, one action at a time.",
    icon: Sprout,
  },
  {
    id: "track",
    emoji: null,
    title: "Track What\nMatters",
    description:
      "Fitness, reading, meditation, finance — any habit, tracked beautifully.",
    icons: [Dumbbell, Brain, BookOpen, Palette, DollarSign],
  },
  {
    id: "ai",
    emoji: "🤖",
    title: "Your Personal\nAI Coach",
    description:
      "Get personalized habit plans, predictions, and encouragement — available 24/7, powered by AI.",
    icon: Sparkles,
  },
  {
    id: "ready",
    emoji: null,
    title: "Your Journey\nBegins Now",
    description: "Let's build habits that transform your life.",
    showStages: true,
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const router = useRouter();

  const finishOnboarding = (path: string) => {
    try {
      localStorage.setItem("grindlog_has_seen_onboarding", "true");
    } catch (e) {}
    router.push(path);
  };

  const goNext = () => {
    if (current < slides.length - 1) {
      setDirection(1);
      setCurrent(current + 1);
    } else {
      finishOnboarding("/auth/signup");
    }
  };

  const goBack = () => {
    if (current > 0) {
      setDirection(-1);
      setCurrent(current - 1);
    }
  };

  const slide = slides[current];

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden">
      {/* Background Picture */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/onboarding-bg.png" 
          alt="Background" 
          fill
          priority
          unoptimized
          className="object-cover"
        />
      </div>
      {/* Header Navigation */}
      <div className="relative z-10 flex h-12 shrink-0 items-center justify-between px-4 pt-safe sm:h-16 sm:px-5">
        {/* Back button */}
        <AnimatePresence mode="wait">
          {current > 0 ? (
            <motion.button
              key="back"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={springs.default}
              onClick={goBack}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] transition-all active:scale-95 active:bg-[var(--color-bg-tertiary)]"
            >
              <ChevronLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
            </motion.button>
          ) : (
            <div className="h-11 w-11" />
          )}
        </AnimatePresence>

        {/* Skip button */}
        <AnimatePresence mode="wait">
          {current < slides.length - 1 && (
            <motion.button
              key="skip"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={springs.default}
              onClick={() => finishOnboarding("/auth/signup")}
              className="px-4 py-2 text-sm font-semibold text-[var(--color-text-tertiary)] transition-colors active:text-[var(--color-text-primary)]"
            >
              Skip
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 shrink flex-col items-center justify-center px-4 min-h-0">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -80, scale: 0.95 }}
            transition={springs.default}
            className="flex w-full max-w-md flex-col items-center gap-6 sm:gap-10"
          >
            {/* Visual Section */}
            <div className="flex items-center justify-center">
              {slide.image && (
                <motion.div
                  className="relative h-40 w-40 sm:h-56 sm:w-56"
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Image 
                    src={slide.image} 
                    alt="Illustration" 
                    fill 
                    className="object-contain drop-shadow-2xl" 
                  />
                </motion.div>
              )}

              {slide.emoji && (
                <motion.div
                  className="text-[100px] leading-none sm:text-[120px]"
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {slide.emoji}
                </motion.div>
              )}

              {slide.icons && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 place-items-center mx-auto">
                  {slide.icons.map((Icon, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30, scale: 0.5 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        ...springs.bouncy,
                        delay: i * 0.08,
                      }}
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        "flex items-center justify-center rounded-2xl bg-[var(--color-bg-secondary)] shadow-sm",
                        i === 2 ? "col-span-2 h-20 w-20 mx-auto" : "h-20 w-20"
                      )}
                    >
                      <Icon className="h-9 w-9 text-[var(--color-accent-green)]" />
                    </motion.div>
                  ))}
                </div>
              )}

              {slide.showStages && (
                <div className="flex items-center gap-3 text-6xl sm:text-7xl">
                  {["🌱", "🌿", "🌳", "✨"].map((e, i) => (
                    <motion.span
                      key={e}
                      initial={{ opacity: 0, scale: 0.3, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{
                        ...springs.bouncy,
                        delay: i * 0.12,
                        rotate: {
                          delay: i * 0.12 + 0.3,
                          duration: 0.5
                        }
                      }}
                      className="inline-block"
                    >
                      {e}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-center gap-4 text-center w-full px-2">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.default, delay: 0.1 }}
                className="whitespace-pre-line text-4xl sm:text-5xl font-extrabold leading-[1.15] tracking-tight text-gray-900"
              >
                {slide.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.default, delay: 0.2 }}
                className="max-w-[300px] text-base sm:text-lg font-medium leading-relaxed text-gray-800"
              >
                {slide.description}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 flex shrink-0 flex-col items-center gap-4 px-4 pb-6 pb-safe sm:gap-6 sm:px-6 sm:pb-8">
        {/* Progress Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "h-2 rounded-full transition-all duration-500 ease-out",
                i === current
                  ? "w-8 bg-[var(--color-accent-green)]"
                  : "w-2 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary)]/80"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          className="group relative h-14 w-full max-w-md overflow-hidden rounded-2xl bg-gray-900 text-base font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all active:shadow-md"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {current === slides.length - 1 ? "Get Started" : "Continue"}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </span>
          <motion.div
            className="absolute inset-0 bg-white/10"
            initial={false}
            whileHover={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        </motion.button>

        {/* Sign In Link */}
        <AnimatePresence mode="wait">
          {current === slides.length - 1 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={springs.default}
              onClick={() => finishOnboarding("/auth/signin")}
              className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors active:text-[var(--color-text-primary)]"
            >
              Already have an account?{" "}
              <span className="font-semibold text-[var(--color-text-primary)]">
                Sign in
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}