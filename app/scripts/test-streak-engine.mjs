import assert from "node:assert/strict";
import {
  computeWorkoutStreak,
  buildStreakDateSets,
  toLocalYMD,
  todayInTimeZone,
  shiftYMD,
  DEFAULT_MAX_REST_GAP
} from "../lib/fitness/streak.ts";

console.log("🔥 Running Workout Streak Engine Unit Tests...\n");

// Test 1: Day 1 user with 0 completed workouts
{
  const res = computeWorkoutStreak({
    completedDates: [],
    todayYMD: "2026-10-08",
  });
  assert.equal(res.current, 0, "Current streak should be 0 for new user");
  assert.equal(res.longest, 0, "Longest streak should be 0 for new user");
  assert.equal(res.trainedToday, false, "Should not be trained today");
  console.log("✅ Test 1: Brand new user with 0 completed workouts returns streak = 0");
}

// Test 2: User completes workout today
{
  const res = computeWorkoutStreak({
    completedDates: ["2026-10-08"],
    todayYMD: "2026-10-08",
  });
  assert.equal(res.current, 1, "Current streak should be 1 after completing today's workout");
  assert.equal(res.longest, 1, "Longest streak should be 1");
  assert.equal(res.trainedToday, true, "trainedToday should be true");
  console.log("✅ Test 2: User completes first workout today -> streak = 1");
}

// Test 3: Grace day - Completed yesterday, today not yet completed
{
  const res = computeWorkoutStreak({
    completedDates: ["2026-10-07"],
    todayYMD: "2026-10-08",
  });
  assert.equal(res.current, 1, "Current streak remains 1 during today's grace period");
  assert.equal(res.trainedToday, false, "trainedToday is false before completing today's workout");
  console.log("✅ Test 3: Grace period - trained yesterday, today in progress -> streak = 1 maintained");
}

// Test 4: Consecutive days
{
  const res = computeWorkoutStreak({
    completedDates: ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08"],
    todayYMD: "2026-10-08",
  });
  assert.equal(res.current, 4, "Consecutive 4 days gives streak = 4");
  assert.equal(res.longest, 4, "Longest streak is 4");
  console.log("✅ Test 4: 4 consecutive daily workouts -> streak = 4");
}

// Test 5: Planned rest day preservation (4-day split: Mon, Tue, Rest Wed, Thu, Fri)
{
  const res = computeWorkoutStreak({
    completedDates: ["2026-10-05", "2026-10-06", "2026-10-08"], // skipped 10-07 as planned rest
    missedDates: [], // 10-07 was not scheduled
    todayYMD: "2026-10-08",
  });
  assert.equal(res.current, 3, "Streak is preserved across planned rest day");
  console.log("✅ Test 5: Planned rest day does NOT break streak -> streak = 3");
}

// Test 6: Missed scheduled workout breaks streak
{
  const res = computeWorkoutStreak({
    completedDates: ["2026-10-05", "2026-10-06", "2026-10-08"],
    missedDates: ["2026-10-07"], // 10-07 had a scheduled workout that was missed!
    todayYMD: "2026-10-08",
  });
  assert.equal(res.current, 1, "Streak resets to 1 after missing scheduled session on 10-07");
  assert.equal(res.longest, 2, "Longest streak records the prior 2-day run");
  console.log("✅ Test 6: Missed scheduled workout breaks streak -> current = 1, longest = 2");
}

// Test 7: Abandoned training (more than maxRestGap = 2 days without training)
{
  const res = computeWorkoutStreak({
    completedDates: ["2026-10-01", "2026-10-02"],
    todayYMD: "2026-10-08",
  });
  assert.equal(res.current, 0, "Streak resets to 0 after > 2 rest days without training");
  assert.equal(res.longest, 2, "Longest streak preserves the 2-day peak");
  console.log("✅ Test 7: More than 2 consecutive rest days resets streak -> current = 0, longest = 2");
}

// Test 8: Timezone conversion - Late night workout (11:30 PM IST = 6:00 PM UTC)
{
  // 2026-10-07 18:00:00 UTC is 2026-10-07 23:30:00 in Asia/Kolkata
  const isoUtc = "2026-10-07T18:00:00.000Z";
  const istDate = toLocalYMD(isoUtc, "Asia/Kolkata");
  assert.equal(istDate, "2026-10-07", "Should match IST local day 2026-10-07");

  // 2026-10-07 19:00:00 UTC is 2026-10-08 00:30:00 in Asia/Kolkata (past midnight)
  const isoMidnightUtc = "2026-10-07T19:00:00.000Z";
  const istPastMidnight = toLocalYMD(isoMidnightUtc, "Asia/Kolkata");
  assert.equal(istPastMidnight, "2026-10-08", "Should be credited to next calendar day in IST");
  console.log("✅ Test 8: Timezone conversion correctly respects local calendar day in Asia/Kolkata");
}

// Test 9: buildStreakDateSets with raw database rows
{
  const rawWorkouts = [
    { status: "completed", workout_date: "2026-10-06", completed_at: "2026-10-06T14:00:00Z" },
    { status: "completed", workout_date: "2026-10-07", completed_at: "2026-10-07T15:00:00Z" },
    { status: "scheduled", workout_date: "2026-10-08" },
  ];
  const { completedDates, missedDates } = buildStreakDateSets(rawWorkouts, "Asia/Kolkata", "2026-10-08");
  assert.ok(completedDates.has("2026-10-06"));
  assert.ok(completedDates.has("2026-10-07"));
  assert.equal(missedDates.size, 0, "Today's scheduled workout should not be marked missed");
  console.log("✅ Test 9: buildStreakDateSets correctly classifies completed vs pending scheduled workouts");
}

console.log("\n🎉 ALL 9 STREAK TESTS PASSED SUCCESSFULLY!\n");
