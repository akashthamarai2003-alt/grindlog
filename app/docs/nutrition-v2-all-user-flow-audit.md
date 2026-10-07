# GrindLog Nutrition V2 — Comprehensive Flow & All-User Audit Report
**Date:** 2026-10-06  
**Auditor:** Antigravity Advanced Agentic AI  
**Scope:** Complete End-to-End Audit of GrindLog Nutrition Engine V2  
**Target Matrix:** 61 Personas × 7 Days = 427 Plan Days Evaluated across 17 Gates (A–Q)  
**System Status:** V2 Globally Disabled (`nutrition_engine_v2 = false`)  
**Production Readiness Verdict:** **NOT PRODUCTION READY (BLOCKED ON P0 & P1 DEFECTS)**  

---

## 1. Executive Summary

GrindLog Nutrition Engine V2 represents a deterministic, constraint-satisfaction architecture designed to generate culturally authentic, macro-accurate, and budget-constrained 7-day meal plans for Indian fitness trainees.

To verify whether Nutrition V2 is safe and effective for real users, we conducted an exhaustive, empirical audit across all supported user archetypes, testing 61 distinct personas across 17 strict numerical and dietary gates (Gates A through Q).

### Key Test Matrix Findings
- **Total Personas Tested:** 61
- **Passed All Gates:** 11 (18.0%)
- **Failed One or More Gates:** 50 (82.0%)
- **P0 Safety Bugs Discovered:** 1 Critical Allergen Bypass
- **P1 Mathematical Inconsistencies Discovered:** 4 (Activity enum mismatch, Mess budget overdraw, Portion reconciliation unbounded growth, Gender BMR default)

> [!CAUTION]
> **CRITICAL P0 SAFETY FINDING:**  
> The catalog loader (`loadNutritionCatalog` in `unified-7day-planner.ts`) does not copy `allergens` from `foods.json` into the runtime `FoodMacroProfile` objects. As a direct consequence, `foodAllergensLookup()` returns an empty array `[]` for **every food item in the catalog**.  
> **Allergen filtering is completely bypassed**: Dairy-allergic users are served Paneer and Curd; Gluten-allergic users are served Phulkas and Bread; Peanut-allergic users are served Peanut Butter.  
> **V2 must remain strictly disabled globally until this defect is resolved.**

---

## 2. Onboarding Input & Normalization Audit (Part 2)

We audited the contract between `types/fitness/onboarding.ts` (`OnboardingSchema`), the database schema (`fitness_os_profiles`), and the planner normalizer (`V2PlanService.mapProfileToV2Context`).

