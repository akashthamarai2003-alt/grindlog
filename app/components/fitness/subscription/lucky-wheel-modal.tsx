"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Timer, Zap, Check, ArrowRight, X, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";
import { claimSpinDiscountAction } from "@/app/actions/payment";

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimDiscount: (data: {
    token: string;
    expiresAt: number;
    prices: { core: number; pro: number };
    regularPrices: { core: number; pro: number };
  }) => void;
}

// 8 slices: 45 degrees each
// Index 7 is our 50% OFF JACKPOT slice (angle: 315 to 360 deg)
const SLICES = [
  { label: "10% OFF", color: "#0F1A10", textColor: "#6B7280", isWinner: false },
  { label: "20% OFF", color: "#142415", textColor: "#9CA3AF", isWinner: false },
  { label: "15% OFF", color: "#0F1A10", textColor: "#6B7280", isWinner: false },
  { label: "30% OFF", color: "#142415", textColor: "#9CA3AF", isWinner: false },
  { label: "25% OFF", color: "#0F1A10", textColor: "#6B7280", isWinner: false },
  { label: "35% OFF", color: "#142415", textColor: "#9CA3AF", isWinner: false },
  { label: "5% OFF", color: "#0F1A10", textColor: "#6B7280", isWinner: false },
  { label: "🎉 50% OFF", color: "#ADFF00", textColor: "#000000", isWinner: true, badge: "JACKPOT" },
];

