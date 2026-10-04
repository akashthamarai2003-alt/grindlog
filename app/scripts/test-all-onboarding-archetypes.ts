import assert from "node:assert/strict";
import { buildDeterministicStartingReport } from "../lib/services/fitness/starting-report-service";
import type { OnboardingData } from "../types/fitness/onboarding";

console.log("=================================================================");
console.log("RUNNING RIGOROUS ONBOARDING ARCHETYPE VERIFICATION (21 SCENARIOS)");
console.log("=================================================================\n");

interface TestCase {
  name: string;
  onboarding: Partial<OnboardingData>;
  expectedRealistic: boolean;
  expectedDirection: "loss" | "gain" | "maintain";
  assertFn: (report: ReturnType<typeof buildDeterministicStartingReport>) => void;
}

const testCases: TestCase[] = [
  {
    name: "1. Male 85kg -> 50kg (35kg Cut), No Deadline",
    onboarding: {
      gender: "Male",
      weight: 85,
      target_weight: 50,
      goal: "Lose Fat",
      target_deadline_days: undefined,
    },
    expectedRealistic: true,
    expectedDirection: "loss",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.match(r.reality_check.honest_assessment, /~3\.0 to 3\.5 kg\/month/);
      assert.match(r.reality_check.honest_assessment, /Launch Phase.*~9 kg/i);
      assert.doesNotMatch(r.reality_check.honest_assessment, /60 days|unhealthy deficit/i);
      assert.equal(r.timeline_projection[0].target_weight_kg, 82);
      assert.equal(r.timeline_projection[1].target_weight_kg, 79);
      assert.equal(r.timeline_projection[2].target_weight_kg, 76);
    },
  },
  {
    name: "2. Female 70kg -> 52kg (18kg Cut), No Deadline (Female Pacing ~2.4 kg/mo)",
    onboarding: {
      gender: "Female",
      weight: 70,
      target_weight: 52,
      goal: "Lose Fat",
      target_deadline_days: undefined,
    },
    expectedRealistic: true,
    expectedDirection: "loss",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.match(r.reality_check.honest_assessment, /~2\.0 to 2\.5 kg\/month/);
      assert.match(r.reality_check.honest_assessment, /~7 kg of fat loss/);
    },
  },
  {
    name: "3. Male 75kg -> 72kg (Mini Cut 3kg), Goal 'Cut', No Deadline",
    onboarding: {
      gender: "Male",
      weight: 75,
      target_weight: 72,
      goal: "Cut",
      target_deadline_days: undefined,
    },
    expectedRealistic: true,
    expectedDirection: "loss",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.match(r.reality_check.honest_assessment, /Dropping 3 kg at a safe, sustainable pace/);
      assert.doesNotMatch(r.reality_check.honest_assessment, /goal of cut/i);
      // Month 1 hits target 72kg, Month 2 reverse diet, Month 3 set point
      assert.equal(r.timeline_projection[0].target_weight_kg, 72);
      assert.equal(r.timeline_projection[1].target_weight_kg, 72);
      assert.equal(r.timeline_projection[2].target_weight_kg, 72);
    },
  },
  {
    name: "4. Male 80kg -> 75kg (Moderate Cut 5kg), No Deadline",
    onboarding: {
      gender: "Male",
      weight: 80,
      target_weight: 75,
      goal: "Lose Fat",
      target_deadline_days: undefined,
    },
    expectedRealistic: true,
    expectedDirection: "loss",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.equal(r.timeline_projection[0].target_weight_kg, 77);
      assert.equal(r.timeline_projection[1].target_weight_kg, 75);
      assert.equal(r.timeline_projection[2].target_weight_kg, 75);
    },
  },
  {
    name: "5. Male 60kg -> 75kg (15kg Bulk), Goal 'Build Muscle', No Deadline",
    onboarding: {
      gender: "Male",
      weight: 60,
      target_weight: 75,
      goal: "Build Muscle",
      target_deadline_days: undefined,
    },
    expectedRealistic: true,
    expectedDirection: "gain",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.match(r.reality_check.honest_assessment, /~1\.0 to 1\.5 kg\/month/);
      assert.match(r.reality_check.honest_assessment, /~3\.5 kg of lean muscle/);
      assert.equal(r.timeline_projection[0].target_weight_kg, 61.2);
      assert.equal(r.timeline_projection[1].target_weight_kg, 62.4);
      assert.equal(r.timeline_projection[2].target_weight_kg, 63.6);
    },
  },
  {
    name: "6. Female 50kg -> 54kg (4kg Bulk), Goal 'Gain Weight', No Deadline",
    onboarding: {
      gender: "Female",
      weight: 50,
      target_weight: 54,
      goal: "Gain Weight",
      target_deadline_days: undefined,
    },
    expectedRealistic: true,
    expectedDirection: "gain",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.match(r.reality_check.honest_assessment, /~0\.5 to 0\.8 kg\/month/);
    },
  },
  {
    name: "7. Male 70kg -> 72kg (Small Lean Bulk 2kg), No Deadline",
    onboarding: {
      gender: "Male",
      weight: 70,
      target_weight: 72,
      goal: "Build Muscle",
      target_deadline_days: undefined,
    },
    expectedRealistic: true,
    expectedDirection: "gain",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.equal(r.timeline_projection[0].target_weight_kg, 71.2);
      assert.equal(r.timeline_projection[1].target_weight_kg, 72);
      assert.equal(r.timeline_projection[2].target_weight_kg, 72);
    },
  },
  {
    name: "8. Male 72kg -> 72kg (Recomposition), Goal 'Lose Fat + Build Muscle'",
    onboarding: {
      gender: "Male",
      weight: 72,
      target_weight: 72,
      goal: "Lose Fat + Build Muscle",
      target_deadline_days: undefined,
    },
    expectedRealistic: true,
    expectedDirection: "maintain",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.match(r.reality_check.honest_assessment, /body recomposition/i);
      assert.equal(r.timeline_projection[0].target_weight_kg, 72);
      assert.equal(r.timeline_projection[1].target_weight_kg, 72);
      assert.equal(r.timeline_projection[2].target_weight_kg, 72);
    },
  },
  {
    name: "9. Male 80kg -> 80kg, Goal 'Build Strength'",
    onboarding: {
      gender: "Male",
      weight: 80,
      target_weight: 80,
      goal: "Build Strength",
      target_deadline_days: undefined,
    },
    expectedRealistic: true,
    expectedDirection: "maintain",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.match(r.reality_check.honest_assessment, /progressive overload and compound strength/i);
      assert.equal(r.timeline_projection[0].target_weight_kg, 80);
    },
  },
  {
    name: "10. Female 60kg -> 60kg, Goal 'Improve Fitness'",
    onboarding: {
      gender: "Female",
      weight: 60,
      target_weight: 60,
      goal: "Improve Fitness",
      target_deadline_days: undefined,
    },
    expectedRealistic: true,
    expectedDirection: "maintain",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.match(r.reality_check.honest_assessment, /cardiovascular conditioning/i);
      assert.equal(r.timeline_projection[0].target_weight_kg, 60);
    },
  },
  {
    name: "11. Male 75kg -> 75kg, Goal 'Maintain'",
    onboarding: {
      gender: "Male",
      weight: 75,
      target_weight: 75,
      goal: "Maintain",
      target_deadline_days: undefined,
    },
    expectedRealistic: true,
    expectedDirection: "maintain",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.match(r.reality_check.honest_assessment, /maintaining your current physique/i);
      assert.doesNotMatch(r.reality_check.honest_assessment, /goal of maintain/i);
      assert.equal(r.timeline_projection[0].target_weight_kg, 75);
    },
  },
  {
    name: "12. Male 85kg -> 50kg (35kg Cut), Unrealistic User Deadline 60 Days",
    onboarding: {
      gender: "Male",
      weight: 85,
      target_weight: 50,
      goal: "Lose Fat",
      target_deadline_days: 60,
    },
    expectedRealistic: false,
    expectedDirection: "loss",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, false);
      assert.match(r.reality_check.honest_assessment, /dropping 35 kg in your requested 60 days requires an extreme/i);
      assert.match(r.reality_check.honest_assessment, /dropping ~.* to .* kg of pure fat is a much safer/i);
    },
  },
  {
    name: "13. Male 85kg -> 50kg (35kg Cut), Realistic User Deadline 330 Days (~11 mo)",
    onboarding: {
      gender: "Male",
      weight: 85,
      target_weight: 50,
      goal: "Lose Fat",
      target_deadline_days: 330,
    },
    expectedRealistic: true,
    expectedDirection: "loss",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.match(r.reality_check.honest_assessment, /is 100% realistic and well-paced/i);
    },
  },
  {
    name: "14. Male 60kg -> 75kg (15kg Bulk), Unrealistic User Deadline 45 Days",
    onboarding: {
      gender: "Male",
      weight: 60,
      target_weight: 75,
      goal: "Build Muscle",
      target_deadline_days: 45,
    },
    expectedRealistic: false,
    expectedDirection: "gain",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, false);
      assert.match(r.reality_check.honest_assessment, /gaining 15 kg in your requested 45 days isn't realistic/i);
    },
  },
  {
    name: "15. Male 60kg -> 75kg (15kg Bulk), Realistic User Deadline 365 Days",
    onboarding: {
      gender: "Male",
      weight: 60,
      target_weight: 75,
      goal: "Build Muscle",
      target_deadline_days: 365,
    },
    expectedRealistic: true,
    expectedDirection: "gain",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.match(r.reality_check.honest_assessment, /is 100% realistic and well-paced/i);
    },
  },
  {
    name: "16. User with Knee Pain & Lower Back Pain (Injury Adaptation)",
    onboarding: {
      gender: "Male",
      weight: 75,
      target_weight: 70,
      goal: "Lose Fat",
      physical_problems: ["Knee Pain", "Lower Back Pain"],
    },
    expectedRealistic: true,
    expectedDirection: "loss",
    assertFn: (r) => {
      assert.equal(r.health_and_safety.has_concerns, true);
      assert.match(r.health_and_safety.safety_verdict, /knee pain and lower back pain/i);
      assert.match(r.health_and_safety.safety_verdict, /joint-friendly exercise variations/i);
      assert.deepEqual(r.health_and_safety.medical_focus_areas, ["Knee Pain", "Lower Back Pain"]);
    },
  },
  {
    name: "17. User with No Physical Problems (Clean Health Clear)",
    onboarding: {
      gender: "Male",
      weight: 75,
      target_weight: 70,
      goal: "Lose Fat",
      physical_problems: ["None"],
    },
    expectedRealistic: true,
    expectedDirection: "loss",
    assertFn: (r) => {
      assert.equal(r.health_and_safety.has_concerns, false);
      assert.match(r.health_and_safety.safety_verdict, /cleared for full training intensity/i);
    },
  },
  {
    name: "18. User Leaving Target Weight Undefined (Default to Current Weight)",
    onboarding: {
      gender: "Male",
      weight: 80,
      target_weight: undefined,
      goal: "Lose Fat",
    },
    expectedRealistic: true,
    expectedDirection: "maintain",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.equal(r.timeline_projection[0].target_weight_kg, 80);
      assert.equal(r.timeline_projection[1].target_weight_kg, 80);
      assert.equal(r.timeline_projection[2].target_weight_kg, 80);
    },
  },
  {
    name: "19. Home Trainer, Vegan, Hostel Environment",
    onboarding: {
      gender: "Female",
      weight: 58,
      target_weight: 55,
      goal: "Cut",
      training_location: "Home",
      equipment: ["Dumbbells", "Resistance Bands"],
      food_type: "Vegan",
      food_environment: "Hostel",
    },
    expectedRealistic: true,
    expectedDirection: "loss",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, true);
      assert.match(r.first_two_weeks.training_start, /Home/i);
      assert.match(r.first_two_weeks.nutrition_start, /Vegan/i);
    },
  },
  {
    name: "20. Female Bulking with Unrealistic 30-Day Deadline",
    onboarding: {
      gender: "Female",
      weight: 48,
      target_weight: 55,
      goal: "Build Muscle",
      target_deadline_days: 30, // 7kg in 30 days is biologically impossible for females
    },
    expectedRealistic: false,
    expectedDirection: "gain",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, false);
      assert.match(r.reality_check.honest_assessment, /gaining 7 kg in your requested 30 days/i);
    },
  },
  {
    name: "21. Female Fat Loss with 60-Day Deadline (Dropping 12kg)",
    onboarding: {
      gender: "Female",
      weight: 72,
      target_weight: 60,
      goal: "Lose Fat",
      target_deadline_days: 60, // 12kg in 60d = 6kg/mo > female max 3.2
    },
    expectedRealistic: false,
    expectedDirection: "loss",
    assertFn: (r) => {
      assert.equal(r.reality_check.is_timeframe_realistic, false);
      assert.match(r.reality_check.honest_assessment, /dropping 12 kg in your requested 60 days requires an extreme/i);
    },
  },
];

