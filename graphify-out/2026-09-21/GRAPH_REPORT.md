# Graph Report - web  (2026-09-21)

## Corpus Check
- 402 files · ~3,419,736 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6297 nodes · 22377 edges · 171 communities (159 shown, 12 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5c33c8b5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- uc
- _
- lucide-react
- le
- prompts.ts
- createServerSupabase
- Ph
- Ph
- index-Buds9Sm1.js
- Ph
- profile-content.tsx
- oo
- progress-view.tsx
- index-DtLkR01C.js
- constants.ts
- ki
- Ih
- uc
- analyze/route.ts
- hl
- createAdminClient
- grocery-view.tsx
- Ot
- Ih
- il
- r
- r
- .add
- ee
- zn
- mi
- n
- l
- uc
- createClient
- l
- index-CqdT1wea.js
- bt
- n
- index-CoRpx3FC.js
- s
- index-x6K-DhKZ.js
- Q
- uc
- generate-draft/route.ts
- lf
- t
- lf
- dependencies
- fitness-plan-profile.ts
- Ih
- index-B23vSfwu.js
- et
- of
- wf
- admin-login/page.tsx
- Ye
- r
- st
- l
- Le
- app/package.json
- rf
- yf
- rf
- r
- schemas.ts
- onboarding-flow.tsx
- Ye
- fitness-shell.tsx
- Pt
- We
- F
- AIPlanAnimation.tsx
- Ih
- .get
- fitness-notifications.ts
- sf
- vc
- of
- uf
- uf
- uc
- Ph
- Ye
- Ye
- l
- Ye
- l
- r
- reminders-client.tsx
- uf
- of
- devDependencies
- _0
- nn
- types/index.ts
- sf
- import-usda-foundation-foods.mjs
- r
- bl
- l
- Ih
- _0
- C
- Wh
- rf
- ve
- c0
- l
- Hi
- wf
- Ye
- compilerOptions
- B
- r
- _0
- r
- D0
- fu
- _0
- users-table-client.tsx
- nu
- manifest.json
- _0
- yf
- af
- sf
- fitness-dashboard.tsx
- yf
- sf
- fitness-reminders/route.ts
- e
- Wh
- sf
- r
- _0
- grocery-tab.tsx
- nutrition-view.tsx
- $h
- tt
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- bf
- index-BM9U1lvA.js
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- uc
- progression.ts
- ff
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- coach.ts
- package.json
- firebase-messaging-sw.js
- Data import scripts
- nutrition-service.ts
- rules/graphify.md
- workflows/graphify.md
- Rs
- next-env.d.ts
- dl
- ai-insight-card.tsx
- gsap-C8IefbVz.js

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
- `3. Workout Logging & State Persistence` --references--> `WorkoutHeader()`  [INFERRED]
  .planning/codebase/TESTING.md → app/components/fitness/workout/workout-header.tsx
- `Recent Decisions` --references--> `FitnessLayout()`  [INFERRED]
  .planning/STATE.md → app/app/(fitness)/layout.tsx
- `1. Performance Standards (Mobile 60fps Target)` --references--> `BottomNav()`  [INFERRED]
  .planning/codebase/CONVENTIONS.md → app/components/fitness/dashboard/bottom-nav.tsx
- `Phase 1: Core Performance & Tab Optimization [COMPLETED]` --references--> `BottomNav()`  [INFERRED]
  .planning/ROADMAP.md → app/components/fitness/dashboard/bottom-nav.tsx
- `Naming & File Conventions` --references--> `WorkoutSummaryCard()`  [INFERRED]
  .planning/codebase/STRUCTURE.md → app/components/fitness/workout/workout-summary-card.tsx

## Import Cycles
- None detected.

## Communities (171 total, 12 thin omitted)

### Community 0 - "uc"
Cohesion: 0.10
Nodes (31): er(), Fa(), Fn(), ft(), gr(), Ic(), ir(), ju() (+23 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (131): _, aa, ac(), ao(), As, at, Be(), bn (+123 more)

### Community 2 - "lucide-react"
Cohesion: 0.02
Nodes (114): completeExerciseSetsAction(), completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), reopenWorkoutAction(), resetWorkoutTimerAction() (+106 more)

### Community 3 - "le"
Cohesion: 0.21
Nodes (20): ch(), df(), hf(), hn(), jf(), Kt(), mf(), mn() (+12 more)

### Community 4 - "prompts.ts"
Cohesion: 0.15
Nodes (24): GET(), addUnique(), budgetPlanningReference(), buildCompactPlanProfile(), buildFitnessPlanPrompt(), buildPlanReportInsights(), buildPlanSafetyBrief(), compactList() (+16 more)

### Community 5 - "createServerSupabase"
Cohesion: 0.03
Nodes (86): exportUserData(), exportWorkoutHistoryCSV(), quickCompleteWorkoutAction(), getUserSupportMessages(), submitSupportMessage(), dynamic, POST(), POST() (+78 more)

### Community 6 - "Ph"
Cohesion: 0.04
Nodes (87): Ph(), A0(), b0(), Ba(), t(), bc(), Bd(), bh() (+79 more)

### Community 7 - "Ph"
Cohesion: 0.06
Nodes (55): Ph(), as(), Cn(), er(), Es(), Fn(), ft(), gr() (+47 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.06
Nodes (85): $, A, b, c(), D, e(), f, g (+77 more)

### Community 9 - "Ph"
Cohesion: 0.04
Nodes (89): Ph(), bc(), Bd(), bh(), Bl(), bm(), cd(), cf() (+81 more)

### Community 10 - "profile-content.tsx"
Cohesion: 0.05
Nodes (48): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem (+40 more)

### Community 11 - "oo"
Cohesion: 0.13
Nodes (22): A0(), ai(), b0(), Cl(), cm(), Es(), ff(), fl() (+14 more)

### Community 12 - "progress-view.tsx"
Cohesion: 0.05
Nodes (52): GET(), POST(), GET(), GET(), metadata, ProgressPage(), app_assets_images_placeholder_goal, AchievementsShowcase() (+44 more)

### Community 13 - "index-DtLkR01C.js"
Cohesion: 0.03
Nodes (161): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+153 more)

### Community 14 - "constants.ts"
Cohesion: 0.06
Nodes (72): GroceryPage(), ACTIVITY_MULTIPLIERS, AUTHENTIC_INDIAN_RECIPES, AuthenticMealRecipe, BANNED_FOOD_PATTERNS, calculateWaterTarget(), CATEGORY_RETAIL_UNITS, CORE_MEAL_TYPES (+64 more)

### Community 15 - "ki"
Cohesion: 0.15
Nodes (13): bf(), dc(), gu(), jh(), Ki(), Kr(), Nh(), O0() (+5 more)

### Community 16 - "Ih"
Cohesion: 0.04
Nodes (77): Ih(), ad(), ah(), an(), ar(), b0(), bf(), Bt() (+69 more)

### Community 17 - "uc"
Cohesion: 0.11
Nodes (30): a0(), bu(), er(), Fn(), ft(), gr(), i0(), Ic() (+22 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.08
Nodes (36): POST(), POST(), stableStringify(), stripImagePayload(), POST(), AIStartingReportPage(), displayValue(), dynamic (+28 more)

### Community 19 - "hl"
Cohesion: 0.12
Nodes (22): Do(), Ei(), en(), _f(), hd(), Ii(), jf(), Jl() (+14 more)

### Community 20 - "createAdminClient"
Cohesion: 0.03
Nodes (98): createCouponAction(), toggleCouponStatusAction(), getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), checkUserPremiumStatusAction() (+90 more)

### Community 21 - "grocery-view.tsx"
Cohesion: 0.27
Nodes (15): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps, getScaledPrice() (+7 more)

### Community 22 - "Ot"
Cohesion: 0.16
Nodes (32): Vx(), Vx(), ap(), Bn(), Bx, ep(), ex(), o() (+24 more)

### Community 23 - "Ih"
Cohesion: 0.05
Nodes (76): Ih(), A0(), ad(), an(), as(), bc(), bh(), Bt() (+68 more)

### Community 24 - "il"
Cohesion: 0.06
Nodes (18): n(), Fn(), hu(), ic(), il, jr, ma(), nf() (+10 more)

### Community 25 - "r"
Cohesion: 0.08
Nodes (48): $h(), ct(), el(), m(), ot(), r(), Re(), y() (+40 more)

### Community 26 - "r"
Cohesion: 0.11
Nodes (44): af(), At(), b0(), bh(), bu(), di(), Do(), eh() (+36 more)

### Community 27 - ".add"
Cohesion: 0.08
Nodes (14): af, Cn(), Gn, Gu(), kl(), ks(), _l(), me() (+6 more)

### Community 28 - "ee"
Cohesion: 0.36
Nodes (10): ao(), ci(), ee(), ef(), is(), Jr(), lo(), Pu() (+2 more)

### Community 29 - "zn"
Cohesion: 0.14
Nodes (31): _a(), ds(), dt(), er(), ft(), gc(), gh(), hh() (+23 more)

### Community 30 - "mi"
Cohesion: 0.12
Nodes (28): c0(), cf(), ci(), ee(), ef(), Fu(), hc(), hi() (+20 more)

### Community 31 - "n"
Cohesion: 0.18
Nodes (36): ot(), ad(), an(), bu(), di(), eh(), fi(), go() (+28 more)

### Community 32 - "l"
Cohesion: 0.07
Nodes (67): af(), At(), bf(), bi(), bo(), ch(), co(), cs() (+59 more)

### Community 33 - "uc"
Cohesion: 0.09
Nodes (35): a0(), er(), fh(), Fn(), ft(), gr(), I(), i0() (+27 more)

### Community 34 - "createClient"
Cohesion: 0.07
Nodes (31): approveFitnessPlanAdjustmentAction(), POST(), GET(), POST(), POST(), CoachPage(), metadata, CoachChat() (+23 more)

### Community 35 - "l"
Cohesion: 0.08
Nodes (60): ar(), bi(), bo(), co(), cs(), Ct(), dd(), ea() (+52 more)

### Community 36 - "index-CqdT1wea.js"
Cohesion: 0.09
Nodes (57): am(), ap(), ax(), Bn, Bx, cx(), de(), Dn() (+49 more)

### Community 37 - "bt"
Cohesion: 0.11
Nodes (34): af(), ao(), At(), da(), fs(), go(), Kl(), lf() (+26 more)

### Community 38 - "n"
Cohesion: 0.18
Nodes (36): ot(), ad(), an(), bu(), di(), eh(), fi(), go() (+28 more)

### Community 39 - "index-CoRpx3FC.js"
Cohesion: 0.09
Nodes (56): am(), ap(), ax(), Bn, Bx, cm(), cx(), de() (+48 more)

### Community 40 - "s"
Cohesion: 0.16
Nodes (29): $h(), D(), di(), fi(), Hl(), oh(), Qu(), b() (+21 more)

### Community 41 - "index-x6K-DhKZ.js"
Cohesion: 0.06
Nodes (80): $, A, b, c(), D, e(), f, g (+72 more)

### Community 42 - "Q"
Cohesion: 0.08
Nodes (15): r0(), r0(), r0(), r0(), r0(), r0(), r0(), Ae() (+7 more)

### Community 43 - "uc"
Cohesion: 0.16
Nodes (17): as(), br(), cr(), Fn(), gr(), id(), ju(), Kn() (+9 more)

### Community 44 - "generate-draft/route.ts"
Cohesion: 0.14
Nodes (42): maxDuration, POST(), maxDuration, POST(), POST(), POST(), getProfileContext(), maxDuration (+34 more)

### Community 45 - "lf"
Cohesion: 0.27
Nodes (14): ao(), fs(), gi(), lf(), ms(), _o(), os(), qt() (+6 more)

### Community 46 - "t"
Cohesion: 0.09
Nodes (36): At(), bi(), ch(), co(), cs(), gd(), e(), t() (+28 more)

### Community 47 - "lf"
Cohesion: 0.23
Nodes (16): ao(), fs(), gi(), Gt(), lf(), ms(), _o(), os() (+8 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "fitness-plan-profile.ts"
Cohesion: 0.12
Nodes (30): GenerateGroceryResponseSchema, POST(), GeneratedGroceryItemSchema, AVAILABLE_FOOD_ALIASES, buildGoalCalorieTarget(), cleanText(), expectedMealCount(), FILLER_WORDS (+22 more)

### Community 50 - "Ih"
Cohesion: 0.05
Nodes (73): Ih(), A0(), an(), bc(), bm(), cd(), cn(), dc() (+65 more)

### Community 51 - "index-B23vSfwu.js"
Cohesion: 0.08
Nodes (68): am(), ap(), ax(), Bn, Bx, cm(), cx(), de() (+60 more)

### Community 52 - "et"
Cohesion: 0.05
Nodes (23): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), rr(), rr() (+15 more)

### Community 53 - "of"
Cohesion: 0.11
Nodes (60): ad(), af(), an(), bo(), di(), eh(), fi(), fs() (+52 more)

### Community 54 - "wf"
Cohesion: 0.07
Nodes (36): ai(), Cl(), cm(), ds(), Ei(), ff(), fl(), G0() (+28 more)

### Community 55 - "admin-login/page.tsx"
Cohesion: 0.70
Nodes (3): loginAdminAction(), AdminLogin(), handleSubmit()

### Community 56 - "Ye"
Cohesion: 0.12
Nodes (34): hx(), E(), M(), _a(), ad(), bd(), Bt(), dh() (+26 more)

### Community 57 - "r"
Cohesion: 0.11
Nodes (39): aa(), ar(), Bt(), Da(), dh(), dt(), ea(), ft() (+31 more)

### Community 58 - "st"
Cohesion: 0.14
Nodes (26): T0(), E0(), E0(), T0(), E0(), E0(), E0(), E0() (+18 more)

### Community 59 - "l"
Cohesion: 0.07
Nodes (72): At(), bi(), bo(), co(), cs(), Ct(), dd(), df() (+64 more)

### Community 60 - "Le"
Cohesion: 0.15
Nodes (17): as(), da(), Es(), ht(), Ia(), Kf(), Le(), t() (+9 more)

### Community 61 - "app/package.json"
Cohesion: 0.04
Nodes (50): Providers(), FitnessBottomNav(), tabs, TimePicker12h(), TimePicker12hProps, config, updateSession(), cn() (+42 more)

### Community 62 - "rf"
Cohesion: 0.14
Nodes (26): af(), ao(), At(), fs(), gi(), Kl(), lf(), ls() (+18 more)

### Community 63 - "yf"
Cohesion: 0.09
Nodes (32): bm(), ch(), Dl(), ea(), $f(), G0(), Ga(), Gf() (+24 more)

### Community 64 - "rf"
Cohesion: 0.13
Nodes (29): af(), ao(), ch(), cn(), fs(), Hr(), Kl(), lf() (+21 more)

### Community 65 - "r"
Cohesion: 0.15
Nodes (40): b0(), bu(), di(), Do(), eh(), fi(), Fr(), gs() (+32 more)

### Community 66 - "schemas.ts"
Cohesion: 0.13
Nodes (16): generateProNutritionLayer(), getProfileNutritionContext(), CoachResponseSchema, FITNESS_PLAN_JSON_SCHEMA, GeneratedExerciseSchema, GeneratedLifestyleSchema, GeneratedMealSchema, GeneratedNutritionData (+8 more)

### Community 67 - "onboarding-flow.tsx"
Cohesion: 0.08
Nodes (21): saveFitnessOnboardingAction(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_left (+13 more)

### Community 68 - "Ye"
Cohesion: 0.10
Nodes (35): _a(), ad(), Bt(), da(), dt(), gc(), gh(), hh() (+27 more)

### Community 69 - "fitness-shell.tsx"
Cohesion: 0.06
Nodes (34): ExerciseDetailPage(), generateMetadata(), NutritionLoading(), ProfileLoading(), ProgressLoading(), FitnessChatbot(), Message, BottomNav() (+26 more)

### Community 70 - "Pt"
Cohesion: 0.17
Nodes (28): ap(), Bn(), Bx, ep(), ex(), o(), Ha, ip() (+20 more)

### Community 71 - "We"
Cohesion: 0.12
Nodes (25): A0(), ai(), bc(), cd(), Cl(), cm(), en(), fl() (+17 more)

### Community 72 - "F"
Cohesion: 0.09
Nodes (4): F, I, k(), q

### Community 73 - "AIPlanAnimation.tsx"
Cohesion: 0.09
Nodes (35): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+27 more)

### Community 74 - "Ih"
Cohesion: 0.05
Nodes (74): Ih(), ad(), ah(), an(), b0(), bc(), bf(), bm() (+66 more)

### Community 75 - ".get"
Cohesion: 0.19
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "fitness-notifications.ts"
Cohesion: 0.19
Nodes (18): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), getUnreadNotificationsCountAction(), markAllNotificationsAsReadAction() (+10 more)

