"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Coins, Palette, Crown, Check, Lock } from "lucide-react";
import { motion } from "motion/react";
import { purchaseItem, equipItem } from "@/app/actions/store";

interface StoreClientProps {
  coins: number;
  unlockedItems: string[];
  equippedTheme: string;
  equippedFrame: string;
}

const STORE_ITEMS = [
  {
    id: "neon_theme",
    type: "theme" as const,
    name: "Neon Cyberpunk",
    description: "A dark, glowing futuristic aesthetic.",
    price: 500,
    icon: Palette,
    color: "#818cf8"
  },
  {
    id: "ocean_theme",
    type: "theme" as const,
    name: "Ocean Breeze",
    description: "Cool blues and calming water tones.",
    price: 500,
    icon: Palette,
    color: "#0ea5e9"
  },
  {
    id: "sunset_theme",
    type: "theme" as const,
    name: "Sunset Glow",
    description: "Warm orange and red evening hues.",
    price: 500,
    icon: Palette,
    color: "#ea580c"
  },
  {
    id: "gold_frame",
    type: "frame" as const,
    name: "Golden Aura",
    description: "A glowing gold frame for your avatar.",
    price: 250,
    icon: Crown,
    color: "#ffd700"
  },
  {
    id: "diamond_frame",
    type: "frame" as const,
    name: "Diamond Shine",
    description: "An icy blue border that sparkles.",
    price: 350,
    icon: Crown,
    color: "#00ffff"
  },
  {
    id: "fire_frame",
    type: "frame" as const,
    name: "Blazing Fire",
    description: "An animated, pulsing fire ring.",
    price: 600,
    icon: Crown,
    color: "#ff4500"
  }
];

export function StoreClient({ coins, unlockedItems, equippedTheme, equippedFrame }: StoreClientProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (item: typeof STORE_ITEMS[0]) => {
    setLoadingId(item.id);
    try {
      const isOwned = unlockedItems.includes(item.id);
      
      if (!isOwned) {
        // Purchase
        const res = await purchaseItem(item.id, item.price);
        if (!res.success) {
          alert(res.error);
          setLoadingId(null);
          return;
        }
      }

      // Equip
      await equipItem(item.id, item.type);
    } catch (error) {
      console.error(error);
    }
    setLoadingId(null);
  };

  const handleUnequip = async (type: "theme" | "frame") => {
    setLoadingId(`unequip_${type}`);
    await equipItem(type === "theme" ? "default" : "none", type);
    setLoadingId(null);
  };

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-4 safe-top bg-[var(--color-bg-primary)] min-h-dvh">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]"
          >
            <ChevronLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
          </button>
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            Store
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-bg-secondary)] px-3 py-1.5 rounded-full shadow-sm">
          <Coins className="w-4 h-4 text-[#FFD60A]" />
          <span className="font-bold text-[var(--color-text-primary)]">{coins}</span>
        </div>
      </div>

      {/* Store Items List */}
      <div className="flex flex-col gap-4">
        {STORE_ITEMS.map((item) => {
          const isOwned = unlockedItems.includes(item.id);
          const isEquipped = item.type === "theme" 
            ? equippedTheme === item.id 
            : equippedFrame === item.id;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--color-bg-elevated)] p-4 rounded-2xl shadow-sm border border-[var(--color-bg-tertiary)] flex flex-col gap-3"
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    {item.name}
                    {item.type === "theme" ? (
                      <span className="text-[10px] bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded-full text-[var(--color-text-secondary)]">Theme</span>
                    ) : (
                      <span className="text-[10px] bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded-full text-[var(--color-text-secondary)]">Frame</span>
                    )}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                {isEquipped ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUnequip(item.type)}
                      disabled={loadingId === `unequip_${item.type}`}
                      className="px-4 py-2 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-full text-sm font-bold opacity-80"
                    >
                      Unequip
                    </button>
                    <button disabled className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-green)] text-white rounded-full text-sm font-bold shadow-md opacity-50">
                      <Check className="w-4 h-4" /> Equipped
                    </button>
                  </div>
                ) : isOwned ? (
                  <button
                    onClick={() => handleAction(item)}
                    disabled={loadingId === item.id}
                    className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-full text-sm font-bold shadow-md shadow-[var(--color-primary-light)] active:scale-95 transition-transform"
                  >
                    {loadingId === item.id ? "..." : "Equip"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(item)}
                    disabled={loadingId === item.id || coins < item.price}
                    className="flex items-center gap-2 px-6 py-2 bg-[var(--color-bg-primary)] border-2 border-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-full text-sm font-bold active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
                  >
                    {loadingId === item.id ? (
                      "..."
                    ) : (
                      <>
                        {coins < item.price ? <Lock className="w-4 h-4 text-[var(--color-text-tertiary)]" /> : null}
                        {item.price} Coins
                      </>
                    )}
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
