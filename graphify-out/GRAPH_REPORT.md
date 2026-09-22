# Graph Report - web  (2026-09-22)

## Corpus Check
- 407 files · ~3,421,818 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6326 nodes · 22438 edges · 175 communities (164 shown, 11 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b58378f6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- nutrition-view.tsx
- _
- react
- index-B23vSfwu.js
- fitness-plan-profile.ts
- Bi
- Ph
- dx
- index-Buds9Sm1.js
- Ph
- AIPlanAnimation.tsx
- Z
- lucide-react
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
- $h
- r
- .add
- createClient
- ei
- Ye
- n
- ue
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
- r
- st
- nn
- Ye
- Ye
- Ye
- l
- Ye
- types/index.ts
- sf
- (fitness)/page.tsx
- rf
- r
- y0
- onboarding-flow.tsx
- le
- createServerSupabase
- sf
- _0
- F
- grocery-view.tsx
- Ih
- .get
- fitness-notifications.ts
- wf
- vc
- Ta
- ee
- Ui
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
- We
- users-table-client.tsx
- _0
- et
- uc
- l
- import-usda-foundation-foods.mjs
- Ft
- rf
- l
- Ih
- _0
- uc
- zn
- bf
- D0
- c0
- l
- Ph
- prompts.ts
- C
- compilerOptions
- sf
- r
- _0
- bt
- ve
- mi
- ee
- devDependencies
- nu
- manifest.json
- _0
- yf
- sf
- of
- fu
- r
- ee
- fitness-reminders/route.ts
- l
- uc
- openai/client.ts
- bf
- r
- _0
- plan-setup/page.tsx
- hl
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
- profile-content.tsx
- ai-insight-card.tsx
- progression.ts
- dl
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- fitness-shell.tsx
- coach.ts
- package.json
- app/package.json
- firebase-messaging-sw.js
- Data import scripts
- nutrition-service.ts
- rules/graphify.md
- workflows/graphify.md
- scripts
- admin-login/page.tsx
- next-env.d.ts
- dx

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

## Communities (175 total, 11 thin omitted)

### Community 0 - "nutrition-view.tsx"
Cohesion: 0.06
Nodes (44): DailyActivityCard(), DailyActivityCardProps, FitnessDashboardBottom(), FitnessDashboardBottomProps, TodaysGoalsCard(), TodaysGoalsCardProps, formatFoodItem(), TodaysNutritionCard() (+36 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (127): _, aa, ac(), ao(), As, at, Be(), bf() (+119 more)

### Community 2 - "react"
Cohesion: 0.03
Nodes (113): exportUserData(), exportWorkoutHistoryCSV(), completeExerciseSetsAction(), completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction() (+105 more)

### Community 3 - "index-B23vSfwu.js"
Cohesion: 0.08
Nodes (69): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+61 more)

### Community 4 - "fitness-plan-profile.ts"
Cohesion: 0.13
Nodes (31): GenerateGroceryResponseSchema, POST(), GeneratedGroceryItemSchema, AVAILABLE_FOOD_ALIASES, buildGoalCalorieTarget(), cleanText(), expectedMealCount(), FILLER_WORDS (+23 more)

### Community 5 - "Bi"
Cohesion: 0.10
Nodes (29): A0(), an(), as(), bc(), cd(), D(), Es(), Hl() (+21 more)

### Community 6 - "Ph"
Cohesion: 0.05
Nodes (71): Ph(), cd(), cf(), Cn(), dc(), Dl(), Do(), ds() (+63 more)

### Community 7 - "dx"
Cohesion: 0.06
Nodes (62): am(), ap(), ax(), Bn, cx(), de(), Dn(), dx() (+54 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.06
Nodes (60): $, A, b, c(), D, e(), f, g (+52 more)

### Community 9 - "Ph"
Cohesion: 0.05
Nodes (79): Ph(), ad(), br(), cd(), Cn(), cr(), Dl(), ds() (+71 more)

### Community 10 - "AIPlanAnimation.tsx"
Cohesion: 0.13
Nodes (24): AICharacter(), AICharacterProps, AIPlanAnimation(), AIPlanAnimationProps, DEFAULT_FALLBACK_PROFILE, PILL_CONFIGS, PillConfig, ProfileSummary (+16 more)

### Community 11 - "Z"
Cohesion: 0.15
Nodes (16): bs(), ks(), re(), tn(), Vo(), G(), I(), K() (+8 more)

### Community 12 - "lucide-react"
Cohesion: 0.03
Nodes (58): createCouponAction(), toggleCouponStatusAction(), ClientCouponForm(), CopyButton(), AdminCouponsPage(), ToggleCouponButton(), GET(), metadata (+50 more)

### Community 13 - "index-DtLkR01C.js"
Cohesion: 0.04
Nodes (119): $, A, b, c(), D, e(), f, g (+111 more)

### Community 14 - "constants.ts"
Cohesion: 0.06
Nodes (74): GroceryPage(), metadata, ACTIVITY_MULTIPLIERS, AUTHENTIC_INDIAN_RECIPES, AuthenticMealRecipe, BANNED_FOOD_PATTERNS, calculateWaterTarget(), CATEGORY_RETAIL_UNITS (+66 more)

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
Cohesion: 0.08
Nodes (36): POST(), POST(), stableStringify(), stripImagePayload(), POST(), AIStartingReportPage(), displayValue(), dynamic (+28 more)

### Community 19 - "sf"
Cohesion: 0.08
Nodes (41): ai(), bc(), Bd(), Bl(), bm(), Cl(), cm(), Dd() (+33 more)

### Community 20 - "createAdminClient"
Cohesion: 0.03
Nodes (102): getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), checkUserPremiumStatusAction(), claimSpinDiscountAction(), createMessageTopUpOrder() (+94 more)

### Community 21 - "af"
Cohesion: 0.21
Nodes (17): af(), bo(), fs(), hn(), io(), ll(), ms(), _o() (+9 more)

### Community 22 - "rf"
Cohesion: 0.10
Nodes (36): _0(), as(), c0(), cf(), ch(), da(), ds(), Fr() (+28 more)

### Community 23 - "Ih"
Cohesion: 0.05
Nodes (66): Ih(), ai(), bf(), bh(), bm(), Cl(), cm(), cn() (+58 more)

### Community 24 - "il"
Cohesion: 0.06
Nodes (15): n(), Fn(), hu(), il, jr, ma(), mu(), nf() (+7 more)

### Community 25 - "$h"
Cohesion: 0.16
Nodes (24): $h(), ct(), el(), m(), ot(), r(), Re(), y() (+16 more)

### Community 26 - "r"
Cohesion: 0.15
Nodes (40): ai(), b0(), bu(), di(), Do(), eh(), fi(), Fr() (+32 more)

### Community 27 - ".add"
Cohesion: 0.08
Nodes (13): af, Cn(), Gn, Gu(), kl(), _l(), me(), Mn (+5 more)

### Community 28 - "createClient"
Cohesion: 0.11
Nodes (21): approveFitnessPlanAdjustmentAction(), POST(), GET(), FitnessProPage(), metadata, ProfileSubscriptionProps, PricingCard(), PricingCardProps (+13 more)

### Community 29 - "ei"
Cohesion: 0.08
Nodes (39): A0(), ai(), an(), bc(), cd(), Cl(), cm(), D() (+31 more)

### Community 30 - "Ye"
Cohesion: 0.08
Nodes (51): $h(), hx(), C(), E(), _a(), ad(), ar(), bd() (+43 more)

### Community 31 - "n"
Cohesion: 0.15
Nodes (36): ot(), an(), bh(), bu(), di(), eh(), fi(), ft() (+28 more)

### Community 32 - "ue"
Cohesion: 0.15
Nodes (15): ad(), Bt(), ke(), la(), Ln(), mu(), sc(), ud() (+7 more)

### Community 33 - "uc"
Cohesion: 0.10
Nodes (32): a0(), bu(), er(), Fa(), Fn(), ft(), gr(), i0() (+24 more)

### Community 34 - "of"
Cohesion: 0.12
Nodes (31): ao(), At(), c0(), ci(), ee(), ef(), i(), is() (+23 more)

### Community 35 - "l"
Cohesion: 0.06
Nodes (66): ar(), At(), bi(), bo(), ch(), co(), cs(), Ct() (+58 more)

### Community 36 - "dx"
Cohesion: 0.07
Nodes (52): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+44 more)

