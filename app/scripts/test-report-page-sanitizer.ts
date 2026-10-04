import assert from "node:assert/strict";

console.log("=================================================================");
console.log("TESTING REPORT PAGE SANITIZER & ROADMAP LOGIC (EDGE CASES)");
console.log("=================================================================\n");

// Test legacy AI hallucinated messages when user has NO deadline
const edgeCases = [
  {
    name: "Legacy hallucination 'dropping 35 kg in 60 days' with no user deadline",
    profile: { weight: 85, target_weight: 50, goal: "Lose Fat", gender: "Male" },
    onboarding: { target_deadline_days: undefined },
    legacyAssessment: "Listen bro, dropping 35 kg in 60 days requires an extreme, unhealthy deficit that burns muscle. In your 60-day window, dropping ~5 to 7 kg is safer.",
    legacyRealistic: false,
    expectedSanitizedRealistic: true,
    expectedRegex: /Dropping 35 kg at a safe, sustainable pace of ~3\.0 to 3\.5 kg\/month/,
  },
  {
    name: "Legacy hallucination 'gaining 15 kg in 45 days' with no user deadline",
    profile: { weight: 60, target_weight: 75, goal: "Build Muscle", gender: "Male" },
    onboarding: { target_deadline_days: undefined },
    legacyAssessment: "Listen bro, gaining 15 kg in 45 days requires an extreme bulking deficit.",
    legacyRealistic: false,
    expectedSanitizedRealistic: true,
    expectedRegex: /Gaining 15 kg of quality lean mass at a clean rate of ~1\.0 to 1\.5 kg\/month/,
  },
  {
    name: "Recomposition user (stable weight) with empty AI text",
    profile: { weight: 70, target_weight: 70, goal: "Lose Fat + Build Muscle", gender: "Male" },
    onboarding: { target_deadline_days: undefined },
    legacyAssessment: "",
    legacyRealistic: true,
    expectedSanitizedRealistic: true,
    expectedRegex: /body recomposition/i,
  },
  {
    name: "Female user cutting with legacy 60-day warning",
    profile: { weight: 68, target_weight: 55, goal: "Cut", gender: "Female" },
    onboarding: { target_deadline_days: undefined },
    legacyAssessment: "Listen bro, dropping 13 kg in 60 days requires extreme deficit",
    legacyRealistic: false,
    expectedSanitizedRealistic: true,
    expectedRegex: /~2\.0 to 2\.5 kg\/month/i,
  },
];

