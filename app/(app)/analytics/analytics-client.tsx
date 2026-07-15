"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { motion, useInView, useMotionValue, useSpring, animate, AnimatePresence } from "motion/react";
import {
  ArrowLeft, TrendingUp, Flame, Trophy, AlertCircle,
  Activity, Smartphone, Calendar, BatteryCharging, Smile, Sparkles, Clock, Target
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface AnalyticsData {
  highlights: {
    completion: number;
    longestStreak: number;
    bestHabit: string;
    bestHabitEmoji: string;
    worstHabit: string;
    worstHabitEmoji: string;
    worstHabitRate: number;
  };
  totalActiveHabits: number;
  weeklyData: { day: string; habits: number; totalHabits: number; mood: number; energy: number }[];
  donutData: { label: string; value: number; color: string }[];
  heatmapData: number[]; // 28 days (4 weeks)
  trendData: { date: string; completions: number }[];
  timeOfDayData: { hour: number; count: number }[];
  radarData: { category: string; value: number }[];
}

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

function generateSmooth(data: AnalyticsData["weeklyData"], dataKey: "mood" | "energy") {
  if (data.length === 0) return { path: "", xs: [], ys: [] };
  const xs = data.map((_, i) => (i / Math.max(1, data.length - 1)) * W);
  const ys = data.map(d => H - (Math.min(10, Math.max(0, d[dataKey])) / 10) * H);
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` C ${cx} ${ys[i - 1]}, ${cx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  return { path: d, xs, ys };
}

function generateArea(data: AnalyticsData["weeklyData"], dataKey: "mood" | "energy") {
  const { path, xs, ys } = generateSmooth(data, dataKey);
  if (!path) return "";
  return `${path} L ${xs[xs.length - 1]} ${H} L ${xs[0]} ${H} Z`;
}

function LineChart({ data }: { data: AnalyticsData["weeklyData"] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [hover, setHover] = useState<number | null>(null);

  const moodPath = generateSmooth(data, "mood");
  const energyPath = generateSmooth(data, "energy");

  return (
    <div ref={ref} className="relative">
      {/* Hover tooltip */}
      {hover !== null && data[hover] && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-1 z-10 pointer-events-none"
          style={{ left: moodPath.xs[hover] - 28, transform: "none" }}
        >
          <div className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-tertiary)] rounded-xl px-3 py-1.5 shadow-lg text-[10px] font-bold leading-tight text-center min-w-[56px]">
            <div className="text-[#007AFF]">😊 {data[hover].mood || 0}</div>
            <div className="text-[#FF9500]">⚡ {data[hover].energy || 0}</div>
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
              d={generateArea(data, "energy")}
              fill="url(#energyGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            />
            <motion.path
              d={generateArea(data, "mood")}
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
        {inView && energyPath.path && (
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
        {inView && moodPath.path && (
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
        {data.map((d, i) => (
          <g key={i} onClick={() => setHover(hover === i ? null : i)}>
            <rect
              x={moodPath.xs[i] - 16}
              y={-12}
              width={32}
              height={H + 16}
              fill="transparent"
            />
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
        {data.map((d, i) => (
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

function WeeklyBars({ data }: { data: AnalyticsData["weeklyData"] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [active, setActive] = useState<number | null>(null);
  
  const rawMax = Math.max(...data.map(d => Math.max(d.habits, d.totalHabits)), 1);
  const max = Math.max(Math.ceil(rawMax / 4) * 4, 4);
  const gridLines = [max, max * 0.75, max * 0.5, max * 0.25, 0];

  return (
    <div ref={ref} className="relative h-[180px] w-full pt-4 pb-6 pl-4 pr-1">
      {/* Grid Lines */}
      <div className="absolute inset-0 pt-4 pb-6 pl-4 pr-1 flex flex-col justify-between pointer-events-none">
        {gridLines.map((val, i) => (
          <div key={i} className="flex items-center w-full h-0">
            <span className="absolute left-0 text-[10px] font-bold text-[var(--color-text-tertiary)] w-3 text-right -translate-y-1/2">
              {val}
            </span>
            <div className="w-full border-t border-dashed border-[var(--color-bg-tertiary)]/50 ml-5" />
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="relative h-full flex items-end justify-between gap-1.5 sm:gap-3 z-10 ml-5">
        {data.map((d, i) => {
          const pct = (d.habits / max) * 100;
          const isActive = active === i;
          
          let baseColor = "#E5E5EA"; // Grey for 0
          if (d.totalHabits > 0) {
            if (d.habits >= d.totalHabits) baseColor = "#34C759"; // Green
            else if (d.habits > 0) baseColor = "#60A5FA"; // Blue
          } else if (d.habits > 0) {
            baseColor = "#60A5FA";
          }

          return (
            <motion.div
              key={i}
              className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer relative"
              onHoverStart={() => setActive(i)}
              onHoverEnd={() => setActive(null)}
              onTapStart={() => setActive(i)}
              onTap={() => setActive(null)}
            >
              <div className="w-full relative flex items-end justify-center h-full">
                {inView && (
                  <motion.div
                    initial={{ height: 0, backgroundColor: "#E5E5EA" }}
                    animate={{ height: `${pct}%`, backgroundColor: baseColor }}
                    transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.2 + i * 0.05 }}
                    className={cn(
                      "w-full rounded-t-[6px] transition-all duration-200",
                      isActive ? "opacity-100 shadow-md" : "opacity-80"
                    )}
                  />
                )}
                {/* Tooltip */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: -4 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute -top-7 text-[10px] font-black text-white bg-[var(--color-text-primary)] px-2 py-0.5 rounded-md pointer-events-none shadow-sm z-20"
                    >
                      {d.habits}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className={cn(
                "absolute -bottom-5 text-[10px] font-bold transition-colors whitespace-nowrap",
                isActive ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"
              )}>
                {d.day.substring(0, 3)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DONUT CHART ──────────────────────────────────────────────────────────────

function DonutChart({ data }: { data: AnalyticsData["donutData"] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [active, setActive] = useState<number | null>(null);
  const r = 52;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  const total = Math.max(data.reduce((a, b) => a + b.value, 0), 1); // fallback to 1

  const segments = data.map((seg) => {
    const len = (seg.value / total) * circ;
    const start = offset;
    offset += len;
    return { ...seg, len, start };
  });

  if (data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-sm font-bold text-[var(--color-text-tertiary)]">No category data</div>;
  }

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
              strokeDasharray={`${Math.max(0, seg.len - (segments.length > 1 ? 2 : 0))} ${circ - seg.len + (segments.length > 1 ? 2 : 0)}`}
              strokeDashoffset={-seg.start}
              filter={active === i ? `url(#glow-seg-${i})` : undefined}
              style={{ cursor: "pointer" }}
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{
                strokeDasharray: inView
                  ? `${Math.max(0, seg.len - (segments.length > 1 ? 2 : 0))} ${circ - seg.len + (segments.length > 1 ? 2 : 0)}`
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

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {active !== null ? (
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <span className="text-lg font-black" style={{ color: segments[active].color }}>
                {Math.round((segments[active].value / total) * 100)}%
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
              <span className="text-xl font-black text-[var(--color-text-primary)]">{total}</span>
              <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Habits</span>
            </motion.div>
          )}
        </div>
      </div>

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
              <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] capitalize">{seg.label}</span>
            </div>
            <span className="text-[9px] font-black text-[var(--color-text-secondary)]">
              {Math.round((seg.value / total) * 100)}%
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── HEATMAP ──────────────────────────────────────────────────────────────────

const HEAT_COLORS = ["#1a1a2e","#1e3a5f","#1565c0","#1976d2","#42a5f5"];
// For light/dark adaptation, we might want dynamic heat colors, but we'll stick to blue scale.
const LIGHT_HEAT_COLORS = ["var(--color-bg-elevated)", "#bbdefb", "#64b5f6", "#2196f3", "#1565c0"];

function Heatmap({ data }: { data: AnalyticsData["heatmapData"] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [tip, setTip] = useState<number | null>(null);

  const weeks = 4;
  const rows = 7;
  const DAYS = ["M","T","W","T","F","S","S"];

  // Use light colors for visibility in standard theme
  const colors = LIGHT_HEAT_COLORS;

  return (
    <div ref={ref} className="flex flex-col gap-2 w-full">
      <div className="grid grid-cols-4 gap-1 pl-3">
        {["W1","W2","W3","W4"].map((w, i) => (
          <span key={i} className="text-[8px] font-bold text-[var(--color-text-tertiary)] text-center">{w}</span>
        ))}
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: "auto repeat(4, 1fr)" }}>
        {Array.from({ length: rows }).map((_, row) => (
          <Fragment key={row}>
            <span key={`label-${row}`} className="text-[8px] font-bold text-[var(--color-text-tertiary)] flex items-center justify-center pr-0.5">
              {DAYS[row]}
            </span>
            {Array.from({ length: weeks }).map((_, col) => {
              const idx = col * rows + row;
              const val = data[idx] ?? 0;
              // Map val to 0-4 bucket
              const colorIdx = Math.min(4, Math.floor(val));
              return (
                <motion.div
                  key={`${row}-${col}`}
                  className="aspect-square rounded-[3px] cursor-pointer ring-1 ring-[var(--color-bg-tertiary)]/20 shadow-sm"
                  style={{ backgroundColor: colors[colorIdx] }}
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
          </Fragment>
        ))}
      </div>

      <div className="flex items-center justify-end gap-1 mt-0.5">
        <span className="text-[8px] text-[var(--color-text-tertiary)] font-bold">Less</span>
        {colors.map((c, i) => (
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-black text-[var(--color-text-tertiary)] mb-3 uppercase tracking-[0.15em]">
      {children}
    </h2>
  );
}

// ─── TREND CHART ──────────────────────────────────────────────────────────────
function TrendChart({ data }: { data: AnalyticsData["trendData"] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const max = Math.max(...data.map(d => d.completions), 1);
  const W = 300, H = 100;
  
  const xs = data.map((_, i) => (i / Math.max(1, data.length - 1)) * W);
  const ys = data.map(d => H - (d.completions / max) * H);
  
  let path = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    path += ` C ${cx} ${ys[i - 1]}, ${cx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  const area = `${path} L ${W} ${H} L 0 ${H} Z`;
  
  return (
    <div ref={ref} className="relative w-full h-[140px] pt-4">
      <svg viewBox={`0 -10 ${W} ${H + 20}`} className="w-full h-full overflow-visible preserve-3d" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#AF52DE" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#AF52DE" stopOpacity="0" />
          </linearGradient>
        </defs>
        {inView && (
          <motion.path
            d={area}
            fill="url(#trendGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        )}
        {inView && (
          <motion.path
            d={path}
            fill="none"
            stroke="#AF52DE"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        )}
      </svg>
    </div>
  );
}

// ─── RADAR CHART ──────────────────────────────────────────────────────────────
function RadarChart({ data }: { data: AnalyticsData["radarData"] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  if (!data || data.length < 3) {
      return <div className="h-[200px] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-tertiary)] text-center px-4">Add at least 3 habits in different categories to see balance.</div>;
  }
  
  const size = 200, center = size / 2, radius = size / 2 - 20;
  const max = Math.max(...data.map(d => d.value), 1);
  
  const points = data.map((d, i) => {
    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
    const dist = (d.value / max) * radius;
    return {
      label: d.category,
      x: center + Math.cos(angle) * dist,
      y: center + Math.sin(angle) * dist,
      lx: center + Math.cos(angle) * (radius + 15),
      ly: center + Math.sin(angle) * (radius + 15),
      px: center + Math.cos(angle) * radius,
      py: center + Math.sin(angle) * radius,
    };
  });
  
  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ") + " Z";
  const bgPolygon = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.px} ${p.py}`).join(" ") + " Z";
  
  return (
    <div ref={ref} className="relative w-full h-[220px] flex items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full max-w-[220px] overflow-visible">
        {/* Background Grid */}
        <path d={bgPolygon} fill="none" stroke="var(--color-bg-tertiary)" strokeWidth="1" strokeDasharray="3 3" />
        {points.map((p, i) => (
            <line key={i} x1={center} y1={center} x2={p.px} y2={p.py} stroke="var(--color-bg-tertiary)" strokeWidth="1" strokeDasharray="3 3" />
        ))}
        
        {/* Data Polygon */}
        {inView && (
          <motion.path
            d={polygonPath}
            fill="#34C759" fillOpacity="0.2"
            stroke="#34C759" strokeWidth="2" strokeLinejoin="round"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
            style={{ transformOrigin: "center" }}
          />
        )}
        
        {/* Labels */}
        {inView && points.map((p, i) => (
          <motion.text
            key={i}
            x={p.lx} y={p.ly}
            textAnchor="middle" alignmentBaseline="middle"
            className="text-[8px] font-black fill-[var(--color-text-secondary)] uppercase tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          >
            {p.label.substring(0, 10)}{p.label.length > 10 ? "..." : ""}
          </motion.text>
        ))}
      </svg>
    </div>
  );
}

// ─── TIME OF DAY CHART ────────────────────────────────────────────────────────
function TimeOfDayChart({ data }: { data: AnalyticsData["timeOfDayData"] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div ref={ref} className="relative w-full h-[120px] pt-6 pb-2">
        <div className="absolute top-[50%] left-4 right-4 h-px bg-[var(--color-bg-tertiary)] -translate-y-1/2 rounded-full" />
        <div className="relative w-full h-full flex items-center justify-between px-4">
          {Array.from({ length: 24 }).map((_, h) => {
            const item = data.find(d => d.hour === h);
            const count = item ? item.count : 0;
            const r = count > 0 ? Math.max(4, (count / maxCount) * 16) : 0;
            
            // Only label a few hours to not clutter
            const showLabel = h % 6 === 0 || h === 23;
            const label = h === 0 ? "12A" : h === 12 ? "12P" : h > 12 ? `${h-12}P` : `${h}A`;
            
            return (
              <div key={h} className="relative flex flex-col items-center justify-center flex-1 h-full">
                  {inView && count > 0 && (
                    <motion.div
                      className="absolute rounded-full bg-[#FF9500] shadow-sm opacity-90"
                      style={{ width: r * 2, height: r * 2, top: `calc(50% - ${r}px)` }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 + (h * 0.03) }}
                    />
                  )}
                  {showLabel && (
                    <span className="absolute bottom-2 text-[8px] font-bold text-[var(--color-text-tertiary)] text-center">
                      {label}
                    </span>
                  )}
              </div>
            );
          })}
        </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const { highlights } = data;
  
  const currentWeekCount = data.weeklyData.reduce((acc, curr) => acc + curr.habits, 0);

  return (
    <div className="flex flex-col min-h-dvh px-4 pb-32 pt-4 safe-top bg-[var(--color-bg-primary)]">
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
            <HighlightCard icon={Activity} label="Completion" color="#AF52DE" delay={0.1}>
              <CompletionRing value={highlights.completion} />
            </HighlightCard>
            <HighlightCard icon={Flame} label="Best Streak" color="#FF9500" delay={0.18}>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-[var(--color-text-primary)] leading-none">
                  <AnimatedNumber value={highlights.longestStreak} />
                </span>
                <span className="text-sm font-bold text-[var(--color-text-tertiary)] mb-1">days</span>
              </div>
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 h-1.5 rounded-full bg-[#FF9500]"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: i < Math.min(highlights.longestStreak, 7) ? 1 : 0.3 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1.2 + i * 0.07 }}
                    style={{ transformOrigin: "left" }}
                  />
                ))}
              </div>
            </HighlightCard>
            <HighlightCard icon={Trophy} label="Top Habit" color="#34C759" delay={0.26}>
              <span className="text-[14px] font-black text-[var(--color-text-primary)] leading-tight truncate">
                {highlights.bestHabit || "None Yet"}
              </span>
              <div className="flex items-center gap-1 mt-2 min-h-[24px]">
                {highlights.bestHabitEmoji ? (
                  <motion.span
                    className="text-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 1.0 }}
                  >
                    {highlights.bestHabitEmoji}
                  </motion.span>
                ) : null}
              </div>
            </HighlightCard>
            <HighlightCard icon={AlertCircle} label="Needs Work" color="#FF3B30" delay={0.34}>
              <div className="flex items-center gap-2">
                {highlights.worstHabitEmoji && (
                  <span className="text-base">{highlights.worstHabitEmoji}</span>
                )}
                <span className="text-[14px] font-black text-[var(--color-text-primary)] leading-tight truncate">
                  {highlights.worstHabit || "None"}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF3B30] to-[#FF6B6B]"
                  initial={{ width: 0 }}
                  animate={{ width: `${highlights.worstHabitRate}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 1.2 }}
                />
              </div>
              <span className="text-[9px] font-bold text-[#FF3B30] mt-1">
                {Math.round(highlights.worstHabitRate)}% avg
              </span>
            </HighlightCard>
          </div>
        </section>

        {/* ── 1.5 30-DAY TREND ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 28, delay: 0.38 }}
          className="rounded-[28px] bg-[var(--color-bg-secondary)] p-5 ring-1 ring-[var(--color-bg-tertiary)] shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-black text-[var(--color-text-primary)]">30-Day Trend</h2>
              <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] mt-0.5">Your momentum over the last month</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 bg-[#AF52DE]/15">
              <Activity className="h-3.5 w-3.5 text-[#AF52DE]" />
            </div>
          </div>
          <TrendChart data={data.trendData} />
        </motion.section>

        {/* ── 2. WEEKLY BARS (HABITS COMPLETED) ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 28, delay: 0.42 }}
          className="rounded-[28px] bg-[var(--color-bg-secondary)] p-5 ring-1 ring-[var(--color-bg-tertiary)] shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black text-[var(--color-text-primary)]">Habits Completed</h2>
              <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] mt-0.5">Daily count this week</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 bg-[#34C759]/15">
              <TrendingUp className="h-3.5 w-3.5 text-[#34C759]" />
              <span className="text-[10px] font-black text-[#34C759]">{currentWeekCount} total</span>
            </div>
          </div>
          <WeeklyBars data={data.weeklyData} />
        </motion.section>

        {/* ── TIME OF DAY ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 28, delay: 0.46 }}
          className="rounded-[28px] bg-[var(--color-bg-secondary)] p-5 ring-1 ring-[var(--color-bg-tertiary)] shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[var(--color-text-primary)]">Time of Day</h2>
              <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] mt-0.5">When you are most active</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 bg-[#FF9500]/15">
              <Clock className="h-3.5 w-3.5 text-[#FF9500]" />
            </div>
          </div>
          <TimeOfDayChart data={data.timeOfDayData} />
        </motion.section>

        {/* ── 3. MOOD & ENERGY ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 28, delay: 0.50 }}
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
          <LineChart data={data.weeklyData} />
        </motion.section>

        {/* ── 4. CATEGORIES & HEATMAP ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* ── LIFE BALANCE ── */}
          <motion.section
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 28, delay: 0.65 }}
            className="col-span-2 rounded-[28px] bg-[var(--color-bg-secondary)] p-5 ring-1 ring-[var(--color-bg-tertiary)] shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-black text-[var(--color-text-primary)]">Life Balance</h2>
                <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] mt-0.5">Your most active categories</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 bg-[#34C759]/15">
                <Target className="h-3.5 w-3.5 text-[#34C759]" />
              </div>
            </div>
            <RadarChart data={data.radarData} />
          </motion.section>

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
              <span className="text-[10px] font-black text-[var(--color-text-primary)]">Categories</span>
            </div>
            <DonutChart data={data.donutData} />
          </motion.section>

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
            <Heatmap data={data.heatmapData} />
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
