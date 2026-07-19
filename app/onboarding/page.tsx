"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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

const FitnessIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fitGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF3B30" />
        <stop offset="1" stopColor="#FF9500" />
      </linearGradient>
    </defs>
    <rect x="15" y="40" width="70" height="20" rx="10" fill="url(#fitGrad)" />
    <rect x="25" y="25" width="15" height="50" rx="7.5" fill="url(#fitGrad)" />
    <rect x="60" y="25" width="15" height="50" rx="7.5" fill="url(#fitGrad)" />
    <rect x="10" y="32" width="10" height="36" rx="5" fill="#FFD60A" />
    <rect x="80" y="32" width="10" height="36" rx="5" fill="#FFD60A" />
  </svg>
);

const BrainIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brainGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#AF52DE" />
        <stop offset="1" stopColor="#FF2D55" />
      </linearGradient>
    </defs>
    <path d="M50 90C25 90 15 70 15 50C15 25 30 15 50 15C70 15 85 25 85 50C85 70 75 90 50 90Z" fill="url(#brainGrad)" opacity="0.2" />
    <path d="M50 80C30 80 25 65 25 50C25 32 35 25 50 25C65 25 75 32 75 50C75 65 70 80 50 80Z" fill="url(#brainGrad)" />
    <path d="M50 25V80" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
    <circle cx="35" cy="45" r="5" fill="#FFFFFF" />
    <circle cx="65" cy="45" r="5" fill="#FFFFFF" />
    <path d="M40 65 Q 50 75 60 65" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const BookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bookGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#007AFF" />
        <stop offset="1" stopColor="#30B0C7" />
      </linearGradient>
    </defs>
    <path d="M50 85V25c-15-5-25-5-35 0v60c10-5 20-5 35 0z" fill="url(#bookGrad)" />
    <path d="M50 85V25c15-5 25-5 35 0v60c-10-5-20-5-35 0z" fill="#32ADE6" />
    <path d="M30 45h10M30 60h10M70 45H60M70 60H60" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const PaletteIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="artGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF9500" />
        <stop offset="1" stopColor="#FFD60A" />
      </linearGradient>
    </defs>
    <path d="M50 90c-22.1 0-40-17.9-40-40 0-22.1 17.9-40 40-40 22.1 0 40 17.9 40 40 0 5.5-4.5 10-10 10h-6c-5.5 0-10 4.5-10 10 0 5.5-4.5 10-10 10H50z" fill="url(#artGrad)" />
    <circle cx="35" cy="35" r="7" fill="#FF3B30" />
    <circle cx="50" cy="25" r="7" fill="#007AFF" />
    <circle cx="65" cy="35" r="7" fill="#34C759" />
    <circle cx="75" cy="50" r="7" fill="#AF52DE" />
  </svg>
);

const FinanceIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="moneyGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34C759" />
        <stop offset="1" stopColor="#30B0C7" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="40" fill="url(#moneyGrad)" />
    <path d="M50 25v50M40 40c0-10 20-15 20-5 0 15-20 10-20 25 0 10 20 5 20-5" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const slides = [
  {
    id: "welcome",
    emoji: "🌳",
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
    icons: [FitnessIcon, BrainIcon, BookIcon, PaletteIcon, FinanceIcon],
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

  const goNext = () => {
    if (current < slides.length - 1) {
      setDirection(1);
      setCurrent(current + 1);
    } else {
      router.push("/auth/signup");
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
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--color-bg-primary)]">
      {/* Header Navigation */}
      <div className="relative z-10 flex h-16 items-center justify-between px-5 pt-safe">
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
              onClick={() => router.push("/auth/signup")}
              className="px-4 py-2 text-sm font-semibold text-[var(--color-text-tertiary)] transition-colors active:text-[var(--color-text-primary)]"
            >
              Skip
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -80, scale: 0.95 }}
            transition={springs.default}
            className="flex w-full max-w-md flex-col items-center"
          >
            {/* Visual Section */}
            <div className="mb-10 flex min-h-[200px] items-center justify-center sm:min-h-[240px]">
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
                        "group flex items-center justify-center rounded-2xl bg-[var(--color-bg-secondary)] shadow-sm",
                        i === 2 ? "col-span-2 h-20 w-20 mx-auto" : "h-20 w-20"
                      )}
                    >
                      <Icon className="h-10 w-10 drop-shadow-sm transition-transform group-hover:scale-110" />
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
            <div className="flex flex-col items-center gap-4 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.default, delay: 0.1 }}
                className="whitespace-pre-line text-4xl font-extrabold leading-[1.15] tracking-tight text-[var(--color-text-primary)] sm:text-5xl"
              >
                {slide.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.default, delay: 0.2 }}
                className="max-w-[340px] text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg"
              >
                {slide.description}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 pb-8 pb-safe">
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
          className="group relative h-14 w-full max-w-md overflow-hidden rounded-2xl bg-[var(--color-accent-green)] text-base font-semibold text-white shadow-lg shadow-[var(--color-accent-green)]/20 transition-all active:shadow-md"
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
              onClick={() => router.push("/auth/signin")}
              className="px-4 py-2 text-sm font-medium text-[var(--color-text-tertiary)] transition-colors active:text-[var(--color-text-primary)]"
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