### Community 77 - "sf"
Cohesion: 0.13
Nodes (19): ar(), Bt(), Fu(), ke(), la(), Ln(), md(), Mi() (+11 more)

### Community 78 - "vc"
Cohesion: 0.11
Nodes (18): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+10 more)

### Community 79 - "of"
Cohesion: 0.10
Nodes (41): ao(), c0(), ci(), Dd(), dn(), ee(), ef(), fo() (+33 more)

### Community 80 - "uf"
Cohesion: 0.10
Nodes (36): as(), c0(), cf(), ci(), ee(), ef(), Fr(), Fu() (+28 more)

### Community 81 - "uf"
Cohesion: 0.09
Nodes (38): bc(), cd(), Cl(), cm(), D(), Fa(), Fr(), hc() (+30 more)

### Community 82 - "uc"
Cohesion: 0.14
Nodes (19): as(), br(), cr(), Fn(), gr(), id(), Jc(), ju() (+11 more)

### Community 83 - "Ph"
Cohesion: 0.04
Nodes (79): Ph(), A0(), ai(), as(), b0(), bh(), Bt(), bu() (+71 more)

### Community 84 - "Ye"
Cohesion: 0.18
Nodes (24): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+16 more)

### Community 85 - "Ye"
Cohesion: 0.14
Nodes (33): aa(), Da(), dh(), dt(), ea(), gh(), hh(), ic() (+25 more)