for (const ec of edgeCases) {
  const currentWeightNum = typeof ec.profile.weight === "number" && ec.profile.weight > 20 ? ec.profile.weight : null;
  const targetWeightNum = typeof ec.profile.target_weight === "number" && ec.profile.target_weight > 20 ? ec.profile.target_weight : null;
  const deadlineDays = typeof ec.onboarding.target_deadline_days === "number" && ec.onboarding.target_deadline_days > 0 ? ec.onboarding.target_deadline_days : null;
  const diffKg = currentWeightNum && targetWeightNum ? Math.round(Math.abs(currentWeightNum - targetWeightNum) * 10) / 10 : 0;

  const normalizedGoal = (ec.profile.goal || "").toLowerCase().trim();
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

  const isMaintainGoal = diffKg < 0.5 || (isGoalRecomp && diffKg <= 1.5);
  const isLossGoal = !isMaintainGoal && ((currentWeightNum !== null && targetWeightNum !== null && currentWeightNum > targetWeightNum) || (isGoalFatLoss && !isGoalMuscleGain));
  const isGainGoal = !isMaintainGoal && !isLossGoal;

  const isFemale = (ec.profile.gender || "").toLowerCase().startsWith("f");
  const monthlyRate = isLossGoal ? (isFemale ? 2.4 : 3.2) : isGainGoal ? (isFemale ? 0.7 : 1.3) : 0;
  const totalMonthsExact = monthlyRate > 0 && diffKg > 0 ? diffKg / monthlyRate : 3;
  const totalMonths = Math.max(1, Math.round(totalMonthsExact * 10) / 10);
  const totalWeeks = Math.max(4, Math.round(totalMonths * 4.3));

  const impliedMonthlyRate = diffKg > 0 && deadlineDays && deadlineDays > 0 ? (diffKg / deadlineDays) * 30.4 : 0;
  const maxSafeRate = isLossGoal ? (isFemale ? 3.2 : 4.5) : isGainGoal ? (isFemale ? 1.0 : 2.0) : 999;
  const isScientificallyUnrealistic = Boolean(deadlineDays && diffKg >= 4 && !isMaintainGoal && impliedMonthlyRate > maxSafeRate);

  const isTimeframeRealistic = deadlineDays ? (isScientificallyUnrealistic ? false : Boolean(ec.legacyRealistic ?? true)) : true;
  assert.equal(isTimeframeRealistic, ec.expectedSanitizedRealistic, `${ec.name}: realistic flag mismatch`);

  let displayedAssessment = String(ec.legacyAssessment || "");
  if (!deadlineDays) {
    const hasHallucinatedWindow = /\b\d+\s*(?:days?|weeks?|months?)\b/i.test(displayedAssessment);
    const hasNegativeWarning = displayedAssessment.includes("unhealthy") || displayedAssessment.includes("deficit") || displayedAssessment.includes("extreme") || displayedAssessment.includes("starvation");
    const hasInvalidText = !displayedAssessment || !isTimeframeRealistic || hasHallucinatedWindow || hasNegativeWarning || displayedAssessment.includes("60-day") || displayedAssessment.includes("Listen bro, dropping");

    if (hasInvalidText) {
      if (isLossGoal && diffKg >= 1) {
        const p1TargetLoss = Math.min(diffKg, isFemale ? 7 : 9);
        displayedAssessment = totalMonths <= 3
          ? `Since you haven't set a rushed deadline, we're taking the smart, scientific approach. Dropping ${diffKg} kg at a safe, sustainable pace will take approximately ${totalMonths} ${totalMonths === 1 ? "month" : "months"} (~${totalWeeks} weeks). This protects your metabolism, retains 100% of your lean muscle, and ensures the fat stays off permanently!`
          : `Since you haven't set a rushed deadline, we're taking the smart, scientific approach. Dropping ${diffKg} kg at a safe, sustainable pace of ~${isFemale ? "2.0 to 2.5" : "3.0 to 3.5"} kg/month will take approximately ${totalMonths} months (~${totalWeeks} weeks). This protects your metabolism, retains 100% of your lean muscle, and ensures the fat stays off permanently! In your 3-month Launch Phase, we're targeting your first ~${p1TargetLoss} kg of fat loss.`;
      } else if (isGainGoal && diffKg >= 1) {
        const p1TargetGain = Math.min(diffKg, isFemale ? 2 : 3.5);
        displayedAssessment = totalMonths <= 3
          ? `Since you haven't set a rushed deadline, we're taking the smart, scientific approach. Gaining ${diffKg} kg of quality lean mass at a clean rate will take approximately ${totalMonths} ${totalMonths === 1 ? "month" : "months"} (~${totalWeeks} weeks). This minimizes unwanted body fat and builds solid functional strength.`
          : `Since you haven't set a rushed deadline, we're taking the smart, scientific approach. Gaining ${diffKg} kg of quality lean mass at a clean rate of ~${isFemale ? "0.5 to 0.8" : "1.0 to 1.5"} kg/month will take approximately ${totalMonths} months (~${totalWeeks} weeks). This minimizes unwanted body fat and builds solid functional strength. In your 3-month Launch Phase, we're targeting your first ~${p1TargetGain} kg of lean muscle!`;
      } else if (normalizedGoal.includes("recomp") || normalizedGoal.includes("lose fat + build muscle")) {
        displayedAssessment = "Since you haven't set a rushed deadline, we're taking the smart, scientific approach with body recomposition. We're keeping your weight stable while simultaneously dropping body fat and packing on lean muscle. Your clothes will fit looser, your waistline will tighten, and your compound lifts will climb!";
      }
    }
  }

  assert.match(displayedAssessment, ec.expectedRegex, `${ec.name}: assessment did not match expected regex`);
  console.log(`[PASS] ${ec.name}`);
}

console.log("\nALL REPORT PAGE SANITIZER TESTS PASSED PERFECTLY!");