### Community 37 - "rf"
Cohesion: 0.15
Nodes (26): af(), ao(), fs(), gi(), Kl(), lf(), ls(), ms() (+18 more)

### Community 38 - "of"
Cohesion: 0.11
Nodes (52): ad(), an(), bh(), bo(), di(), ed(), eh(), fi() (+44 more)

### Community 39 - "dx"
Cohesion: 0.07
Nodes (62): am(), ap(), ax(), Bn, cm(), cx(), de(), Dn() (+54 more)

### Community 40 - "r"
Cohesion: 0.11
Nodes (53): ai(), as(), bu(), c0(), di(), Do(), fh(), fi() (+45 more)

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
Nodes (40): maxDuration, POST(), maxDuration, POST(), POST(), POST(), getProfileContext(), maxDuration (+32 more)

### Community 45 - "rf"
Cohesion: 0.15
Nodes (25): af(), ao(), At(), fs(), Hr(), Kl(), lf(), ls() (+17 more)

### Community 46 - "l"
Cohesion: 0.14
Nodes (50): ad(), an(), bo(), di(), eh(), fi(), gd(), l() (+42 more)

### Community 47 - "B"
Cohesion: 0.20
Nodes (23): bd(), Da(), dh(), dt(), ea(), gc(), gh(), hh() (+15 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "schemas.ts"
Cohesion: 0.08
Nodes (30): dynamic, GET(), POST(), revalidate, POST(), POST(), buildFitnessCoachContext(), generateProNutritionLayer() (+22 more)

### Community 50 - "Ih"
Cohesion: 0.04
Nodes (81): Ih(), A0(), ad(), an(), as(), bc(), bh(), Bt() (+73 more)

### Community 51 - "Ot"
Cohesion: 0.06
Nodes (96): am(), ap(), ax(), Bn, cm(), ep(), Ex(), Fx() (+88 more)

### Community 52 - "Qt"
Cohesion: 0.12
Nodes (4): cf, nr(), pa(), Qt()

### Community 53 - "r"
Cohesion: 0.10
Nodes (31): ar(), bi(), bu(), er(), ft(), ge(), hs(), je() (+23 more)

### Community 54 - "st"
Cohesion: 0.15
Nodes (26): T0(), E0(), E0(), T0(), E0(), E0(), E0(), A0() (+18 more)

### Community 55 - "nn"
Cohesion: 0.09
Nodes (11): ar(), en(), ja(), ls(), nn(), Oi(), ol(), ru (+3 more)

### Community 56 - "Ye"
Cohesion: 0.16
Nodes (27): hx(), E(), M(), _a(), ad(), bd(), dh(), dt() (+19 more)

### Community 57 - "Ye"
Cohesion: 0.10
Nodes (39): aa(), ar(), Bt(), bu(), Da(), dh(), dt(), ea() (+31 more)

### Community 58 - "Ye"
Cohesion: 0.17
Nodes (27): Bt(), Da(), dh(), dt(), ea(), fh(), gh(), hh() (+19 more)

### Community 59 - "l"
Cohesion: 0.08
Nodes (54): ar(), At(), bi(), bo(), co(), cs(), df(), eo() (+46 more)

### Community 60 - "Ye"
Cohesion: 0.14
Nodes (29): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+21 more)