| Field Name | Allowed Database Values | Onboarding Input Values | Planner Internal Value | Normalization Behavior | Failure Mode / Identified Mismatch |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `age` | `INTEGER` [16, 120] | Number input [16, 120] | `number` | Direct pass-through, defaults to 25 | None; safe bounds enforced. |
| `gender` | `TEXT` | `"Male"`, `"Female"`, `"Other"`, `"Prefer not to say"` | `"male" \| "female" \| "other"` | Defaults to `"male"` if null | **P1 BUG:** Non-female values (`"Other"`, `"Prefer not to say"`) default to male formula ($+5\text{ kcal}$) instead of female ($-161\text{ kcal}$) or gender-neutral average. |
| `height` | `NUMERIC` [50, 300] | Number input [50, 300] | `heightCm` | Defaults to 172/175 cm if null | None; safe bounds enforced. |
| `weight` | `NUMERIC` [30, 400] | Number input [30, 400] | `weightKg` | Defaults to 70 kg if null | None; safe bounds enforced. |
| `goal` | `TEXT` | `"Lose Fat"`, `"Cut"`, `"Build Muscle"`, `"Gain Weight"`, `"Lose Fat + Build Muscle"`, `"Build Strength"`, `"Improve Fitness"`, `"Maintain"` | `"Lose Fat" \| "Maintain" \| ...` | Planner checks substring for `"lose"`, `"gain"`, `"cut"`, `"bulk"` | **P1 BUG:** Goals like `"Build Strength"` or `"Improve Fitness"` fall through to $0\text{ kcal}$ offset (maintenance) instead of surplus (+200 kcal). |
| `activity_level` | `TEXT` | `"Mostly sitting"`, `"Lightly active"`, `"Moderately active"`, `"Very active"` | String passed to planner | Substring matching in `unified-7day-planner.ts:93` | **P1 BUG:** Planner checks `act.includes("sedentary")`. Because `"mostly sitting"` does NOT include `"sedentary"`, desk workers fail the check and receive multiplier `1.375` (overestimating burn by ~300 kcal / +14.6%) and miss the `1.4 g/kg` protein adjustment. |
| `food_type` | `TEXT` | `"Vegetarian"`, `"Eggetarian"`, `"Non-Vegetarian"`, `"Vegan"` | `"vegetarian" \| "eggetarian" \| "non-veg" \| "vegan"` | Normalized via substring checks | Clean; maps correctly. |
| `food_environment` | `TEXT` | `"Home"`, `"PG"`, `"Hostel"`, `"Office/Canteen"`, `"I Cook"`, `"Mixed"` | `"Home" \| "PG" \| "Hostel" \| ...` | Direct substring mapping | Clean; defaults to `"Home"`. |
| `meals_per_day` | `TEXT` | `"2 meals"`, `"3 meals"`, `"4 meals"`, `"5+ meals"` | `2 \| 3 \| 4 \| 5` | Extracts digit, clamps $[2, 5]$ | Clean; defaults to 3. |
| `nutrition_budget` | `TEXT` | `"₹0–1,000"`, `"₹1,000–2,000"`, `"₹2,000–5,000"`, `"₹5,000+"` | `monthlyBudgetInr`, `weeklyBudgetTargetInr` | Normalized via `calculateDailyBudget` | Clean; maps to ₹1000, ₹2000, ₹4500, ₹7500. |
| `budget_policy` | `TEXT` (`'STRICT' \| 'FLEXIBLE'`) | Not asked in onboarding UI | `"STRICT" \| "FLEXIBLE"` | If monthly $\le 2000 \implies$ `"STRICT"`, else `"FLEXIBLE"` | Works, but triggers strict budget failures for low-budget mess students. |
| `mess_available` | `BOOLEAN` | Not collected in onboarding UI | `boolean` | If null and env is PG/Hostel $\implies$ auto-defaults to `true` | **P1 BUG:** Forcibly assigns mess meals to students who live in PG/Hostel but cook their own food. |
| `mess_meals` | `TEXT[]` | Not collected in onboarding UI | `MealSlotType[]` | Defaults to `['breakfast', 'lunch', 'dinner']` | Works as default for mess living. |
| `available_equipment` | `TEXT[]` | Multi-select checkboxes | `CookingEquipment[]` | Maps equipment strings; if empty in Hostel/PG defaults to `['kettle']`, else `['stove', 'blender']` | Works, but `some()` check in candidate generator permits 2-equipment recipes for 1-equipment users. |
| `food_allergies` | `TEXT` | Free-text comma-separated | `string[]` | Splits string by comma/newline | **P0 BUG:** Parsed correctly, but lookup in planner catalog returns empty array, bypassing all filtering! |
| `foods_disliked` | `TEXT` | Free-text comma-separated | `string[]` | Splits string by comma/newline | **P2 BUG:** Treated as a **hard exclusion filter** across all ingredients instead of a scoring soft penalty, leading to plan generation failure for picky eaters. |
| `foods_avoided` | `TEXT` | Free-text comma-separated | `string[]` | Splits string by comma/newline | Correctly treated as hard exclusion. |
| `workout_time` | `TEXT` | `"HH:MM:SS"` or text | `string` | Stored as snapshot | Current planner does not dynamically move meal slots around workout time. |

---

## 3. Boundary Target Calculation Audit (Part 3)

We executed deterministic calculations across 8 extreme boundary archetypes to verify Mifflin-St Jeor BMR, TDEE scaling, goal offsets, and macronutrient reconciliation ($4\text{P} + 9\text{F} + 4\text{C} = \text{Target Calories}$).

