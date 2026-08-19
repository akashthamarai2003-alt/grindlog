"use client";

import { WorkoutAnalytics } from "@/types/fitness/analytics";
import { Dumbbell, Target } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function WorkoutAnalyticsCard({ metrics }: { metrics: WorkoutAnalytics }) {
  if (metrics.totalWorkouts === 0) {
    return (
      <div className="w-full flex flex-col gap-3">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Workout Analytics
        </h2>
        <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <Dumbbell className="w-8 h-8 text-white/20 mb-3" />
          <p className="text-sm font-bold text-white/60 mb-2">No completed workouts yet</p>
          <p className="text-xs font-medium text-white/40">Complete your first workout to see workout analytics.</p>
        </div>
      </div>
    );
  }

  const chartData = metrics.weeklyChart || [];

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Workout Analytics
        </h2>
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
          {metrics.completedWorkouts} / {metrics.totalWorkouts} Completed
        </span>
      </div>

      <div className="w-full bg-[#111A10] border border-white/5 rounded-[24px] p-5">
        
        {/* Top Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Dumbbell className="w-3 h-3" /> Volume
            </span>
            <span className="text-xl font-black text-white">{metrics.trainingVolumeKg.toLocaleString()} <span className="text-xs text-white/50">kg</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Target className="w-3 h-3" /> Sets / Reps
            </span>
            <span className="text-xl font-black text-white">{metrics.totalSets} <span className="text-xs text-white/50">/ {metrics.totalReps}</span></span>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-32 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ backgroundColor: '#0A1108', border: '1px solid rgba(173,255,0,0.3)', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 700 }}
                itemStyle={{ color: '#ADFF00' }}
              />
              <Bar dataKey="volume" radius={[4, 4, 4, 4]} barSize={24} minPointSize={4}>
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.completed ? '#ADFF00' : 'rgba(255,255,255,0.05)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between px-2 text-[9px] font-black tracking-widest text-white/40 uppercase">
          {chartData.map((d: any) => <span key={d.day}>{d.day.charAt(0)}</span>)}
        </div>

      </div>
    </div>
  );
}