export function LuckyWheelModal({ isOpen, onClose, onClaimDiscount }: LuckyWheelModalProps) {
  const [phase, setPhase] = useState<"ready" | "spinning" | "won">("ready");
  const [rotation, setRotation] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-spin 1.2s after modal appears
  useEffect(() => {
    if (!isOpen) return;

    const autoSpinTimeout = setTimeout(() => {
      startSpin();
    }, 1200);

    return () => clearTimeout(autoSpinTimeout);
  }, [isOpen]);

  // Handle countdown when in 'won' phase
  useEffect(() => {
    if (phase === "won") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const fireConfetti = () => {
    try {
      const duration = 2500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.6 },
          colors: ["#ADFF00", "#FFFFFF", "#10B981", "#EAB308"],
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.6 },
          colors: ["#ADFF00", "#FFFFFF", "#10B981", "#EAB308"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch (e) {
      console.error("Confetti trigger error:", e);
    }
  };

  const startSpin = () => {
    if (phase !== "ready") return;
    setPhase("spinning");

    // Slice 7 is centered at 337.5 deg. Rotating clockwise by 22.5 deg brings center to 0 deg (top pointer).
    // 5 full spins: 5 * 360 + 22.5 = 1822.5 deg.
    const targetDeg = 1800 + 22.5;
    setRotation(targetDeg);

    // Spin animation duration is 3.6s
    setTimeout(() => {
      setPhase("won");
      fireConfetti();
    }, 3800);
  };

  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      const res = await claimSpinDiscountAction();
      if (!res.success || !res.token) {
        throw new Error(res.error || "Failed to claim discount");
      }

      onClaimDiscount({
        token: res.token,
        expiresAt: res.expiresAt,
        prices: res.prices,
        regularPrices: res.regularPrices,
      });
      onClose();
    } catch (err: any) {
      alert(err?.message || "Could not apply discount");
    } finally {
      setIsClaiming(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-[#0D160E] border border-[#1F331F] rounded-3xl p-6 text-white shadow-[0_0_60px_rgba(173,255,0,0.15)] overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#ADFF00]/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#142415] border border-[#223A23] flex items-center justify-center text-gray-400 hover:text-white transition-colors z-20"
        >
          <X size={16} />
        </button>

        {phase !== "won" ? (
          /* ================= WHEEL SPIN SCREEN ================= */
          <div className="flex flex-col items-center text-center py-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/30 text-[#ADFF00] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles size={12} /> Exclusive Athlete Reward
            </div>

            <h2 className="text-2xl font-black tracking-tight mb-1">
              Spinning Your Special Offer
            </h2>
            <p className="text-gray-400 text-xs max-w-xs mb-6">
              Hold tight! We are unlocking a special promotional discount for you right now...
            </p>

            {/* WHEEL CONTAINER */}
            <div className="relative w-64 h-64 my-2 flex items-center justify-center">
              {/* TOP POINTER / TICKER NEEDLE */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
                  <path
                    d="M14 32L3.6077 10L24.3923 10L14 32Z"
                    fill="#ADFF00"
                    stroke="#0A1108"
                    strokeWidth="2"
                  />
                  <circle cx="14" cy="8" r="6" fill="#FFFFFF" />
                </svg>
              </div>

              {/* ROTATING SVG WHEEL */}
              <motion.div
                animate={{ rotate: rotation }}
                transition={{
                  duration: 3.6,
                  ease: [0.15, 0.9, 0.25, 1], // Deceleration physics
                }}
                className="w-full h-full rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] border-4 border-[#1F331F] relative overflow-hidden"
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {SLICES.map((slice, i) => {
                    const angle = 45;
                    const startAngle = i * angle - 90;
                    const endAngle = (i + 1) * angle - 90;

                    // SVG arc coordinates (r = 100, cx = 100, cy = 100)
                    const rad1 = (startAngle * Math.PI) / 180;
                    const rad2 = (endAngle * Math.PI) / 180;
                    const x1 = 100 + 100 * Math.cos(rad1);
                    const y1 = 100 + 100 * Math.sin(rad1);
                    const x2 = 100 + 100 * Math.cos(rad2);
                    const y2 = 100 + 100 * Math.sin(rad2);

                    const midAngle = startAngle + angle / 2;
                    const midRad = (midAngle * Math.PI) / 180;
                    const textX = 100 + 64 * Math.cos(midRad);
                    const textY = 100 + 64 * Math.sin(midRad);

                    return (
                      <g key={i}>
                        <path
                          d={`M100,100 L${x1},${y1} A100,100 0 0,1 ${x2},${y2} Z`}
                          fill={slice.color}
                          stroke="#1A2D1B"
                          strokeWidth="1.5"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill={slice.textColor}
                          fontSize={slice.isWinner ? "10.5" : "9"}
                          fontWeight={slice.isWinner ? "900" : "700"}
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                        >
                          {slice.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* CENTER CAP */}
                  <circle cx="100" cy="100" r="22" fill="#0A1108" stroke="#ADFF00" strokeWidth="3" />
                  <circle cx="100" cy="100" r="14" fill="#142415" />
                  <text
                    x="100"
                    y="104"
                    fill="#ADFF00"
                    fontSize="12"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    ⚡
                  </text>
                </svg>
              </motion.div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#ADFF00] animate-pulse">
              <Zap size={14} /> Selecting highest available discount...
            </div>
          </div>
        ) : (
          /* ================= VICTORY SCREEN ================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-1"
          >
            {/* Victory Badge */}
            <div className="w-16 h-16 rounded-2xl bg-[#ADFF00] text-black flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(173,255,0,0.4)]">
              <span className="text-3xl">🎉</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/30 text-[#ADFF00] text-xs font-black uppercase tracking-wider mb-2">
              ⭐ Jackpot Won: 50% OFF
            </div>

            <h2 className="text-2xl font-black tracking-tight mb-1 text-white">
              Congratulations!
            </h2>
            <p className="text-sm font-bold text-[#ADFF00] mb-1">
              🔥 50% OFF LOCKED IN FOR ALL MONTHS
            </p>
            <p className="text-gray-400 text-xs max-w-xs mb-4">
              Your price is permanently locked. You will never pay standard price as long as your plan stays active!
            </p>

            {/* PRICE COMPARISON CARDS */}
            <div className="grid grid-cols-2 gap-3 w-full mb-4">
              {/* Core Plan */}
              <div className="bg-[#121E12] border border-[#1F331F] rounded-2xl p-3 text-left relative overflow-hidden">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Core Plan
                </div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-xs text-gray-500 line-through">₹59</span>
                  <span className="text-xl font-black text-white">₹29</span>
                  <span className="text-[10px] text-gray-400">/mo</span>
                </div>
                <div className="text-[10px] font-bold text-[#ADFF00]">
                  Save ₹30 every month
                </div>
              </div>

              {/* Pro Plan (Best Value) */}
              <div className="bg-[#152616] border-2 border-[#ADFF00] rounded-2xl p-3 text-left relative overflow-hidden shadow-[0_0_15px_rgba(173,255,0,0.15)]">
                <div className="absolute top-0 right-0 bg-[#ADFF00] text-black text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase">
                  Best Value
                </div>
                <div className="text-[10px] font-black text-[#ADFF00] uppercase tracking-wider mb-1">
                  Pro Plan
                </div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-xs text-gray-500 line-through">₹199</span>
                  <span className="text-xl font-black text-[#ADFF00]">₹99</span>
                  <span className="text-[10px] text-gray-400">/mo</span>
                </div>
                <div className="text-[10px] font-bold text-[#ADFF00]">
                  Save ₹100 every month
                </div>
              </div>
            </div>

            {/* LIFETIME GUARANTEE PILL */}
            <div className="w-full bg-[#121E12] border border-[#1F331F] rounded-xl px-3 py-2 flex items-center gap-2 text-left mb-4">
              <ShieldCheck className="text-[#ADFF00] shrink-0" size={18} />
              <div className="text-[11px] text-gray-300 leading-tight">
                <span className="font-bold text-white">Lifetime Rate Guarantee:</span> This 50% discount applies to all renewal months.
              </div>
            </div>

            {/* 5-MINUTE COUNTDOWN TIMER */}
            <div className="w-full bg-[#080D08] border border-[#ADFF00]/20 rounded-2xl p-3 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="text-[#ADFF00] animate-spin" size={16} />
                <span className="text-xs font-semibold text-gray-300">Offer Expires In:</span>
              </div>
              <div className="font-mono text-lg font-black text-[#ADFF00] tracking-wider">
                {formatTimer(timeLeft)}
              </div>
            </div>

            {/* CLAIM CTA BUTTON */}
            <button
              onClick={handleClaim}
              disabled={isClaiming || timeLeft <= 0}
              className="w-full py-4 bg-[#ADFF00] text-black rounded-full font-black text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(173,255,0,0.3)] hover:bg-[#9BE600] disabled:opacity-50 disabled:shadow-none transition-all cursor-pointer"
            >
              {isClaiming ? (
                <span className="flex items-center gap-2">
                  <Zap size={18} className="animate-spin" /> Securing Your 50% Lock...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  CLAIM 50% OFF FOR ALL MONTHS ⚡
                </span>
              )}
            </button>

            {/* Skip Option */}
            <button
              onClick={onClose}
              className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            >
              No thanks, I prefer paying standard price (₹199)
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