### Community 61 - "types/index.ts"
Cohesion: 0.12
Nodes (16): Achievement, AchievementCategory, AIHabitPlan, AIHabitPlanItem, AISession, AISessionType, Habit, HabitCategory (+8 more)

### Community 62 - "sf"
Cohesion: 0.12
Nodes (28): _0(), bc(), Bl(), cd(), Dd(), dn(), fo(), ha() (+20 more)

### Community 63 - "(fitness)/page.tsx"
Cohesion: 0.06
Nodes (30): DashboardBelow(), dynamic, revalidate, dynamic, WorkoutContent(), DashboardSkeleton(), ExerciseLibraryCard(), FitnessDashboard() (+22 more)

### Community 64 - "rf"
Cohesion: 0.13
Nodes (29): af(), ao(), ch(), cn(), fs(), gi(), Kl(), lf() (+21 more)

### Community 65 - "r"
Cohesion: 0.14
Nodes (43): b0(), bu(), di(), Do(), eh(), fi(), Fr(), Gt() (+35 more)

### Community 66 - "y0"
Cohesion: 0.10
Nodes (26): bm(), Dl(), ds(), ea(), $f(), G0(), Ga(), Gf() (+18 more)

### Community 67 - "onboarding-flow.tsx"
Cohesion: 0.08
Nodes (22): saveFitnessOnboardingAction(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_goal (+14 more)

### Community 68 - "le"
Cohesion: 0.10
Nodes (49): ar(), ch(), Ct(), dd(), df(), eo(), hf(), hn() (+41 more)

### Community 69 - "createServerSupabase"
Cohesion: 0.04
Nodes (80): getUserSupportMessages(), submitSupportMessage(), dynamic, POST(), POST(), POST(), deleteR2File(), deleteScanPhotosFromR2() (+72 more)

### Community 70 - "sf"
Cohesion: 0.14
Nodes (15): ah(), Bt(), Fu(), ke(), la(), Ln(), md(), Mi() (+7 more)

### Community 71 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), Gl() (+9 more)

### Community 72 - "F"
Cohesion: 0.09
Nodes (4): F, I, k(), q

### Community 73 - "grocery-view.tsx"
Cohesion: 0.30
Nodes (14): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps, getScaledPrice(), getScaledQuantity() (+6 more)

### Community 74 - "Ih"
Cohesion: 0.05
Nodes (56): Ih(), ah(), b0(), bf(), bm(), Cl(), da(), dc() (+48 more)

### Community 75 - ".get"
Cohesion: 0.19
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "fitness-notifications.ts"
Cohesion: 0.14
Nodes (22): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), getUnreadNotificationsCountAction(), markAllNotificationsAsReadAction() (+14 more)

