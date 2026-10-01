import { Flame, Clock, TrendingDown, TrendingUp, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

interface ScientificTimeframeCardProps {
  currentWeight?: number | null;
  targetWeight?: number | null;
  goal?: string | null;
  trainingDaysPerWeek?: number | null;
  targetDeadlineDays?: number | null;
}

interface TimelineMilestone {
  stage: string;
  weeks: string;
  targetWeightKg: number;
  deltaKg: number;
  deltaLabel: string;
  isPhase1End?: boolean;
  isFinalGoal?: boolean;
  takeaway: string;
}

export function ScientificTimeframeCard({
  currentWeight,
  targetWeight,
  goal,
  trainingDaysPerWeek,
  targetDeadlineDays,
}: ScientificTimeframeCardProps) {
  const current = typeof currentWeight === "number" && currentWeight > 20 ? currentWeight : 70;
  const target = typeof targetWeight === "number" && targetWeight > 20 ? targetWeight : current;
  const diffKg = Math.abs(current - target);
  const isLoss = current > target;
  const isGain = target > current;
  const isMaintain = diffKg < 0.5;

  // Scientific progress rates based on sports science guidelines
  // Fat loss: Safe, sustainable rate is 0.5 - 0.9 kg/week (~3.0 - 3.5 kg/month)
  // Muscle gain: Safe lean rate is 0.25 - 0.4 kg/week (~1.0 - 1.5 kg/month)
  const monthlyRate = isLoss ? 3.2 : isGain ? 1.3 : 0;
  const totalMonthsExact = monthlyRate > 0 ? diffKg / monthlyRate : 3;
  const totalMonths = Math.max(1, Math.round(totalMonthsExact * 10) / 10);
  const totalWeeks = Math.round(totalMonths * 4.3);

  // Generate milestone phases
  const milestones: TimelineMilestone[] = [];

  if (isMaintain) {
    milestones.push(
      {
        stage: "MONTH 1",
        weeks: "Weeks 1 – 4",
        targetWeightKg: current,
        deltaKg: 0,
        deltaLabel: "Baseline",
        takeaway: "Dial in training intensity and nutrient timing while stabilizing metabolic rate.",
      },
      {
        stage: "MONTH 2",
        weeks: "Weeks 5 – 8",
        targetWeightKg: current,
        deltaKg: 0,
        deltaLabel: "Recomposition",
        takeaway: "Gradual reduction in subcutaneous fat with noticeable increase in muscle firmness.",
      },
      {
        stage: "MONTH 3",
        weeks: "Weeks 9 – 12",
        targetWeightKg: current,
        deltaKg: 0,
        deltaLabel: "Peak Density",
        isPhase1End: true,
        takeaway: "End of Phase 1: Measurable strength PRs and tighter, more defined athletic silhouette.",
      }
    );
  } else if (isLoss) {
    // Month 1
    const m1Loss = Math.min(diffKg, 3.0);
    const m1Weight = Math.round((current - m1Loss) * 10) / 10;
    milestones.push({
      stage: "MONTH 1",
      weeks: "Weeks 1 – 4",
      targetWeightKg: m1Weight,
      deltaKg: -m1Loss,
      deltaLabel: `-${m1Loss.toFixed(1)} kg`,
      takeaway: "Drop initial water weight, adapt to training volume, and establish daily calorie consistency.",
    });

    // Month 2
    if (diffKg > 3) {
      const m2Loss = Math.min(diffKg, 6.0);
      const m2Weight = Math.round((current - m2Loss) * 10) / 10;
      milestones.push({
        stage: "MONTH 2",
        weeks: "Weeks 5 – 8",
        targetWeightKg: m2Weight,
        deltaKg: -m2Loss,
        deltaLabel: `-${m2Loss.toFixed(1)} kg`,
        takeaway: "Visible waistline reduction, looser-fitting clothes, and increased stamina during workouts.",
      });
    }

    // Month 3 (End of Phase 1)
    const m3Loss = Math.min(diffKg, 9.0);
    const m3Weight = Math.round((current - m3Loss) * 10) / 10;
    milestones.push({
      stage: "MONTH 3",
      weeks: "Weeks 9 – 12",
      targetWeightKg: m3Weight,
      deltaKg: -m3Loss,
      deltaLabel: `-${m3Loss.toFixed(1)} kg`,
      isPhase1End: true,
      takeaway: `End of Phase 1: Noticeable body recomposition. Caloric check-in to prepare Phase 2.`,
    });

    // If journey is longer than 3 months (like 28kg loss)
    if (diffKg > 12) {
      const p2Loss = Math.min(diffKg, Math.round(diffKg * 0.65));
      const p2Weight = Math.round((current - p2Loss) * 10) / 10;
      milestones.push({
        stage: "MONTHS 4 – 6",
        weeks: "Phase 2 (Weeks 13 – 24)",
        targetWeightKg: p2Weight,
        deltaKg: -p2Loss,
        deltaLabel: `-${p2Loss.toFixed(1)} kg`,
        takeaway: "Sustained fat loss with adjusted macros to prevent metabolic slowdown or plateaus.",
      });

      milestones.push({
        stage: `MONTHS 7 – ${Math.ceil(totalMonths)}`,
        weeks: `Final Goal Phase`,
        targetWeightKg: target,
        deltaKg: -diffKg,
        deltaLabel: `-${diffKg.toFixed(1)} kg`,
        isFinalGoal: true,
        takeaway: `Reach your ${target} kg goal physique safely while keeping 100% of your hard-earned muscle.`,
      });
    } else if (diffKg > 9) {
      milestones.push({
        stage: `MONTH 4 – ${Math.ceil(totalMonths)}`,
        weeks: `Final Goal Phase`,
        targetWeightKg: target,
        deltaKg: -diffKg,
        deltaLabel: `-${diffKg.toFixed(1)} kg`,
        isFinalGoal: true,
        takeaway: `Reach your target of ${target} kg safely and transition into long-term maintenance.`,
      });
    }
  } else {
    // Lean Bulking
    const m1Gain = Math.min(diffKg, 1.2);
    milestones.push({
      stage: "MONTH 1",
      weeks: "Weeks 1 – 4",
      targetWeightKg: Math.round((current + m1Gain) * 10) / 10,
      deltaKg: m1Gain,
      deltaLabel: `+${m1Gain.toFixed(1)} kg`,
      takeaway: "Neurological adaptations, glycogen replenishment, and strict exercise form mastery.",
    });

    const m2Gain = Math.min(diffKg, 2.4);
    milestones.push({
      stage: "MONTH 2",
      weeks: "Weeks 5 – 8",
      targetWeightKg: Math.round((current + m2Gain) * 10) / 10,
      deltaKg: m2Gain,
      deltaLabel: `+${m2Gain.toFixed(1)} kg`,
      takeaway: "Measurable strength increases across compound lifts with fuller muscle bellies.",
    });

    const m3Gain = Math.min(diffKg, 3.6);
    milestones.push({
      stage: "MONTH 3",
      weeks: "Weeks 9 – 12",
      targetWeightKg: Math.round((current + m3Gain) * 10) / 10,
      deltaKg: m3Gain,
      deltaLabel: `+${m3Gain.toFixed(1)} kg`,
      isPhase1End: true,
      takeaway: "End of Phase 1: Noticeable chest, shoulder, and back hypertrophy with progressive tension.",
    });

    if (diffKg > 4.5) {
      milestones.push({
        stage: `MONTHS 4 – ${Math.ceil(totalMonths)}`,
        weeks: `Final Goal Phase`,
        targetWeightKg: target,
        deltaKg: diffKg,
        deltaLabel: `+${diffKg.toFixed(1)} kg`,
        isFinalGoal: true,
        takeaway: `Hit your ${target} kg target physique with high lean-tissue ratio and dense athletic structure.`,
      });
    }
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[#1A2619] bg-[#121E12] p-5 relative overflow-hidden transition-all duration-300">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#ADFF00]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⏱️</span>
            <h2 className="text-lg leading-tight font-black tracking-tight text-white">
              The Real-World Scientific Timeframe
            </h2>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {isLoss
              ? `Safe, sustainable fat loss rate: 0.5 – 0.9 kg/week (~3.0 – 3.5 kg/month)`
              : isGain
              ? `Safe lean hypertrophy rate: 0.25 – 0.4 kg/week (~1.0 – 1.5 kg/month)`
              : `Maintenance & body recomposition protocol`}
          </p>
        </div>

        {/* Total Journey Badge */}
        {!isMaintain && (
          <div className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full border border-[#ADFF00]/30 bg-[#ADFF00]/10 px-3 py-1 text-[11px] font-black text-[#ADFF00] tracking-wide uppercase">
            <Clock size={13} className="text-[#ADFF00]" />
            <span>
              {totalMonths > 3
                ? `~${totalMonths} Months Total (${totalWeeks} Wks)`
                : `~3 Months (${totalWeeks} Wks)`}
            </span>
          </div>
        )}
      </div>

      {/* Target Comparison Banner */}
      {!isMaintain && (
        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#0D150D] p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Current
              </span>
              <span className="text-base font-black text-white">{current} kg</span>
            </div>
            <div className="flex items-center text-gray-500 text-xs font-bold">
              <span>→</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Goal
              </span>
              <span className="text-base font-black text-[#ADFF00]">{target} kg</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Change
            </span>
            <span
              className={`text-sm font-black ${
                isLoss ? "text-emerald-400" : isGain ? "text-[#ADFF00]" : "text-white"
              }`}
            >
              {isLoss ? `-${diffKg.toFixed(1)} kg` : `+${diffKg.toFixed(1)} kg`}
            </span>
          </div>
        </div>
      )}

      {/* Timeline Milestones Table/Cards */}
      <div className="space-y-2.5">
        {milestones.map((m, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border p-3.5 transition-all ${
              m.isFinalGoal
                ? "border-[#ADFF00]/40 bg-[#ADFF00]/10"
                : m.isPhase1End
                ? "border-emerald-500/30 bg-[#0D150D]"
                : "border-white/5 bg-[#0D150D]"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black tracking-wider uppercase ${
                    m.isFinalGoal ? "text-[#ADFF00]" : "text-white"
                  }`}
                >
                  {m.stage}
                </span>
                <span className="text-[10px] font-medium text-gray-400">
                  ({m.weeks})
                </span>
                {m.isPhase1End && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                    Phase 1 End
                  </span>
                )}
                {m.isFinalGoal && (
                  <span className="rounded-full bg-[#ADFF00]/20 px-2 py-0.5 text-[9px] font-black text-[#ADFF00] uppercase tracking-wider">
                    Final Goal
                  </span>
                )}
              </div>

              {/* Estimated Weight Badge */}
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="rounded-full bg-black/50 border border-white/10 px-2.5 py-0.5 text-xs font-black text-white">
                  ≈ {m.targetWeightKg} kg
                </span>
                {m.deltaLabel && !isMaintain && (
                  <span
                    className={`text-[10px] font-bold ${
                      isLoss ? "text-emerald-400" : "text-[#ADFF00]"
                    }`}
                  >
                    ({m.deltaLabel})
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs leading-relaxed text-gray-300">
              {m.takeaway}
            </p>
          </div>
        ))}
      </div>

      {/* Why 12-Week Mesocycles Coach Tip */}
      <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-3.5 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#ADFF00]">
          <ShieldCheck size={14} />
          <span>Why GrindLog structures your plan in 3-Month Mesocycles</span>
        </div>
        <p className="text-[11px] leading-relaxed text-gray-400">
          Your resting metabolism and calorie needs naturally adapt as your body weight shifts.
          Months 1 to 3 serve as your **Launch Phase** to lock in habits and achieve steady momentum.
          At the end of Month 3, an updated check-in scan recalibrates your training split and nutrition
          to ensure you continue burning fat without hitting frustrating plateaus.
        </p>
      </div>
    </section>
  );
}
