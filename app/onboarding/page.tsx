"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, TreeDeciduous, Brain, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const slides = [
  {
    id: "plant",
    title: "Start Your Journey",
    description: "Every great achievement starts with a single habit. Plant your seed today and commit to growth.",
    icon: <Sprout className="w-24 h-24 text-green-500" strokeWidth={1.5} />,
    color: "bg-green-50",
  },
  {
    id: "grow",
    title: "Grow Your Tree",
    description: "As you complete daily habits, your tree grows. Build streaks to unlock beautiful new environments.",
    icon: <TreeDeciduous className="w-24 h-24 text-emerald-600" strokeWidth={1.5} />,
    color: "bg-emerald-50",
  },
  {
    id: "ai",
    title: "AI Habit Coaching",
    description: "Get personalized insights, smart reminders, and tailored habit plans from your very own AI Coach.",
    icon: <Brain className="w-24 h-24 text-blue-500" strokeWidth={1.5} />,
    color: "bg-blue-50",
  }
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      router.push("/auth/signup");
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const skipOnboarding = () => {
    router.push("/auth/signup");
  };

  return (
    <div className={`min-h-dvh flex flex-col transition-colors duration-500 ${slides[currentSlide].color} overflow-hidden relative`}>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Skip Button */}
      <div className="flex justify-end p-6 relative z-10">
        <button 
          onClick={skipOnboarding}
          className="text-gray-500 font-medium text-sm hover:text-gray-800 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Carousel */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-md mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center text-center w-full"
          >
            <div className="w-48 h-48 mb-12 rounded-full bg-white shadow-xl flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-white/50 scale-110" />
              {slides[currentSlide].icon}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {slides[currentSlide].title}
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-[280px]">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="p-8 pb-12 w-full max-w-md mx-auto relative z-10 flex flex-col items-center gap-8">
        
        {/* Indicators */}
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <div 
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? "w-8 bg-gray-800" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={nextSlide}
          className="w-full h-14 rounded-2xl bg-gray-900 text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
        >
          {currentSlide === slides.length - 1 ? (
            <>
              Get Started
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  );
}