### Community 77 - "wf"
Cohesion: 0.18
Nodes (15): Ei(), hd(), hf(), Ii(), jf(), Jl(), md(), Mt() (+7 more)

### Community 78 - "vc"
Cohesion: 0.07
Nodes (26): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+18 more)

### Community 79 - "Ta"
Cohesion: 0.09
Nodes (39): A0(), ai(), as(), b0(), bc(), Bd(), Bl(), bm() (+31 more)

### Community 80 - "ee"
Cohesion: 0.16
Nodes (21): c0(), cf(), ci(), ee(), ef(), Fu(), hc(), hi() (+13 more)

### Community 81 - "Ui"
Cohesion: 0.13
Nodes (21): as(), br(), cr(), Fn(), gr(), i0(), id(), Jc() (+13 more)

### Community 82 - "uc"
Cohesion: 0.11
Nodes (30): ds(), er(), Fn(), ft(), gr(), Ic(), ir(), Kn() (+22 more)

### Community 83 - "Ph"
Cohesion: 0.05
Nodes (61): Ph(), A0(), b0(), bh(), bm(), Bt(), cf(), Cl() (+53 more)

### Community 84 - "ku"
Cohesion: 0.11
Nodes (15): df(), hf(), ic(), ku(), lf, _o(), a(), Oo() (+7 more)

### Community 85 - "Ye"
Cohesion: 0.16
Nodes (28): aa(), Da(), dh(), dt(), ea(), gh(), hh(), jd() (+20 more)

### Community 86 - "l"
Cohesion: 0.07
Nodes (58): At(), bi(), bo(), ch(), co(), cs(), Ct(), dd() (+50 more)

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

