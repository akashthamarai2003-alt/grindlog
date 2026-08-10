"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Dumbbell, Apple, Check } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface PlanPreviewProps {
  planId: string;
  onConfirm: () => void;
}

export function PlanPreview({ planId, onConfirm }: PlanPreviewProps) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchPlan = async () => {
      const { data } = await supabase
        .from("fitness_os_workout_plans")
        .select(`
          name, description, goal,
          fitness_os_workouts (id),
          fitness_os_nutrition_plans (daily_calories, protein_grams)
        `)
        .eq("id", planId)
        .single();
      
      setPlan(data);
      setLoading(false);
    };
    fetchPlan();
  }, [planId, supabase]);

  if (loading) return null; // Or a minimal skeleton

  const workoutCount = plan.fitness_os_workouts?.length || 0;
  const nutrition = plan.fitness_os_nutrition_plans?.[0];

  return (
    <div className="flex flex-col items-center min-h-[70vh] py-12 px-5 text-center w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
      >
        <Sparkles className="w-10 h-10 text-emerald-600" strokeWidth={1.5} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-gray-900 mb-2 leading-tight"
      >
        Your Plan Is Ready
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 font-medium mb-10"
      >
        {plan.description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full space-y-3 mb-10"
      >
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100 text-left">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <Dumbbell className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Training</h4>
            <p className="text-sm font-medium text-gray-500">{workoutCount} workouts this week</p>
          </div>
        </div>

        {nutrition && (
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100 text-left">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
              <Apple className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Nutrition</h4>
              <p className="text-sm font-medium text-gray-500">
                ~{nutrition.daily_calories} kcal / {nutrition.protein_grams}g protein
              </p>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full mt-auto"
      >
        <button
          onClick={onConfirm}
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.4)]"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          Start My Plan
        </button>
      </motion.div>
    </div>
  );
}
