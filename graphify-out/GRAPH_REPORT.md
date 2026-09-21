# Graph Report - web  (2026-09-21)

## Corpus Check
- 402 files · ~3,418,967 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6300 nodes · 22362 edges · 182 communities (168 shown, 14 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3e28d0d7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- uf
- _
- fitness.ts
- fitness-plan-profile.ts
- bt
- createServerSupabase
- Ph
- Ph
- index-Buds9Sm1.js
- Ph
- motion
- le
- progress-view.tsx
- index-DtLkR01C.js
- constants.ts
- index-B23vSfwu.js
- Ih
- uc
- analyze/route.ts
- app/package.json
- createAdminClient
- Ih
- Ot
- uc
- il
- $h
- r
- .add
- of
- uf
- l
- rf
- l
- y0
- access.ts
- l
- Qe
- lf
- n
- Qe
- r
- _c
- _f
- r
- generate-draft/route.ts
- lf
- l
- sf
- dependencies
- Ye
- r0
- dx
- et
- n
- y0
- Qe
- Ye
- B
- st
- l
- r
- je
- rf
- Ih
- rf
- r
- uc
- onboarding-flow.tsx
- Ye
- prompts.ts
- r
- fu
- F
- AIPlanAnimation.tsx
- Ih
- .get
- fitness-notifications.ts
- Ye
- vc
- of
- r0
- Wh
- uc
- Ph
- dx
- Ye
- sf
- Ye
- sf
- r
- reminders-client.tsx
- ee
- sf
- devDependencies
- _0
- tu
- lf
- Wh
- import-usda-foundation-foods.mjs
- users-table-client.tsx
- n
- l
- Ih
- _0
- he
- E
- ee
- D0
- c0
- l
- tt
- grocery-view.tsx
- Ye
- compilerOptions
- uc
- t
- _0
- $h
- D0
- C
- ve
- sf
- nu
- manifest.json
- _0
- yf
- types/index.ts
- sf
- (fitness)/page.tsx
- wf
- ox
- fitness-reminders/route.ts
- M0
- Wh
- l
- af
- r
- r
- grocery-tab.tsx
- ue
- lucide-react
- Ta
- ue
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- af
- index-BM9U1lvA.js
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- ya
- yf
- progression.ts
- bf
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- Coding Conventions & Standards — GrindLog
- coach.ts
- package.json
- Q
- firebase-messaging-sw.js
- Data import scripts
- nutrition-service.ts
- rules/graphify.md
- workflows/graphify.md
- scripts
- wf
- admin-login/page.tsx
- next-env.d.ts
- ax
- ai-insight-card.tsx
- gsap-C8IefbVz.js
- Ms
- Mc

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
- `Naming & File Conventions` --references--> `BottomNav()`  [INFERRED]
  .planning/codebase/STRUCTURE.md → app/components/fitness/dashboard/bottom-nav.tsx
- `Recent Decisions` --references--> `FitnessLayout()`  [INFERRED]
  .planning/STATE.md → app/app/(fitness)/layout.tsx

## Import Cycles
- None detected.

## Communities (182 total, 14 thin omitted)

### Community 0 - "uf"
Cohesion: 0.07
Nodes (45): A0(), ai(), an(), bc(), cd(), Cl(), cm(), D() (+37 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (122): _, aa, ac(), al(), ao(), As, at, Be() (+114 more)

### Community 2 - "fitness.ts"
Cohesion: 0.03
Nodes (94): completeExerciseSetsAction(), completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), reopenWorkoutAction(), resetWorkoutTimerAction() (+86 more)

### Community 3 - "fitness-plan-profile.ts"
Cohesion: 0.14
Nodes (30): GenerateGroceryResponseSchema, POST(), AVAILABLE_FOOD_ALIASES, buildGoalCalorieTarget(), cleanText(), expectedMealCount(), FILLER_WORDS, getPlanNutritionTargets() (+22 more)

### Community 4 - "bt"
Cohesion: 0.08
Nodes (54): _0(), as(), c0(), cd(), cf(), ch(), ci(), da() (+46 more)

### Community 5 - "createServerSupabase"
Cohesion: 0.03
Nodes (96): exportUserData(), exportWorkoutHistoryCSV(), quickCompleteWorkoutAction(), getUserSupportMessages(), submitSupportMessage(), dynamic, POST(), POST() (+88 more)

### Community 6 - "Ph"
Cohesion: 0.04
Nodes (76): Ih(), Ph(), A0(), ai(), as(), b0(), bh(), cd() (+68 more)

### Community 7 - "Ph"
Cohesion: 0.04
Nodes (93): Ph(), A0(), ai(), bc(), bf(), bh(), cd(), Cl() (+85 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.12
Nodes (30): $, A, b, c(), D, e(), f, g (+22 more)

### Community 9 - "Ph"
Cohesion: 0.05
Nodes (75): Ph(), bc(), Bd(), bh(), Bl(), bm(), cd(), cf() (+67 more)

### Community 10 - "motion"
Cohesion: 0.04
Nodes (48): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem (+40 more)

### Community 11 - "le"
Cohesion: 0.11
Nodes (43): b0(), bf(), Ct(), dc(), dd(), df(), eo(), gu() (+35 more)

### Community 12 - "progress-view.tsx"
Cohesion: 0.05
Nodes (59): GET(), POST(), GET(), POST(), app_assets_images_placeholder_goal, AchievementsShowcase(), ActivityRecoveryAnalyticsCard(), AIProgressReviewCard() (+51 more)

### Community 13 - "index-DtLkR01C.js"
Cohesion: 0.03
Nodes (136): $, A, b, c(), D, e(), f, g (+128 more)

### Community 14 - "constants.ts"
Cohesion: 0.06
Nodes (72): GroceryPage(), ACTIVITY_MULTIPLIERS, AUTHENTIC_INDIAN_RECIPES, AuthenticMealRecipe, BANNED_FOOD_PATTERNS, calculateWaterTarget(), CATEGORY_RETAIL_UNITS, CORE_MEAL_TYPES (+64 more)

### Community 15 - "index-B23vSfwu.js"
Cohesion: 0.05
Nodes (92): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+84 more)

### Community 16 - "Ih"
Cohesion: 0.04
Nodes (79): Ih(), a0(), ad(), an(), bc(), Cl(), cn(), E0() (+71 more)

### Community 17 - "uc"
Cohesion: 0.10
Nodes (33): a0(), bu(), er(), Fa(), Fn(), ft(), gr(), i0() (+25 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.09
Nodes (30): POST(), POST(), stableStringify(), stripImagePayload(), POST(), BODY_SCAN_RESPONSE_INSTRUCTIONS, BodyScanAnalysis, BodyScanAnalysisSchema (+22 more)

### Community 19 - "app/package.json"
Cohesion: 0.05
Nodes (39): config, updateSession(), config, middleware(), config, filteredRuntimeCaching, nextConfig, framer-motion (+31 more)

### Community 20 - "createAdminClient"
Cohesion: 0.04
Nodes (79): createCouponAction(), toggleCouponStatusAction(), getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), checkUserPremiumStatusAction() (+71 more)

### Community 21 - "Ih"
Cohesion: 0.06
Nodes (53): Ih(), as(), ds(), er(), Es(), Fa(), Fn(), ft() (+45 more)

### Community 22 - "Ot"
Cohesion: 0.08
Nodes (78): Xx(), Yx(), Xx(), Yx(), ap(), ep(), ip(), ix() (+70 more)

### Community 23 - "uc"
Cohesion: 0.09
Nodes (37): as(), bu(), er(), Fn(), ft(), gr(), I(), Ic() (+29 more)

### Community 24 - "il"
Cohesion: 0.06
Nodes (13): du(), Fn(), hu(), il, jr, ma(), mu(), nl() (+5 more)

### Community 25 - "$h"
Cohesion: 0.27
Nodes (13): $h(), ct(), el(), m(), r(), Re(), y(), zt() (+5 more)

### Community 26 - "r"
Cohesion: 0.13
Nodes (44): af(), b0(), bh(), bu(), di(), Do(), eh(), fi() (+36 more)

### Community 27 - ".add"
Cohesion: 0.09
Nodes (12): af, Cn(), Gn, Gu(), kl(), _l(), me(), Mn (+4 more)

### Community 28 - "of"
Cohesion: 0.10
Nodes (39): ao(), cf(), ci(), ed(), ee(), ef(), Fu(), ha() (+31 more)

### Community 29 - "uf"
Cohesion: 0.08
Nodes (44): as(), c0(), cf(), ci(), dn(), ds(), ee(), ef() (+36 more)

### Community 30 - "l"
Cohesion: 0.08
Nodes (54): At(), bi(), bo(), ch(), co(), cs(), df(), eo() (+46 more)

### Community 31 - "rf"
Cohesion: 0.17
Nodes (23): af(), ao(), At(), fs(), Kl(), lf(), ls(), ms() (+15 more)

### Community 32 - "l"
Cohesion: 0.12
Nodes (55): ad(), an(), bo(), di(), eh(), fi(), gd(), e() (+47 more)

### Community 33 - "y0"
Cohesion: 0.09
Nodes (28): bm(), Dl(), ea(), $f(), G0(), Ga(), Gf(), If() (+20 more)

### Community 34 - "access.ts"
Cohesion: 0.06
Nodes (51): approveFitnessPlanAdjustmentAction(), dynamic, GET(), POST(), revalidate, POST(), POST(), GET() (+43 more)

### Community 35 - "l"
Cohesion: 0.11
Nodes (40): ar(), bi(), bo(), co(), cs(), df(), eo(), fo() (+32 more)

### Community 36 - "Qe"
Cohesion: 0.11
Nodes (37): am(), ap(), ax(), Bn, ep(), Ex(), Fx(), Gx() (+29 more)

### Community 37 - "lf"
Cohesion: 0.13
Nodes (26): ao(), fs(), gi(), K0(), Kf(), Le(), t(), lf() (+18 more)

### Community 38 - "n"
Cohesion: 0.15
Nodes (38): $h(), ct(), el(), g(), m(), ot(), Re(), zt() (+30 more)

### Community 39 - "Qe"
Cohesion: 0.12
Nodes (34): am(), ap(), ax(), Bn, cm(), El(), ep(), Ex() (+26 more)

### Community 40 - "r"
Cohesion: 0.09
Nodes (54): as(), c0(), di(), fi(), Fr(), ge(), Gt(), hd() (+46 more)

### Community 41 - "_c"
Cohesion: 0.08
Nodes (48): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+40 more)

