"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Gift, Lock, CircleDollarSign, Crown } from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/services/supabase/client";
import { useState } from "react";

export function SeasonClient({ seasonData, progress }: { seasonData: any; progress: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [claimedTiers, setClaimedTiers] = useState<number[]>(progress?.claimed_tiers || []);
  const [isClaiming, setIsClaiming] = useState(false);

  const currentXp = progress?.current_xp || 0;
  
  // Calculate current tier
  let currentTier = 0;
  for (const t of seasonData.tiers) {
    if (currentXp >= t.xpRequired) {
      currentTier = t.tier;
    }
  }

  const handleClaim = async (tier: number, rewardCoins: number) => {
    if (isClaiming || claimedTiers.includes(tier)) return;
    setIsClaiming(true);
    
    try {
      const newClaimed = [...claimedTiers, tier];
      
      // Update progress
      await supabase
        .from("season_progress")
        .update({ claimed_tiers: newClaimed })
        .eq("id", progress.id);

      // Award coins
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         const { data: p } = await supabase.from("profiles").select("coins").eq("id", user.id).single();
         if (p) {
           await supabase.from("profiles").update({ coins: (p.coins || 0) + rewardCoins }).eq("id", user.id);
         }
      }

      setClaimedTiers(newClaimed);
      alert(`Claimed ${rewardCoins} Coins!`);
    } catch (e) {
      alert("Failed to claim reward");
    } finally {
      setIsClaiming(false);
    }
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
            {seasonData.name}
          </h1>
        </div>
      </div>

      {/* Progress Banner */}
      <div className="bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-2xl p-5 shadow-md text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10">
          <Crown className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <p className="text-sm font-semibold opacity-90 mb-1">Current Tier</p>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-black">{currentTier}</span>
            <span className="text-sm font-semibold opacity-80 mb-1.5">/ {seasonData.tiers.length}</span>
          </div>
          
          <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
             {/* Progress to NEXT tier */}
             <motion.div 
               className="h-full bg-white rounded-full"
               initial={{ width: 0 }}
               animate={{ 
                 width: `${Math.min(100, 
                   ((currentXp - (seasonData.tiers[currentTier - 1]?.xpRequired || 0)) / 
                   ((seasonData.tiers[currentTier]?.xpRequired || 500) - (seasonData.tiers[currentTier - 1]?.xpRequired || 0))) * 100
                 )}%` 
               }}
               transition={{ duration: 1 }}
             />
          </div>
          <p className="text-xs font-medium opacity-80 mt-2">
            {currentXp} XP / {seasonData.tiers[currentTier]?.xpRequired || 'MAX'} XP to next tier
          </p>
        </div>
      </div>

      {/* Tiers List */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-black uppercase text-[var(--color-text-tertiary)] tracking-wider px-1">
          Rewards Track
        </h2>
        
        {seasonData.tiers.map((t: any, i: number) => {
          const isUnlocked = currentXp >= t.xpRequired;
          const isClaimed = claimedTiers.includes(t.tier);
          const isMajor = t.tier % 5 === 0;

          return (
            <motion.div
              key={t.tier}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.default, delay: i * 0.05 }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border",
                isUnlocked && !isClaimed ? "bg-[var(--color-bg-elevated)] border-[var(--color-accent-green)] shadow-sm" :
                "bg-[var(--color-bg-secondary)] border-transparent"
              )}
            >
              <div className="flex flex-col items-center justify-center w-12 shrink-0">
                <span className="text-xs font-bold text-[var(--color-text-tertiary)]">Tier</span>
                <span className={cn(
                  "text-xl font-black",
                  isUnlocked ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"
                )}>{t.tier}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm",
                    isMajor ? "bg-[#FFD60A]/20 text-[#D4AF37]" : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]"
                  )}>
                    <CircleDollarSign className="w-4 h-4" />
                    {t.rewardCoins} Coins
                  </div>
                </div>
                <p className="text-xs font-medium text-[var(--color-text-tertiary)] mt-1.5">
                  Requires {t.xpRequired} XP
                </p>
              </div>

              <div>
                {!isUnlocked ? (
                   <div className="w-10 h-10 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center">
                     <Lock className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                   </div>
                ) : isClaimed ? (
                   <div className="w-10 h-10 rounded-full bg-[var(--color-bg-tertiary)]/50 flex items-center justify-center">
                     <span className="text-xs font-bold text-[var(--color-text-tertiary)]">Done</span>
                   </div>
                ) : (
                   <button 
                     onClick={() => handleClaim(t.tier, t.rewardCoins)}
                     disabled={isClaiming}
                     className="bg-[var(--color-accent-green)] text-white px-4 py-2 rounded-xl font-bold shadow-sm active:scale-95 transition-transform"
                   >
                     Claim
                   </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