### Community 92 - "We"
Cohesion: 0.12
Nodes (25): an(), bc(), cd(), D(), E0(), Es(), Hl(), hu() (+17 more)

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
Cohesion: 0.08
Nodes (24): main(), supabase, buildRow(), DEFAULT_JSON_PATH, dryRun, findRecord(), IMPORT_MAP, missing (+16 more)

### Community 99 - "Ft"
Cohesion: 0.21
Nodes (17): _0(), cf(), ci(), ee(), ef(), hc(), hi(), is() (+9 more)

### Community 100 - "rf"
Cohesion: 0.15
Nodes (26): af(), ao(), fs(), gd(), gi(), Kl(), lf(), ls() (+18 more)

### Community 101 - "l"
Cohesion: 0.07
Nodes (72): S, Ba(), t(), bi(), bo(), ch(), co(), cs() (+64 more)

### Community 102 - "Ih"
Cohesion: 0.04
Nodes (79): Ih(), as(), bh(), Bt(), cn(), da(), ed(), er() (+71 more)

### Community 103 - "_0"
Cohesion: 0.20
Nodes (21): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+13 more)

### Community 104 - "uc"
Cohesion: 0.16
Nodes (19): a0(), Fn(), gr(), I(), i0(), jc(), ju(), l0() (+11 more)

### Community 105 - "zn"
Cohesion: 0.15
Nodes (29): _a(), dt(), er(), ft(), gc(), gh(), hh(), Ic() (+21 more)

### Community 106 - "bf"
Cohesion: 0.15
Nodes (14): b0(), bf(), dc(), gu(), Kl(), Kr(), mf(), Pa() (+6 more)

### Community 107 - "D0"
Cohesion: 0.24
Nodes (18): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gl() (+10 more)

### Community 108 - "c0"
Cohesion: 0.12
Nodes (31): ai(), c0(), cm(), Ct(), D0(), df(), fe(), ff() (+23 more)

### Community 109 - "l"
Cohesion: 0.07
Nodes (67): af(), At(), Ba(), t(), bf(), bi(), ch(), co() (+59 more)

### Community 110 - "Ph"
Cohesion: 0.04
Nodes (88): Ph(), A0(), ai(), ao(), bc(), bh(), bm(), cd() (+80 more)

### Community 111 - "prompts.ts"
Cohesion: 0.28
Nodes (16): addUnique(), budgetPlanningReference(), buildCompactPlanProfile(), buildFitnessPlanPrompt(), buildPlanReportInsights(), buildPlanSafetyBrief(), compactList(), compactText() (+8 more)

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

### Community 117 - "bt"
Cohesion: 0.11
Nodes (35): ao(), c0(), ci(), dn(), ee(), ef(), ha(), hc() (+27 more)

### Community 118 - "ve"
Cohesion: 0.12
Nodes (35): ci(), D0(), Dl(), dn(), ee(), ef(), Ei(), fe() (+27 more)

### Community 119 - "mi"
Cohesion: 0.27
Nodes (15): c0(), cf(), ci(), ee(), ef(), is(), lo(), ml() (+7 more)

### Community 120 - "ee"
Cohesion: 0.31
Nodes (13): c0(), cf(), ci(), ee(), ef(), is(), lo(), ml() (+5 more)

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

### Community 126 - "sf"
Cohesion: 0.13
Nodes (18): Fu(), I(), Il(), jc(), ke(), la(), lh(), md() (+10 more)

### Community 127 - "of"
Cohesion: 0.10
Nodes (31): ao(), At(), ci(), co(), cs(), ee(), ef(), e() (+23 more)

### Community 128 - "fu"
Cohesion: 0.09
Nodes (30): bm(), Dl(), ds(), ea(), $f(), G0(), Ga(), Gf() (+22 more)

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
Cohesion: 0.12
Nodes (23): br(), cr(), Fn(), i0(), id(), Jc(), ju(), Kn() (+15 more)

### Community 134 - "openai/client.ts"
Cohesion: 0.33
Nodes (7): GET(), FITNESS_PLAN_SYSTEM_PROMPT, generateOpenAIResponseJSON(), getOpenAIClient(), OPENAI_MODEL, openai, test()