```
================================================================================
BOUNDARY TARGET CALCULATION AUDIT (8 PROFILES)
================================================================================
Profile 1: Small Female Maintenance (150cm, 45kg, 22yo, Light)
  - Targets: 1535 kcal | 81g P | 206g C | 43g F
  - Split: 21.1% Protein, 25.2% Fat, 53.7% Carbs
  - Macro Reconciliation: 1535 vs 1535 (Delta: 0 kcal) ✅

Profile 2: Small Female Cut with 1300 kcal Floor (150cm, 45kg, 22yo, Sedentary)
  - Raw BMR: 1045 kcal, TDEE: 1437 kcal, Deficit (-450): 987 kcal
  - Clamped at Safety Floor: 1300 kcal | 90g P | 154g C | 36g F
  - Macro Reconciliation: 1300 vs 1300 (Delta: 0 kcal) ✅ (Safety floor verified)

Profile 3: Large Male Athlete Bulker (195cm, 110kg, 26yo, Very Active)
  - Targets: 4134 kcal | 198g P | 577g C | 115g F
  - Split: 19.2% Protein, 25.0% Fat, 55.8% Carbs
  - Macro Reconciliation: 4135 vs 4134 (Delta: -1 kcal) ✅

Profile 4: High Weight Cutter (180cm, 120kg, 32yo, Sedentary)
  - Targets: 2534 kcal | 240g P | 236g C | 70g F
  - Split: 37.9% Protein, 24.9% Fat, 37.3% Carbs
  - Macro Reconciliation: 2534 vs 2534 (Delta: 0 kcal) ✅

Profile 5: Desk Worker with Onboarding String "Mostly sitting" (175cm, 75kg, 28yo)
  - Targets: 2350 kcal | 135g P | 306g C | 65g F ⚠️

Profile 6: Desk Worker with Canonical Enum "sedentary" (175cm, 75kg, 28yo)
  - Targets: 2051 kcal | 105g P | 280g C | 57g F ✅
  - Discrepancy: Profile 5 is given +299 kcal (+14.6%) and +30g protein solely due to string mismatch!

Profile 7: Gender "Other" / Non-Binary Profile (165cm, 60kg, 25yo)
  - Targets: 2078 kcal | 108g P | 281g C | 58g F
  - Note: Uses male formula (+5), yielding 166 kcal higher than female formula (-161).

Profile 8: Elderly Profile (168cm, 65kg, 78yo, Light)
  - Targets: 1808 kcal | 117g P | 223g C | 50g F
  - Macro Reconciliation: 1810 vs 1808 (Delta: -2 kcal) ✅
```

---

## 4. 61-Persona Acceptance Matrix Results (Parts 4 & 5)

The test harness evaluated each persona over 7 contiguous plan days against **Gates A through Q**:
- **Gate A:** Daily Calories within $[-3.5\%, +3.5\%]$ on all 7 days.
- **Gate B:** Daily Protein within $[-3.5\%, +8.0\%]$ on all 7 days.
- **Gate C:** Daily Fat Share between $15\%$ and $40\%$ of calories.
- **Gate D:** Daily Carbs $\ge 40\text{g}$.
- **Gate E:** Meal count per day matches `meals_per_day` exactly.
- **Gate F:** Diet compliance 100% (zero meat/eggs in veg, zero animal products in vegan).
- **Gate G:** Allergen leakage 100% zero.
- **Gate H:** Equipment compliance (no unavailable equipment required).
- **Gate I:** Strict budget compliance (total spend $\le$ weekly budget when `STRICT`).
- **Gate J:** Discrete food integer realism (strictly positive integers, sensible portion caps).
- **Gate K:** Continuous food portion realism (single-meal quantities $\le 400\text{g}$).
- **Gate L:** Weekly variety (no recipe $>3$ times/week, no duplicates in same day).
- **Gate M:** Protein rotation (no identical primary protein in 3 consecutive meals).
- **Gate N:** Mess meal provision compliance (proper template with ₹0 staples + protein booster).
- **Gate O:** Avoided/disliked foods excluded.
- **Gate P:** Quality score $\ge 75$ and hard constraints pass.
- **Gate Q:** Plan generation succeeds without crashing.

