"use client";

import React, { useState } from "react";
import { Plus, Minus, Edit3 } from "lucide-react";

interface WaterBottleCardProps {
  consumedMl: number;
  targetMl: number;
  onAddWater: (amount: number) => Promise<void> | void;
  onRemoveWater: (amount: number) => Promise<void> | void;
  onEditGoal: () => void;
  isLoading?: boolean;
}

export function WaterBottleCard({
  consumedMl,
  targetMl,
  onAddWater,
  onRemoveWater,
  onEditGoal,
  isLoading = false,
}: WaterBottleCardProps) {
  const [stepAmount, setStepAmount] = useState<number>(250);

  const rawConsumed = typeof consumedMl === 'number' && !isNaN(consumedMl) ? Math.max(0, consumedMl) : 0;
  const safeTarget = typeof targetMl === 'number' && !isNaN(targetMl) && targetMl > 0 ? targetMl : 2500;
  // Strictly cap at user's chosen goal
  const safeConsumed = Math.min(safeTarget, rawConsumed);
  const isGoalReached = safeConsumed >= safeTarget;
  const percent = Math.min(100, Math.max(0, Math.round((safeConsumed / safeTarget) * 100))) || 0;
  const targetInLiters = (safeTarget / 1000).toFixed(1).replace(/\.0$/, "");
  const consumedInLiters = (safeConsumed / 1000).toFixed(1);

  // SVG Geometry Constants for Bottle ViewBox 0 0 110 230
  // Bottle liquid fills from base (y=196) up to shoulder (y=58) => height delta = 138
  const baseFillY = 196;
  const maxFillHeight = 138;
  const currentFillHeight = Math.max(0, (percent / 100) * maxFillHeight);
  const currentFillY = Math.round(baseFillY - currentFillHeight);
  
  // Floating badge Y coordinate clamped inside bottle view
  const badgeY = Math.round(Math.min(176, Math.max(76, currentFillY)));

  return (
    <div className="bg-[#111A10] border border-white/5 rounded-[28px] p-5 sm:p-6 mt-3 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      {/* Background ambient neon glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#00D2FF]/5 blur-[50px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#00D2FF]/5 blur-[40px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-6">
        {/* LEFT COLUMN: Water Bottle SVG Animation */}
        <div className="w-[105px] sm:w-[125px] flex items-center justify-center shrink-0 select-none">
          <svg
            viewBox="0 0 110 230"
            className="w-full h-auto max-h-[195px] filter drop-shadow-[0_8px_16px_rgba(0,210,255,0.15)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Bottle liquid clipping mask */}
              <clipPath id="bottleInsideClip">
                <path
                  d="M 38 42 L 72 42 L 86 64 L 86 186 C 86 198 76 204 55 204 C 34 204 24 198 24 186 L 24 64 Z"
                />
              </clipPath>

              {/* Water Gradient */}
              <linearGradient id="cyanWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="60%" stopColor="#00C2FF" />
                <stop offset="100%" stopColor="#0099FF" />
              </linearGradient>

              {/* Glass surface highlight gradient */}
              <linearGradient id="glassSheen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="white" stopOpacity="0.02" />
                <stop offset="70%" stopColor="white" stopOpacity="0.12" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>

              {/* Top Cap Gradient */}
              <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#D8E2EC" />
              </linearGradient>
            </defs>

            {/* Lean bottle group by ~-7 degrees to match reference image */}
            <g transform="rotate(-7 55 115)">
              {/* 1. TOP CAP & SPOUT */}
              {/* Loop carry handle */}
              <path
                d="M 47 16 C 47 10, 63 10, 63 16"
                stroke="#E2E8F0"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Spout cap */}
              <rect x="42" y="18" width="26" height="18" rx="6" fill="url(#capGrad)" />
              {/* Cap base ring */}
              <rect x="36" y="34" width="38" height="8" rx="3" fill="#CBD5E1" />

              {/* 2. LEFT STRAP / HANDLE CLIP */}
              <rect
                x="17"
                y="62"
                width="5"
                height="82"
                rx="2.5"
                fill="#E2E8F0"
                className="opacity-90"
              />

              {/* 3. BOTTLE INTERIOR BACKGROUND (Dark smoky translucent plastic) */}
              <path
                d="M 38 42 L 72 42 L 86 64 L 86 186 C 86 198 76 204 55 204 C 34 204 24 198 24 186 L 24 64 Z"
                fill="rgba(255, 255, 255, 0.08)"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="2"
              />

              {/* 4. WATER FILL (Animated Height Clipped Inside Bottle) */}
              <g clipPath="url(#bottleInsideClip)">
                {/* Liquid body */}
                <rect
                  x="15"
                  y={currentFillY}
                  width="80"
                  height={currentFillHeight + 20}
                  fill="url(#cyanWaterGrad)"
                  className="transition-all duration-700 ease-out"
                />

                {/* Surface meniscus curvature */}
                {percent > 0 && (
                  <ellipse
                    cx="55"
                    cy={currentFillY}
                    rx="31"
                    ry="4.5"
                    fill="#38E1FF"
                    className="transition-all duration-700 ease-out opacity-80"
                  />
                )}

                {/* Ambient water reflection */}
                <path
                  d="M 28 65 L 28 185"
                  stroke="rgba(255, 255, 255, 0.25)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>

              {/* 5. MEASUREMENT / GRIP RIBS */}
              <g stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1.5" strokeLinecap="round">
                <line x1="32" y1="102" x2="78" y2="102" />
                <line x1="32" y1="112" x2="78" y2="112" />
                <line x1="32" y1="122" x2="78" y2="122" />
                <line x1="32" y1="132" x2="78" y2="132" />
              </g>

              {/* 6. BOTTLE GLASS SHINE OVERLAY */}
              <path
                d="M 76 68 L 76 182"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* 7. OUTER BOTTLE RIM */}
              <path
                d="M 38 42 L 72 42 L 86 64 L 86 186 C 86 198 76 204 55 204 C 34 204 24 198 24 186 L 24 64 Z"
                fill="url(#glassSheen)"
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* 8. FLOATING PERCENTAGE BADGE */}
              <g
                transform={`translate(68, ${badgeY})`}
                className="transition-transform duration-700 ease-out"
              >
                <circle
                  cx="0"
                  cy="0"
                  r="16"
                  fill="rgba(10, 15, 12, 0.75)"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="4"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                  className="font-sans"
                >
                  {percent}%
                </text>
              </g>
            </g>
          </svg>
        </div>

        {/* RIGHT COLUMN: Water Intake Stats & Stepper Logger */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Header Title */}
          <h3 className="text-sm font-bold text-white tracking-wide">
            Water Intake
          </h3>

          {/* Value Display: 1500 / 2.5 L */}
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {safeConsumed}
            </span>
            <span className="text-sm sm:text-base font-bold text-white/50 pb-0.5">
              / {targetInLiters} L
            </span>
          </div>

          {/* Goal Link with Edit Icon */}
          <button
            type="button"
            onClick={onEditGoal}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00D2FF] hover:text-[#52e5ff] transition-colors mt-1 mb-3.5 group cursor-pointer w-fit"
            title="Edit daily water target"
          >
            <span>Goal - {targetInLiters}L</span>
            <Edit3
              size={12}
              className="opacity-70 group-hover:opacity-100 transition-opacity"
            />
            {isGoalReached && (
              <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/30">
                Goal Reached!
              </span>
            )}
          </button>

          {/* Pill Stepper Logger: [ - ]  250 ml  [ + ] */}
          <div className="w-full max-w-[200px] bg-[#1E261D] border border-white/10 rounded-2xl p-1.5 flex items-center justify-between shadow-inner">
            {/* Minus Button */}
            <button
              type="button"
              disabled={safeConsumed <= 0}
              onClick={() => onRemoveWater(stepAmount)}
              className="w-10 h-10 rounded-xl bg-black/40 hover:bg-black/70 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition-all cursor-pointer"
              title={`Remove ${stepAmount}ml`}
            >
              <Minus size={14} strokeWidth={3} />
            </button>

            {/* Serving Size Selector Toggle */}
            <button
              type="button"
              onClick={() => setStepAmount((prev) => (prev === 250 ? 500 : 250))}
              className="px-2 py-1 rounded-lg hover:bg-white/5 text-xs font-black text-white/90 tracking-wide transition-colors cursor-pointer"
              title="Tap to toggle between 250ml and 500ml"
            >
              {stepAmount} ml
            </button>

            {/* Plus Button with Neon Cyan Highlight */}
            <button
              type="button"
              disabled={isGoalReached}
              onClick={() => onAddWater(stepAmount)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${
                isGoalReached
                  ? "bg-white/10 text-white/30 cursor-not-allowed shadow-none"
                  : "bg-[#00D2FF] hover:bg-[#38e1ff] active:scale-95 text-black cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.35)]"
              }`}
              title={isGoalReached ? `Daily goal of ${targetInLiters}L reached!` : `Add ${stepAmount}ml`}
            >
              <Plus size={16} strokeWidth={3.5} />
            </button>
          </div>

          {/* Subtitle: 0.9L logged today */}
          <p className="text-[11px] font-medium text-white/40 mt-2 tracking-wide">
            {consumedInLiters}L logged today
          </p>
        </div>
      </div>
    </div>
  );
}