### Community 135 - "bf"
Cohesion: 0.20
Nodes (10): bf(), dc(), gu(), jh(), Kr(), O0(), Pu(), sd() (+2 more)

### Community 136 - "r"
Cohesion: 0.14
Nodes (45): b0(), bu(), di(), Do(), eh(), fi(), Fr(), gs() (+37 more)

### Community 137 - "_0"
Cohesion: 0.19
Nodes (21): _0(), D0(), df(), Do(), en(), fe(), ff(), Gl() (+13 more)

### Community 138 - "plan-setup/page.tsx"
Cohesion: 0.13
Nodes (23): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+15 more)

### Community 139 - "hl"
Cohesion: 0.12
Nodes (28): Ct(), dd(), Fu(), hf(), hn(), Ii(), jf(), Jl() (+20 more)

### Community 140 - "wf"
Cohesion: 0.22
Nodes (10): aa(), Ei(), hd(), ke(), Mi(), Qc(), wd(), wf() (+2 more)

### Community 141 - "r"
Cohesion: 0.14
Nodes (28): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+20 more)

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
Nodes (43): _a(), af(), bf(), ch(), Dl(), Do(), ds(), en() (+35 more)

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

### Community 152 - "profile-content.tsx"
Cohesion: 0.04
Nodes (52): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem (+44 more)

### Community 153 - "ai-insight-card.tsx"
Cohesion: 0.40
Nodes (3): PlanAdjustment, ProgressReview, WeeklyWorkoutStats

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
Cohesion: 0.06
Nodes (35): CustomExercisePage(), metadata, ExercisesPage(), metadata, ProfileLoading(), ProgressLoading(), FitnessChatbot(), Message (+27 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 161 - "app/package.json"
Cohesion: 0.04
Nodes (48): generateAIResponse(), generateAIResponseJSON(), getGroqApiKeys(), getGroqClient(), getGroqClientForKey(), GROQ_MODELS, groqClients, RouteModel (+40 more)

### Community 164 - "nutrition-service.ts"
Cohesion: 0.08
Nodes (41): GET(), POST(), DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES, GET(), ALLOWED_MEAL_TYPES (+33 more)

### Community 168 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, import:usda, lint, start, type-check

### Community 169 - "admin-login/page.tsx"
Cohesion: 0.70
Nodes (3): loginAdminAction(), AdminLogin(), handleSubmit()

### Community 175 - "dx"
Cohesion: 0.09
Nodes (31): e(), Ml(), Ol(), tr(), de(), Dn(), dx(), El() (+23 more)

## Knowledge Gaps
- **532 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+527 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 883 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `fu`, `index-B23vSfwu.js`, `uc`, `Bi`, `Ph`, `index-Buds9Sm1.js`, `Ph`, `Z`, `hl`, `index-DtLkR01C.js`, `he`, `of`, `il`, `$h`, `.add`, `dl`, `ei`, `uc`, `dx`, `of`, `index-Cq6kntJJ.js`, `pr`, `dx`, `Ih`, `Ot`, `Qt`, `r`, `st`, `nn`, `Ye`, `sf`, `le`, `.get`, `vc`, `Ta`, `Ui`, `uc`, `ku`, `tt`, `et`, `uc`, `Ft`, `l`, `Ih`, `_0`, `uc`, `zn`, `l`, `Ph`, `bt`, `ve`, `mi`, `nu`, `yf`, `of`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `fu`, `_`, `index-B23vSfwu.js`, `Bi`, `Ph`, `bf`, `r`, `he`, `dx`, `ei`, `l`, `pr`, `B`, `st`, `Ye`, `_0`, `vc`, `ku`, `et`, `rf`, `ee`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `index-B23vSfwu.js`, `l`, `Bi`, `Ph`, `he`, `We`, `rf`, `ei`, `uc`, `dx`, `B`, `Ot`, `st`, `sf`, `vc`, `ku`, `Ye`, `et`, `bf`, `r`, `ve`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._