### Gate Failure Summary
```
┌───────────────────────────────────────────────┬─────────────────┐
│ Gate Description                              │ Failure Count   │
├───────────────────────────────────────────────┼─────────────────┤
│ Gate K (Continuous Portion Realism > 400g)    │ 31 / 61 (50.8%) │
│ Gate P (Quality Score >= 75 / Hard Fail)      │ 33 / 61 (54.1%) │
│ Gate C (Fat Share [15%, 40%])                 │ 18 / 61 (29.5%) │
│ Gate B (Protein [-3.5%, +8.0%])               │ 14 / 61 (23.0%) │
│ Gate A (Calories [-3.5%, +3.5%])              │ 12 / 61 (19.7%) │
│ Gate I (Strict Budget Compliance)             │  9 / 61 (14.8%) │
│ Gate G (Allergen Zero Leakage)                │  8 / 61 (13.1%) │
│ Gate L (Weekly Variety - Canonical Repeats)   │  5 / 61  (8.2%) │
│ Gate F (Diet Compliance)                      │  2 / 61  (3.3%) │
│ Gate E (Meal Count Compliance)                │  0 / 61  (0.0%) │
│ Gate J (Discrete Food Realism)                │  0 / 61  (0.0%) │
│ Gate N (Mess Meal Template Provision)         │  0 / 61  (0.0%) │
│ Gate Q (Execution Crashes / Exceptions)       │  0 / 61  (0.0%) │
└───────────────────────────────────────────────┴─────────────────┘
```

### Complete 61-Persona Results Table

