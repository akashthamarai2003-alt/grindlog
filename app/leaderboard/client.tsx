"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Trophy, Crown, Flame, Sparkles, Medal } from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";

export function LeaderboardClient({ topUsers, currentUserId }: { topUsers: any[]; currentUserId: string }) {
  const router = useRouter();

  // Sort and pick top 3
  const top3 = topUsers.slice(0, 3);
  const rest = topUsers.slice(3);

  // Reorder top 3 for podium (2, 1, 3)
  const podium = [
    top3[1] || null,
    top3[0] || null,
    top3[2] || null
  ];

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-4 safe-top bg-[var(--color-bg-primary)] min-h-dvh relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-gradient-to-b from-[#FFD700]/10 to-transparent blur-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-3 relative z-20">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]"
        >
          <ChevronLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            Leaderboard
          </h1>
        </div>
      </div>

      {/* Podium */}
      <div className="flex justify-center items-end gap-3 mt-10 mb-8 h-56 relative z-10">
        {podium.map((user, i) => {
          const isFirst = i === 1;
          const isSecond = i === 0;
          const isThird = i === 2;

          if (!user) {
            return (
              <div key={i} className="flex flex-col items-center opacity-40">
                <div className={cn(
                  "rounded-full border-4 flex items-center justify-center border-dashed border-[var(--color-text-tertiary)] bg-[var(--color-bg-secondary)] mb-10",
                  isFirst ? "w-24 h-24" : "w-16 h-16"
                )}>
                  <span className="text-2xl font-bold text-[var(--color-text-tertiary)]">?</span>
                </div>
                {/* Pillar */}
                <div className={cn(
                  "w-20 rounded-t-2xl mt-2 bg-gradient-to-t from-[var(--color-bg-tertiary)]/50 to-[var(--color-bg-secondary)] border-x border-t border-[var(--color-bg-tertiary)]",
                  isFirst ? "h-24" : isSecond ? "h-16" : "h-12"
                )} />
              </div>
            );
          }
          
          return (
            <motion.div 
              key={user.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...springs.bouncy, delay: isFirst ? 0.2 : isSecond ? 0.3 : 0.4 }}
              className={cn(
                "flex flex-col items-center relative",
                isFirst && "z-10"
              )}
            >
              {isFirst && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#FFD700]/20 blur-2xl rounded-full -z-10" />
              )}
              
              <div className="relative mb-3 group cursor-pointer">
                <div className={cn(
                  "rounded-full border-[3px] flex items-center justify-center bg-[var(--color-bg-elevated)] shadow-xl transition-transform group-hover:scale-105",
                  isFirst ? "w-24 h-24 border-[#FFD700] ring-4 ring-[#FFD700]/20" : isSecond ? "w-16 h-16 border-[#C0C0C0]" : "w-16 h-16 border-[#CD7F32]"
                )}>
                  <span className={cn(
                    "font-black text-[var(--color-text-primary)]",
                    isFirst ? "text-3xl" : "text-xl"
                  )}>
                    {user.display_name.charAt(0)}
                  </span>
                </div>
                
                <div className={cn(
                  "absolute -bottom-3 left-1/2 -translate-x-1/2 min-w-[28px] h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--color-bg-primary)] px-2",
                  isFirst ? "bg-gradient-to-r from-[#FFD700] to-[#FDB931]" : isSecond ? "bg-gradient-to-r from-[#E2E2E2] to-[#C0C0C0]" : "bg-gradient-to-r from-[#FFB347] to-[#CD7F32]"
                )}>
                  {isFirst ? <Crown className="w-3.5 h-3.5 text-yellow-900 drop-shadow-sm" /> : <span className="text-white font-black text-xs drop-shadow-md">{isSecond ? "2" : "3"}</span>}
                </div>
              </div>
              
              <p className={cn(
                "font-bold text-[var(--color-text-primary)] truncate w-24 text-center mt-1",
                isFirst ? "text-base" : "text-sm"
              )}>
                {user.display_name.split(" ")[0].replace("(Bot)", "").trim()}
              </p>
              
              <div className={cn(
                "rounded-full mt-1.5 px-2.5 py-0.5 border flex items-center gap-1",
                isFirst ? "bg-[#FFD700]/10 border-[#FFD700]/30" : "bg-[var(--color-bg-secondary)] border-[var(--color-bg-tertiary)]"
              )}>
                <Sparkles className={cn("w-3 h-3", isFirst ? "text-[#FFD700]" : "text-[var(--color-xp)]")} />
                <p className={cn("text-[11px] font-black", isFirst ? "text-[#FFD700]" : "text-[var(--color-xp)]")}>
                  {user.xp}
                </p>
              </div>
              
              {/* Pillar */}
              <div className={cn(
                "w-24 rounded-t-2xl mt-4 bg-gradient-to-t shadow-inner relative overflow-hidden",
                isFirst ? "from-[#FFD700]/5 to-[#FFD700]/20 border-x border-t border-[#FFD700]/30 h-24" : 
                isSecond ? "from-[#C0C0C0]/5 to-[#C0C0C0]/20 border-x border-t border-[#C0C0C0]/30 h-16" : 
                "from-[#CD7F32]/5 to-[#CD7F32]/20 border-x border-t border-[#CD7F32]/30 h-12"
              )}>
                <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 relative z-10">
        {rest.map((user, i) => {
          const rank = i + 4;
          const isMe = user.id === currentUserId;
          
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.default, delay: 0.1 * i }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl relative overflow-hidden transition-all",
                isMe 
                  ? "bg-gradient-to-r from-[var(--color-accent-green)]/10 to-[var(--color-accent-green)]/5 ring-1 ring-[var(--color-accent-green)]/30 shadow-sm" 
                  : "bg-[var(--color-bg-secondary)] shadow-sm hover:shadow-md border border-[var(--color-bg-tertiary)]/30"
              )}
            >
              {isMe && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-accent-green)] rounded-l-2xl" />
              )}
              
              <div className="w-6 text-center font-black text-[var(--color-text-tertiary)] text-sm opacity-60">
                {rank}
              </div>
              
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-inner",
                isMe ? "bg-[var(--color-accent-green)] text-white" : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]"
              )}>
                {user.display_name.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[var(--color-text-primary)] truncate text-base">
                  {user.display_name.replace("(Bot)", "").trim()}
                  {isMe && <span className="ml-2 px-1.5 py-0.5 rounded-md bg-[var(--color-accent-green)]/20 text-[10px] font-black uppercase text-[var(--color-accent-green)] tracking-wider">You</span>}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" /> 
                    Lvl {user.level}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="font-black text-[var(--color-text-primary)] text-base tabular-nums flex items-center gap-1">
                  {user.xp} <span className="text-[10px] font-bold text-[var(--color-xp)]">XP</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {topUsers.length === 0 && (
        <div className="text-center text-[var(--color-text-tertiary)] py-10 font-medium">
          No users found on the leaderboard yet.
        </div>
      )}
    </div>
  );
}
