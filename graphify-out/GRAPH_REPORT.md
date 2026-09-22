# Graph Report - web  (2026-09-22)

## Corpus Check
- 407 files · ~3,421,710 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6326 nodes · 22433 edges · 180 communities (167 shown, 13 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b1f35fe4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- nutrition-view.tsx
- _
- fitness.ts
- index-B23vSfwu.js
- fitness-plan-profile.ts
- fl
- Ph
- dx
- index-Buds9Sm1.js
- Ph
- lucide-react
- Z
- progress-view.tsx
- index-DtLkR01C.js
- constants.ts
- he
- Ih
- We
- analyze/route.ts
- sf
- createAdminClient
- af
- rf
- Ih
- il
- r
- r
- .add
- i
- M0
- Ye
- n
- sf
- uc
- of
- l
- dx
- rf
- of
- dx
- r
- index-Cq6kntJJ.js
- pr
- D
- generate-draft/route.ts
- rf
- l
- B
- dependencies
- schemas.ts
- Ih
- Ot
- Qt
- ie
- st
- nn
- Ye
- Ye
- Ye
- l
- Ye
- types/index.ts
- Bi
- (fitness)/page.tsx
- bt
- r
- y0
- onboarding-flow.tsx
- le
- next
- sf
- _0
- F
- grocery-view.tsx
- Ih
- .get
- fitness-notifications.ts
- wf
- vc
- sf
- ee
- wf
- uc
- Ph
- ku
- Ye
- l
- Ye
- tt
- rf
- reminders-client.tsx
- r
- uf
- users-table-client.tsx
- _0
- et
- uc
- l
- import-usda-foundation-foods.mjs
- ee
- rf
- l
- Ih
- _0
- sf
- zn
- bf
- D0
- c0
- hl
- Ph
- prompts.ts
- C
- compilerOptions
- sf
- r
- _0
- ei
- ve
- af
- Ft
- devDependencies
- nu
- manifest.json
- _0
- yf
- yf
- of
- i
- r
- ee
- fitness-reminders/route.ts
- l
- uc
- seed-comprehensive-foods.mjs
- (fitness)/support/page.tsx
- r
- _0
- grocery-tab.tsx
- yf
- wf
- r
- bf
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- bf
- dx
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- motion
- zod
- progression.ts
- dl
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- fitness-shell.tsx
- coach.ts
- package.json
- supabase/middleware.ts
- firebase-messaging-sw.js
- Data import scripts
- createServerSupabase
- rules/graphify.md
- workflows/graphify.md
- scripts
- workout-skeleton.tsx
- Coding Conventions & Standards — GrindLog
- next-env.d.ts
- dx
- Product Roadmap — GrindLog
- dashboard-skeleton.tsx
- Project State — GrindLog
- Codebase Structure & Directory Layout — GrindLog

## God Nodes (most connected - your core abstractions)
1. `Ph()` - 359 edges
2. `Ph()` - 358 edges
3. `Ph()` - 358 edges
4. `Ih()` - 357 edges
5. `Ih()` - 357 edges
6. `Ih()` - 356 edges
7. `Ih()` - 354 edges
8. `Ih()` - 354 edges
9. `Ph()` - 354 edges
10. `_` - 351 edges

## Surprising Connections (you probably didn't know these)
- `1. Performance Standards (Mobile 60fps Target)` --references--> `BottomNav()`  [INFERRED]
  .planning/codebase/CONVENTIONS.md → app/components/fitness/dashboard/bottom-nav.tsx
- `Phase 1: Core Performance & Tab Optimization [COMPLETED]` --references--> `BottomNav()`  [INFERRED]
  .planning/ROADMAP.md → app/components/fitness/dashboard/bottom-nav.tsx
- `3. Workout Logging & State Persistence` --references--> `WorkoutHeader()`  [INFERRED]
  .planning/codebase/TESTING.md → app/components/fitness/workout/workout-header.tsx
- `Recent Decisions` --references--> `FitnessLayout()`  [INFERRED]
  .planning/STATE.md → app/app/(fitness)/layout.tsx
- `Naming & File Conventions` --references--> `BottomNav()`  [INFERRED]
  .planning/codebase/STRUCTURE.md → app/components/fitness/dashboard/bottom-nav.tsx

## Import Cycles
- None detected.

## Communities (180 total, 13 thin omitted)

### Community 0 - "nutrition-view.tsx"
Cohesion: 0.06
Nodes (43): DailyActivityCard(), DailyActivityCardProps, FitnessDashboardBottom(), FitnessDashboardBottomProps, TodaysGoalsCard(), TodaysGoalsCardProps, formatFoodItem(), TodaysNutritionCard() (+35 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (127): _, aa, ac(), ao(), As, at, Be(), bf() (+119 more)

### Community 2 - "fitness.ts"
Cohesion: 0.04
Nodes (93): completeExerciseSetsAction(), completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), quickCompleteWorkoutAction(), reopenWorkoutAction() (+85 more)

### Community 3 - "index-B23vSfwu.js"
Cohesion: 0.08
Nodes (69): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+61 more)

