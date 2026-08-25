"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Dumbbell, Apple, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlanPreview } from "./plan-preview";

const GENERATION_STEPS = [
  "Analyzing your goals...",
  "Understanding your training level...",
  "Building your workouts...",
  "Planning your nutrition...",
  "Personalizing your routine..."
];

export function PlanGeneration() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);

  useEffect(() => {
    // Animate through steps visually (fake progress, but realistic timing)
    if (!isGenerating) return;
    
    const interval = setInterval(() => {
      setStepIndex(prev => {
        if (prev < GENERATION_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    // Trigger generation on mount
    const generatePlan = async () => {
      try {
        const res = await fetch("/api/fitness-ai/generate-plan", {
          method: "POST"
        });
        const data = await res.json();
        
        if (data.success) {
          // Success! Fast forward step index and show preview
          setStepIndex(GENERATION_STEPS.length - 1);
          setTimeout(() => {
            setIsGenerating(false);
            setPlanId(data.data.planId);
          }, 1000);
        } else {
          setError(data.error || "We couldn't build your plan right now.");
          setIsGenerating(false);
        }
      } catch (err) {
        setError("We couldn't build your plan right now. Please try again.");
        setIsGenerating(false);
      }
    };

    generatePlan();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-5 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Generation Failed</h2>
        <p className="text-gray-500 mb-8">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full max-w-xs bg-gray-900 text-white font-bold py-4 rounded-2xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-5 w-full max-w-sm mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold tracking-widest text-emerald-500 uppercase mb-3">
            Your plan is
          </h2>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Being Built
          </h1>
          <div className="mt-4 flex justify-center">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        </div>

        <div className="w-full space-y-4">
          {GENERATION_STEPS.map((step, idx) => {
            const isCompleted = idx < stepIndex;
            const isCurrent = idx === stepIndex;
            
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: isCompleted || isCurrent ? 1 : 0.3, 
                  x: 0 
                }}
                className="flex items-center gap-3"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isCompleted ? 'bg-emerald-500 text-white' : 
                  isCurrent ? 'border-2 border-emerald-500 text-transparent' : 
                  'border-2 border-gray-200 text-transparent'
                }`}>
                  {isCompleted && <CheckCircle2 className="w-4 h-4" strokeWidth={3} />}
                  {isCurrent && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                </div>
                <span className={`text-sm font-semibold transition-colors ${
                  isCompleted ? 'text-gray-900' :
                  isCurrent ? 'text-emerald-600' :
                  'text-gray-400'
                }`}>
                  {step}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  if (planId) {
    return <PlanPreview planId={planId} onConfirm={() => router.push("/")} />;
  }

  return null;
}