| Persona ID | Category | Persona Description | Target Cal | Target Prot | Weekly Spend | Weekly Budget | Score | Status | Failed Gates |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **P01** | Vegetarian | Balanced Veg Moderate Maintenance | 2594 | 126g | ₹2358 | ₹1125 | 74 | ❌ FAIL | Gate K, Gate P |
| **P02** | Vegetarian | Veg Fat Loss Female Cutter | 1391 | 130g | ₹2022 | ₹1125 | 55 | ❌ FAIL | Gate A, Gate P |
| **P03** | Vegetarian | Veg Muscle Gain Bulker | 2966 | 122g | ₹2342 | ₹1875 | 55 | ❌ FAIL | Gate B, Gate P |
| **P04** | Vegetarian | Veg Sedentary Desk Worker | 1693 | 104g | ₹1624 | ₹1125 | 55 | ❌ FAIL | Gate A, Gate K, Gate P |
| **P05** | Vegetarian | Veg High Calorie Athlete (5 meals) | 3561 | 148g | ₹3020 | ₹1875 | 73 | ❌ FAIL | Gate B, Gate P |
| **P06** | Vegetarian | Veg Senior Light Active | 2080 | 130g | ₹2017 | ₹1125 | 77 | ❌ FAIL | Gate K |
| **P07** | Vegan | Vegan Active Bulker (Zero Dairy) | 3403 | 137g | ₹2364 | ₹1875 | 55 | ❌ FAIL | Gate B, Gate C, Gate F, Gate K, Gate P |
| **P08** | Vegan | Vegan Moderate Fat Loss | 1612 | 120g | ₹1895 | ₹1125 | 55 | ❌ FAIL | Gate A, Gate B, Gate K, Gate P |
| **P09** | Vegan | Vegan Maintenance PG Student | 2519 | 117g | ₹1675 | ₹1125 | 79 | ❌ FAIL | Gate C |
| **P10** | Vegan | Vegan High Protein Cutter | 2206 | 150g | ₹2563 | ₹1125 | 75 | ❌ FAIL | Gate K |
| **P11** | Vegan | Vegan Small Female Light Active | 1566 | 86g | ₹1504 | ₹1125 | 55 | ❌ FAIL | Gate A, Gate C, Gate F, Gate P |
| **P12** | Eggetarian | Eggetarian Muscle Gain Bulker | 3001 | 130g | ₹2466 | ₹1125 | 75 | ❌ FAIL | Gate K |
| **P13** | Eggetarian | Eggetarian Fat Loss Cutter | 2375 | 170g | ₹2475 | ₹1125 | 74 | ❌ FAIL | Gate K, Gate P |
| **P14** | Eggetarian | Eggetarian Maintenance Female | 1707 | 99g | ₹1484 | ₹1125 | 86 | ✅ PASS | *(None)* |
| **P15** | Eggetarian | Eggetarian PG Student | 2577 | 122g | ₹1890 | ₹1125 | 77 | ❌ FAIL | Gate B, Gate K |
| **P16** | Eggetarian | Eggetarian 5-Meal Athlete | 3485 | 144g | ₹2818 | ₹1875 | 55 | ❌ FAIL | Gate B, Gate P |
| **P17** | Non-Veg | Non-Veg Heavy Lifter Bulker | 3464 | 144g | ₹2498 | ₹1875 | 81 | ✅ PASS | *(None)* |
| **P18** | Non-Veg | Non-Veg Aggressive Cutter | 2476 | 184g | ₹2441 | ₹1875 | 84 | ❌ FAIL | Gate C, Gate K |
| **P19** | Non-Veg | Non-Veg Female Maintenance | 1772 | 101g | ₹1529 | ₹1125 | 87 | ✅ PASS | *(None)* |
| **P20** | Non-Veg | Non-Veg High Calorie Athlete (3500+ kcal) | 3612 | 153g | ₹2874 | ₹1875 | 78 | ❌ FAIL | Gate K |
| **P21** | Non-Veg | Non-Veg 2-Meal IF Office Worker | 1893 | 156g | ₹2076 | ₹1125 | 77 | ❌ FAIL | Gate C, Gate K |
| **P22** | Non-Veg | Non-Veg Lean Gain Intermediate | 2487 | 112g | ₹2134 | ₹1875 | 90 | ✅ PASS | *(None)* |
| **P23** | Meal Counts | 2 Meals per day (Lunch + Dinner IF) | 2208 | 150g | ₹2145 | ₹1125 | 72 | ❌ FAIL | Gate A, Gate K, Gate P |
| **P24** | Meal Counts | 3 Meals per day Standard | 2066 | 108g | ₹1619 | ₹1125 | 84 | ❌ FAIL | Gate C |
| **P25** | Meal Counts | 4 Meals per day Standard | 2937 | 126g | ₹2411 | ₹1125 | 76 | ✅ PASS | *(None)* |
| **P26** | Meal Counts | 5+ Meals per day Athletic Spread | 3438 | 140g | ₹3104 | ₹1875 | 55 | ❌ FAIL | Gate B, Gate K, Gate P |
| **P27** | Allergies | Dairy Allergy (Zero Milk/Curd/Paneer) | 2527 | 122g | ₹2025 | ₹1125 | 80 | ❌ FAIL | Gate C, Gate G, Gate K |
| **P28** | Allergies | Gluten Allergy (Celiac / Wheat-Free) | 1752 | 104g | ₹1721 | ₹1125 | 55 | ❌ FAIL | Gate A, Gate C, Gate G, Gate K, Gate P |
| **P29** | Allergies | Peanut Allergy | 2693 | 133g | ₹2210 | ₹1125 | 75 | ❌ FAIL | Gate G, Gate K |
| **P30** | Allergies | Tree Nut Allergy | 1666 | 94g | ₹1608 | ₹1125 | 83 | ❌ FAIL | Gate A |
| **P31** | Allergies | Soy Allergy (Vegan No-Soy) | 2468 | 117g | ₹1947 | ₹1125 | 69 | ❌ FAIL | Gate C, Gate G, Gate K, Gate P |
| **P32** | Allergies | Egg Allergy (Non-Veg No-Eggs) | 2571 | 126g | ₹1930 | ₹1125 | 75 | ❌ FAIL | Gate B, Gate C, Gate G |
| **P33** | Allergies | Multi-Allergy: Dairy + Gluten | 1721 | 99g | ₹1678 | ₹1125 | 55 | ❌ FAIL | Gate A, Gate C, Gate G, Gate K, Gate P |
| **P34** | Allergies | Multi-Allergy: Dairy + Peanut | 2660 | 130g | ₹1959 | ₹1125 | 75 | ❌ FAIL | Gate G |
| **P35** | Allergies | Multi-Allergy: Gluten + Soy | 2488 | 122g | ₹2015 | ₹1125 | 77 | ❌ FAIL | Gate C, Gate G, Gate K |
| **P36** | Allergies | Fish / Shellfish Allergy | 1815 | 104g | ₹1597 | ₹1125 | 85 | ✅ PASS | *(None)* |
| **P37** | Equipment | Stove Only (No Blender, No Microwave) | 2534 | 122g | ₹2134 | ₹1125 | 79 | ❌ FAIL | Gate K |
| **P38** | Equipment | Kettle Only (Hostel Room Restriction) | 2461 | 112g | ₹1526 | ₹500 | 4 | ❌ FAIL | Gate A, Gate B, Gate C, Gate I, Gate K, Gate L, Gate P |
| **P39** | Equipment | Microwave Only | 2658 | 135g | ₹2810 | ₹1125 | 55 | ❌ FAIL | Gate B, Gate C, Gate K, Gate P |
| **P40** | Equipment | No Equipment / None (Cold Prep) | 1647 | 90g | ₹1573 | ₹1125 | 55 | ❌ FAIL | Gate A, Gate C, Gate P |
| **P41** | Equipment | Full Modern Kitchen | 3008 | 137g | ₹2387 | ₹1875 | 55 | ❌ FAIL | Gate B, Gate P |
| **P42** | Mess & Hostel | Hostel Student 3-Slot Mess (B, L, D) | 2511 | 115g | ₹532 | ₹500 | 55 | ❌ FAIL | Gate I, Gate P |
| **P43** | Mess & Hostel | PG Resident 2-Slot Mess (L, D) | 2577 | 122g | ₹887 | ₹500 | 55 | ❌ FAIL | Gate I, Gate L, Gate P |
| **P44** | Mess & Hostel | Office Canteen Lunch Mess (1 slot) | 2329 | 137g | ₹1532 | ₹1125 | 87 | ✅ PASS | *(None)* |
| **P45** | Mess & Hostel | Hostel Mess + Kettle in room (4 meals) | 1724 | 94g | ₹828 | ₹500 | 55 | ❌ FAIL | Gate I, Gate P |
| **P46** | Mess & Hostel | Strict Budget Hostel Mess (₹1000/mo) | 2437 | 108g | ₹532 | ₹250 | 55 | ❌ FAIL | Gate I, Gate P |
| **P47** | Mess & Hostel | Vegan Student in Hostel Mess | 2544 | 119g | ₹636 | ₹500 | 55 | ❌ FAIL | Gate C, Gate I, Gate K, Gate L, Gate P |
| **P48** | Mess & Hostel | Eggetarian in Hostel Mess (Egg Booster) | 2618 | 126g | ₹606 | ₹500 | 55 | ❌ FAIL | Gate I, Gate P |
| **P49** | Budget | Ultra-Low Budget STRICT (₹1000/mo, ₹250/wk) | 2511 | 117g | ₹1708 | ₹250 | 55 | ❌ FAIL | Gate I, Gate L, Gate P |
| **P50** | Budget | Moderate Budget STRICT (₹2000/mo, ₹500/wk) | 2594 | 126g | ₹2220 | ₹500 | 55 | ❌ FAIL | Gate I, Gate L, Gate P |
| **P51** | Budget | High Budget FLEXIBLE (₹7500/mo, ₹1875/wk) | 3125 | 144g | ₹2381 | ₹1875 | 82 | ✅ PASS | *(None)* |
| **P52** | Workout Timing | Early Morning Workout (06:00:00) | 2587 | 126g | ₹2353 | ₹1125 | 74 | ❌ FAIL | Gate K, Gate P |
| **P53** | Workout Timing | Midday Workout (12:00:00) | 2651 | 135g | ₹1921 | ₹1125 | 77 | ✅ PASS | *(None)* |
| **P54** | Workout Timing | Evening Workout (18:30:00) | 2062 | 104g | ₹1735 | ₹1125 | 85 | ✅ PASS | *(None)* |
| **P55** | Workout Timing | Late Night Workout (21:30:00) | 2639 | 130g | ₹2267 | ₹1125 | 69 | ❌ FAIL | Gate K, Gate P |
| **P56** | Pantry Stocks | Abundant Staple Pantry Stocked | 2534 | 122g | ₹2039 | ₹1125 | 79 | ❌ FAIL | Gate K |
| **P57** | Pantry Stocks | High-Protein Pantry Stocked | 2554 | 126g | ₹2038 | ₹1125 | 55 | ❌ FAIL | Gate B, Gate C, Gate K, Gate P |
| **P58** | Pantry Stocks | Empty Pantry (No Available Foods) | 1748 | 101g | ₹1548 | ₹1125 | 55 | ❌ FAIL | Gate A, Gate K, Gate P |
| **P59** | Avoid / Dislike | Dislikes Bittergourd / Karela & Baingan | 2556 | 122g | ₹2180 | ₹1125 | 71 | ❌ FAIL | Gate B, Gate K, Gate P |
| **P60** | Avoid / Dislike | Avoids Red Meat & Pork (Chicken/Fish Only) | 2670 | 133g | ₹1950 | ₹1125 | 79 | ✅ PASS | *(None)* |
| **P61** | Avoid / Dislike | Avoids Soya / Soya Chunks (Thyroid / Pref) | 1779 | 108g | ₹2244 | ₹1125 | 50 | ❌ FAIL | Gate A, Gate B, Gate C, Gate K, Gate P |

