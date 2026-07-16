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
    <div className="flex flex-col gap-5 px-5 pb-8 pt-4 safe-top bg-[var(--color-bg-primary)] min-h-dvh">
      {/* Header */}
      <div className="flex items-center gap-3">
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
      <div className="flex justify-center items-end gap-2 mt-4 mb-6 h-48">
        {podium.map((user, i) => {
          const isFirst = i === 1;
          const isSecond = i === 0;
          const isThird = i === 2;

          if (!user) {
            return (
              <div key={i} className="flex flex-col items-center opacity-40">
                <div className={cn(
                  "rounded-full border-4 flex items-center justify-center border-dashed border-[var(--color-text-tertiary)] bg-[var(--color-bg-secondary)] mb-[38px]",
                  isFirst ? "w-20 h-20" : "w-16 h-16"
                )}>
                  <span className="text-xl font-bold text-[var(--color-text-tertiary)]">?</span>
                </div>
                {/* Pillar */}
                <div className={cn(
                  "w-20 rounded-t-xl mt-2 bg-[var(--color-bg-tertiary)]",
                  isFirst ? "h-20" : isSecond ? "h-14" : "h-10"
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
              className="flex flex-col items-center"
            >
              <div className="relative mb-2">
                <div className={cn(
                  "rounded-full border-4 flex items-center justify-center bg-[var(--color-bg-secondary)]",
                  isFirst ? "w-20 h-20 border-[#FFD700]" : "w-16 h-16 border-[#C0C0C0]",
                  isThird && "border-[#CD7F32]"
                )}>
                  <span className="text-xl font-bold">{user.display_name.charAt(0)}</span>
                </div>
                <div className={cn(
                  "absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md",
                  isFirst ? "bg-[#FFD700]" : isSecond ? "bg-[#C0C0C0]" : "bg-[#CD7F32]"
                )}>
                  {isFirst ? <Crown className="w-4 h-4 text-white" /> : <span className="text-white font-bold text-xs">{isSecond ? "2" : "3"}</span>}
                </div>
              </div>
              <p className="text-sm font-bold text-[var(--color-text-primary)] truncate w-24 text-center">
                {user.display_name.split(" ")[0]}
              </p>
              <div className="bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded-full mt-1">
                <p className="text-[10px] font-bold text-[var(--color-xp)]">
                  {user.xp} XP
                </p>
              </div>
              
              {/* Pillar */}
              <div className={cn(
                "w-20 rounded-t-xl mt-2 bg-gradient-to-t from-[var(--color-bg-secondary)] to-transparent",
                isFirst ? "h-20" : isSecond ? "h-14" : "h-10"
              )} />
            </motion.div>
          );
        })}
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {rest.map((user, i) => {
          const rank = i + 4;
          const isMe = user.id === currentUserId;
          
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springs.default, delay: 0.1 * i }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl",
                isMe ? "bg-[var(--color-accent-green)]/10 ring-1 ring-[var(--color-accent-green)]/30" : "bg-[var(--color-bg-secondary)]"
              )}
            >
              <div className="w-6 text-center font-bold text-[var(--color-text-tertiary)] text-sm">
                {rank}
              </div>
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center font-bold text-[var(--color-text-primary)]">
                {user.display_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--color-text-primary)] truncate">
                  {user.display_name}
                  {isMe && <span className="ml-2 text-[10px] font-black uppercase text-[var(--color-accent-green)]">You</span>}
                </p>
                <p className="text-xs font-medium text-[var(--color-text-tertiary)] flex items-center gap-1 mt-0.5">
                  <Flame className="w-3 h-3 text-[var(--color-xp)]" /> Lvl {user.level}
                </p>
              </div>
              <div className="font-bold text-[var(--color-text-primary)] text-sm tabular-nums">
                {user.xp} <span className="text-[10px] text-[var(--color-text-tertiary)]">XP</span>
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
