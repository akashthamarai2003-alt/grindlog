"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import bgImage from "../../public/onboarding1.png";
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
    <div className="flex min-h-dvh flex-col relative px-4 overflow-hidden safe-top">
      {/* Background Image */}
      <Image 
        src={bgImage}
        alt="Background Landscape"
        fill
        className="object-cover object-center z-0"
        priority
      />
      <div className="absolute inset-0 bg-black/40 z-0" /> {/* Dark overlay for text readability */}

      <div className="flex flex-col flex-1 relative z-10">
        {/* Skip */}
      {current < slides.length - 1 && (
        <div className="flex items-center justify-end px-6 pt-4">
          <button
            onClick={() => router.push("/auth/signup")}
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Skip
          </button>
        </div>
      )}

      {/* Back button */}
      {current > 0 && (
        <div className="px-4 pt-2">
          <button
            onClick={goBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-colors hover:bg-white/30"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-12">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={springs.default}
            className="flex w-full flex-col items-center gap-8"
          >
            {/* Visual */}
            <div className="flex h-48 items-center justify-center">
              {slide.emoji && (
                <motion.div
                  className="text-8xl"
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {slide.emoji}
                </motion.div>
              )}

              {slide.icons && (
                <div className="flex flex-wrap justify-center gap-3">
                  {slide.icons.map((Icon, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        ...springs.bouncy,
                        delay: i * 0.1,
                      }}
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md"
                    >
                      <Icon className="h-8 w-8 text-[#34C759]" />
                    </motion.div>
                  ))}
                </div>
              )}

              {slide.showStages && (
                <div className="flex items-center gap-2 text-5xl">
                  {["🌱", "🌿", "🌳", "✨"].map((e, i) => (
                    <motion.span
                      key={e}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        ...springs.bouncy,
                        delay: i * 0.15,
                      }}
                    >
                      {e}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>

            {/* Text */}
            <div className="flex flex-col items-center gap-3 text-center">
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white whitespace-pre-line drop-shadow-md">
                {slide.title}
              </h2>
              <p className="text-base leading-relaxed text-white/90 max-w-sm drop-shadow">
                {slide.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-6 px-8 pb-10 safe-bottom">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === current
                  ? "w-6 bg-[#34C759]"
                  : "w-1.5 bg-white/30"
              )}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={goNext}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#34C759] text-base font-semibold text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] transition-all hover:brightness-110 border border-white/20"
        >
          {current === slides.length - 1 ? "Get Started" : "Continue"}
          <ArrowRight className="h-5 w-5" />
        </motion.button>

        {current === slides.length - 1 && (
          <button
            onClick={() => router.push("/auth/signin")}
            className="text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            Already have an account? Sign in
          </button>
        )}
      </div>
      
      </div>
    </div>
  );
}