---

## 5. Root-Cause Analysis of Failure Gates

### 1. The Allergen Leakage Hole (Gate G Failures: P27, P28, P29, P31, P32, P33, P34, P35)
- **Root Cause:** In `lib/fitness/nutrition/unified-7day-planner.ts:327-345`, the `profile: FoodMacroProfile` mapping object omits the `allergens` field when iterating over `foodsRaw`.
- **Impact:** `foodById.get(foodId).allergens` is always `undefined`. The lookup function `foodAllergensLookup(foodId)` falls back to `[]`.
- **Result:** Candidate filtering and validation are blind to allergens, serving Paneer, Dahi, and Curd to dairy-allergic users, and wheat chapatis to celiac patients.

### 2. Mess Hostel Strict Budget Overrun (Gate I Failures: P42, P43, P45, P46, P48)
- **Root Cause:** A trainee in a hostel mess with budget `"₹1,000–2,000"` receives a weekly target of ₹500 and policy `"STRICT"`. Over 7 days, 21 mess meals require Protein Boosters (Low Fat Paneer / Curd) costing ₹20–₹35 each. This results in ₹532–₹606 in booster costs alone.
- **Impact:** The strict budget trimmer in `unified-7day-planner.ts:1107` only checks fruit, nuts, corn, and bread; it never trims or alternates mess boosters.
- **Result:** Total weekly cost reaches ₹532 against the ₹500 ceiling, triggering a hard `STRICT BUDGET VIOLATION` and capping plan quality at 55.

