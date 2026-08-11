"use client";

import { Activity, Heart, Dumbbell } from "lucide-react";

export function CategoryPills() {
  const categories = [
    { id: "warmup", label: "Warm Up", icon: Activity, active: true },
    { id: "cardio", label: "Cardio", icon: Heart, active: false },
    { id: "strength", label: "Strength", icon: Dumbbell, active: false }
  ];

  return (
    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.id}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all whitespace-nowrap shrink-0 ${
              cat.active 
                ? "border-[#ADFF00] bg-[#ADFF00]/10 text-white shadow-[0_0_10px_rgba(173,255,0,0.1)]"
                : "border-[#1A2619] bg-[#121E12] text-gray-400 hover:text-white hover:border-gray-700"
            }`}
          >
            <Icon size={14} className={cat.active ? "text-[#ADFF00]" : "text-gray-500"} />
            <span className="text-xs font-semibold">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
