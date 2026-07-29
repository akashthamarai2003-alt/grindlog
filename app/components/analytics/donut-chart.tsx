"use client";

import { motion } from "motion/react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { springs } from "@/animations/springs";

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
}

const COLORS = ["#34C759", "#007AFF", "#FF9500", "#5856D6", "#FF3B30", "#FFD700"];

export function DonutChart({ data }: DonutChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springs.default, delay: 0.35 }}
      className="rounded-2xl bg-[var(--color-bg-secondary)] p-5"
    >
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
        Habit Breakdown
      </h3>

      <div className="flex items-center gap-4">
        <div className="h-[100px] w-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={46}
                paddingAngle={3}
                dataKey="value"
                animationDuration={1000}
                animationEasing="ease-out"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0];
                  return (
                    <div className="rounded-lg bg-[var(--color-bg-elevated)] px-2.5 py-1.5 text-xs font-semibold shadow-[var(--shadow-elevated)]">
                      {d.name}: {d.value}%
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                {item.name}
              </span>
              <span className="ml-auto text-xs font-bold tabular-nums text-[var(--color-text-primary)]">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