### Community 4 - "fitness-plan-profile.ts"
Cohesion: 0.11
Nodes (35): GenerateGroceryResponseSchema, POST(), generateProNutritionLayer(), getProfileNutritionContext(), GeneratedGroceryItemSchema, GeneratedNutritionData, NUTRITION_JSON_SCHEMA, AVAILABLE_FOOD_ALIASES (+27 more)

### Community 5 - "fl"
Cohesion: 0.13
Nodes (24): A0(), an(), bc(), cd(), Es(), I(), Il(), jc() (+16 more)

### Community 6 - "Ph"
Cohesion: 0.05
Nodes (73): Ph(), cd(), cf(), dc(), Dl(), Do(), ds(), ed() (+65 more)

### Community 7 - "dx"
Cohesion: 0.06
Nodes (62): am(), ap(), ax(), Bn, cx(), de(), Dn(), dx() (+54 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.06
Nodes (60): $, A, b, c(), D, e(), f, g (+52 more)

### Community 9 - "Ph"
Cohesion: 0.05
Nodes (79): Ph(), ad(), br(), cd(), Cn(), cr(), Dl(), ds() (+71 more)

### Community 10 - "lucide-react"
Cohesion: 0.02
Nodes (83): loginAdminAction(), createCouponAction(), toggleCouponStatusAction(), toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), ClientCouponForm(), CopyButton(), ToggleCouponButton() (+75 more)

### Community 11 - "Z"
Cohesion: 0.15
Nodes (16): bs(), ks(), re(), tn(), Vo(), G(), I(), K() (+8 more)

### Community 12 - "progress-view.tsx"
Cohesion: 0.04
Nodes (64): GET(), GET(), POST(), app_assets_images_placeholder_goal, AchievementsShowcase(), ActivityRecoveryAnalyticsCard(), AIProgressReviewCard(), BodyMeasurementsList() (+56 more)

### Community 13 - "index-DtLkR01C.js"
Cohesion: 0.04
Nodes (119): $, A, b, c(), D, e(), f, g (+111 more)

### Community 14 - "constants.ts"
Cohesion: 0.06
Nodes (73): GroceryPage(), ACTIVITY_MULTIPLIERS, AUTHENTIC_INDIAN_RECIPES, AuthenticMealRecipe, BANNED_FOOD_PATTERNS, calculateWaterTarget(), CATEGORY_RETAIL_UNITS, CORE_MEAL_TYPES (+65 more)

### Community 15 - "he"
Cohesion: 0.10
Nodes (32): bs(), bs(), $h(), ct(), el(), g(), m(), ot() (+24 more)

### Community 16 - "Ih"
Cohesion: 0.06
Nodes (49): Ih(), ao(), bi(), bo(), cn(), co(), cs(), fo() (+41 more)

### Community 17 - "We"
Cohesion: 0.09
Nodes (31): an(), bc(), cd(), D(), E0(), ed(), Es(), fh() (+23 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.10
Nodes (31): POST(), POST(), stableStringify(), stripImagePayload(), POST(), AIStartingReportPage(), displayValue(), dynamic (+23 more)

### Community 19 - "sf"
Cohesion: 0.08
Nodes (41): ai(), bc(), Bd(), Bl(), bm(), Cl(), cm(), Dd() (+33 more)

### Community 20 - "createAdminClient"
Cohesion: 0.03
Nodes (105): getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), checkUserPremiumStatusAction(), claimSpinDiscountAction(), createMessageTopUpOrder() (+97 more)