### Community 42 - "_f"
Cohesion: 0.28
Nodes (6): Ae(), br(), cr, _f(), Un, Xo

### Community 43 - "r"
Cohesion: 0.12
Nodes (27): aa(), ar(), Bt(), ge(), hd(), ju(), ke(), Ln() (+19 more)

### Community 44 - "generate-draft/route.ts"
Cohesion: 0.08
Nodes (63): GET(), maxDuration, POST(), maxDuration, POST(), POST(), POST(), getProfileContext() (+55 more)

### Community 45 - "lf"
Cohesion: 0.19
Nodes (19): ao(), fs(), gi(), Kf(), lf(), ms(), no(), _o() (+11 more)

### Community 46 - "l"
Cohesion: 0.07
Nodes (59): At(), bf(), bi(), bo(), ch(), co(), cs(), en() (+51 more)

### Community 47 - "sf"
Cohesion: 0.16
Nodes (15): aa(), ad(), Bt(), ke(), Ln(), md(), Mi(), sc() (+7 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "Ye"
Cohesion: 0.17
Nodes (25): hx(), C(), E(), _a(), bd(), dh(), dt(), fh() (+17 more)

### Community 50 - "r0"
Cohesion: 0.11
Nodes (22): ah(), bm(), Dl(), ds(), ea(), $f(), G0(), Ga() (+14 more)

### Community 51 - "dx"
Cohesion: 0.08
Nodes (47): am(), ap(), ax(), Bn, cm(), de(), Dn(), dx() (+39 more)

### Community 52 - "et"
Cohesion: 0.04
Nodes (22): Bl(), Bl(), Bl(), bm(), Bl(), rr(), Bl(), rr() (+14 more)

### Community 53 - "n"
Cohesion: 0.16
Nodes (35): ot(), an(), b0(), bh(), di(), eh(), fi(), go() (+27 more)

### Community 54 - "y0"
Cohesion: 0.09
Nodes (28): bm(), Dl(), ea(), $f(), G0(), Ga(), Gf(), If() (+20 more)

### Community 55 - "Qe"
Cohesion: 0.17
Nodes (27): ap(), Bn(), Bx, ep(), ex(), o(), Ha, ip() (+19 more)

### Community 56 - "Ye"
Cohesion: 0.11
Nodes (35): hx(), E(), M(), _a(), ad(), bd(), Bt(), dh() (+27 more)

### Community 57 - "B"
Cohesion: 0.14
Nodes (41): Da(), dt(), ea(), gc(), gh(), hh(), jd(), mh() (+33 more)

### Community 58 - "st"
Cohesion: 0.11
Nodes (32): T0(), E0(), bo(), E0(), on(), qo(), T0(), E0() (+24 more)

### Community 59 - "l"
Cohesion: 0.11
Nodes (39): ar(), At(), Ct(), dd(), df(), eo(), hf(), hn() (+31 more)

### Community 60 - "r"
Cohesion: 0.14
Nodes (41): af(), ai(), bu(), di(), Do(), fi(), ft(), gs() (+33 more)

### Community 61 - "je"
Cohesion: 0.11
Nodes (33): af(), bi(), co(), cs(), fs(), gi(), hs(), io() (+25 more)

### Community 62 - "rf"
Cohesion: 0.10
Nodes (34): af(), ao(), At(), da(), fs(), gi(), go(), Ia() (+26 more)

### Community 63 - "Ih"
Cohesion: 0.06
Nodes (55): Ih(), as(), ds(), er(), Es(), Fa(), Fn(), ft() (+47 more)

### Community 64 - "rf"
Cohesion: 0.12
Nodes (37): af(), ao(), bi(), bo(), ch(), Do(), fo(), fs() (+29 more)

### Community 65 - "r"
Cohesion: 0.10
Nodes (55): af(), b0(), bh(), bu(), cn(), da(), di(), Do() (+47 more)

### Community 66 - "uc"
Cohesion: 0.15
Nodes (18): ad(), br(), cr(), Fn(), go(), gs(), id(), Kn() (+10 more)

### Community 67 - "onboarding-flow.tsx"
Cohesion: 0.08
Nodes (23): saveFitnessOnboardingAction(), dynamic, OnboardingPage(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female (+15 more)

### Community 68 - "Ye"
Cohesion: 0.17
Nodes (25): hx(), C(), E(), _a(), bd(), dh(), dt(), fh() (+17 more)

### Community 69 - "prompts.ts"
Cohesion: 0.31
Nodes (14): addUnique(), budgetPlanningReference(), buildCompactPlanProfile(), buildPlanReportInsights(), buildPlanSafetyBrief(), compactList(), compactText(), getPlanStartDate() (+6 more)

### Community 70 - "r"
Cohesion: 0.09
Nodes (34): ad(), as(), Bd(), br(), cr(), Fn(), gd(), ge() (+26 more)

### Community 71 - "fu"
Cohesion: 0.06
Nodes (45): A0(), an(), bc(), cd(), Cl(), cm(), D(), Es() (+37 more)

### Community 72 - "F"
Cohesion: 0.09
Nodes (4): F, I, k(), q

### Community 73 - "AIPlanAnimation.tsx"
Cohesion: 0.09
Nodes (36): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+28 more)

### Community 74 - "Ih"
Cohesion: 0.05
Nodes (72): Ih(), ad(), an(), b0(), bc(), bf(), Bt(), cd() (+64 more)

### Community 75 - ".get"
Cohesion: 0.19
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "fitness-notifications.ts"
Cohesion: 0.16
Nodes (20): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), getUnreadNotificationsCountAction(), markAllNotificationsAsReadAction() (+12 more)

