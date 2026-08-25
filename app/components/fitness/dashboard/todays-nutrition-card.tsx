"use client";

import { motion } from "framer-motion";
import { Utensils, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TodaysNutritionCardProps {
  nutrition?: any; // The nutrition plan object from DB
  premiumLevel?: string;
}

export function TodaysNutritionCard({ nutrition, premiumLevel = "core" }: TodaysNutritionCardProps) {
  const targetCalories = nutrition?.daily_calories || 2100;
  const targetProtein = nutrition?.protein_grams || 120;

  const meals = nutrition?.meals && nutrition.meals.length > 0 
    ? nutrition.meals.map((m: any, idx: number) => ({
        id: idx,
        name: m.meal_name,
        desc: m.items?.join(" + ") || "Planned Meal",
        completed: false // Default to not completed unless we track it
      }))
    : [];

  const [completedMeals, setCompletedMeals] = useState<Record<number, boolean>>(
    meals.reduce((acc: any, m: any) => ({ ...acc, [m.id]: m.completed }), {})
  );

  const totalMeals = meals.length || 1;
  const completedCount = Object.values(completedMeals).filter(Boolean).length;

  const currentCalories = Math.round((targetCalories / totalMeals) * completedCount);
  const caloriesPercent = Math.min((currentCalories / targetCalories) * 100, 100);

  const currentProtein = Math.round((targetProtein / totalMeals) * completedCount);
  const proteinPercent = Math.min((currentProtein / targetProtein) * 100, 100);

  const toggleMeal = (id: number) => {
    setCompletedMeals(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="w-full relative p-[1px] rounded-2xl overflow-hidden group mt-2"
    >
      {/* Animated Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF00]/20 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      
      <div className="relative bg-[#111A10] rounded-2xl p-5 flex flex-col gap-5 shadow-xl border border-white/5 backdrop-blur-md">
        
        {/* Top Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 flex items-center justify-center">
            <Utensils className="w-4 h-4 text-[#ADFF00]" />
          </div>
          <h3 className="text-sm font-semibold tracking-wide text-white/90 uppercase">Today's Nutrition</h3>
        </div>

        {/* Macros Progress */}
        <div className="space-y-4">
          {/* Calories */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Calories</span>
              <span className="text-sm font-black text-white">{currentCalories.toLocaleString()} <span className="text-white/40 font-medium">/ {targetCalories.toLocaleString()} kcal</span></span>
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${caloriesPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.7 }}
                className="h-full bg-gradient-to-r from-orange-500/50 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] rounded-full relative"
              />
            </div>
          </div>

          {/* Protein */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Protein</span>
              <span className="text-sm font-black text-white">{currentProtein} <span className="text-white/40 font-medium">/ {targetProtein} g</span></span>
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${proteinPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                className="h-full bg-gradient-to-r from-[#ADFF00]/50 to-[#ADFF00] shadow-[0_0_10px_rgba(173,255,0,0.5)] rounded-full relative"
              />
            </div>
          </div>
        </div>

        {/* Meals List */}
        <div className="bg-black/30 rounded-xl border border-white/5 overflow-hidden">
          {premiumLevel === "core" ? (
            <div className="p-5 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ADFF00]/10 flex items-center justify-center mb-1">
                <Utensils className="w-5 h-5 text-[#ADFF00]" />
              </div>
              <h4 className="text-sm font-bold text-white">Full Meal Plan Locked</h4>
              <p className="text-[10px] text-white/50 max-w-[200px]">
                You currently have access to Macros Only. Upgrade to Pro for a hyper-personalized daily meal plan.
              </p>
              <Link href="/payment?returnTo=/fitness" className="mt-1">
                <button className="bg-[#ADFF00]/10 hover:bg-[#ADFF00]/20 text-[#ADFF00] text-[10px] font-black uppercase px-4 py-2 rounded-full border border-[#ADFF00]/20 transition-all flex items-center gap-1.5">
                  Unlock Pro <ArrowRight size={12} />
                </button>
              </Link>
            </div>
          ) : meals.length > 0 ? (
            meals.map((meal: any, idx: number) => {
              const isCompleted = completedMeals[meal.id];
              
              return (
                <div 
                  key={meal.id}
                  onClick={() => toggleMeal(meal.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${idx !== meals.length - 1 ? 'border-b border-white/5' : ''} ${isCompleted ? 'bg-[#ADFF00]/5' : 'hover:bg-white/5'}`}
                >
                  <div className="shrink-0 flex items-center justify-center">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-[#ADFF00]" />
                    ) : (
                      <Circle className="w-5 h-5 text-white/20" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isCompleted ? 'text-[#ADFF00]/80' : 'text-white/80'}`}>
                      {meal.name}
                    </p>
                    <p className="text-xs font-medium text-white/40 truncate max-w-[200px]">
                      {meal.desc}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-5 flex flex-col items-center justify-center text-center">
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">No Meals Planned</p>
              <p className="text-xs text-white/30">Your AI nutrition plan will appear here.</p>
            </div>
          )}
        </div>

        {/* Link Button */}
        <Link href="/nutrition" className="w-full mt-1">
          <button className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-2">
            <span className="text-[13px] font-bold text-white uppercase tracking-wider">View Full Diet</span>
            <ArrowRight className="w-4 h-4 text-[#ADFF00]" />
          </button>
        </Link>
        
      </div>
    </motion.div>
  );
}
