"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, animate } from "motion/react";
import {
  ArrowLeft, TrendingUp, Flame, Trophy, AlertCircle,
  Activity, Smartphone, Calendar, BatteryCharging, Smile, Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const HIGHLIGHTS = {
  completion: 87,
  longestStreak: 14,
  bestHabit: "Reading",
  worstHabit: "Wake up 6am",
};

const WEEKLY_DATA = [
  { day: "Mon", habits: 5, mood: 8, energy: 7 },
  { day: "Tue", habits: 6, mood: 7, energy: 6 },
  { day: "Wed", habits: 4, mood: 6, energy: 4 },
  { day: "Thu", habits: 7, mood: 9, energy: 8 },
  { day: "Fri", habits: 8, mood: 10, energy: 9 },
  { day: "Sat", habits: 6, mood: 8, energy: 7 },
  { day: "Sun", habits: 5, mood: 7, energy: 6 },
];

const DONUT_DATA = [
  { label: "Productive", value: 45, color: "#34C759" },
  { label: "Social",     value: 30, color: "#007AFF" },
  { label: "Fun",        value: 25, color: "#FF9500" },
];

const HEATMAP_DATA = [
  4,3,2,4,1,0,3,
  2,4,3,1,4,2,3,
  1,0,4,3,2,4,1,
  3,2,1,4,3,2,4,
];

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
    animate(motionVal, value, { duration: 1.4, ease: "easeOut" });
    return unsub;
  }, [value]);

  return <span ref={ref}>0{suffix}</span>;
}

// ─── LINE CHART ───────────────────────────────────────────────────────────────

const W = 300;
const H = 110;