### 3. Continuous Portion Realism Clamping (Gate K Failures: 31 Personas)
- **Root Cause:** In `unified-7day-planner.ts:1438`, when daily calories fall short during reconciliation, the engine appends up to 150g of rice to dinner:  
  `const addG = Math.min(150, Math.max(25, Math.round((calDiff / 1.3) / 25) * 25)); riceItem.quantity += addG;`  
- **Impact:** Because it lacks an upper cap check against `maxSensiblePortion` (350g), the quantity balloons to **450g of steamed rice** in a single meal.
- **Result:** Fails portion realism gates for excessive single-meal carbohydrate mass.

### 4. Activity Level Enum String Mismatch
- **Root Cause:** Onboarding saves `activity_level = "Mostly sitting"`. The planner in `unified-7day-planner.ts:93` expects `"sedentary"`.
- **Impact:** `"mostly sitting"` fails `act.includes("sedentary")` and defaults to multiplier `1.375` (lightly active) instead of `1.2`. Furthermore, `proteinPerKg = 1.4` is skipped.
- **Result:** Trainees with desk jobs are assigned ~300 surplus calories and 30g extra protein, sabotaging fat loss.

---

## 6. Subsystem Audits (Parts 6–13)

### Swap Engine Audit (Part 6)
- **Algorithm:** `V2PlanService.getV2SwapOptions` retrieves candidates matching slot macros, executes portion optimization, and filters out the active recipe.
- **Safety Guard:** `execute_v2_meal_swap_atomic` acquires a transactional lock and verifies meal status is `PLANNED`. If the meal is `LOGGED`, it rejects with `CANNOT_SWAP_LOGGED_MEAL`.
- **Verdict:** Highly robust; preserves macro consistency and protects logged meal history.