let passed = 0;
for (const tc of testCases) {
  try {
    const report = buildDeterministicStartingReport(tc.onboarding, 24, 18, "");
    assert.ok(report, `${tc.name}: report must exist`);
    assert.ok(report.reality_check, `${tc.name}: reality_check must exist`);
    assert.equal(
      report.reality_check.is_timeframe_realistic,
      tc.expectedRealistic,
      `${tc.name}: is_timeframe_realistic expected ${tc.expectedRealistic} got ${report.reality_check.is_timeframe_realistic}`
    );
    assert.ok(
      Array.isArray(report.reality_check.achievable_in_timeframe) && report.reality_check.achievable_in_timeframe.length >= 3,
      `${tc.name}: achievable_in_timeframe must have >= 3 items`
    );
    assert.equal(
      report.timeline_projection.length,
      3,
      `${tc.name}: timeline_projection must have 3 months`
    );
    tc.assertFn(report);
    console.log(`[PASS] ${tc.name}`);
    passed++;
  } catch (err: any) {
    console.error(`[FAIL] ${tc.name}`);
    console.error(`       Error: ${err.message}`);
    process.exit(1);
  }
}

console.log(`\n=================================================================`);
console.log(`ALL ${passed}/${testCases.length} ONBOARDING ARCHETYPE TESTS PASSED PERFECTLY!`);
console.log(`=================================================================`);