### Community 86 - "l"
Cohesion: 0.09
Nodes (48): ar(), bi(), bo(), co(), cs(), Ct(), dd(), df() (+40 more)

### Community 87 - "Ye"
Cohesion: 0.20
Nodes (23): hx(), E(), M(), _a(), bd(), bh(), dt(), gc() (+15 more)

### Community 88 - "l"
Cohesion: 0.06
Nodes (74): ar(), bf(), bi(), bo(), ch(), co(), cs(), Ct() (+66 more)

### Community 89 - "r"
Cohesion: 0.08
Nodes (70): S, $h(), ct(), el(), g(), m(), ot(), r() (+62 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.11
Nodes (23): updateRemindersAction(), metadata, RemindersPage(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS (+15 more)

### Community 91 - "uf"
Cohesion: 0.09
Nodes (38): c0(), cf(), ci(), Dl(), dn(), ee(), ef(), Fr() (+30 more)

### Community 92 - "of"
Cohesion: 0.09
Nodes (42): ao(), c0(), ci(), Dd(), dn(), ee(), ef(), fo() (+34 more)

### Community 93 - "devDependencies"
Cohesion: 0.11
Nodes (17): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+9 more)

### Community 94 - "_0"
Cohesion: 0.16
Nodes (25): _0(), ai(), Cl(), cm(), D0(), dn(), Ei(), fe() (+17 more)

### Community 95 - "nn"
Cohesion: 0.10
Nodes (9): ar(), en(), ja(), ls(), nn(), ol(), ru, ur() (+1 more)

### Community 96 - "types/index.ts"
Cohesion: 0.12
Nodes (16): Achievement, AchievementCategory, AIHabitPlan, AIHabitPlanItem, AISession, AISessionType, Habit, HabitCategory (+8 more)

### Community 97 - "sf"
Cohesion: 0.16
Nodes (16): aa(), ar(), Bt(), ke(), Ln(), md(), Mi(), nr() (+8 more)

### Community 98 - "import-usda-foundation-foods.mjs"
Cohesion: 0.08
Nodes (25): main(), supabase, buildRow(), DEFAULT_JSON_PATH, dryRun, findRecord(), IMPORT_MAP, missing (+17 more)

### Community 99 - "r"
Cohesion: 0.10
Nodes (31): as(), c0(), da(), Fr(), gd(), ge(), hc(), hd() (+23 more)

### Community 100 - "bl"
Cohesion: 0.11
Nodes (16): bc(), bl(), a(), El(), a(), u(), ku(), nc() (+8 more)

### Community 101 - "l"
Cohesion: 0.09
Nodes (56): Ba(), t(), bi(), bo(), ch(), co(), cs(), Ct() (+48 more)

### Community 102 - "Ih"
Cohesion: 0.05
Nodes (56): Ih(), A0(), an(), bf(), bm(), cn(), dc(), ds() (+48 more)

### Community 103 - "_0"
Cohesion: 0.15
Nodes (25): _0(), ai(), D0(), dn(), Ei(), Fa(), fe(), ff() (+17 more)

### Community 104 - "C"
Cohesion: 0.14
Nodes (8): bf(), dc(), gu(), Kr(), O0(), Pu(), Ut(), C

### Community 105 - "Wh"
Cohesion: 0.16
Nodes (24): $h(), hx(), C(), E(), bd(), D(), dh(), fh() (+16 more)

### Community 106 - "rf"
Cohesion: 0.12
Nodes (28): _0(), cf(), ch(), ci(), ee(), ef(), Fu(), gd() (+20 more)

### Community 107 - "ve"
Cohesion: 0.14
Nodes (33): _0(), cf(), ci(), D0(), Dl(), dn(), ee(), ef() (+25 more)

### Community 108 - "c0"
Cohesion: 0.15
Nodes (24): bs(), bs(), bs(), bs(), c0(), D0(), df(), fe() (+16 more)

### Community 109 - "l"
Cohesion: 0.07
Nodes (57): At(), bf(), bi(), bo(), ch(), Ct(), eo(), gd() (+49 more)

### Community 110 - "Hi"
Cohesion: 0.08
Nodes (36): bm(), ds(), ed(), $f(), G0(), Gf(), If(), j0() (+28 more)

### Community 111 - "wf"
Cohesion: 0.20
Nodes (11): Ba(), t(), Ei(), hd(), Ii(), Mi(), Qc(), wd() (+3 more)

### Community 112 - "Ye"
Cohesion: 0.13
Nodes (32): aa(), Bt(), Da(), dh(), dt(), ea(), ft(), gh() (+24 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "B"
Cohesion: 0.15
Nodes (30): bd(), Da(), dh(), dt(), ea(), fh(), gc(), gh() (+22 more)

### Community 115 - "r"
Cohesion: 0.13
Nodes (52): af(), bu(), df(), di(), Do(), eo(), fi(), Fr() (+44 more)

### Community 116 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+8 more)

### Community 117 - "r"
Cohesion: 0.13
Nodes (29): $h(), ct(), el(), g(), m(), r(), Re(), zt() (+21 more)

### Community 118 - "D0"
Cohesion: 0.10
Nodes (37): ai(), bc(), c0(), cd(), Cl(), D(), D0(), dh() (+29 more)

### Community 119 - "fu"
Cohesion: 0.09
Nodes (31): bm(), Dl(), ds(), ea(), $f(), G0(), Ga(), Gf() (+23 more)

### Community 120 - "_0"
Cohesion: 0.19
Nodes (21): _0(), D0(), da(), dn(), Ei(), fe(), ff(), Fl() (+13 more)

### Community 121 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 122 - "nu"
Cohesion: 0.09
Nodes (10): eu(), gf, ir(), jf(), nu, qu(), Rn(), sn() (+2 more)

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), Ei(), fe(), ff(), Gl(), Gn(), Hr() (+9 more)

### Community 125 - "yf"
Cohesion: 0.14
Nodes (10): df(), hc, hf(), kc(), lc, mf(), pf(), ro (+2 more)

### Community 126 - "af"
Cohesion: 0.40
Nodes (11): af(), fs(), io(), ms(), _o(), os(), qt(), Rl() (+3 more)

### Community 127 - "sf"
Cohesion: 0.14
Nodes (25): _0(), bc(), Bl(), cd(), Dd(), dn(), fo(), ha() (+17 more)

### Community 128 - "fitness-dashboard.tsx"
Cohesion: 0.09
Nodes (22): DailyActivityCard(), DashboardSkeleton(), ExerciseLibraryCard(), FitnessDashboard(), FitnessDashboardProps, HorizontalCalendar(), HorizontalCalendarProps, ProNutritionGenerationCard() (+14 more)

### Community 129 - "yf"
Cohesion: 0.38
Nodes (10): hf(), hn(), jf(), Kt(), mn(), Na(), pf(), xn() (+2 more)

### Community 130 - "sf"
Cohesion: 0.12
Nodes (27): c0(), cf(), ci(), Dl(), ee(), ef(), Fu(), is() (+19 more)

### Community 131 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 132 - "e"
Cohesion: 0.09
Nodes (41): ao(), At(), bi(), bo(), co(), cs(), fo(), fs() (+33 more)

### Community 133 - "Wh"
Cohesion: 0.16
Nodes (24): $h(), hx(), C(), E(), bd(), D(), dh(), fh() (+16 more)

### Community 134 - "sf"
Cohesion: 0.25
Nodes (9): ke(), la(), lh(), md(), Mi(), sf(), wd(), wf() (+1 more)

### Community 136 - "r"
Cohesion: 0.10
Nodes (44): ai(), b0(), bh(), bu(), di(), Do(), eh(), er() (+36 more)

### Community 137 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+8 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 140 - "nutrition-view.tsx"
Cohesion: 0.06
Nodes (39): TodaysGoalsCard(), TodaysGoalsCardProps, formatFoodItem(), TodaysNutritionCard(), TodaysNutritionCardProps, FoodAvatar(), FoodAvatarProps, Food (+31 more)

### Community 141 - "$h"
Cohesion: 0.16
Nodes (23): $h(), ct(), el(), g(), m(), r(), Re(), zt() (+15 more)

### Community 142 - "tt"
Cohesion: 0.14
Nodes (14): ai(), Cl(), Do(), Fa(), G0(), li(), qo(), rm() (+6 more)

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
Cohesion: 0.07
Nodes (40): _a(), bf(), bm(), Cl(), dc(), Dl(), ds(), eo() (+32 more)

### Community 147 - "index-BM9U1lvA.js"
Cohesion: 0.07
Nodes (71): H, app_public_assets_icons_buvcj6jz_m, am(), ap(), ax(), Bn, Bx, cx() (+63 more)

### Community 149 - "Concerns, Technical Debt & Watch-Outs — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Database Waterfall Regressions, 2. White Theme CSS Overrides, 3. PWA Service Worker Cache Invalidation, 4. Mobile Keyboard & Viewport Layout Shifts, 5. Razorpay Webhook Idempotency & Webhook Retries, Concerns, Technical Debt & Watch-Outs — GrindLog

### Community 150 - "External Integrations & Services — GrindLog"
Cohesion: 0.25
Nodes (7): 1. Supabase (Database, Auth, Storage), 2. Razorpay (Payment Gateway), 3. Google Gemini AI (@google/genai), 4. PWA Service Worker (Next-PWA & Workbox), 5. Resend (Email Service), 6. Developer Tooling & Agent Workflow Suite, External Integrations & Services — GrindLog

### Community 151 - "Product & Technical Requirements — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Performance & Latency Requirements, 2. Workout & Fitness Requirements, 3. Nutrition & Diet Requirements, 4. Design & Mobile Experience Requirements, 5. Security & Billing Requirements, Product & Technical Requirements — GrindLog

### Community 152 - "uc"
Cohesion: 0.17
Nodes (15): as(), Fn(), gr(), I(), jc(), ju(), pr(), sr() (+7 more)

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 164 - "nutrition-service.ts"
Cohesion: 0.07
Nodes (43): GET(), POST(), DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES, GET(), ALLOWED_MEAL_TYPES (+35 more)

### Community 170 - "Rs"
Cohesion: 0.20
Nodes (9): bf(), Ci(), Gt(), H(), If(), ql(), Rs(), to() (+1 more)

### Community 175 - "dl"
Cohesion: 0.22
Nodes (5): dl(), pl, qi, qn(), yu()

### Community 176 - "ai-insight-card.tsx"
Cohesion: 0.40
Nodes (3): PlanAdjustment, ProgressReview, WeeklyWorkoutStats

### Community 177 - "gsap-C8IefbVz.js"
Cohesion: 0.38
Nodes (4): e(), Ml(), Ol(), tr()

## Knowledge Gaps
- **519 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+514 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 868 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `uc`, `le`, `Ph`, `Ph`, `index-Buds9Sm1.js`, `index-DtLkR01C.js`, `tt`, `ki`, `Ih`, `uc`, `bf`, `index-BM9U1lvA.js`, `hl`, `of`, `Ot`, `Ih`, `uc`, `r`, `il`, `.add`, `ff`, `ee`, `mi`, `zn`, `uc`, `index-CqdT1wea.js`, `bt`, `index-CoRpx3FC.js`, `index-x6K-DhKZ.js`, `Q`, `uc`, `Rs`, `t`, `dl`, `index-B23vSfwu.js`, `et`, `st`, `Pt`, `.get`, `vc`, `uc`, `Ph`, `Ye`, `uf`, `of`, `_0`, `nn`, `bl`, `l`, `rf`, `ve`, `c0`, `Hi`, `r`, `fu`, `nu`, `yf`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `Ph`, `Ph`, `index-DtLkR01C.js`, `tt`, `uc`, `Ih`, `il`, `index-CoRpx3FC.js`, `s`, `index-x6K-DhKZ.js`, `et`, `st`, `l`, `rf`, `sf`, `vc`, `Ye`, `r`, `ve`, `c0`, `B`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `uc`, `_`, `Ph`, `Ph`, `index-DtLkR01C.js`, `Ih`, `il`, `r`, `index-x6K-DhKZ.js`, `Q`, `lf`, `et`, `st`, `Ye`, `vc`, `uf`, `l`, `_0`, `Wh`, `c0`, `B`, `fu`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._