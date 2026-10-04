import { Flame, Clock, TrendingDown, TrendingUp, Sparkles, CheckCircle2, ShieldCheck, AlertCircle, Calendar } from "lucide-react";

interface ScientificTimeframeCardProps {
  currentWeight?: number | null;
  targetWeight?: number | null;
  goal?: string | null;
  trainingDaysPerWeek?: number | null;
  targetDeadlineDays?: number | null;
  targetPhysique?: string | null;
  gender?: string | null;
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
  targetPhysique,
  gender,
}: ScientificTimeframeCardProps) {
  // 1. Safe normalization of weights
  const current = typeof currentWeight === "number" && currentWeight > 20 ? Math.round(currentWeight * 10) / 10 : 70;
  
  // 2. Goal normalization
  const normalizedGoal = (goal || "").toLowerCase().trim();
  const isGoalFatLoss =
    normalizedGoal.includes("fat") ||
    normalizedGoal.includes("cut") ||
    normalizedGoal.includes("loss") ||
    normalizedGoal.includes("lose");
  const isGoalMuscleGain =
    normalizedGoal.includes("muscle") ||
    normalizedGoal.includes("bulk") ||
    normalizedGoal.includes("gain") ||
    normalizedGoal.includes("mass");
  const isGoalRecomp =
    normalizedGoal.includes("maintain") ||
    normalizedGoal.includes("recomp") ||
    normalizedGoal.includes("strength") ||
    normalizedGoal.includes("fitness") ||
    normalizedGoal.includes("lose fat + build muscle");

  // 3. Fallback target weight based on user intent if not specified
  let target = typeof targetWeight === "number" && targetWeight > 20 ? Math.round(targetWeight * 10) / 10 : null;
  if (target === null) {
    if (isGoalFatLoss) {
      target = Math.round(current * 0.9 * 10) / 10; // standard 10% fat loss target
    } else if (isGoalMuscleGain) {
      target = Math.round(current * 1.05 * 10) / 10; // standard 5% lean mass target
    } else {
      target = current;
    }
  }

  const diffKg = Math.round(Math.abs(current - target) * 10) / 10;
  
  // 4. Direction classification
  const isMaintain = diffKg < 0.5 || (isGoalRecomp && diffKg <= 1.5);
  const isLoss = !isMaintain && (current > target || (isGoalFatLoss && !isGoalMuscleGain));
  const isGain = !isMaintain && !isLoss;

  // 5. Scientific progress rates based on sports science guidelines
  // Fat loss: Safe, sustainable rate is 0.5 - 0.9 kg/week (~3.0 - 3.5 kg/month for men, ~2.0 - 2.5 kg/month for women)
  // Muscle gain: Safe lean rate is 0.25 - 0.4 kg/week (~1.0 - 1.5 kg/month for men, ~0.6 - 0.8 kg/month for women)
  const isFemale = (gender || "").toLowerCase().trim().startsWith("f");
  const monthlyRate = isLoss ? (isFemale ? 2.4 : 3.2) : isGain ? (isFemale ? 0.7 : 1.3) : 0;
  const totalMonthsExact = monthlyRate > 0 && diffKg > 0 ? diffKg / monthlyRate : 3;
  const totalMonths = Math.max(1, Math.round(totalMonthsExact * 10) / 10);
  const totalWeeks = Math.max(4, Math.round(totalMonths * 4.3));

  // 6. User target deadline comparison (Reality Check)
  const userRequestedDays = typeof targetDeadlineDays === "number" && targetDeadlineDays > 0 ? targetDeadlineDays : null;
  const scientificDays = Math.round(totalMonths * 30.4);
  const isDeadlineUnrealistic = Boolean(
    userRequestedDays && 
    userRequestedDays < scientificDays * 0.65 && 
    diffKg >= 5
  );

  // 7. Generate milestone phases tailored to user profile
  const milestones: TimelineMilestone[] = [];

  if (isMaintain) {
    // ── RECOMPOSITION / MAINTENANCE ARCHETYPE ──
    milestones.push(
      {
        stage: "MONTH 1",
        weeks: "Weeks 1 – 4",
        targetWeightKg: current,
        deltaKg: 0,
        deltaLabel: "Baseline",
        takeaway: "Dial in training intensity, establish daily protein targets, and stabilize metabolic rate.",
      },
      {
        stage: "MONTH 2",
        weeks: "Weeks 5 – 8",
        targetWeightKg: current,
        deltaKg: 0,
        deltaLabel: "Recomposition",
        takeaway: "Gradual reduction in subcutaneous body fat accompanied by noticeable increases in muscular firmness.",
      },
      {
        stage: "MONTH 3",
        weeks: "Weeks 9 – 12",
        targetWeightKg: current,
        deltaKg: 0,
        deltaLabel: "Peak Density",
        isPhase1End: true,
        takeaway: "End of Phase 1: Measurable strength PRs and a visibly tighter, more athletic silhouette at your stable weight.",
      }
    );
  } else if (isLoss) {
    // ── FAT LOSS / CUT ARCHETYPE ──
    const m1Limit = isFemale ? 2.4 : 3.0;
    const m2Limit = isFemale ? 4.8 : 6.0;
    const m3Limit = isFemale ? 7.2 : 9.0;
    const m1Loss = isFemale ? 2.4 : 3.0;
    const m2Loss = isFemale ? 4.8 : 6.0;
    const m3Loss = isFemale ? 7.2 : 9.0;

    if (diffKg <= m1Limit) {
      // Small Cut (1 - 3 kg)
      milestones.push(
        {
          stage: "MONTH 1",
          weeks: "Weeks 1 – 4",
          targetWeightKg: target,
          deltaKg: -diffKg,
          deltaLabel: `-${diffKg.toFixed(1)} kg`,
          isFinalGoal: true,
          takeaway: `Reach your ${target} kg target weight through water balance optimization and a controlled caloric deficit.`,
        },
        {
          stage: "MONTH 2",
          weeks: "Weeks 5 – 8",
          targetWeightKg: target,
          deltaKg: 0,
          deltaLabel: "Reverse Diet",
          takeaway: "Gradually reverse diet back to maintenance calories, stabilizing hormones and preventing rebound weight.",
        },
        {
          stage: "MONTH 3",
          weeks: "Weeks 9 – 12",
          targetWeightKg: target,
          deltaKg: 0,
          deltaLabel: "Set Point",
          isPhase1End: true,
          takeaway: "End of Phase 1: Solidify your new lower set point with sustained muscle density and energy.",
        }
      );
    } else if (diffKg <= m2Limit) {
      // Moderate Cut (4 - 6 kg)
      const m1Weight = Math.round((current - m1Loss) * 10) / 10;
      milestones.push({
        stage: "MONTH 1",
        weeks: "Weeks 1 – 4",
        targetWeightKg: m1Weight,
        deltaKg: -m1Loss,
        deltaLabel: `-${m1Loss.toFixed(1)} kg`,
        takeaway: "Initial water flush and establishing consistent calorie deficit without metabolic crash.",
      });

      milestones.push({
        stage: "MONTH 2",
        weeks: "Weeks 5 – 8",
        targetWeightKg: target,
        deltaKg: -diffKg,
        deltaLabel: `-${diffKg.toFixed(1)} kg`,
        isFinalGoal: true,
        takeaway: `Hit your ${target} kg goal physique! Noticeable waist reduction and defined facial features.`,
      });

      milestones.push({
        stage: "MONTH 3",
        weeks: "Weeks 9 – 12",
        targetWeightKg: target,
        deltaKg: -diffKg,
        deltaLabel: "Maintenance",
        isPhase1End: true,
        takeaway: "End of Phase 1: Consolidate new body composition and lock in your new maintenance metabolic rate.",
      });
    } else if (diffKg <= m3Limit) {
      // Substantial 3-Month Cut (7 - 9 kg)
      const m1Weight = Math.round((current - m1Loss) * 10) / 10;
      const m2Weight = Math.round((current - m2Loss) * 10) / 10;

      milestones.push({
        stage: "MONTH 1",
        weeks: "Weeks 1 – 4",
        targetWeightKg: m1Weight,
        deltaKg: -m1Loss,
        deltaLabel: `-${m1Loss.toFixed(1)} kg`,
        takeaway: "Drop initial water weight, adapt to training volume, and establish daily calorie consistency.",
      });

      milestones.push({
        stage: "MONTH 2",
        weeks: "Weeks 5 – 8",
        targetWeightKg: m2Weight,
        deltaKg: -m2Loss,
        deltaLabel: `-${m2Loss.toFixed(1)} kg`,
        takeaway: "Accelerated subcutaneous fat loss, tighter waistline, and increased workout endurance.",
      });

      milestones.push({
        stage: "MONTH 3",
        weeks: "Weeks 9 – 12",
        targetWeightKg: target,
        deltaKg: -diffKg,
        deltaLabel: `-${diffKg.toFixed(1)} kg`,
        isPhase1End: true,
        isFinalGoal: true,
        takeaway: `End of Phase 1: Achieve your target ${target} kg physique with high muscle retention and sharp definition.`,
      });
    } else {
      // Extensive Transformation Journey (> 9 kg, e.g. 15 kg - 28 kg)
      const m1Weight = Math.round((current - m1Loss) * 10) / 10;
      const m2Weight = Math.round((current - m2Loss) * 10) / 10;
      const m3Weight = Math.round((current - m3Loss) * 10) / 10;

      milestones.push({
        stage: "MONTH 1",
        weeks: "Weeks 1 – 4",
        targetWeightKg: m1Weight,
        deltaKg: -m1Loss,
        deltaLabel: `-${m1Loss.toFixed(1)} kg`,
        takeaway: "Drop initial water weight, adapt to training volume, and establish daily calorie consistency.",
      });

      milestones.push({
        stage: "MONTH 2",
        weeks: "Weeks 5 – 8",
        targetWeightKg: m2Weight,
        deltaKg: -m2Loss,
        deltaLabel: `-${m2Loss.toFixed(1)} kg`,
        takeaway: "Visible waistline reduction, looser-fitting clothes, and increased stamina during workouts.",
      });

      milestones.push({
        stage: "MONTH 3",
        weeks: "Weeks 9 – 12",
        targetWeightKg: m3Weight,
        deltaKg: -m3Loss,
        deltaLabel: `-${m3Loss.toFixed(1)} kg`,
        isPhase1End: true,
        takeaway: "End of Phase 1: Noticeable body recomposition. Caloric check-in to prepare Phase 2.",
      });

      if (totalMonths > 6) {
        // At Month 6 (6 months of steady, safe sports science deficit):
        // 6 months * monthlyRate (3.2 kg/mo) = 19.2 kg
        const p2Loss = Math.min(diffKg - 2, Math.round(6 * monthlyRate * 10) / 10);
        const p2Weight = Math.round((current - p2Loss) * 10) / 10;
        milestones.push({
          stage: "MONTHS 4 – 6",
          weeks: "Weeks 13 – 26",
          targetWeightKg: p2Weight,
          deltaKg: -p2Loss,
          deltaLabel: `-${p2Loss.toFixed(1)} kg`,
          takeaway: "Sustained fat loss with adjusted macros to prevent metabolic slowdown or plateaus.",
        });

        milestones.push({
          stage: `MONTHS 7 – ${Math.ceil(totalMonths)}`,
          weeks: `Weeks 27 – ${totalWeeks}`,
          targetWeightKg: target,
          deltaKg: -diffKg,
          deltaLabel: `-${diffKg.toFixed(1)} kg`,
          isFinalGoal: true,
          takeaway: `Reach your ${target} kg goal physique safely while keeping 100% of your hard-earned muscle.`,
        });
      } else {
        const endMonth = Math.ceil(totalMonths);
        milestones.push({
          stage: endMonth === 4 ? "MONTH 4" : `MONTHS 4 – ${endMonth}`,
          weeks: `Weeks 13 – ${totalWeeks}`,
          targetWeightKg: target,
          deltaKg: -diffKg,
          deltaLabel: `-${diffKg.toFixed(1)} kg`,
          isFinalGoal: true,
          takeaway: `Reach your target of ${target} kg safely and transition into long-term maintenance.`,
        });
      }
    }
  } else {
    // ── LEAN HYPERTROPHY / BULK ARCHETYPE ──
    const m1BulkLimit = isFemale ? 1.4 : 2.0;
    const m2BulkLimit = isFemale ? 2.8 : 4.0;
    const m1Gain = isFemale ? 0.7 : 1.2;
    const m2Gain = isFemale ? 1.4 : 2.4;
    const m3Gain = isFemale ? 2.1 : 3.6;

    if (diffKg <= m1BulkLimit) {
      milestones.push(
        {
          stage: "MONTH 1",
          weeks: "Weeks 1 – 4",
          targetWeightKg: Math.round((current + Math.min(diffKg, m1Gain)) * 10) / 10,
          deltaKg: Math.min(diffKg, m1Gain),
          deltaLabel: `+${Math.min(diffKg, m1Gain).toFixed(1)} kg`,
          takeaway: "Neurological adaptations, glycogen replenishment, and strict exercise form mastery.",
        },
        {
          stage: "MONTH 2",
          weeks: "Weeks 5 – 8",
          targetWeightKg: target,
          deltaKg: diffKg,
          deltaLabel: `+${diffKg.toFixed(1)} kg`,
          isFinalGoal: true,
          takeaway: `Hit your ${target} kg goal weight with lean muscle accretion and minimal fat gain.`,
        },
        {
          stage: "MONTH 3",
          weeks: "Weeks 9 – 12",
          targetWeightKg: target,
          deltaKg: diffKg,
          deltaLabel: "Solidification",
          isPhase1End: true,
          takeaway: "End of Phase 1: Lock in progressive strength PRs and increase muscle myofibrillar density.",
        }
      );
    } else if (diffKg <= m2BulkLimit) {
      milestones.push(
        {
          stage: "MONTH 1",
          weeks: "Weeks 1 – 4",
          targetWeightKg: Math.round((current + m1Gain) * 10) / 10,
          deltaKg: m1Gain,
          deltaLabel: `+${m1Gain.toFixed(1)} kg`,
          takeaway: "Neurological adaptations, glycogen replenishment, and strict exercise form mastery.",
        },
        {
          stage: "MONTH 2",
          weeks: "Weeks 5 – 8",
          targetWeightKg: Math.round((current + m2Gain) * 10) / 10,
          deltaKg: m2Gain,
          deltaLabel: `+${m2Gain.toFixed(1)} kg`,
          takeaway: "Measurable strength increases across compound lifts with fuller muscle bellies.",
        },
        {
          stage: "MONTH 3",
          weeks: "Weeks 9 – 12",
          targetWeightKg: target,
          deltaKg: diffKg,
          deltaLabel: `+${diffKg.toFixed(1)} kg`,
          isPhase1End: true,
          isFinalGoal: true,
          takeaway: `End of Phase 1: Target ${target} kg physique achieved with noticeable muscular development.`,
        }
      );
    } else {
      // Extensive Muscle Building (> 4 kg)
      milestones.push(
        {
          stage: "MONTH 1",
          weeks: "Weeks 1 – 4",
          targetWeightKg: Math.round((current + m1Gain) * 10) / 10,
          deltaKg: m1Gain,
          deltaLabel: `+${m1Gain.toFixed(1)} kg`,
          takeaway: "Neurological adaptations, glycogen replenishment, and strict exercise form mastery.",
        },
        {
          stage: "MONTH 2",
          weeks: "Weeks 5 – 8",
          targetWeightKg: Math.round((current + m2Gain) * 10) / 10,
          deltaKg: m2Gain,
          deltaLabel: `+${m2Gain.toFixed(1)} kg`,
          takeaway: "Measurable strength increases across compound lifts with fuller muscle bellies.",
        },
        {
          stage: "MONTH 3",
          weeks: "Weeks 9 – 12",
          targetWeightKg: Math.round((current + m3Gain) * 10) / 10,
          deltaKg: m3Gain,
          deltaLabel: `+${m3Gain.toFixed(1)} kg`,
          isPhase1End: true,
          takeaway: "End of Phase 1: Noticeable muscular hypertrophy with progressive tension. Recalibrate for Phase 2.",
        }
      );

      if (totalMonths > 6) {
        // At Month 6 (6 months of steady lean bulk at ~1.3 kg/mo):
        const p2Gain = Math.min(diffKg - 1, Math.round(6 * monthlyRate * 10) / 10);
        milestones.push({
          stage: "MONTHS 4 – 6",
          weeks: "Weeks 13 – 26",
          targetWeightKg: Math.round((current + p2Gain) * 10) / 10,
          deltaKg: p2Gain,
          deltaLabel: `+${p2Gain.toFixed(1)} kg`,
          takeaway: "Sustained progressive hypertrophy with periodic deload weeks to safeguard joints.",
        });

        milestones.push({
          stage: `MONTHS 7 – ${Math.ceil(totalMonths)}`,
          weeks: `Weeks 27 – ${totalWeeks}`,
          targetWeightKg: target,
          deltaKg: diffKg,
          deltaLabel: `+${diffKg.toFixed(1)} kg`,
          isFinalGoal: true,
          takeaway: `Hit your ${target} kg target physique with high lean-tissue ratio and dense athletic structure.`,
        });
      } else {
        const endMonth = Math.ceil(totalMonths);
        milestones.push({
          stage: endMonth === 4 ? "MONTH 4" : `MONTHS 4 – ${endMonth}`,
          weeks: `Weeks 13 – ${totalWeeks}`,
          targetWeightKg: target,
          deltaKg: diffKg,
          deltaLabel: `+${diffKg.toFixed(1)} kg`,
          isFinalGoal: true,
          takeaway: `Hit your ${target} kg target physique with high lean-tissue ratio and dense athletic structure.`,
        });
      }
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
              ? isFemale
                ? "Safe, sustainable fat loss rate: 0.4 – 0.7 kg/week (~2.0 – 2.5 kg/month)"
                : "Safe, sustainable fat loss rate: 0.5 – 0.9 kg/week (~3.0 – 3.5 kg/month)"
              : isGain
              ? isFemale
                ? "Safe lean hypertrophy rate: 0.15 – 0.25 kg/week (~0.6 – 0.8 kg/month)"
                : "Safe lean hypertrophy rate: 0.25 – 0.4 kg/week (~1.0 – 1.5 kg/month)"
              : "Maintenance & body recomposition protocol"}
            {targetPhysique && (
              <span className="ml-1 text-gray-500 font-medium">
                • Target: <span className="text-gray-300 font-semibold">{targetPhysique}</span>
              </span>
            )}
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

      {/* User Onboarding Deadline Reality Check Callout */}
      {userRequestedDays && (
        <div
          className={`flex items-start gap-2.5 rounded-2xl border p-3 text-xs ${
            isDeadlineUnrealistic
              ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
              : "border-[#1A2619] bg-[#0D150D] text-gray-300"
          }`}
        >
          {isDeadlineUnrealistic ? (
            <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <Calendar size={15} className="text-[#ADFF00] shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold">
              <span>Onboarding Goal: {userRequestedDays} Days</span>
              <span
                className={`text-[10px] px-2 py-0.2 rounded-full uppercase tracking-wider ${
                  isDeadlineUnrealistic
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-[#ADFF00]/10 text-[#ADFF00] border border-[#ADFF00]/20"
                }`}
              >
                {isDeadlineUnrealistic ? "Aggressive Pace" : "Realistic Pace"}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-400">
              {isDeadlineUnrealistic
                ? (isGain
                    ? `Gaining ${diffKg} kg in ${userRequestedDays} days would require an excessive calorie surplus resulting mostly in unwanted body fat. GrindLog's sports science model structures your journey with a steady lean surplus (targeting ≈ +${isFemale ? "1.5 to 2.2" : "2.5 to 3.5"} kg of lean mass in your first 60–90 days safely), before stepping into Phase 2.`
                    : `Dropping ${diffKg} kg in ${userRequestedDays} days requires an extreme, unhealthy deficit. GrindLog's sports science model protects your muscle by structuring your first 90 days as Phase 1 (targeting ≈ -${isFemale ? "6.6 to 7.2" : "9.0"} kg safely), before stepping smoothly into Phase 2.`)
                : `Your requested ${userRequestedDays}-day timeframe aligns well with healthy, sustainable sports science recommendations.`}
            </p>
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
            <div className="flex items-start sm:items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                <span
                  className={`text-xs font-black tracking-wider uppercase whitespace-nowrap ${
                    m.isFinalGoal ? "text-[#ADFF00]" : "text-white"
                  }`}
                >
                  {m.stage}
                </span>
                <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
                  ({m.weeks})
                </span>
                {m.isPhase1End && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider whitespace-nowrap">
                    Phase 1 End
                  </span>
                )}
                {m.isFinalGoal && (
                  <span className="inline-flex items-center rounded-full bg-[#ADFF00]/20 border border-[#ADFF00]/30 px-2 py-0.5 text-[9px] font-black text-[#ADFF00] uppercase tracking-wider whitespace-nowrap">
                    Final Goal
                  </span>
                )}
              </div>

              {/* Estimated Weight Badge */}
              <div className="shrink-0 flex items-center gap-1.5 whitespace-nowrap pt-0.5 sm:pt-0">
                <span className="rounded-full bg-black/60 border border-white/10 px-2.5 py-0.5 text-xs font-black text-white whitespace-nowrap">
                  ≈ {m.targetWeightKg} kg
                </span>
                {m.deltaLabel && !isMaintain && (
                  <span
                    className={`text-[11px] font-bold whitespace-nowrap ${
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
          Months 1 to 3 serve as your <strong>Launch Phase</strong> to lock in habits and achieve steady momentum.
          {trainingDaysPerWeek && (
            <span>
              {" "}With your <strong>{trainingDaysPerWeek}-day/week</strong> training split, your workouts provide the precise progressive overload required without causing central nervous system overtraining.
            </span>
          )}
          {" "}At the end of Month 3, an updated check-in scan recalibrates your training split and nutrition
          to ensure you continue progressing without hitting frustrating plateaus.
        </p>
      </div>
    </section>
  );
}