### Community 21 - "af"
Cohesion: 0.21
Nodes (17): af(), bo(), fs(), hn(), io(), ll(), ms(), _o() (+9 more)

### Community 22 - "rf"
Cohesion: 0.10
Nodes (36): _0(), as(), c0(), cf(), ch(), da(), ds(), Fr() (+28 more)

### Community 23 - "Ih"
Cohesion: 0.05
Nodes (59): $h(), Ih(), bf(), bh(), Bt(), Cl(), cm(), cn() (+51 more)

### Community 24 - "il"
Cohesion: 0.06
Nodes (15): n(), Fn(), hu(), il, jr, ma(), mu(), nf() (+7 more)

### Community 25 - "r"
Cohesion: 0.14
Nodes (29): $h(), ct(), el(), m(), ot(), r(), Re(), y() (+21 more)

### Community 26 - "r"
Cohesion: 0.15
Nodes (40): ai(), b0(), bu(), di(), Do(), eh(), fi(), Fr() (+32 more)

### Community 27 - ".add"
Cohesion: 0.08
Nodes (13): af, Cn(), Gn, Gu(), kl(), _l(), me(), Mn (+5 more)

### Community 28 - "i"
Cohesion: 0.10
Nodes (29): bm(), Dl(), ds(), ea(), $f(), Fa(), G0(), Ga() (+21 more)

### Community 29 - "M0"
Cohesion: 0.08
Nodes (39): A0(), an(), as(), bc(), cd(), Cl(), cm(), D() (+31 more)

### Community 30 - "Ye"
Cohesion: 0.15
Nodes (28): hx(), C(), E(), _a(), ad(), bd(), dh(), dt() (+20 more)

### Community 31 - "n"
Cohesion: 0.15
Nodes (36): ot(), an(), bh(), bu(), di(), eh(), fi(), ft() (+28 more)

### Community 32 - "sf"
Cohesion: 0.13
Nodes (16): Bt(), ed(), Fu(), Jn(), ke(), la(), Ln(), md() (+8 more)

### Community 33 - "uc"
Cohesion: 0.10
Nodes (32): a0(), bu(), er(), Fa(), Fn(), ft(), gr(), i0() (+24 more)

### Community 34 - "of"
Cohesion: 0.12
Nodes (31): ao(), At(), c0(), ci(), ee(), ef(), i(), is() (+23 more)

### Community 35 - "l"
Cohesion: 0.13
Nodes (36): ch(), Ct(), dd(), df(), eo(), hf(), hn(), ho() (+28 more)

### Community 36 - "dx"
Cohesion: 0.07
Nodes (52): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+44 more)

### Community 37 - "rf"
Cohesion: 0.10
Nodes (36): af(), ao(), as(), da(), fs(), Fu(), ht(), Ia() (+28 more)

### Community 38 - "of"
Cohesion: 0.12
Nodes (48): ad(), an(), bh(), bo(), di(), eh(), fi(), go() (+40 more)

### Community 39 - "dx"
Cohesion: 0.07
Nodes (62): am(), ap(), ax(), Bn, cm(), cx(), de(), Dn() (+54 more)

### Community 40 - "r"
Cohesion: 0.14
Nodes (40): ai(), bu(), di(), Do(), fi(), ft(), Gt(), ir() (+32 more)

### Community 41 - "index-Cq6kntJJ.js"
Cohesion: 0.09
Nodes (56): am(), ap(), ax(), Ba(), Bx, cx(), de(), Dn() (+48 more)

### Community 42 - "pr"
Cohesion: 0.04
Nodes (26): r0(), r0(), r0(), r0(), r0(), r0(), r0(), Ae() (+18 more)

### Community 43 - "D"
Cohesion: 0.27
Nodes (12): hx(), C(), E(), bd(), D(), dh(), fh(), hu() (+4 more)

### Community 44 - "generate-draft/route.ts"
Cohesion: 0.13
Nodes (41): maxDuration, POST(), maxDuration, POST(), POST(), getProfileContext(), maxDuration, NUTRITION_JSON_SCHEMA (+33 more)

### Community 45 - "rf"
Cohesion: 0.15
Nodes (25): af(), ao(), At(), fs(), Hr(), Kl(), lf(), ls() (+17 more)

