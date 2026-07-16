"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Target, Calendar, CalendarDays, Coins, Sparkles } from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function QuestsClient({ initialQuests }: { initialQuests: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");

  const dailyQuests = initialQuests.filter(q => q.quest_type === "daily");
  const weeklyQuests = initialQuests.filter(q => q.quest_type === "weekly");
  const monthlyQuests = initialQuests.filter(q => q.quest_type === "monthly");
  
  const questsToShow = activeTab === "daily" ? dailyQuests : activeTab === "weekly" ? weeklyQuests : monthlyQuests;

  const questDetails: Record<string, { title: string, desc: string }> = {
    "daily_1_habit": { title: "Warm Up", desc: "Complete 1 habit today" },
    "daily_3_habits": { title: "Grind Session", desc: "Complete 3 habits today" },
    "weekly_10_habits": { title: "Weekly Warrior", desc: "Complete 10 habits this week" },
    "weekly_20_habits": { title: "Consistency is Key", desc: "Complete 20 habits this week" },
    "monthly_50_habits": { title: "Monthly Master", desc: "Complete 50 habits this month" },
    "monthly_100_habits": { title: "Unstoppable", desc: "Complete 100 habits this month" },
  };

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
            Quests
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--color-bg-secondary)] p-1 rounded-2xl">
        {[
          { id: "daily", label: "Daily", icon: Target },
          { id: "weekly", label: "Weekly", icon: Calendar },
          { id: "monthly", label: "Monthly", icon: CalendarDays },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-xl transition-colors z-10",
                isActive ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="questsTab"
                  className="absolute inset-0 bg-[var(--color-bg-elevated)] shadow-sm rounded-xl -z-10"
                  transition={springs.gentle}
                />
              )}
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Quest List */}
      <div className="flex flex-col gap-3 mt-2">
        {questsToShow.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 bg-[var(--color-bg-secondary)] rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-[var(--color-text-tertiary)]" />
            </div>
            <h3 className="text-[var(--color-text-primary)] font-bold text-lg mb-1">Coming Soon</h3>
            <p className="text-[var(--color-text-secondary)] text-sm px-4">
              {activeTab === "daily" ? "Daily" : activeTab === "weekly" ? "Weekly" : "Monthly"} quests are not available yet!
            </p>
          </div>
        ) : (
          questsToShow.map((quest, i) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.default, delay: i * 0.1 }}
              className="bg-[var(--color-bg-elevated)] p-4 rounded-2xl shadow-sm border border-[var(--color-bg-tertiary)]"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-[var(--color-text-primary)] font-bold mb-1">
                    {questDetails[quest.quest_key]?.title || "Quest"}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-xs font-medium">
                    {questDetails[quest.quest_key]?.desc || "Complete this quest"}
                  </p>
                </div>
                
                {quest.is_completed ? (
                  <div className="bg-[var(--color-accent-green)]/10 text-[var(--color-accent-green)] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Done
                  </div>
                ) : (
                  <div className="bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] px-3 py-1 rounded-full text-xs font-bold">
                    {quest.progress_current} / {quest.progress_target}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden mb-4">
                <motion.div 
                  className={cn(
                    "h-full rounded-full",
                    quest.is_completed ? "bg-[var(--color-accent-green)]" : "bg-[var(--color-xp)]"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (quest.progress_current / quest.progress_target) * 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              {/* Rewards */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[var(--color-text-secondary)] text-xs font-bold bg-[var(--color-bg-secondary)] px-2 py-1 rounded-md">
                  <Sparkles className="w-3 h-3 text-[var(--color-xp)]" />
                  +{quest.xp_reward} XP
                </div>
                <div className="flex items-center gap-1 text-[var(--color-text-secondary)] text-xs font-bold bg-[var(--color-bg-secondary)] px-2 py-1 rounded-md">
                  <Coins className="w-3 h-3 text-[#FFD60A]" />
                  +{quest.coins_reward} Coins
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

    </div>
  );
}
