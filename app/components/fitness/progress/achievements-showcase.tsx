"use client";

import { Achievement } from "@/types/fitness/analytics";
import { Lock } from "lucide-react";

export function AchievementsShowcase({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-3">
      <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
        Achievements
      </h2>

      <div className="flex flex-col gap-2">
        {achievements.map((ach) => (
          <div 
            key={ach.id} 
            className={`w-full flex items-center p-4 rounded-[16px] border ${ach.unlocked ? 'bg-[#111A10] border-[#ADFF00]/20' : 'bg-[#0A1108] border-white/5 opacity-60'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 mr-4 ${ach.unlocked ? 'bg-[#ADFF00]/10 border border-[#ADFF00]/20 shadow-[0_0_15px_rgba(173,255,0,0.1)]' : 'bg-white/5'}`}>
              {ach.unlocked ? ach.icon : <Lock className="w-5 h-5 text-white/20" />}
            </div>
            
            <div className="flex-1 flex flex-col">
              <h3 className={`text-[13px] font-black uppercase tracking-wider mb-0.5 ${ach.unlocked ? 'text-white' : 'text-white/40'}`}>
                {ach.title}
              </h3>
              <p className="text-[10px] font-medium text-white/50 mb-2 leading-snug">
                {ach.description}
              </p>
              
              {!ach.unlocked && (
                <div className="w-full flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/30 rounded-full"
                      style={{ width: `${(ach.progress / ach.target) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-white/40">{ach.progress}/{ach.target}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
