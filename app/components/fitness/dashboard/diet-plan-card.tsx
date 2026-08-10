"use client";

import { motion } from "framer-motion";
import { Utensils, Droplet, Flame } from "lucide-react";

interface DietPlanCardProps {
  nutrition?: {
    daily_calories: number | null;
    protein_grams: number | null;
    meals: Array<{
      meal_name: string;
      time_of_day: string;
      items: string[];
      total_calories: number | null;
      protein_grams: number | null;
      prep_instructions: string;
    }>;
    guidance: string;
  };
}

export function DietPlanCard({ nutrition }: DietPlanCardProps) {
  if (!nutrition || !nutrition.meals || nutrition.meals.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="w-full bg-white rounded-[2rem] p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110 duration-500 ease-out" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-2">
            AI Diet Plan
          </h2>
          <div className="flex gap-4 items-end">
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">
              {nutrition.daily_calories} <span className="text-sm font-medium text-gray-500">kcal</span>
            </h3>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {nutrition.protein_grams}g <span className="text-sm font-medium text-gray-500">protein</span>
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-6">
        {nutrition.meals.map((meal, index) => (
          <div key={index} className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-orange-500" />
                {meal.meal_name}
              </h4>
              <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                {meal.time_of_day}
              </span>
            </div>
            
            <ul className="text-sm text-gray-600 font-medium pl-6 list-disc marker:text-gray-300">
              {meal.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            {meal.prep_instructions && (
              <div className="mt-2 text-xs text-gray-500 bg-white p-2 rounded-lg border border-gray-100 font-medium flex gap-2 items-start">
                <span className="text-orange-500 shrink-0">💡</span>
                <p>{meal.prep_instructions}</p>
              </div>
            )}
            
            <div className="flex gap-3 mt-1 opacity-70">
              {meal.total_calories && (
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-400" />
                  {meal.total_calories} kcal
                </span>
              )}
              {meal.protein_grams && (
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-blue-400" />
                  {meal.protein_grams}g P
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {nutrition.guidance && (
        <div className="mt-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100 text-sm font-medium text-orange-800">
          {nutrition.guidance}
        </div>
      )}
    </motion.div>
  );
}
