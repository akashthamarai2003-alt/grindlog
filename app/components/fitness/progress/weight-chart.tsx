"use client";

import { WeightPoint } from "@/types/fitness/analytics";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Plus } from "lucide-react";
import Link from "next/link";

export function WeightChart({ data, targetWeight }: { data: WeightPoint[], targetWeight: number | null }) {
  if (data.length === 0) {
    return (
      <div className="w-full flex flex-col gap-3">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Weight History
        </h2>
        <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-48">
          <p className="text-sm font-bold text-white/60 mb-2">No weight history yet</p>
          <Link href="/progress/log-weight" className="flex items-center gap-2 px-4 py-2 bg-[#ADFF00]/10 text-[#ADFF00] rounded-xl font-black text-xs uppercase tracking-widest border border-[#ADFF00]/20 hover:bg-[#ADFF00]/20 transition-colors">
            <Plus className="w-3 h-3" /> Log Weight
          </Link>
        </div>
      </div>
    );
  }

  // Find min and max for chart domain
  const weights = data.map(d => d.weight);
  if (targetWeight) weights.push(targetWeight);
  const minWeight = Math.floor(Math.min(...weights) - 1);
  const maxWeight = Math.ceil(Math.max(...weights) + 1);

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Weight History
        </h2>
        <Link href="/progress/log-weight" className="flex items-center gap-1 text-[#ADFF00] font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">
          <Plus className="w-3 h-3" /> Log
        </Link>
      </div>

      <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-4 pt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 12, left: -25, bottom: 0 }}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(val) => {
                try {
                  const parts = String(val).split('-');
                  if (parts.length === 3) {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const day = parseInt(parts[2], 10);
                    const monthIdx = parseInt(parts[1], 10) - 1;
                    return `${day} ${months[monthIdx] || ''}`;
                  }
                  return val;
                } catch {
                  return val;
                }
              }}
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              domain={[minWeight, maxWeight]}
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              dx={-5}
              tickFormatter={(val) => `${Math.round(val)}`}
            />
            <Tooltip
              formatter={(value: any) => [`${Number(value).toFixed(1)} kg`, 'Weight']}
              labelFormatter={(label: any) => {
                try {
                  const parts = String(label).split('-');
                  if (parts.length === 3) {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const day = parseInt(parts[2], 10);
                    const monthIdx = parseInt(parts[1], 10) - 1;
                    const year = parts[0];
                    return `${day} ${months[monthIdx] || ''} ${year}`;
                  }
                  return label;
                } catch {
                  return label;
                }
              }}
              contentStyle={{ backgroundColor: '#0A1108', border: '1px solid rgba(173,255,0,0.3)', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 700 }}
              itemStyle={{ color: '#ADFF00' }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#ADFF00" 
              strokeWidth={3}
              dot={{ fill: '#0A1108', stroke: '#ADFF00', strokeWidth: 2, r: 4 }}
              activeDot={{ fill: '#ADFF00', stroke: '#0A1108', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