### Community 46 - "l"
Cohesion: 0.13
Nodes (52): ad(), an(), b0(), bo(), di(), eh(), fi(), gd() (+44 more)

### Community 47 - "B"
Cohesion: 0.20
Nodes (23): bd(), Da(), dh(), dt(), ea(), gc(), gh(), hh() (+15 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "schemas.ts"
Cohesion: 0.08
Nodes (34): GET(), dynamic, GET(), POST(), revalidate, POST(), POST(), POST() (+26 more)

### Community 50 - "Ih"
Cohesion: 0.04
Nodes (81): Ih(), A0(), ad(), an(), as(), bc(), bh(), Bt() (+73 more)

### Community 51 - "Ot"
Cohesion: 0.06
Nodes (96): am(), ap(), ax(), Bn, cm(), ep(), Ex(), Fx() (+88 more)

### Community 52 - "Qt"
Cohesion: 0.12
Nodes (4): cf, nr(), pa(), Qt()

### Community 53 - "ie"
Cohesion: 0.11
Nodes (27): At(), bi(), co(), e(), gi(), hs(), je(), jo() (+19 more)

### Community 54 - "st"
Cohesion: 0.15
Nodes (26): T0(), E0(), E0(), T0(), E0(), E0(), E0(), A0() (+18 more)

### Community 55 - "nn"
Cohesion: 0.09
Nodes (11): ar(), en(), ja(), ls(), nn(), Oi(), ol(), ru (+3 more)

### Community 56 - "Ye"
Cohesion: 0.17
Nodes (25): hx(), E(), M(), _a(), bd(), dh(), dt(), fh() (+17 more)

### Community 57 - "Ye"
Cohesion: 0.16
Nodes (28): ar(), bu(), Da(), dh(), dt(), ea(), ft(), gh() (+20 more)

### Community 58 - "Ye"
Cohesion: 0.17
Nodes (27): Bt(), Da(), dh(), dt(), ea(), fh(), gh(), hh() (+19 more)

### Community 59 - "l"
Cohesion: 0.06
Nodes (63): ar(), At(), bi(), bo(), co(), cs(), Ct(), dd() (+55 more)

### Community 60 - "Ye"
Cohesion: 0.18
Nodes (24): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+16 more)

### Community 61 - "types/index.ts"
Cohesion: 0.12
Nodes (16): Achievement, AchievementCategory, AIHabitPlan, AIHabitPlanItem, AISession, AISessionType, Habit, HabitCategory (+8 more)

### Community 62 - "Bi"
Cohesion: 0.09
Nodes (32): er(), Fa(), Fn(), ft(), gr(), Ic(), ir(), ju() (+24 more)

### Community 63 - "(fitness)/page.tsx"
Cohesion: 0.06
Nodes (29): DashboardBelow(), dynamic, revalidate, dynamic, WorkoutContent(), ExerciseLibraryCard(), FitnessDashboard(), FitnessDashboardProps (+21 more)

### Community 64 - "bt"
Cohesion: 0.11
Nodes (35): af(), ao(), ch(), cn(), da(), fs(), gd(), Kl() (+27 more)

### Community 65 - "r"
Cohesion: 0.10
Nodes (56): ai(), b0(), D(), di(), Do(), eh(), fi(), Fr() (+48 more)

### Community 66 - "y0"
Cohesion: 0.10
Nodes (26): bm(), Dl(), ds(), ea(), $f(), G0(), Ga(), Gf() (+18 more)

### Community 67 - "onboarding-flow.tsx"
Cohesion: 0.08
Nodes (21): saveFitnessOnboardingAction(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_left (+13 more)

### Community 68 - "le"
Cohesion: 0.10
Nodes (49): ar(), ch(), Ct(), dd(), df(), eo(), hf(), hn() (+41 more)

### Community 69 - "next"
Cohesion: 0.03
Nodes (88): approveFitnessPlanAdjustmentAction(), deleteR2File(), deleteScanPhotosFromR2(), isR2Configured, POST(), POST(), POST(), GET() (+80 more)

### Community 70 - "sf"
Cohesion: 0.14
Nodes (15): ah(), Bt(), Fu(), ke(), la(), Ln(), md(), Mi() (+7 more)

### Community 71 - "_0"
Cohesion: 0.24
Nodes (18): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+10 more)

### Community 72 - "F"
Cohesion: 0.09
Nodes (4): F, I, k(), q

