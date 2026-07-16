"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CircleDollarSign, Palette, Crown, Check, Lock, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { purchaseItem, equipItem } from "@/app/actions/store";
import { cn } from "@/lib/utils";

interface StoreClientProps {
  coins: number;
  unlockedItems: string[];
  equippedTheme: string;
  equippedFrame: string;
}

const STORE_ITEMS = [
  // --- THEMES ---
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
    id: "sakura_theme",
    type: "theme" as const,
    name: "Sakura Blossom",
    description: "Soft pinks and cherry blossom aesthetics.",
    price: 800,
    icon: Sparkles,
    color: "#ff69b4"
  },
  {
    id: "midnight_theme",
    type: "theme" as const,
    name: "Midnight OLED",
    description: "Pure blacks with striking purple accents.",
    price: 1000,
    icon: Palette,
    color: "#a855f7"
  },
  {
    id: "forest_theme",
    type: "theme" as const,
    name: "Forest Canopy",
    description: "Rich, deep natural greens and earthy tones.",
    price: 500,
    icon: Palette,
    color: "#10b981"
  },
  
  // --- FRAMES ---
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
  },
  {
    id: "emerald_frame",
    type: "frame" as const,
    name: "Emerald Glow",
    description: "A pulsing, vibrant green nature border.",
    price: 450,
    icon: ImageIcon,
    color: "#10b981"
  },
  {
    id: "amethyst_frame",
    type: "frame" as const,
    name: "Amethyst Crystal",
    description: "A deep purple glowing border.",
    price: 500,
    icon: Crown,
    color: "#a855f7"
  }
];

type TabType = "themes" | "frames";

export function StoreClient({ coins, unlockedItems, equippedTheme, equippedFrame }: StoreClientProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("themes");

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

  const filteredItems = STORE_ITEMS.filter(item => 
    (activeTab === "themes" && item.type === "theme") ||
    (activeTab === "frames" && item.type === "frame")
  );

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-4 safe-top bg-[var(--color-bg-primary)] min-h-dvh">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-[var(--color-text-secondary)]" />
          </button>
          <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            Store
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-br from-[#FFD60A]/20 to-[#FF9F0A]/20 px-4 py-2 rounded-full shadow-inner ring-1 ring-[#FFD60A]/30">
          <CircleDollarSign className="w-5 h-5 text-[#d48806]" />
          <span className="font-black text-[#d48806] text-lg">{coins}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--color-bg-secondary)] p-1 rounded-2xl relative">
        <button 
          onClick={() => setActiveTab("themes")}
          className={cn(
            "flex-1 py-2.5 text-sm font-bold z-10 transition-colors rounded-xl",
            activeTab === "themes" ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
          )}
        >
          Themes
        </button>
        <button 
          onClick={() => setActiveTab("frames")}
          className={cn(
            "flex-1 py-2.5 text-sm font-bold z-10 transition-colors rounded-xl",
            activeTab === "frames" ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
          )}
        >
          Frames
        </button>
        {/* Tab Indicator */}
        <motion.div 
          layoutId="store-tab-indicator"
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--color-bg-elevated)] rounded-xl shadow-sm border border-[var(--color-bg-tertiary)] z-0"
          initial={false}
          animate={{ left: activeTab === "themes" ? "4px" : "calc(50%)" }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      </div>

      {/* Store Items List */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            const isOwned = unlockedItems.includes(item.id);
            const isEquipped = item.type === "theme" 
              ? equippedTheme === item.id 
              : equippedFrame === item.id;
            
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={cn(
                  "relative p-5 rounded-3xl overflow-hidden shadow-lg border border-[var(--color-bg-tertiary)] flex flex-col gap-4",
                  "bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-bg-secondary)]"
                )}
              >
                {/* Subtle Background Glow based on item color - using radial gradient instead of CSS blur for much better performance */}
                <div 
                  className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${item.color} 0%, transparent 70%)` }}
                />

                <div className="flex items-start gap-4 relative z-10">
                  {item.type === "theme" ? (
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ring-1 ring-black/5"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      <item.icon className="w-7 h-7" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 shrink-0 flex items-center justify-center relative">
                       {/* Frame Preview Avatar */}
                       <div 
                         className={cn(
                           "absolute inset-0 rounded-2xl",
                           `frame-${item.id.replace('_frame', '')}`
                         )}
                       />
                       <span className="text-xl relative z-10">👤</span>
                    </div>
                  )}

                  <div className="flex-1 pt-1">
                    <h3 className="font-extrabold text-[var(--color-text-primary)] text-lg tracking-tight">
                      {item.name}
                    </h3>
                    <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5 leading-snug font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 relative z-10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-2 py-1 rounded-md">
                    {item.type}
                  </div>
                  
                  {isEquipped ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUnequip(item.type)}
                        disabled={loadingId === `unequip_${item.type}`}
                        className="px-4 py-2.5 bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] rounded-xl text-sm font-bold active:scale-95 transition-transform"
                      >
                        Unequip
                      </button>
                      <button disabled className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[var(--color-accent-green)] to-[#28a745] text-white rounded-xl text-sm font-black shadow-[var(--shadow-glow-green)]">
                        <Check className="w-4 h-4" /> Equipped
                      </button>
                    </div>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleAction(item)}
                      disabled={loadingId === item.id}
                      className="px-8 py-2.5 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] rounded-xl text-sm font-black shadow-lg active:scale-95 transition-transform"
                    >
                      {loadingId === item.id ? "..." : "Equip"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(item)}
                      disabled={loadingId === item.id || coins < item.price}
                      className={cn(
                        "flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-black active:scale-95 transition-transform",
                        coins >= item.price 
                          ? "bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white shadow-[var(--shadow-glow-blue)]"
                          : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] opacity-60"
                      )}
                    >
                      {loadingId === item.id ? (
                        "..."
                      ) : (
                        <>
                          {coins < item.price ? <Lock className="w-4 h-4" /> : null}
                          {item.price} <CircleDollarSign className="w-4 h-4 ml-0.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