### Community 77 - "Ye"
Cohesion: 0.16
Nodes (24): _a(), bh(), dt(), Fu(), gc(), gh(), hh(), jd() (+16 more)

### Community 78 - "vc"
Cohesion: 0.05
Nodes (38): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+30 more)

### Community 79 - "of"
Cohesion: 0.07
Nodes (57): ao(), At(), bc(), bo(), c0(), cf(), ci(), Dd() (+49 more)

### Community 80 - "r0"
Cohesion: 0.11
Nodes (25): ah(), bm(), ea(), $f(), G0(), Ga(), Gf(), If() (+17 more)

### Community 81 - "Wh"
Cohesion: 0.14
Nodes (25): $h(), hx(), E(), M(), bd(), D(), dh(), hu() (+17 more)

### Community 82 - "uc"
Cohesion: 0.08
Nodes (35): as(), br(), bu(), cr(), er(), Fn(), ft(), gr() (+27 more)

### Community 83 - "Ph"
Cohesion: 0.05
Nodes (68): Ph(), _a(), ar(), bm(), Bt(), bu(), Ct(), dc() (+60 more)

### Community 84 - "dx"
Cohesion: 0.17
Nodes (25): dx(), $h(), hx(), E(), M(), bd(), D(), dh() (+17 more)