### Community 73 - "grocery-view.tsx"
Cohesion: 0.27
Nodes (15): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps, getScaledPrice() (+7 more)

### Community 74 - "Ih"
Cohesion: 0.04
Nodes (80): Ih(), a0(), ad(), ah(), b0(), bf(), bm(), Cl() (+72 more)

### Community 75 - ".get"
Cohesion: 0.19
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "fitness-notifications.ts"
Cohesion: 0.17
Nodes (19): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), getUnreadNotificationsCountAction(), markAllNotificationsAsReadAction() (+11 more)

### Community 77 - "wf"
Cohesion: 0.08
Nodes (33): aa(), ai(), cm(), dc(), Ei(), ff(), fl(), Gc() (+25 more)

### Community 78 - "vc"
Cohesion: 0.07
Nodes (26): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+18 more)

### Community 79 - "sf"
Cohesion: 0.06
Nodes (55): A0(), ai(), as(), b0(), Ba(), t(), bc(), Bd() (+47 more)

### Community 80 - "ee"
Cohesion: 0.16
Nodes (21): c0(), cf(), ci(), ee(), ef(), Fu(), hc(), hi() (+13 more)

### Community 81 - "wf"
Cohesion: 0.13
Nodes (18): aa(), Bt(), Ei(), hd(), ke(), Ln(), Mi(), nd() (+10 more)

### Community 82 - "uc"
Cohesion: 0.11
Nodes (30): bu(), er(), Fn(), ft(), gr(), Ic(), ir(), ju() (+22 more)

### Community 83 - "Ph"
Cohesion: 0.04
Nodes (87): Ph(), A0(), as(), bh(), Bl(), bm(), br(), Bt() (+79 more)

### Community 84 - "ku"
Cohesion: 0.11
Nodes (15): df(), hf(), ic(), ku(), lf, _o(), a(), Oo() (+7 more)

### Community 85 - "Ye"
Cohesion: 0.17
Nodes (27): Da(), dh(), dt(), ea(), gh(), hh(), jd(), Ln() (+19 more)

### Community 86 - "l"
Cohesion: 0.09
Nodes (43): ar(), At(), bi(), bo(), co(), cs(), fo(), gi() (+35 more)

### Community 87 - "Ye"
Cohesion: 0.16
Nodes (27): hx(), E(), M(), _a(), ad(), bd(), bh(), dh() (+19 more)

### Community 88 - "tt"
Cohesion: 0.09
Nodes (35): bi(), bo(), co(), cs(), Fa(), fo(), gi(), go() (+27 more)

