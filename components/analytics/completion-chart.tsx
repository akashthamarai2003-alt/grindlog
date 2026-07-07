"use client";

import { motion } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { springs } from "@/animations/springs";

interface CompletionChartProps {
  data: { day: string; rate: number }[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-elevated)] px-3 py-2 shadow-[var(--shadow-elevated)]">
      <p className="text-[10px] font-semibold text-[var(--color-text-tertiary)]">{label}</p>
      <p className="text-sm font-bold text-[var(--color-accent-green)]">
        {payload[0].value}%
      </p>
    </div>
  );
};

export function CompletionChart({ data }: CompletionChartProps) {
  const gain = Math.round((data[data.length - 1]?.rate || 0) - (data[0]?.rate || 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springs.default, delay: 0.25 }}
      className="rounded-2xl bg-[var(--color-bg-secondary)] p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Completion Rate
        </h3>
        <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-accent-green-light)] px-2.5 py-1">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className="text-[var(--color-accent-green)]"
          >
            <path
              d="M6 2L6 10M2 6L6 2L10 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs font-bold text-[var(--color-accent-green)]">
            +{gain}%
          </span>
        </div>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent-green)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-accent-green)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-bg-tertiary)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "var(--color-text-tertiary)" }}
              dy={8}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "var(--color-text-tertiary)" }}
              tickFormatter={(v) => `${v}%`}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="var(--color-accent-green)"
              strokeWidth={2.5}
              fill="url(#completionGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "var(--color-accent-green)",
                stroke: "white",
                strokeWidth: 2,
              }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
