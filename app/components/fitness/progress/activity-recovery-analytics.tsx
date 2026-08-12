"use client";

import { ActivityAnalytics, RecoveryAnalytics } from "@/types/fitness/analytics";
import { Footprints, Moon } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";

export function ActivityRecoveryAnalyticsCard({ activity, recovery }: { activity: ActivityAnalytics, recovery: RecoveryAnalytics }) {
  const stepsData = activity.stepsChart.length > 0 ? activity.stepsChart : [
    { day: "M", steps: 8500, target: 10000 },
    { day: "T", steps: 11000, target: 10000 },
    { day: "W", steps: 9500, target: 10000 },
    { day: "T", steps: 10500, target: 10000 },
    { day: "F", steps: 7200, target: 10000 },
    { day: "S", steps: 12000, target: 10000 },
    { day: "S", steps: 5000, target: 10000 },
  ];

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Activity & Recovery
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Activity Card */}
        <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <Footprints className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">Steps</span>
          </div>
          <div className="flex items-end gap-1 mb-4">
            <span className="text-xl font-black text-white leading-none">{activity.averageDailySteps.toLocaleString()}</span>
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Avg</span>
          </div>
          
          <div className="w-full h-16 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stepsData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Bar dataKey="steps" radius={[2, 2, 2, 2]} barSize={12}>
                  {stepsData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.steps >= entry.target ? '#34d399' : 'rgba(52,211,153,0.3)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recovery Card */}
        <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">Sleep</span>
            </div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-xl font-black text-white leading-none">{recovery.averageSleepHours}</span>
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Hrs Avg</span>
            </div>
          </div>
          
          <div className="w-full flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[9px] font-black tracking-widest uppercase">
              <span className="text-white/40">Quality</span>
              <span className={recovery.averageSleepQuality > 70 ? "text-indigo-400" : "text-white"}>{recovery.averageSleepQuality}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-400 rounded-full" 
                style={{ width: `${recovery.averageSleepQuality}%` }} 
              />
            </div>
            <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">
              {recovery.restDays} Rest Days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