### Community 89 - "rf"
Cohesion: 0.17
Nodes (29): af(), an(), At(), bu(), di(), eh(), fi(), Kl() (+21 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.13
Nodes (21): updateRemindersAction(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS, REMINDER_TYPES, ReminderTypeSheet() (+13 more)

### Community 91 - "r"
Cohesion: 0.10
Nodes (34): as(), b0(), dn(), Do(), Fr(), ge(), ha(), hc() (+26 more)

### Community 92 - "uf"
Cohesion: 0.08
Nodes (43): an(), as(), bc(), c0(), cd(), D(), E0(), Es() (+35 more)

### Community 93 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 94 - "_0"
Cohesion: 0.24
Nodes (18): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+10 more)

### Community 95 - "et"
Cohesion: 0.08
Nodes (37): Bl(), bm(), Cl(), ea(), $f(), G0(), Ga(), Gf() (+29 more)

### Community 96 - "uc"
Cohesion: 0.09
Nodes (34): Cn(), er(), Fn(), ft(), gr(), I(), Ic(), ir() (+26 more)

### Community 97 - "l"
Cohesion: 0.09
Nodes (52): Ba(), t(), bf(), bi(), ch(), co(), cs(), Ct() (+44 more)

### Community 98 - "import-usda-foundation-foods.mjs"
Cohesion: 0.21
Nodes (11): buildRow(), DEFAULT_JSON_PATH, dryRun, findRecord(), IMPORT_MAP, missing, nutrient(), payload (+3 more)

### Community 99 - "ee"
Cohesion: 0.31
Nodes (13): _0(), cf(), ci(), ee(), ef(), is(), lo(), ml() (+5 more)

### Community 100 - "rf"
Cohesion: 0.11
Nodes (33): ad(), af(), ao(), At(), cn(), ed(), fs(), j0() (+25 more)

### Community 101 - "l"
Cohesion: 0.07
Nodes (72): S, Ba(), t(), bi(), bo(), ch(), co(), cs() (+64 more)

### Community 102 - "Ih"
Cohesion: 0.04
Nodes (79): Ih(), bf(), bh(), bm(), co(), cs(), dc(), Dl() (+71 more)

### Community 103 - "_0"
Cohesion: 0.11
Nodes (38): _0(), c0(), cf(), ci(), D0(), dn(), ee(), ef() (+30 more)

### Community 104 - "sf"
Cohesion: 0.15
Nodes (17): ar(), Bt(), Fu(), ke(), la(), Ln(), md(), Mi() (+9 more)

### Community 105 - "zn"
Cohesion: 0.15
Nodes (29): _a(), dt(), er(), ft(), gc(), gh(), hh(), Ic() (+21 more)

### Community 106 - "bf"
Cohesion: 0.15
Nodes (14): b0(), bf(), dc(), gu(), Kl(), Kr(), mf(), Pa() (+6 more)

### Community 107 - "D0"
Cohesion: 0.26
Nodes (17): D0(), dn(), Ei(), fe(), ff(), Fl(), Gl(), Gn() (+9 more)

### Community 108 - "c0"
Cohesion: 0.31
Nodes (15): c0(), D0(), df(), fe(), Gl(), Gn(), Lu(), nt() (+7 more)

### Community 109 - "hl"
Cohesion: 0.08
Nodes (52): At(), bf(), bi(), ch(), Ct(), eo(), gd(), e() (+44 more)

### Community 110 - "Ph"
Cohesion: 0.04
Nodes (88): Ph(), A0(), ai(), ao(), bc(), bh(), bm(), cd() (+80 more)

### Community 111 - "prompts.ts"
Cohesion: 0.29
Nodes (15): addUnique(), budgetPlanningReference(), buildCompactPlanProfile(), buildPlanReportInsights(), buildPlanSafetyBrief(), compactList(), compactText(), getPlanStartDate() (+7 more)

### Community 112 - "C"
Cohesion: 0.12
Nodes (10): bf(), dc(), gu(), Kr(), mf(), O0(), Pu(), Ut() (+2 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "sf"
Cohesion: 0.14
Nodes (18): aa(), ad(), ar(), Bt(), Fu(), ke(), Ln(), md() (+10 more)

### Community 115 - "r"
Cohesion: 0.13
Nodes (42): af(), ai(), di(), Do(), fi(), gs(), Gt(), js() (+34 more)

### Community 116 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+8 more)

### Community 117 - "ei"
Cohesion: 0.24
Nodes (16): ao(), c0(), ci(), ee(), ef(), is(), lo(), ml() (+8 more)

### Community 118 - "ve"
Cohesion: 0.12
Nodes (35): ci(), D0(), Dl(), dn(), ee(), ef(), Ei(), fe() (+27 more)

### Community 119 - "af"
Cohesion: 0.26
Nodes (15): af(), fs(), io(), ll(), ms(), _o(), os(), ps() (+7 more)

### Community 120 - "Ft"
Cohesion: 0.20
Nodes (18): c0(), cf(), ci(), ee(), ef(), hc(), hi(), is() (+10 more)

### Community 121 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 122 - "nu"
Cohesion: 0.11
Nodes (9): eu(), gf, ir(), jf(), nu, qu(), Rn(), sn() (+1 more)

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "_0"
Cohesion: 0.24
Nodes (18): _0(), D0(), Ei(), fe(), ff(), gd(), Gl(), Gn() (+10 more)

### Community 125 - "yf"
Cohesion: 0.20
Nodes (7): hc, kc(), lc, mf(), ro, vf(), yf

### Community 126 - "yf"
Cohesion: 0.23
Nodes (15): ch(), df(), eo(), hf(), hn(), jf(), Kt(), mn() (+7 more)

### Community 127 - "of"
Cohesion: 0.08
Nodes (50): _0(), ao(), bc(), cd(), cf(), ci(), cs(), Dd() (+42 more)

### Community 128 - "i"
Cohesion: 0.23
Nodes (14): bi(), bo(), fo(), go(), hs(), je(), jo(), ps() (+6 more)

### Community 129 - "r"
Cohesion: 0.10
Nodes (37): $h(), ct(), el(), g(), m(), r(), Re(), zt() (+29 more)

### Community 130 - "ee"
Cohesion: 0.29
Nodes (14): c0(), cf(), ci(), ee(), ef(), is(), lo(), ml() (+6 more)

### Community 131 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 132 - "l"
Cohesion: 0.11
Nodes (39): ar(), At(), Ct(), dd(), df(), eo(), hf(), hn() (+31 more)

### Community 133 - "uc"
Cohesion: 0.21
Nodes (14): br(), cr(), Fn(), id(), ju(), Kn(), l0(), Mr() (+6 more)

### Community 134 - "seed-comprehensive-foods.mjs"
Cohesion: 0.18
Nodes (8): supabase, supabase, VERIFIED_FOODS, FOOD_PHOTOS, supabase, dotenv, ref_node_path, ref_node_process

### Community 135 - "(fitness)/support/page.tsx"
Cohesion: 0.26
Nodes (9): getUserSupportMessages(), submitSupportMessage(), dynamic, FitnessSupportPage(), revalidate, SUPPORT_CATEGORIES, SupportClient(), SupportClientProps (+1 more)

### Community 136 - "r"
Cohesion: 0.15
Nodes (40): ai(), b0(), bu(), di(), Do(), eh(), fi(), Fr() (+32 more)

### Community 137 - "_0"
Cohesion: 0.19
Nodes (21): _0(), D0(), df(), Do(), en(), fe(), ff(), Gl() (+13 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 139 - "yf"
Cohesion: 0.29
Nodes (12): hf(), hn(), jf(), Kt(), mn(), Na(), pf(), qi() (+4 more)

### Community 140 - "wf"
Cohesion: 0.22
Nodes (10): aa(), Ei(), hd(), ke(), Mi(), Qc(), wd(), wf() (+2 more)

### Community 141 - "r"
Cohesion: 0.10
Nodes (36): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+28 more)

### Community 142 - "bf"
Cohesion: 0.20
Nodes (10): bf(), dc(), gu(), jh(), Kr(), O0(), Pu(), sd() (+2 more)

### Community 143 - "Key Architectural Patterns"
Cohesion: 0.22
Nodes (8): 1. Parallel Batching vs. Sequential Waterfalls, 2. In-Memory Calendar & Status Math, 3. Immediate Suspense Streaming, 4. Router Caching & Optimistic Tab Transitions, 5. Theme Architecture (Dark & White), Architectural Overview, Architecture & Data Flow — GrindLog, Key Architectural Patterns

### Community 144 - "Technology Stack — GrindLog"
Cohesion: 0.22
Nodes (8): AI & LLM Integrations, Core Runtime & Framework, Data Layer & State, Mobile & PWA, Payments & Subscriptions, Styling & Design System, Technology Stack — GrindLog, Utilities & Validation

### Community 145 - "Critical Test Flows"
Cohesion: 0.22
Nodes (8): 1. Tab Navigation & Instant Switching, 2. Dual-Theme Verification (Dark vs. White), 3. Workout Logging & State Persistence, 4. Nutrition & Calorie Tracking, 5. Authentication & Subscription Guard Rails, Critical Test Flows, Testing & Verification Guide — GrindLog, Verification Commands

### Community 146 - "bf"
Cohesion: 0.08
Nodes (42): _a(), af(), bf(), ch(), Dl(), Do(), ds(), en() (+34 more)

### Community 147 - "dx"
Cohesion: 0.07
Nodes (62): am(), ap(), ax(), Bn, cx(), de(), Dn(), dx() (+54 more)

### Community 149 - "Concerns, Technical Debt & Watch-Outs — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Database Waterfall Regressions, 2. White Theme CSS Overrides, 3. PWA Service Worker Cache Invalidation, 4. Mobile Keyboard & Viewport Layout Shifts, 5. Razorpay Webhook Idempotency & Webhook Retries, Concerns, Technical Debt & Watch-Outs — GrindLog

### Community 150 - "External Integrations & Services — GrindLog"
Cohesion: 0.25
Nodes (7): 1. Supabase (Database, Auth, Storage), 2. Razorpay (Payment Gateway), 3. Google Gemini AI (@google/genai), 4. PWA Service Worker (Next-PWA & Workbox), 5. Resend (Email Service), 6. Developer Tooling & Agent Workflow Suite, External Integrations & Services — GrindLog

### Community 151 - "Product & Technical Requirements — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Performance & Latency Requirements, 2. Workout & Fitness Requirements, 3. Nutrition & Diet Requirements, 4. Design & Mobile Experience Requirements, 5. Security & Billing Requirements, Product & Technical Requirements — GrindLog

### Community 152 - "motion"
Cohesion: 0.04
Nodes (47): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem (+39 more)

### Community 153 - "zod"
Cohesion: 0.20
Nodes (6): s, safeNumber, GeneratedMealSchema, s, s, zod

### Community 155 - "dl"
Cohesion: 0.22
Nodes (5): dl(), pl, qi, qn(), yu()

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 158 - "fitness-shell.tsx"
Cohesion: 0.20
Nodes (12): NutritionLoading(), ProfileLoading(), ProgressLoading(), BottomNav(), TodaysWorkoutCard(), FitnessShellInner(), MAIN_PAGES, NavigationContext (+4 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 161 - "supabase/middleware.ts"
Cohesion: 0.38
Nodes (5): config, updateSession(), config, middleware(), @supabase/ssr

### Community 164 - "createServerSupabase"
Cohesion: 0.04
Nodes (76): exportUserData(), exportWorkoutHistoryCSV(), dynamic, POST(), POST(), POST(), GET(), GET() (+68 more)

### Community 168 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, import:usda, lint, start, type-check

### Community 170 - "Coding Conventions & Standards — GrindLog"
Cohesion: 0.33
Nodes (5): 1. Performance Standards (Mobile 60fps Target), 2. Design System & Theming, 3. Server vs. Client Boundary Rules, 4. TypeScript & Error Handling, Coding Conventions & Standards — GrindLog

### Community 175 - "dx"
Cohesion: 0.09
Nodes (31): e(), Ml(), Ol(), tr(), de(), Dn(), dx(), El() (+23 more)

### Community 176 - "Product Roadmap — GrindLog"
Cohesion: 0.33
Nodes (5): Phase 1: Core Performance & Tab Optimization [COMPLETED], Phase 2: Nutrition & Food Logging Enhancements [UPCOMING], Phase 3: Workout Audio, Haptics & Offline Sync [PLANNED], Phase 4: Social, Leaderboards & Gamification [PLANNED], Product Roadmap — GrindLog

### Community 178 - "Project State — GrindLog"
Cohesion: 0.40
Nodes (4): main(), Blockers & Open Items, Current Status, Project State — GrindLog

### Community 179 - "Codebase Structure & Directory Layout — GrindLog"
Cohesion: 0.50
Nodes (3): Codebase Structure & Directory Layout — GrindLog, Naming & File Conventions, Root Repository Map (`c:\manage\web\`)

## Knowledge Gaps
- **533 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+528 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 884 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `index-B23vSfwu.js`, `uc`, `fl`, `Ph`, `index-Buds9Sm1.js`, `Ph`, `Z`, `index-DtLkR01C.js`, `r`, `he`, `of`, `il`, `r`, `.add`, `dl`, `uc`, `dx`, `of`, `index-Cq6kntJJ.js`, `pr`, `dx`, `Ih`, `Ot`, `Qt`, `ie`, `st`, `nn`, `Ye`, `Bi`, `bt`, `r`, `le`, `Ih`, `.get`, `vc`, `sf`, `uc`, `Ph`, `ku`, `tt`, `et`, `uc`, `l`, `Ih`, `_0`, `zn`, `hl`, `Ph`, `ei`, `ve`, `af`, `Ft`, `nu`, `yf`, `of`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `i`, `_`, `index-B23vSfwu.js`, `fl`, `r`, `r`, `he`, `dx`, `M0`, `l`, `pr`, `B`, `st`, `Ye`, `Bi`, `_0`, `vc`, `ku`, `et`, `rf`, `sf`, `Ft`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `index-B23vSfwu.js`, `l`, `fl`, `r`, `he`, `We`, `rf`, `uc`, `dx`, `B`, `Ot`, `st`, `Bi`, `sf`, `vc`, `ku`, `Ye`, `et`, `bf`, `r`, `ve`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._