### Community 85 - "Ye"
Cohesion: 0.17
Nodes (24): Da(), dh(), dt(), ea(), gh(), hh(), jd(), Ln() (+16 more)

### Community 86 - "sf"
Cohesion: 0.14
Nodes (21): bf(), Ct(), dc(), dd(), gu(), Ii(), Je(), Jl() (+13 more)

### Community 87 - "Ye"
Cohesion: 0.15
Nodes (26): _a(), ar(), bh(), Bt(), dt(), gc(), gh(), hh() (+18 more)

### Community 88 - "sf"
Cohesion: 0.14
Nodes (21): bf(), Ct(), dc(), dd(), gu(), Ii(), Je(), Jl() (+13 more)

### Community 89 - "r"
Cohesion: 0.16
Nodes (37): S, ot(), an(), b0(), bu(), di(), Do(), eh() (+29 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.13
Nodes (21): updateRemindersAction(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS, REMINDER_TYPES, ReminderTypeSheet() (+13 more)

### Community 91 - "ee"
Cohesion: 0.16
Nodes (22): _0(), cf(), ci(), cs(), ee(), ef(), gs(), ho() (+14 more)

### Community 92 - "sf"
Cohesion: 0.08
Nodes (47): A0(), ai(), ao(), c0(), ci(), Cl(), cm(), Dd() (+39 more)

### Community 93 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 94 - "_0"
Cohesion: 0.25
Nodes (18): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), Gl() (+10 more)

### Community 95 - "tu"
Cohesion: 0.06
Nodes (13): ar(), en(), H(), ja(), ls(), nn(), Oi(), ol() (+5 more)

### Community 96 - "lf"
Cohesion: 0.32
Nodes (12): ao(), fs(), gi(), lf(), ms(), no(), os(), Rl() (+4 more)

### Community 97 - "Wh"
Cohesion: 0.27
Nodes (14): $h(), w(), X(), r(), rx(), Wh(), ct(), el() (+6 more)

### Community 98 - "import-usda-foundation-foods.mjs"
Cohesion: 0.11
Nodes (18): buildRow(), DEFAULT_JSON_PATH, dryRun, findRecord(), IMPORT_MAP, missing, nutrient(), payload (+10 more)

### Community 99 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 100 - "n"
Cohesion: 0.10
Nodes (12): bo(), n(), Co(), Fi(), nf(), pl, qi, qn() (+4 more)

### Community 101 - "l"
Cohesion: 0.09
Nodes (51): ar(), Ba(), t(), bi(), ch(), Ct(), dd(), df() (+43 more)

### Community 102 - "Ih"
Cohesion: 0.06
Nodes (51): Ih(), bf(), bh(), bm(), cn(), dc(), ds(), ea() (+43 more)

### Community 103 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), Gl() (+9 more)

### Community 104 - "he"
Cohesion: 0.12
Nodes (26): bs(), bs(), $h(), ct(), el(), g(), m(), r() (+18 more)

### Community 105 - "E"
Cohesion: 0.31
Nodes (11): r(), mx(), ic(), Il(), nc(), ud(), w(), z() (+3 more)

### Community 106 - "ee"
Cohesion: 0.23
Nodes (16): c0(), cf(), ci(), ee(), ef(), Fu(), is(), lo() (+8 more)

### Community 107 - "D0"
Cohesion: 0.16
Nodes (25): ai(), Cl(), D0(), dn(), Ei(), fe(), ff(), Fl() (+17 more)

### Community 108 - "c0"
Cohesion: 0.17
Nodes (23): c0(), Cl(), D0(), df(), fe(), ff(), Gl(), Gn() (+15 more)

### Community 109 - "l"
Cohesion: 0.09
Nodes (49): Ba(), t(), bf(), bi(), ch(), Ct(), eo(), gd() (+41 more)

### Community 110 - "tt"
Cohesion: 0.17
Nodes (26): ui(), ui(), co(), cs(), of(), oo(), q0(), ro() (+18 more)

### Community 111 - "grocery-view.tsx"
Cohesion: 0.27
Nodes (15): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps, getScaledPrice() (+7 more)

### Community 112 - "Ye"
Cohesion: 0.19
Nodes (23): Bt(), Da(), dh(), dt(), ea(), gh(), hh(), jd() (+15 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "uc"
Cohesion: 0.10
Nodes (30): bd(), dh(), fh(), Fn(), gr(), Il(), ju(), Kc() (+22 more)

### Community 115 - "t"
Cohesion: 0.11
Nodes (31): At(), bi(), bo(), co(), cs(), fo(), ho(), hs() (+23 more)

### Community 116 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), df(), Ei(), fe(), Gl(), Gn(), Lu() (+8 more)

### Community 117 - "$h"
Cohesion: 0.16
Nodes (24): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+16 more)

### Community 118 - "D0"
Cohesion: 0.15
Nodes (25): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gl() (+17 more)

### Community 120 - "ve"
Cohesion: 0.12
Nodes (38): _0(), c0(), cf(), ci(), D0(), Dl(), dn(), ee() (+30 more)

### Community 121 - "sf"
Cohesion: 0.15
Nodes (19): Ct(), dd(), Fu(), Ii(), Jl(), ke(), la(), md() (+11 more)

### Community 122 - "nu"
Cohesion: 0.09
Nodes (11): u0(), eu(), gf, ir(), jf(), nu, qu(), Rn() (+3 more)

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "_0"
Cohesion: 0.24
Nodes (18): _0(), D0(), Ei(), fe(), ff(), gd(), Gl(), Gn() (+10 more)

### Community 125 - "yf"
Cohesion: 0.15
Nodes (9): bn, dc(), hc, kc(), lc, mf(), ro, vf() (+1 more)

### Community 126 - "types/index.ts"
Cohesion: 0.12
Nodes (16): Achievement, AchievementCategory, AIHabitPlan, AIHabitPlanItem, AISession, AISessionType, Habit, HabitCategory (+8 more)

### Community 127 - "sf"
Cohesion: 0.07
Nodes (47): _0(), A0(), ai(), bc(), Bl(), cd(), cm(), D() (+39 more)

### Community 128 - "(fitness)/page.tsx"
Cohesion: 0.22
Nodes (6): DashboardSkeleton(), FitnessDashboard(), FitnessLandingPage(), SAMPLE_FREE_PLAN, SAMPLE_FREE_WEEK_DAYS, SAMPLE_FREE_WORKOUT

### Community 129 - "wf"
Cohesion: 0.15
Nodes (17): aa(), Ba(), t(), Ct(), Ei(), hd(), hf(), Ii() (+9 more)

### Community 130 - "ox"
Cohesion: 0.17
Nodes (15): de(), Dn(), Dx(), El(), It(), On(), ox(), re() (+7 more)

### Community 131 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 132 - "M0"
Cohesion: 0.11
Nodes (27): A0(), ai(), an(), bc(), cd(), Cl(), cm(), D() (+19 more)

### Community 133 - "Wh"
Cohesion: 0.27
Nodes (14): $h(), w(), X(), r(), rx(), Wh(), ct(), el() (+6 more)

### Community 134 - "l"
Cohesion: 0.07
Nodes (57): At(), bi(), bo(), ch(), cn(), co(), cs(), df() (+49 more)

### Community 135 - "af"
Cohesion: 0.26
Nodes (15): af(), fs(), hn(), io(), ll(), ms(), no(), _o() (+7 more)

### Community 136 - "r"
Cohesion: 0.16
Nodes (37): ai(), b0(), di(), Do(), eh(), fi(), Fr(), Gt() (+29 more)

### Community 137 - "r"
Cohesion: 0.11
Nodes (37): _0(), ar(), At(), b0(), D0(), df(), fe(), ff() (+29 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 139 - "ue"
Cohesion: 0.16
Nodes (15): ad(), ar(), Bt(), ed(), Jn(), ke(), la(), Ln() (+7 more)

### Community 140 - "lucide-react"
Cohesion: 0.02
Nodes (94): toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), ResetPasswordPage(), FIELD_CONFIGS, FieldConfig, LogMeasurementsPage(), LogWeightPage(), RecentLog (+86 more)

### Community 141 - "Ta"
Cohesion: 0.08
Nodes (39): Bd(), Bl(), bm(), Dl(), ds(), ed(), $f(), G0() (+31 more)

### Community 142 - "ue"
Cohesion: 0.16
Nodes (15): ad(), ar(), Bt(), ed(), Jn(), ke(), la(), Ln() (+7 more)

### Community 143 - "Key Architectural Patterns"
Cohesion: 0.22
Nodes (8): 1. Parallel Batching vs. Sequential Waterfalls, 2. In-Memory Calendar & Status Math, 3. Immediate Suspense Streaming, 4. Router Caching & Optimistic Tab Transitions, 5. Theme Architecture (Dark & White), Architectural Overview, Architecture & Data Flow — GrindLog, Key Architectural Patterns

### Community 144 - "Technology Stack — GrindLog"
Cohesion: 0.22
Nodes (8): AI & LLM Integrations, Core Runtime & Framework, Data Layer & State, Mobile & PWA, Payments & Subscriptions, Styling & Design System, Technology Stack — GrindLog, Utilities & Validation

### Community 145 - "Critical Test Flows"
Cohesion: 0.22
Nodes (8): 1. Tab Navigation & Instant Switching, 2. Dual-Theme Verification (Dark vs. White), 3. Workout Logging & State Persistence, 4. Nutrition & Calorie Tracking, 5. Authentication & Subscription Guard Rails, Critical Test Flows, Testing & Verification Guide — GrindLog, Verification Commands

### Community 146 - "af"
Cohesion: 0.32
Nodes (13): af(), fs(), hn(), io(), _o(), os(), qt(), Rl() (+5 more)

### Community 147 - "index-BM9U1lvA.js"
Cohesion: 0.08
Nodes (68): am(), ap(), ax(), Bn, Bx, cx(), de(), Dn() (+60 more)

### Community 149 - "Concerns, Technical Debt & Watch-Outs — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Database Waterfall Regressions, 2. White Theme CSS Overrides, 3. PWA Service Worker Cache Invalidation, 4. Mobile Keyboard & Viewport Layout Shifts, 5. Razorpay Webhook Idempotency & Webhook Retries, Concerns, Technical Debt & Watch-Outs — GrindLog

### Community 150 - "External Integrations & Services — GrindLog"
Cohesion: 0.25
Nodes (7): 1. Supabase (Database, Auth, Storage), 2. Razorpay (Payment Gateway), 3. Google Gemini AI (@google/genai), 4. PWA Service Worker (Next-PWA & Workbox), 5. Resend (Email Service), 6. Developer Tooling & Agent Workflow Suite, External Integrations & Services — GrindLog

### Community 151 - "Product & Technical Requirements — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Performance & Latency Requirements, 2. Workout & Fitness Requirements, 3. Nutrition & Diet Requirements, 4. Design & Mobile Experience Requirements, 5. Security & Billing Requirements, Product & Technical Requirements — GrindLog

### Community 152 - "ya"
Cohesion: 0.21
Nodes (18): c0(), cf(), ci(), ee(), ef(), Fu(), is(), lo() (+10 more)

### Community 153 - "yf"
Cohesion: 0.29
Nodes (12): ch(), hf(), hn(), jf(), jt(), Kt(), mn(), Na() (+4 more)

### Community 155 - "bf"
Cohesion: 0.24
Nodes (12): bf(), ch(), Dl(), eo(), hn(), jt(), Kt(), mf() (+4 more)

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 158 - "Coding Conventions & Standards — GrindLog"
Cohesion: 0.15
Nodes (10): 1. Performance Standards (Mobile 60fps Target), 2. Design System & Theming, 3. Server vs. Client Boundary Rules, 4. TypeScript & Error Handling, Coding Conventions & Standards — GrindLog, Phase 1: Core Performance & Tab Optimization [COMPLETED], Phase 2: Nutrition & Food Logging Enhancements [UPCOMING], Phase 3: Workout Audio, Haptics & Offline Sync [PLANNED] (+2 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 161 - "Q"
Cohesion: 0.18
Nodes (11): x0(), r0(), G0(), r0(), G0(), r0(), r0(), r0() (+3 more)

### Community 164 - "nutrition-service.ts"
Cohesion: 0.05
Nodes (57): GET(), POST(), DELETE(), DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES, GET() (+49 more)

### Community 168 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, import:usda, lint, start, type-check

### Community 169 - "wf"
Cohesion: 0.22
Nodes (10): aa(), Ei(), hd(), ke(), Qc(), wd(), wf(), zd() (+2 more)

### Community 170 - "admin-login/page.tsx"
Cohesion: 0.32
Nodes (4): loginAdminAction(), AdminLogin(), handleSubmit(), HorizontalWorkoutListProps

### Community 175 - "ax"
Cohesion: 0.29
Nodes (7): am(), ax(), cx(), fx(), nx(), rx(), sm()

### Community 176 - "ai-insight-card.tsx"
Cohesion: 0.40
Nodes (3): PlanAdjustment, ProgressReview, WeeklyWorkoutStats

### Community 177 - "gsap-C8IefbVz.js"
Cohesion: 0.32
Nodes (5): e(), Ml(), Ol(), tr(), xa

### Community 178 - "Ms"
Cohesion: 0.40
Nodes (6): go(), gs(), po(), xo(), Ms(), rt

### Community 179 - "Mc"
Cohesion: 0.67
Nodes (3): Jd(), Mc(), ux()

## Knowledge Gaps
- **524 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+519 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 877 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `bt`, `Ph`, `index-Buds9Sm1.js`, `le`, `index-DtLkR01C.js`, `Ta`, `index-B23vSfwu.js`, `Ih`, `uc`, `index-BM9U1lvA.js`, `of`, `Ih`, `Ot`, `uc`, `il`, `ya`, `.add`, `of`, `Q`, `_c`, `_f`, `wf`, `l`, `gsap-C8IefbVz.js`, `Ms`, `dx`, `et`, `B`, `st`, `je`, `Ih`, `r`, `uc`, `r`, `fu`, `.get`, `vc`, `of`, `uc`, `Ph`, `sf`, `_0`, `tu`, `n`, `he`, `c0`, `tt`, `uc`, `t`, `ve`, `nu`, `yf`, `sf`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `index-B23vSfwu.js`, `Ih`, `uc`, `Qe`, `r`, `l`, `r0`, `et`, `B`, `st`, `l`, `rf`, `Ye`, `vc`, `dx`, `ee`, `n`, `he`, `D0`, `tt`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `bt`, `le`, `index-B23vSfwu.js`, `Q`, `l`, `dx`, `et`, `B`, `st`, `r`, `vc`, `r0`, `Wh`, `Ye`, `lf`, `n`, `he`, `tt`, `t`, `D0`, `nu`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._