function generateSmooth(dataKey: "mood" | "energy") {
  const xs = WEEKLY_DATA.map((_, i) => (i / (WEEKLY_DATA.length - 1)) * W);
  const ys = WEEKLY_DATA.map(d => H - (d[dataKey] / 10) * H);
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` C ${cx} ${ys[i - 1]}, ${cx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  return { path: d, xs, ys };
}

function generateArea(dataKey: "mood" | "energy") {
  const { path, xs, ys } = generateSmooth(dataKey);
  return `${path} L ${xs[xs.length - 1]} ${H} L ${xs[0]} ${H} Z`;
}

function LineChart() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [hover, setHover] = useState<number | null>(null);

  const moodPath = generateSmooth("mood");
  const energyPath = generateSmooth("energy");

  return (
    <div ref={ref} className="relative">
      {/* Hover tooltip */}
      {hover !== null && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-1 z-10 pointer-events-none"
          style={{ left: moodPath.xs[hover] - 28, transform: "none" }}
        >
          <div className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-tertiary)] rounded-xl px-3 py-1.5 shadow-lg text-[10px] font-bold leading-tight text-center min-w-[56px]">
            <div className="text-[#007AFF]">😊 {WEEKLY_DATA[hover].mood}</div>
            <div className="text-[#FF9500]">⚡ {WEEKLY_DATA[hover].energy}</div>
          </div>
        </motion.div>
      )}

      <svg
        viewBox={`0 -12 ${W} ${H + 16}`}
        className="w-full"
        style={{ height: 130 }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#007AFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF9500" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#FF9500" stopOpacity="0" />
          </linearGradient>
          <filter id="glow-blue">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-orange">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Area fills */}
        {inView && (
          <>
            <motion.path
              d={generateArea("energy")}
              fill="url(#energyGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            />
            <motion.path
              d={generateArea("mood")}
              fill="url(#moodGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            />
          </>
        )}

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((t, i) => (
          <line
            key={i}
            x1={0} y1={H * t} x2={W} y2={H * t}
            stroke="var(--color-bg-tertiary)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Energy line */}
        {inView && (
          <motion.path
            d={energyPath.path}
            fill="none"
            stroke="#FF9500"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-orange)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: [0.43, 0.13, 0.23, 0.96], delay: 0.6 }}
          />
        )}

        {/* Mood line */}
        {inView && (
          <motion.path
            d={moodPath.path}
            fill="none"
            stroke="#007AFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-blue)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: [0.43, 0.13, 0.23, 0.96], delay: 0.9 }}
          />
        )}

        {/* Interactive dots */}
        {WEEKLY_DATA.map((d, i) => (
          <g key={i} onClick={() => setHover(hover === i ? null : i)}>
            {/* Tap target */}
            <rect
              x={moodPath.xs[i] - 16}
              y={-12}
              width={32}
              height={H + 16}
              fill="transparent"
            />
            {/* Mood dot */}
            {inView && (
              <motion.circle
                cx={moodPath.xs[i]}
                cy={moodPath.ys[i]}
                r={hover === i ? 5 : 3.5}
                fill={hover === i ? "#007AFF" : "var(--color-bg-secondary)"}
                stroke="#007AFF"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 1.6 + i * 0.06 }}
              />
            )}
            {/* Energy dot */}
            {inView && (
              <motion.circle
                cx={energyPath.xs[i]}
                cy={energyPath.ys[i]}
                r={hover === i ? 5 : 3.5}
                fill={hover === i ? "#FF9500" : "var(--color-bg-secondary)"}
                stroke="#FF9500"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 1.8 + i * 0.06 }}
              />
            )}
            {/* Vertical hover line */}
            {hover === i && (
              <motion.line
                x1={moodPath.xs[i]} y1={-12}
                x2={moodPath.xs[i]} y2={H}
                stroke="var(--color-bg-tertiary)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </g>
        ))}
      </svg>

      {/* X labels */}
      <div className="flex justify-between px-0 mt-1">
        {WEEKLY_DATA.map((d, i) => (
          <motion.span
            key={i}
            className={cn(
              "text-[10px] font-bold flex-1 text-center transition-colors",
              hover === i ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"
            )}
            animate={{ scale: hover === i ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            {d.day.slice(0, 1)}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

// ─── WEEKLY BARS ──────────────────────────────────────────────────────────────

function WeeklyBars() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...WEEKLY_DATA.map(d => d.habits));

  return (
    <div ref={ref} className="flex items-end justify-between h-[130px] px-1 gap-2">
      {WEEKLY_DATA.map((d, i) => {
        const pct = (d.habits / max) * 100;
        const isActive = active === i;
        return (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-1.5 flex-1 h-full"
            onTapStart={() => setActive(i)}
            onTap={() => setActive(null)}
          >
            {/* Count label */}
            <motion.span
              className="text-[10px] font-black text-[var(--color-text-secondary)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ delay: 1.4 + i * 0.08 }}
            >
              {d.habits}
            </motion.span>

            {/* Bar track */}
            <div className="w-full flex-1 rounded-full bg-[var(--color-bg-tertiary)] flex items-end overflow-hidden relative">
              {inView && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 18, delay: 1.0 + i * 0.09 }}
                  className={cn(
                    "w-full rounded-full transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-t from-[#30B0C7] to-[#007AFF]"
                      : "bg-gradient-to-t from-[#34C759]/90 to-[#30D158]"
                  )}
                />
              )}
              {/* Shimmer */}
              {inView && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 + i * 0.09 }}
                />
              )}
            </div>

            <span className={cn(
              "text-[10px] font-bold transition-colors",
              isActive ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"
            )}>
              {d.day.slice(0, 1)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── DONUT CHART ──────────────────────────────────────────────────────────────

function DonutChart() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [active, setActive] = useState<number | null>(null);
  const r = 52;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  const segments = DONUT_DATA.map((seg) => {
    const len = (seg.value / 100) * circ;
    const start = offset;
    offset += len;
    return { ...seg, len, start };
  });

  return (
    <div ref={ref} className="flex flex-col items-center gap-3 w-full">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <defs>
            {segments.map((seg, i) => (
              <filter key={i} id={`glow-seg-${i}`}>
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            ))}
          </defs>
          {/* Track */}
          <circle cx="70" cy="70" r={r} fill="none"
            stroke="var(--color-bg-tertiary)" strokeWidth="14" />

          {segments.map((seg, i) => (
            <motion.circle
              key={i}
              cx="70" cy="70" r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={active === i ? 18 : 14}
              strokeLinecap="round"
              strokeDasharray={`${seg.len - 2} ${circ - seg.len + 2}`}
              strokeDashoffset={-seg.start}
              filter={active === i ? `url(#glow-seg-${i})` : undefined}
              style={{ cursor: "pointer" }}
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{
                strokeDasharray: inView
                  ? `${seg.len - 2} ${circ - seg.len + 2}`
                  : `0 ${circ}`,
                opacity: active !== null && active !== i ? 0.35 : 1,
              }}
              transition={{
                strokeDasharray: { duration: 1.2, ease: "easeOut", delay: 1.2 + i * 0.25 },
                opacity: { duration: 0.2 },
                strokeWidth: { type: "spring", stiffness: 300, damping: 20 },
              }}
              onClick={() => setActive(active === i ? null : i)}
            />
          ))}
        </svg>

        {/* Centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {active !== null ? (
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <span className="text-lg font-black" style={{ color: segments[active].color }}>
                {segments[active].value}%
              </span>
              <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] text-center leading-tight">
                {segments[active].label}
              </span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <span className="text-xl font-black text-[var(--color-text-primary)]">4h</span>
              <span className="text-[9px] font-bold text-[var(--color-text-tertiary)]">20m</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1 w-full">
        {segments.map((seg, i) => (
          <motion.button
            key={i}
            className="flex items-center justify-between w-full"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -8 }}
            transition={{ delay: 1.8 + i * 0.1 }}
            onClick={() => setActive(active === i ? null : i)}
          >
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-[9px] font-bold text-[var(--color-text-tertiary)]">{seg.label}</span>
            </div>
            <span className="text-[9px] font-black text-[var(--color-text-secondary)]">{seg.value}%</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── HEATMAP ──────────────────────────────────────────────────────────────────

const DAYS = ["M","T","W","T","F","S","S"];
const HEAT_COLORS = ["#1a1a2e","#1e3a5f","#1565c0","#1976d2","#42a5f5"];

function Heatmap() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [tip, setTip] = useState<number | null>(null);

  const weeks = 4;
  const rows = 7;

  return (
    <div ref={ref} className="flex flex-col gap-2 w-full">
      {/* Day labels */}
      <div className="grid grid-cols-4 gap-1">
        {["W1","W2","W3","W4"].map((w, i) => (
          <span key={i} className="text-[8px] font-bold text-[var(--color-text-tertiary)] text-center">{w}</span>
        ))}
      </div>

      {/* Grid: 7 rows × 4 cols */}
      <div className="grid gap-1" style={{ gridTemplateColumns: "auto repeat(4, 1fr)" }}>
        {Array.from({ length: rows }).map((_, row) => (
          <>
            <span key={`label-${row}`} className="text-[8px] font-bold text-[var(--color-text-tertiary)] flex items-center justify-center pr-0.5">
              {DAYS[row]}
            </span>
            {Array.from({ length: weeks }).map((_, col) => {
              const idx = col * rows + row;
              const val = HEATMAP_DATA[idx] ?? 0;
              return (
                <motion.div
                  key={`${row}-${col}`}
                  className="aspect-square rounded-[3px] cursor-pointer"
                  style={{ backgroundColor: HEAT_COLORS[val] }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: inView ? 1 : 0, opacity: inView ? 1 : 0 }}
                  whileTap={{ scale: 0.85 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 22,
                    delay: 1.6 + idx * 0.025,
                  }}
                  onHoverStart={() => setTip(idx)}
                  onHoverEnd={() => setTip(null)}
                  onTapStart={() => setTip(idx)}
                />
              );
            })}
          </>
        ))}
      </div>

      {/* Scale */}
      <div className="flex items-center justify-end gap-1 mt-0.5">
        <span className="text-[8px] text-[var(--color-text-tertiary)] font-bold">Less</span>
        {HEAT_COLORS.map((c, i) => (
          <div key={i} className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[8px] text-[var(--color-text-tertiary)] font-bold">More</span>
      </div>
    </div>
  );
}

// ─── RING CARD ────────────────────────────────────────────────────────────────

function CompletionRing({ value }: { value: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const r = 30;
  const circ = 2 * Math.PI * r;

  return (
    <div ref={ref} className="relative w-20 h-20 mx-auto">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none"
          stroke="var(--color-bg-tertiary)" strokeWidth="8" />
        <motion.circle
          cx="40" cy="40" r={r}
          fill="none"
          stroke="#AF52DE"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: inView ? circ - (value / 100) * circ : circ }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.8 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-black text-[var(--color-text-primary)]">
          {inView ? <AnimatedNumber value={value} suffix="%" /> : "0%"}
        </span>
      </div>
    </div>
  );
}

// ─── HIGHLIGHT CARD ───────────────────────────────────────────────────────────

function HighlightCard({
  icon: Icon, label, color, children, delay,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  children: React.ReactNode;
  delay: number;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28, delay }}
      whileTap={{ scale: 0.96 }}
      onTapStart={() => setPressed(true)}
      onTap={() => setPressed(false)}
      onTapCancel={() => setPressed(false)}
      className={cn(
        "flex flex-col rounded-[24px] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)] overflow-hidden relative cursor-pointer",
        "bg-[var(--color-bg-secondary)]"
      )}
    >
      {/* Subtle glow bg */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center gap-2 mb-3" style={{ color }}>
        <div className="p-1.5 rounded-xl" style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>

      {children}
    </motion.div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-dvh px-4 pb-12 pt-4 safe-top bg-[var(--color-bg-primary)]">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex items-center justify-between mb-8 sticky top-0 z-20 bg-[var(--color-bg-primary)]/80 backdrop-blur-xl pb-3"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] ring-1 ring-[var(--color-bg-tertiary)]"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </motion.button>

        <div className="flex flex-col items-center gap-0.5">
          <h1 className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">
            Life Analytics
          </h1>
          <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">
            This Week
          </span>
        </div>

        <motion.div
          animate={{ rotate: [0, 15, -10, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[#FF9500] ring-1 ring-[var(--color-bg-tertiary)]"
        >
          <Sparkles className="h-4 w-4" />
        </motion.div>
      </motion.div>

      <div className="flex flex-col gap-5">

        {/* ── 1. HIGHLIGHTS ── */}
        <section>
          <SectionLabel>Highlights</SectionLabel>
          <div className="grid grid-cols-2 gap-3">

            {/* Completion — with ring */}
            <HighlightCard icon={Activity} label="Completion" color="#AF52DE" delay={0.1}>
              <CompletionRing value={HIGHLIGHTS.completion} />
            </HighlightCard>

            {/* Streak */}
            <HighlightCard icon={Flame} label="Best Streak" color="#FF9500" delay={0.18}>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-[var(--color-text-primary)] leading-none">
                  <AnimatedNumber value={HIGHLIGHTS.longestStreak} />
                </span>
                <span className="text-sm font-bold text-[var(--color-text-tertiary)] mb-1">days</span>
              </div>
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 h-1.5 rounded-full bg-[#FF9500]"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: i < 5 ? 1 : 0.3 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1.2 + i * 0.07 }}
                    style={{ transformOrigin: "left" }}
                  />
                ))}
              </div>
            </HighlightCard>

            {/* Best Habit */}
            <HighlightCard icon={Trophy} label="Top Habit" color="#34C759" delay={0.26}>
              <span className="text-xl font-black text-[var(--color-text-primary)] leading-tight">
                {HIGHLIGHTS.bestHabit}
              </span>
              <div className="flex items-center gap-1 mt-2">
                {["🔥","✅","📚"].map((e, i) => (
                  <motion.span
                    key={i}
                    className="text-base"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 1.0 + i * 0.1 }}
                  >
                    {e}
                  </motion.span>
                ))}
              </div>
            </HighlightCard>

            {/* Worst Habit */}
            <HighlightCard icon={AlertCircle} label="Needs Work" color="#FF3B30" delay={0.34}>
              <span className="text-base font-black text-[var(--color-text-primary)] leading-tight">
                {HIGHLIGHTS.worstHabit}
              </span>
              <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF3B30] to-[#FF6B6B]"
                  initial={{ width: 0 }}
                  animate={{ width: "32%" }}
                  transition={{ duration: 1, ease: "easeOut", delay: 1.2 }}
                />
              </div>
              <span className="text-[9px] font-bold text-[#FF3B30] mt-1">32% this week</span>
            </HighlightCard>
          </div>
        </section>

        {/* ── 2. MOOD & ENERGY ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 28, delay: 0.42 }}
          className="rounded-[28px] bg-[var(--color-bg-secondary)] p-5 ring-1 ring-[var(--color-bg-tertiary)] shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-black text-[var(--color-text-primary)]">Mood & Energy</h2>
              <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] mt-0.5">Tap any point for details</p>
            </div>
            <div className="flex flex-col gap-1 items-end text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-[#007AFF]">
                <div className="w-4 h-0.5 rounded-full bg-[#007AFF]"/>
                <Smile className="h-3 w-3"/> Mood
              </span>
              <span className="flex items-center gap-1.5 text-[#FF9500]">
                <div className="w-4 h-0.5 rounded-full bg-[#FF9500]"/>
                <BatteryCharging className="h-3 w-3"/> Energy
              </span>
            </div>
          </div>
          <LineChart />
        </motion.section>

        {/* ── 3. WEEKLY BARS ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 28, delay: 0.50 }}
          className="rounded-[28px] bg-[var(--color-bg-secondary)] p-5 ring-1 ring-[var(--color-bg-tertiary)] shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black text-[var(--color-text-primary)]">Habits Completed</h2>
              <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] mt-0.5">Daily count this week</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 bg-[#34C759]/15">
              <TrendingUp className="h-3.5 w-3.5 text-[#34C759]" />
              <span className="text-[10px] font-black text-[#34C759]">+12%</span>
            </div>
          </div>
          <WeeklyBars />
        </motion.section>

        {/* ── 4. SCREEN TIME + HEATMAP ── */}
        <div className="grid grid-cols-2 gap-3">

          {/* Screen Time Donut */}
          <motion.section
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 28, delay: 0.58 }}
            className="rounded-[28px] bg-[var(--color-bg-secondary)] p-4 ring-1 ring-[var(--color-bg-tertiary)] shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-xl bg-[#AF52DE]/15">
                <Smartphone className="h-3.5 w-3.5 text-[#AF52DE]" />
              </div>
              <span className="text-[10px] font-black text-[var(--color-text-primary)]">Screen Time</span>
            </div>
            <DonutChart />
          </motion.section>

          {/* Calendar Heatmap */}
          <motion.section
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 28, delay: 0.65 }}
            className="rounded-[28px] bg-[var(--color-bg-secondary)] p-4 ring-1 ring-[var(--color-bg-tertiary)] shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-xl bg-[#007AFF]/15">
                <Calendar className="h-3.5 w-3.5 text-[#007AFF]" />
              </div>
              <span className="text-[10px] font-black text-[var(--color-text-primary)]">Activity Map</span>
            </div>
            <Heatmap />
          </motion.section>
        </div>

        {/* ── 5. FOOTER QUOTE ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center py-2"
        >
          <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] italic">
            "Small habits make big differences" ✨
          </p>
        </motion.div>

      </div>
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-black text-[var(--color-text-tertiary)] mb-3 uppercase tracking-[0.15em]">
      {children}
    </h2>
  );
}