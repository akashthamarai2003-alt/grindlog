# Graph Report - web  (2026-09-22)

## Corpus Check
- 402 files · ~3,420,094 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6305 nodes · 22382 edges · 178 communities (166 shown, 12 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f39cd190`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- uc
- _
- ref_framer_motion
- index-CoRpx3FC.js
- index-LDG-1p68.js
- lucide-react
- Ph
- _c
- index-Buds9Sm1.js
- Ph
- profile-content.tsx
- st
- progress-view.tsx
- index-Cq6kntJJ.js
- constants.ts
- index-DtLkR01C.js
- Ih
- uc
- analyze/route.ts
- sf
- next
- of
- dl
- Ih
- bl
- $h
- r
- .add
- tt
- exercise-detail.tsx
- Ye
- n
- wf
- uc
- uc
- l
- Pt
- rf
- of
- Wh
- r
- ai-insight-card.tsx
- pr
- r0
- generate-draft/route.ts
- rf
- l
- Ai
- dependencies
- access.ts
- Ih
- index-B23vSfwu.js
- et
- n
- uc
- nn
- Ye
- zn
- We
- l
- Ye
- app/package.json
- uc
- fitness-dashboard.tsx
- je
- r
- ai-insight-service.ts
- onboarding-flow.tsx
- le
- createServerSupabase
- y0
- $h
- F
- react
- Ih
- .get
- fitness-notifications.ts
- uc
- ku
- sf
- ee
- Wh
- uc
- Ph
- prompts.ts
- r
- l
- Ye
- i
- r
- reminders-client.tsx
- rf
- We
- users-table-client.tsx
- _0
- fu
- uc
- l
- import-usda-foundation-foods.mjs
- bt
- sf
- hl
- Ih
- _0
- types/index.ts
- B
- ee
- D0
- wf
- l
- Ph
- rf
- Ye
- compilerOptions
- Ye
- r
- _0
- plan-setup/page.tsx
- D0
- af
- ve
- devDependencies
- nu
- manifest.json
- _0
- yf
- ee
- of
- ei
- r
- mi
- fitness-reminders/route.ts
- l
- Wh
- wf
- workout/page.tsx
- r
- _0
- grocery-tab.tsx
- ff
- nutrition-view.tsx
- r
- coach-chat.tsx
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- af
- index-BM9U1lvA.js
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- springs.ts
- he
- progression.ts
- yf
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- fitness-shell.tsx
- coach.ts
- package.json
- add-scan/route.ts
- firebase-messaging-sw.js
- Data import scripts
- nutrition-service.ts
- rules/graphify.md
- workflows/graphify.md
- swap-meal/route.ts
- workout-heatmap.tsx
- Uo
- next-env.d.ts
- gsap-C8IefbVz.js
- admin-login/page.tsx
- log-measurements/page.tsx

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
- `Recent Decisions` --references--> `FitnessShell()`  [INFERRED]
  .planning/STATE.md → app/components/fitness/fitness-shell.tsx

## Import Cycles
- None detected.

## Communities (178 total, 12 thin omitted)

### Community 0 - "uc"
Cohesion: 0.09
Nodes (35): ds(), er(), Fa(), Fn(), ft(), gr(), Ic(), ir() (+27 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (137): _, aa, ac(), ao(), As, at, Be(), bf() (+129 more)

### Community 2 - "ref_framer_motion"
Cohesion: 0.05
Nodes (65): completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), quickCompleteWorkoutAction(), reopenWorkoutAction(), resetWorkoutTimerAction() (+57 more)

### Community 3 - "index-CoRpx3FC.js"
Cohesion: 0.04
Nodes (118): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+110 more)

### Community 4 - "index-LDG-1p68.js"
Cohesion: 0.08
Nodes (66): am(), ap(), ax(), Bn(), Bx, Cc(), cx(), de() (+58 more)

### Community 5 - "lucide-react"
Cohesion: 0.04
Nodes (21): createCouponAction(), toggleCouponStatusAction(), ClientCouponForm(), CopyButton(), AdminCouponsPage(), ToggleCouponButton(), FitnessTableClient(), FitnessUserDetails (+13 more)

### Community 6 - "Ph"
Cohesion: 0.04
Nodes (84): Ph(), A0(), Bd(), Bl(), bm(), cd(), cf(), dc() (+76 more)

### Community 7 - "_c"
Cohesion: 0.06
Nodes (66): am(), ap(), ax(), Bn, cx(), de(), Dn(), dx() (+58 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.06
Nodes (84): $, A, b, c(), D, e(), f, g (+76 more)

### Community 9 - "Ph"
Cohesion: 0.04
Nodes (81): Ph(), A0(), Bd(), Bl(), bm(), cd(), cf(), Cn() (+73 more)

### Community 10 - "profile-content.tsx"
Cohesion: 0.06
Nodes (38): toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), ForgotPasswordPage(), ResetPasswordPage(), SignInContent(), SignUpContent(), RoadmapPage(), metadata (+30 more)

### Community 11 - "st"
Cohesion: 0.14
Nodes (27): T0(), E0(), E0(), T0(), E0(), E0(), E0(), E0() (+19 more)

### Community 12 - "progress-view.tsx"
Cohesion: 0.08
Nodes (35): app_assets_images_placeholder_goal, AchievementsShowcase(), ActivityRecoveryAnalyticsCard(), AIProgressReviewCard(), BodyMeasurementsList(), BodyProgressPhotos(), NutritionAnalyticsCard(), getPeriodDescription() (+27 more)

### Community 13 - "index-Cq6kntJJ.js"
Cohesion: 0.06
Nodes (84): $, A, b, c(), D, e(), f, g (+76 more)

### Community 14 - "constants.ts"
Cohesion: 0.05
Nodes (88): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), GroceryPage(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps (+80 more)

### Community 15 - "index-DtLkR01C.js"
Cohesion: 0.09
Nodes (59): am(), ap(), ax(), Bn(), Bx, Cc(), cx(), de() (+51 more)

### Community 16 - "Ih"
Cohesion: 0.05
Nodes (68): Ih(), ad(), an(), as(), b0(), bc(), bf(), cd() (+60 more)

### Community 17 - "uc"
Cohesion: 0.11
Nodes (29): a0(), er(), Fn(), ft(), gr(), i0(), Ic(), ir() (+21 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.08
Nodes (35): POST(), POST(), stableStringify(), stripImagePayload(), POST(), AIStartingReportPage(), displayValue(), dynamic (+27 more)

### Community 19 - "sf"
Cohesion: 0.10
Nodes (37): ao(), bc(), c0(), ci(), Dd(), Dl(), dn(), ee() (+29 more)

### Community 20 - "next"
Cohesion: 0.04
Nodes (76): getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), checkUserPremiumStatusAction(), createMessageTopUpOrder(), createRazorpayOrder() (+68 more)

### Community 21 - "of"
Cohesion: 0.12
Nodes (30): af(), At(), fs(), hn(), io(), Kl(), ll(), ls() (+22 more)

### Community 22 - "dl"
Cohesion: 0.22
Nodes (5): dl(), pl, qi, qn(), yu()

### Community 23 - "Ih"
Cohesion: 0.04
Nodes (85): Ih(), A0(), an(), bc(), bf(), bh(), bm(), cd() (+77 more)

### Community 24 - "bl"
Cohesion: 0.05
Nodes (22): bl(), n(), a(), Fn(), hu(), ic(), il, jr (+14 more)

### Community 25 - "$h"
Cohesion: 0.17
Nodes (22): $h(), ct(), el(), m(), r(), Re(), y(), zt() (+14 more)

### Community 26 - "r"
Cohesion: 0.13
Nodes (44): ai(), b0(), bu(), di(), Do(), eh(), fi(), Fr() (+36 more)

### Community 27 - ".add"
Cohesion: 0.08
Nodes (14): af, Cn(), Gn, Gu(), kl(), ks(), _l(), me() (+6 more)

### Community 28 - "tt"
Cohesion: 0.09
Nodes (37): At(), bi(), bo(), ch(), co(), cs(), Fa(), fo() (+29 more)

### Community 29 - "exercise-detail.tsx"
Cohesion: 0.10
Nodes (27): completeExerciseSetsAction(), ExerciseBrowser(), ExerciseBrowserContent(), exerciseCache, LibraryExercise, ExerciseAnimationPlayer(), ExerciseAnimationPlayerProps, BODYWEIGHT_KEYWORDS (+19 more)

### Community 30 - "Ye"
Cohesion: 0.13
Nodes (28): _a(), ar(), Bt(), da(), dt(), gc(), gh(), jd() (+20 more)

### Community 31 - "n"
Cohesion: 0.12
Nodes (45): ad(), an(), bh(), bo(), bu(), di(), eh(), fi() (+37 more)

### Community 32 - "wf"
Cohesion: 0.10
Nodes (26): aa(), ai(), Cl(), cm(), Ei(), ff(), fl(), Gc() (+18 more)

### Community 33 - "uc"
Cohesion: 0.10
Nodes (33): a0(), bu(), er(), Fn(), ft(), gr(), i0(), Ic() (+25 more)

### Community 34 - "uc"
Cohesion: 0.12
Nodes (23): as(), br(), cr(), Fn(), gr(), ic(), id(), Il() (+15 more)

### Community 35 - "l"
Cohesion: 0.08
Nodes (52): At(), bi(), bo(), co(), cs(), Ct(), dd(), df() (+44 more)

### Community 36 - "Pt"
Cohesion: 0.08
Nodes (48): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+40 more)

### Community 37 - "rf"
Cohesion: 0.15
Nodes (26): ad(), af(), ao(), fs(), Kl(), lf(), ls(), ms() (+18 more)

### Community 38 - "of"
Cohesion: 0.10
Nodes (49): ad(), an(), At(), bh(), bo(), di(), eh(), fi() (+41 more)

### Community 39 - "Wh"
Cohesion: 0.27
Nodes (14): $h(), w(), X(), r(), rx(), Wh(), ct(), el() (+6 more)

### Community 40 - "r"
Cohesion: 0.18
Nodes (35): af(), ai(), bu(), di(), Do(), fi(), gs(), Gt() (+27 more)

### Community 41 - "ai-insight-card.tsx"
Cohesion: 0.40
Nodes (3): PlanAdjustment, ProgressReview, WeeklyWorkoutStats

### Community 42 - "pr"
Cohesion: 0.05
Nodes (26): r0(), r0(), r0(), r0(), r0(), r0(), r0(), Ae() (+18 more)

### Community 43 - "r0"
Cohesion: 0.15
Nodes (20): bm(), ea(), $f(), G0(), Ga(), Gf(), If(), Jr() (+12 more)

### Community 44 - "generate-draft/route.ts"
Cohesion: 0.05
Nodes (106): GET(), dynamic, GET(), POST(), revalidate, maxDuration, POST(), GenerateGroceryResponseSchema (+98 more)

### Community 45 - "rf"
Cohesion: 0.15
Nodes (26): af(), ao(), At(), fs(), gd(), Kl(), lf(), ls() (+18 more)

### Community 46 - "l"
Cohesion: 0.07
Nodes (57): bf(), bi(), ch(), co(), cs(), en(), eo(), gd() (+49 more)

### Community 47 - "Ai"
Cohesion: 0.12
Nodes (26): ao(), en(), fs(), gi(), K0(), Kf(), Le(), t() (+18 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "access.ts"
Cohesion: 0.10
Nodes (24): generateSlug(), POST(), FitnessProPage(), metadata, ProfileSubscriptionProps, PricingCard(), PricingCardProps, ProPageClient() (+16 more)

### Community 50 - "Ih"
Cohesion: 0.05
Nodes (60): Ih(), bf(), bh(), bm(), Cl(), cm(), cn(), dc() (+52 more)

### Community 51 - "index-B23vSfwu.js"
Cohesion: 0.08
Nodes (65): am(), ap(), ax(), Bn, Bx, cm(), cx(), de() (+57 more)

### Community 52 - "et"
Cohesion: 0.08
Nodes (13): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), rr(), rr() (+5 more)

### Community 53 - "n"
Cohesion: 0.17
Nodes (38): ot(), ad(), an(), bo(), di(), eh(), fi(), go() (+30 more)

### Community 54 - "uc"
Cohesion: 0.15
Nodes (19): br(), cr(), Fn(), go(), gs(), id(), ju(), Kn() (+11 more)

### Community 55 - "nn"
Cohesion: 0.10
Nodes (9): ar(), en(), ja(), ls(), nn(), ol(), ru, ur() (+1 more)

### Community 56 - "Ye"
Cohesion: 0.17
Nodes (23): _a(), bd(), da(), dh(), dt(), fh(), gc(), gh() (+15 more)

### Community 57 - "zn"
Cohesion: 0.18
Nodes (28): ar(), Da(), dh(), dt(), ea(), gh(), hh(), jd() (+20 more)

### Community 58 - "We"
Cohesion: 0.09
Nodes (30): A0(), an(), as(), bc(), cd(), D(), Es(), fh() (+22 more)

### Community 59 - "l"
Cohesion: 0.09
Nodes (43): At(), co(), cs(), dd(), df(), eo(), hf(), hn() (+35 more)

### Community 60 - "Ye"
Cohesion: 0.20
Nodes (23): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+15 more)

### Community 61 - "app/package.json"
Cohesion: 0.04
Nodes (54): claimSpinDiscountAction(), FitnessBottomNav(), tabs, LuckyWheelModal(), LuckyWheelModalProps, TimePicker12h(), TimePicker12hProps, PlanPricingConfig (+46 more)

### Community 62 - "uc"
Cohesion: 0.09
Nodes (33): bu(), er(), Fa(), Fn(), ft(), gr(), Ic(), ir() (+25 more)

### Community 63 - "fitness-dashboard.tsx"
Cohesion: 0.11
Nodes (20): getUnreadNotificationsCountAction(), DailyActivityCard(), DailyActivityCardProps, DashboardHeader(), fetchUnreadCount(), DashboardHeaderProps, ExerciseLibraryCard(), FitnessDashboard() (+12 more)

### Community 64 - "je"
Cohesion: 0.14
Nodes (26): ao(), bi(), bo(), Fa(), fo(), fs(), gi(), hs() (+18 more)

### Community 65 - "r"
Cohesion: 0.12
Nodes (48): ai(), as(), b0(), bu(), di(), Do(), eh(), fi() (+40 more)

### Community 66 - "ai-insight-service.ts"
Cohesion: 0.12
Nodes (19): GET(), POST(), POST(), GET(), AiWorkoutCoachService, activeUserGenerations, AIInsightService, DAILY_AI_REVIEW_LIMIT (+11 more)

### Community 67 - "onboarding-flow.tsx"
Cohesion: 0.08
Nodes (21): saveFitnessOnboardingAction(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_left (+13 more)

### Community 68 - "le"
Cohesion: 0.10
Nodes (48): ar(), ch(), Ct(), dd(), df(), eo(), hf(), hn() (+40 more)

### Community 69 - "createServerSupabase"
Cohesion: 0.03
Nodes (73): exportUserData(), exportWorkoutHistoryCSV(), dynamic, POST(), POST(), POST(), GET(), GET() (+65 more)

### Community 70 - "y0"
Cohesion: 0.14
Nodes (21): bm(), ds(), ea(), $f(), G0(), Ga(), Gf(), If() (+13 more)

### Community 71 - "$h"
Cohesion: 0.14
Nodes (25): $h(), ct(), el(), g(), m(), r(), Re(), zt() (+17 more)

### Community 72 - "F"
Cohesion: 0.07
Nodes (5): C, F, I, k(), q

### Community 73 - "react"
Cohesion: 0.11
Nodes (25): AICharacter(), AICharacterProps, AIPlanAnimation(), AIPlanAnimationProps, DEFAULT_FALLBACK_PROFILE, PILL_CONFIGS, PillConfig, ProfileSummary (+17 more)

### Community 74 - "Ih"
Cohesion: 0.05
Nodes (60): Ih(), ad(), ah(), ar(), b0(), bf(), Bt(), cn() (+52 more)

### Community 75 - ".get"
Cohesion: 0.19
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "fitness-notifications.ts"
Cohesion: 0.22
Nodes (15): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), markAllNotificationsAsReadAction(), markNotificationAsReadAction() (+7 more)

### Community 77 - "uc"
Cohesion: 0.20
Nodes (14): as(), br(), cr(), Fn(), gr(), id(), ju(), l0() (+6 more)

### Community 78 - "ku"
Cohesion: 0.05
Nodes (35): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+27 more)

### Community 79 - "sf"
Cohesion: 0.09
Nodes (40): ai(), as(), bc(), Cl(), cm(), Dd(), dn(), Es() (+32 more)

### Community 80 - "ee"
Cohesion: 0.21
Nodes (17): c0(), cf(), ci(), ee(), ef(), Fu(), is(), lo() (+9 more)

### Community 81 - "Wh"
Cohesion: 0.36
Nodes (10): $h(), D(), X(), Wh(), ct(), el(), ot(), r() (+2 more)

### Community 82 - "uc"
Cohesion: 0.11
Nodes (28): er(), Fn(), ft(), gr(), Ic(), ir(), Kn(), l0() (+20 more)

### Community 83 - "Ph"
Cohesion: 0.04
Nodes (75): Ph(), A0(), ai(), b0(), bh(), Bt(), cf(), Cl() (+67 more)

### Community 84 - "prompts.ts"
Cohesion: 0.16
Nodes (22): approveFitnessPlanAdjustmentAction(), POST(), GET(), buildFitnessCoachContext(), addUnique(), budgetPlanningReference(), buildCompactPlanProfile(), buildFitnessCoachPrompt() (+14 more)

### Community 85 - "r"
Cohesion: 0.09
Nodes (46): aa(), ar(), bu(), Da(), dh(), dt(), ea(), fh() (+38 more)

### Community 86 - "l"
Cohesion: 0.08
Nodes (44): Ct(), dd(), df(), eo(), Fu(), hf(), hn(), Ii() (+36 more)

### Community 87 - "Ye"
Cohesion: 0.10
Nodes (37): _a(), ah(), ar(), bd(), bh(), Bt(), dh(), dt() (+29 more)

### Community 88 - "i"
Cohesion: 0.10
Nodes (31): bi(), bo(), co(), cs(), fo(), gi(), go(), gs() (+23 more)

### Community 89 - "r"
Cohesion: 0.11
Nodes (48): S, ot(), af(), an(), b0(), bh(), bu(), di() (+40 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.13
Nodes (21): updateRemindersAction(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS, REMINDER_TYPES, ReminderTypeSheet() (+13 more)

### Community 91 - "rf"
Cohesion: 0.08
Nodes (51): as(), At(), bc(), c0(), cd(), cf(), ci(), dn() (+43 more)

### Community 92 - "We"
Cohesion: 0.11
Nodes (27): an(), bc(), cd(), D(), E0(), Es(), Hl(), I() (+19 more)

### Community 93 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 94 - "_0"
Cohesion: 0.19
Nodes (22): _0(), D0(), da(), dn(), Ei(), fe(), ff(), Fl() (+14 more)

### Community 95 - "fu"
Cohesion: 0.08
Nodes (33): bm(), Dl(), ds(), ea(), $f(), G0(), Ga(), Gf() (+25 more)

### Community 96 - "uc"
Cohesion: 0.11
Nodes (30): er(), Fn(), ft(), gr(), Ic(), ir(), Kn(), l0() (+22 more)

### Community 97 - "l"
Cohesion: 0.08
Nodes (51): Ba(), t(), bf(), bi(), ch(), co(), cs(), Ct() (+43 more)

### Community 98 - "import-usda-foundation-foods.mjs"
Cohesion: 0.11
Nodes (17): buildRow(), DEFAULT_JSON_PATH, dryRun, findRecord(), IMPORT_MAP, missing, nutrient(), payload (+9 more)

### Community 99 - "bt"
Cohesion: 0.08
Nodes (46): _0(), as(), c0(), cf(), ch(), da(), ds(), fh() (+38 more)

### Community 100 - "sf"
Cohesion: 0.11
Nodes (21): ad(), ar(), Bt(), Fu(), ke(), la(), lh(), Ln() (+13 more)

### Community 101 - "hl"
Cohesion: 0.08
Nodes (58): ar(), Ba(), t(), bi(), bo(), ch(), co(), cs() (+50 more)

### Community 102 - "Ih"
Cohesion: 0.04
Nodes (79): Ih(), A0(), ai(), an(), as(), b0(), bc(), bf() (+71 more)

### Community 103 - "_0"
Cohesion: 0.20
Nodes (20): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+12 more)

### Community 104 - "types/index.ts"
Cohesion: 0.10
Nodes (19): AuthState, Achievement, AchievementCategory, AIHabitPlan, AIHabitPlanItem, AISession, AISessionType, Habit (+11 more)

### Community 105 - "B"
Cohesion: 0.13
Nodes (29): _a(), ad(), bd(), Bt(), dh(), dt(), gc(), gh() (+21 more)

### Community 106 - "ee"
Cohesion: 0.16
Nodes (21): _0(), cf(), ci(), ee(), ef(), Fu(), hc(), hi() (+13 more)

### Community 107 - "D0"
Cohesion: 0.25
Nodes (17): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gn() (+9 more)

### Community 108 - "wf"
Cohesion: 0.12
Nodes (31): c0(), Ct(), D0(), df(), Ei(), fe(), ff(), Gc() (+23 more)

### Community 109 - "l"
Cohesion: 0.09
Nodes (50): bf(), bi(), bu(), ch(), co(), cs(), Ct(), eo() (+42 more)

### Community 110 - "Ph"
Cohesion: 0.04
Nodes (73): Ph(), A0(), ai(), bf(), bm(), Cl(), cm(), Cn() (+65 more)

### Community 111 - "rf"
Cohesion: 0.11
Nodes (32): af(), ao(), At(), ch(), cn(), fs(), gi(), Kl() (+24 more)

### Community 112 - "Ye"
Cohesion: 0.14
Nodes (31): ar(), Bt(), Da(), dh(), dt(), ea(), ft(), gh() (+23 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "Ye"
Cohesion: 0.11
Nodes (35): aa(), ad(), Bt(), Da(), dt(), ea(), Fu(), gc() (+27 more)

### Community 115 - "r"
Cohesion: 0.11
Nodes (49): $h(), ai(), c0(), D(), di(), fi(), Fr(), ge() (+41 more)

### Community 116 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+8 more)

### Community 117 - "plan-setup/page.tsx"
Cohesion: 0.24
Nodes (12): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+4 more)

### Community 118 - "D0"
Cohesion: 0.24
Nodes (18): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gl() (+10 more)

### Community 119 - "af"
Cohesion: 0.24
Nodes (16): af(), fs(), io(), ll(), ms(), no(), _o(), os() (+8 more)

### Community 120 - "ve"
Cohesion: 0.12
Nodes (38): _0(), c0(), cf(), ci(), D0(), Dl(), dn(), ee() (+30 more)

### Community 121 - "devDependencies"
Cohesion: 0.11
Nodes (17): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+9 more)

### Community 122 - "nu"
Cohesion: 0.11
Nodes (9): eu(), gf, ir(), jf(), nu, qu(), Rn(), sn() (+1 more)

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), Ei(), fe(), ff(), Gl(), Gn(), Hr() (+9 more)

### Community 125 - "yf"
Cohesion: 0.18
Nodes (7): hc, kc(), lc, mf(), ro, vf(), yf

### Community 126 - "ee"
Cohesion: 0.31
Nodes (13): c0(), cf(), ci(), ee(), ef(), is(), lo(), ml() (+5 more)

### Community 127 - "of"
Cohesion: 0.07
Nodes (54): _0(), ao(), At(), bc(), Bl(), bm(), cd(), ci() (+46 more)

### Community 128 - "ei"
Cohesion: 0.24
Nodes (16): ao(), c0(), ci(), ee(), ef(), is(), lo(), ml() (+8 more)

### Community 129 - "r"
Cohesion: 0.22
Nodes (15): $h(), ct(), el(), ot(), r(), Re(), zt(), Ih() (+7 more)

### Community 130 - "mi"
Cohesion: 0.23
Nodes (15): ci(), Cl(), Dl(), ee(), ef(), is(), jt(), lo() (+7 more)

### Community 131 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 132 - "l"
Cohesion: 0.07
Nodes (63): bi(), bo(), co(), cs(), Ct(), dd(), df(), eo() (+55 more)

### Community 133 - "Wh"
Cohesion: 0.15
Nodes (26): $h(), hx(), C(), E(), bd(), D(), dh(), fh() (+18 more)

### Community 134 - "wf"
Cohesion: 0.14
Nodes (15): aa(), Bt(), Ei(), hd(), ke(), Ln(), Mi(), Qc() (+7 more)

### Community 135 - "workout/page.tsx"
Cohesion: 0.20
Nodes (5): dynamic, AiCoachNote(), AiCoachNoteProps, WeeklyWorkoutView(), WorkoutSkeleton()

### Community 136 - "r"
Cohesion: 0.11
Nodes (59): af(), ao(), bh(), di(), eh(), fi(), Fr(), fs() (+51 more)

### Community 137 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+9 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 140 - "nutrition-view.tsx"
Cohesion: 0.06
Nodes (41): TodaysGoalsCard(), TodaysGoalsCardProps, formatFoodItem(), TodaysNutritionCard(), TodaysNutritionCardProps, FoodAvatar(), FoodAvatarProps, Food (+33 more)

### Community 141 - "r"
Cohesion: 0.14
Nodes (29): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+21 more)

### Community 142 - "coach-chat.tsx"
Cohesion: 0.19
Nodes (9): CoachChat(), CoachInput(), CoachInputProps, CoachLoading(), CoachMessage(), CoachMessageProps, CoachSuggestions(), CoachSuggestionsProps (+1 more)

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
Cohesion: 0.15
Nodes (24): _a(), af(), ds(), fs(), G0(), hn(), Hr(), io() (+16 more)

### Community 147 - "index-BM9U1lvA.js"
Cohesion: 0.08
Nodes (64): am(), ap(), ax(), Bn, Bx, cx(), de(), Dn() (+56 more)

### Community 149 - "Concerns, Technical Debt & Watch-Outs — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Database Waterfall Regressions, 2. White Theme CSS Overrides, 3. PWA Service Worker Cache Invalidation, 4. Mobile Keyboard & Viewport Layout Shifts, 5. Razorpay Webhook Idempotency & Webhook Retries, Concerns, Technical Debt & Watch-Outs — GrindLog

### Community 150 - "External Integrations & Services — GrindLog"
Cohesion: 0.25
Nodes (7): 1. Supabase (Database, Auth, Storage), 2. Razorpay (Payment Gateway), 3. Google Gemini AI (@google/genai), 4. PWA Service Worker (Next-PWA & Workbox), 5. Resend (Email Service), 6. Developer Tooling & Agent Workflow Suite, External Integrations & Services — GrindLog

### Community 151 - "Product & Technical Requirements — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Performance & Latency Requirements, 2. Workout & Fitness Requirements, 3. Nutrition & Diet Requirements, 4. Design & Mobile Experience Requirements, 5. Security & Billing Requirements, Product & Technical Requirements — GrindLog

### Community 152 - "springs.ts"
Cohesion: 0.20
Nodes (8): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem

### Community 153 - "he"
Cohesion: 0.18
Nodes (11): bs(), bs(), bs(), bs(), bs(), bs(), bs(), bs() (+3 more)

### Community 155 - "yf"
Cohesion: 0.33
Nodes (11): ch(), hf(), hn(), jf(), Kt(), mn(), Na(), pf() (+3 more)

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 158 - "fitness-shell.tsx"
Cohesion: 0.06
Nodes (33): NutritionLoading(), ProfileLoading(), ProgressLoading(), FitnessChatbot(), Message, BottomNav(), DashboardSkeleton(), TodaysWorkoutCard() (+25 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 161 - "add-scan/route.ts"
Cohesion: 0.27
Nodes (8): deleteR2File(), deleteScanPhotosFromR2(), isR2Configured, POST(), deleteR2File(), isR2Configured, POST(), @aws-sdk/client-s3

### Community 164 - "nutrition-service.ts"
Cohesion: 0.07
Nodes (42): GET(), POST(), DELETE(), DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES, GET() (+34 more)

### Community 168 - "swap-meal/route.ts"
Cohesion: 0.44
Nodes (9): ALLOWED_MEAL_TYPES, isDietCompatible(), isFoodAvailable(), isFoodBlocked(), matchesTerm(), normalize(), POST(), profileTerms() (+1 more)

### Community 169 - "workout-heatmap.tsx"
Cohesion: 0.24
Nodes (9): CellData, DAY_LABELS, formatDate(), getIntensityClass(), HeatmapCell, HeatmapProps, INTENSITY_COLORS, MONTH_LABELS (+1 more)

### Community 170 - "Uo"
Cohesion: 0.24
Nodes (10): Ba(), t(), Cn(), I(), Ii(), js(), oh(), Pl() (+2 more)

### Community 175 - "gsap-C8IefbVz.js"
Cohesion: 0.38
Nodes (4): e(), Ml(), Ol(), tr()

### Community 176 - "admin-login/page.tsx"
Cohesion: 0.70
Nodes (3): loginAdminAction(), AdminLogin(), handleSubmit()

### Community 177 - "log-measurements/page.tsx"
Cohesion: 0.40
Nodes (3): FIELD_CONFIGS, FieldConfig, LogMeasurementsPage()

## Knowledge Gaps
- **529 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+524 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 878 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `uc`, `ei`, `mi`, `index-CoRpx3FC.js`, `index-LDG-1p68.js`, `Ph`, `_c`, `index-Buds9Sm1.js`, `Ph`, `ff`, `st`, `index-Cq6kntJJ.js`, `index-DtLkR01C.js`, `Ih`, `uc`, `index-BM9U1lvA.js`, `sf`, `of`, `dl`, `of`, `bl`, `$h`, `he`, `.add`, `tt`, `uc`, `uc`, `Pt`, `pr`, `Uo`, `Ai`, `index-B23vSfwu.js`, `et`, `uc`, `nn`, `zn`, `uc`, `le`, `.get`, `ku`, `sf`, `uc`, `Ph`, `rf`, `_0`, `fu`, `uc`, `bt`, `hl`, `Ih`, `af`, `ve`, `nu`, `yf`, `of`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `index-CoRpx3FC.js`, `r`, `st`, `Ih`, `index-BM9U1lvA.js`, `bl`, `he`, `yf`, `l`, `pr`, `Uo`, `et`, `Ye`, `uc`, `y0`, `ku`, `Wh`, `fu`, `sf`, `B`, `ve`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `mi`, `index-CoRpx3FC.js`, `st`, `Ih`, `uc`, `bl`, `he`, `Wh`, `r`, `Uo`, `r0`, `et`, `l`, `Ye`, `je`, `ku`, `We`, `bt`, `B`, `D0`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._