"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Target } from "lucide-react";
import { useState } from "react";

interface TodaysGoalsCardProps {
  lifestyle?: any;
  nutrition?: any;
  workoutCompleted?: boolean;
}

export function TodaysGoalsCard({ lifestyle, nutrition, workoutCompleted = false }: TodaysGoalsCardProps) {
  // Use real targets if available
  const stepsTarget = lifestyle?.daily_steps_target || 10000;
  const waterTarget = lifestyle?.water_target_liters || 3;
  const sleepTarget = lifestyle?.sleep_target_hours || 8;
  const proteinTarget = nutrition?.protein_grams || 120;

  // We are defaulting the first three to checked to match the user's requested visual
  const initialGoals = [
    { id: 'workout', text: "Complete workout", completed: workoutCompleted },
    { id: 'breakfast', text: "Eat breakfast", completed: true },
    { id: 'protein', text: `Hit ${proteinTarget}g protein target`, completed: true },
    { id: 'steps', text: `${stepsTarget.toLocaleString()} steps`, completed: false },
    { id: 'water', text: `${waterTarget}L water`, completed: false },
    { id: 'sleep', text: `Sleep before 11 PM (Target ${sleepTarget}h)`, completed: false },
  ];

  const [goals, setGoals] = useState(initialGoals);

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="w-full relative p-[1px] rounded-2xl overflow-hidden group mt-2"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF00]/10 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      
      <div className="relative bg-[#111A10] rounded-2xl p-5 flex flex-col gap-4 shadow-xl border border-white/5 backdrop-blur-md">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-[#ADFF00]" />
          </div>
          <h3 className="text-sm font-semibold tracking-wide text-white/90 uppercase">Today's Goals</h3>
        </div>

        {/* Goals List */}
        <div className="flex flex-col gap-3">
          {goals.map((goal) => (
            <div 
              key={goal.id} 
              onClick={() => toggleGoal(goal.id)}
              className="flex items-center gap-3 cursor-pointer group/item"
            >
              <div className="shrink-0 flex items-center justify-center">
                {goal.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-[#ADFF00] drop-shadow-[0_0_5px_rgba(173,255,0,0.5)]" />
                ) : (
                  <Circle className="w-5 h-5 text-white/20 group-hover/item:text-white/40 transition-colors" />
                )}
              </div>
              <span className={`text-sm font-medium tracking-wide ${goal.completed ? 'text-white/40 line-through' : 'text-white/80'}`}>
                {goal.text}
              </span>
            </div>
          ))}
        </div>
        
      </div>
    </motion.div>
  );
}