### Logging & Remaining Macros Audit (Part 7)
- **Algorithm:** `V2PlanService.logV2PlannedMeal` takes locked snapshot items from `meal_plan_items` and inserts immutable records into `food_logs`.
- **Dynamic Calculation:** `getV2AdaptiveRemainingDay` queries live logs between local day boundaries and subtracts from effective targets.
- **Verdict:** 100% immutable and compliant with GrindLog design principles.

### Smart Grocery Engine Audit (Part 8)
- **Algorithm:** `V2PlanService.generateV2GroceryList` aggregates quantities across the active 7-day period.
- **Categorization:** Items provided by mess (₹0) route to `providedByMess`; pantry items route to `alreadyHave`; remaining foods are rounded to retail units (e.g. 6-pack eggs, 1L milk).
- **Verdict:** Operationally sound, accurate unit conversions.

### Database Persistence & RLS Audit (Part 11)
- **RPC Transactions:** Uses `persist_v2_meal_plan_atomic` protected by PostgreSQL `pg_advisory_xact_lock`.
- **History Guard:** Rejects regeneration if any meal in the date range has `status = 'LOGGED'` (`CANNOT_REGENERATE_LOGGED_MEAL`).
- **Verdict:** Production-grade transactional consistency.

---

## 7. Categorized Bug & Remediation Inventory (Part 14)

### Priority P0 — Safety & Regulatory (Immediate Blockers)
1. **Catalog Allergen Loss Bug:**  
   In `lib/fitness/nutrition/unified-7day-planner.ts:327-345`, copy `f.allergens` into `profile` and add `allergens?: string[]` to `FoodMacroProfile` in `portion-optimizer.ts`.
2. **Mess Strict Budget Feasibility Bug:**  
   In `unified-7day-planner.ts:500-520, 636`, adjust booster allocation or allow free dal protein top-up to satisfy protein targets within the strict ₹500 weekly allowance.

### Priority P1 — Mathematical & Logic Integrity
3. **Onboarding Activity Level Mapping:**  
   In `lib/services/nutrition/v2-plan-service.ts:mapProfileToV2Context`, normalize `"Mostly sitting"` to `"sedentary"`, `"Lightly active"` to `"light"`, `"Moderately active"` to `"moderate"`, and `"Very active"` to `"heavy"`.
4. **Gender BMR Normalization:**  
   In `unified-7day-planner.ts:89`, treat `"other"` and `"prefer not to say"` with a gender-neutral median constant ($-78$) rather than male ($+5$).
5. **Continuous Rice/Carb Portion Cap:**  
   In `unified-7day-planner.ts:1438`, enforce `Math.min(350, riceItem.quantity + addG)` so single-meal rice portions never exceed 350g.
6. **Goal Offset Expansion:**  
   In `unified-7day-planner.ts:104`, map `"Build Strength"` and `"Lose Fat + Build Muscle"` to explicit target offsets (+200 kcal and -250 kcal).

### Priority P2 — Personalization & Preference
7. **Soft Disliked Foods Scoring:**  
   In `candidate-generator.ts:196`, separate `dislikedFoods` from `avoidedFoods`. Dislikes should apply a -25 point score penalty rather than a hard candidate exclusion.
8. **Stricter Equipment Enforcement:**  
   In `candidate-generator.ts:232`, require that recipes requiring multiple appliances (e.g. blender + stove) have ALL required equipment present, not merely `some()`.

---

## 8. Final Production Readiness Verdict (Part 15)

```
================================================================================
FINAL PRODUCTION READINESS ASSESSMENT: NOT PRODUCTION READY
================================================================================
Feature Flag Status: DISABLED GLOBALLY (nutrition_engine_v2 = false)
Matrix Pass Rate: 11 / 61 (18.0%)
Hard Constraint Pass Rate: 28 / 61 (45.9%)
Critical Defect Count: 1 P0 (Allergens), 4 P1 (Enums, Budget, Portions)

RECOMMENDED NEXT STEPS:
1. Do NOT enable Nutrition V2 globally in production.
2. Present this audit report and generated artifacts to engineering leadership.
3. Upon user approval, implement the targeted remediation phase for P0 and P1 bugs.
4. Re-run scripts/run-all-user-audit-matrix.mjs to verify 100% pass rate across all 61 personas.
================================================================================
```
