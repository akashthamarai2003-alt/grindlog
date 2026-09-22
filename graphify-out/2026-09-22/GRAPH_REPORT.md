# Graph Report - web  (2026-09-22)

## Corpus Check
- 403 files · ~3,421,165 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6311 nodes · 22398 edges · 165 communities (154 shown, 11 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `49529676`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Ui
- _
- fitness.ts
- index-B23vSfwu.js
- Ot
- uf
- Ph
- _c
- index-Buds9Sm1.js
- Ph
- lucide-react
- st
- progress-view.tsx
- index-DtLkR01C.js
- constants.ts
- au
- Ih
- Bi
- analyze/route.ts
- sf
- createAdminClient
- of
- r
- Ih
- il
- r
- r
- .add
- i
- We
- Ye
- ir
- r
- uc
- uc
- l
- Qe
- rf
- nf
- index-CoRpx3FC.js
- l
- Pt
- pr
- Wh
- generate-draft/route.ts
- bt
- l
- rf
- dependencies
- access.ts
- Ih
- dx
- et
- of
- Oi
- nn
- Ye
- Ye
- M0
- e
- Ye
- app/package.json
- uc
- (fitness)/page.tsx
- lf
- r
- tt
- onboarding-flow.tsx
- le
- createServerSupabase
- sf
- _0
- F
- AIPlanAnimation.tsx
- Ih
- .get
- fitness-notifications.ts
- kf
- vc
- r
- ee
- Q
- uc
- Ph
- ku
- Ye
- l
- Ye
- l
- r
- reminders-client.tsx
- Ft
- fl
- users-table-client.tsx
- _0
- fu
- uc
- l
- import-usda-foundation-foods.mjs
- rf
- rf
- l
- Ih
- _0
- lf
- B
- ee
- D0
- c0
- l
- Ph
- rf
- ue
- compilerOptions
- Ye
- s
- ve
- lt
- D0
- af
- mi
- devDependencies
- nu
- manifest.json
- _0
- yf
- ee
- sf
- _o
- r
- fitness-reminders/route.ts
- l
- dx
- r
- _0
- grocery-tab.tsx
- $h
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- af
- dx
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- springs.ts
- progression.ts
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- next
- coach.ts
- package.json
- firebase-messaging-sw.js
- Data import scripts
- nutrition-service.ts
- rules/graphify.md
- workflows/graphify.md
- wf
- next-env.d.ts
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
- `Naming & File Conventions` --references--> `BottomNav()`  [INFERRED]
  .planning/codebase/STRUCTURE.md → app/components/fitness/dashboard/bottom-nav.tsx
- `Phase 1: Core Performance & Tab Optimization [COMPLETED]` --references--> `BottomNav()`  [INFERRED]
  .planning/ROADMAP.md → app/components/fitness/dashboard/bottom-nav.tsx

## Import Cycles
- None detected.

## Communities (165 total, 11 thin omitted)

### Community 0 - "Ui"
Cohesion: 0.10
Nodes (32): as(), er(), Fn(), ft(), gr(), Ic(), ir(), ju() (+24 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (124): _, aa, ac(), al(), ao(), As, at, Be() (+116 more)

### Community 2 - "fitness.ts"
Cohesion: 0.04
Nodes (87): completeExerciseSetsAction(), completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), quickCompleteWorkoutAction(), reopenWorkoutAction() (+79 more)

### Community 3 - "index-B23vSfwu.js"
Cohesion: 0.06
Nodes (76): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+68 more)

### Community 4 - "Ot"
Cohesion: 0.11
Nodes (40): Xx(), Yx(), Xx(), Yx(), Vx(), Vx(), Xx(), Yx() (+32 more)

### Community 5 - "uf"
Cohesion: 0.07
Nodes (45): as(), bc(), cd(), Cl(), cm(), Fr(), Fu(), hc() (+37 more)

### Community 6 - "Ph"
Cohesion: 0.04
Nodes (93): Ph(), A0(), br(), cd(), Cl(), cm(), cr(), Dl() (+85 more)

### Community 7 - "_c"
Cohesion: 0.09
Nodes (47): ap(), ax(), Bn, de(), Dn(), dx(), El(), ep() (+39 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.05
Nodes (97): $, A, b, c(), D, e(), f, g (+89 more)

### Community 9 - "Ph"
Cohesion: 0.04
Nodes (95): Ph(), aa(), bc(), Bd(), bf(), Bl(), bm(), Bt() (+87 more)

### Community 10 - "lucide-react"
Cohesion: 0.02
Nodes (117): loginAdminAction(), toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), AdminLogin(), handleSubmit(), ForgotPasswordPage(), ResetPasswordPage(), SignInContent() (+109 more)

### Community 11 - "st"
Cohesion: 0.13
Nodes (27): T0(), E0(), E0(), T0(), E0(), E0(), E0(), E0() (+19 more)

### Community 12 - "progress-view.tsx"
Cohesion: 0.06
Nodes (43): GET(), metadata, ProgressPage(), app_assets_images_placeholder_goal, AchievementsShowcase(), ActivityRecoveryAnalyticsCard(), AIProgressReviewCard(), BodyMeasurementsList() (+35 more)

### Community 13 - "index-DtLkR01C.js"
Cohesion: 0.04
Nodes (118): $, A, b, c(), D, e(), f, g (+110 more)

### Community 14 - "constants.ts"
Cohesion: 0.05
Nodes (88): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), GroceryPage(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps (+80 more)

### Community 15 - "au"
Cohesion: 0.18
Nodes (28): ap(), Bn(), Bx, ep(), ex(), o(), Ha, ip() (+20 more)

### Community 16 - "Ih"
Cohesion: 0.05
Nodes (69): Ih(), ai(), an(), b0(), bc(), bf(), cd(), Cl() (+61 more)

### Community 17 - "Bi"
Cohesion: 0.08
Nodes (39): a0(), er(), Fa(), fh(), Fn(), ft(), gr(), I() (+31 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.07
Nodes (34): POST(), POST(), stableStringify(), stripImagePayload(), AIStartingReportPage(), displayValue(), dynamic, isRecord() (+26 more)

### Community 19 - "sf"
Cohesion: 0.08
Nodes (51): A0(), ai(), ao(), c0(), ci(), Cl(), cm(), Dd() (+43 more)

### Community 20 - "createAdminClient"
Cohesion: 0.04
Nodes (76): createCouponAction(), toggleCouponStatusAction(), getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), checkUserPremiumStatusAction() (+68 more)

### Community 21 - "of"
Cohesion: 0.13
Nodes (29): af(), At(), fs(), Gt(), hn(), io(), Kl(), ll() (+21 more)

### Community 22 - "r"
Cohesion: 0.10
Nodes (31): as(), c0(), da(), fh(), Fr(), gd(), ge(), hc() (+23 more)

### Community 23 - "Ih"
Cohesion: 0.04
Nodes (71): Ih(), A0(), ad(), an(), bf(), bh(), bm(), Bt() (+63 more)

### Community 24 - "il"
Cohesion: 0.07
Nodes (16): bo(), n(), Co(), Fi(), Fn(), hu(), il, ma() (+8 more)

### Community 25 - "r"
Cohesion: 0.09
Nodes (42): $h(), ct(), el(), m(), ot(), r(), Re(), y() (+34 more)

### Community 26 - "r"
Cohesion: 0.16
Nodes (38): ai(), b0(), bu(), di(), Do(), eh(), fi(), Fr() (+30 more)

### Community 27 - ".add"
Cohesion: 0.08
Nodes (14): af, Cn(), Gn, Gu(), kl(), ks(), _l(), me() (+6 more)

### Community 28 - "i"
Cohesion: 0.21
Nodes (15): bi(), bo(), Fa(), fo(), go(), hs(), jo(), qo() (+7 more)

### Community 29 - "We"
Cohesion: 0.10
Nodes (28): A0(), an(), as(), bc(), cd(), Es(), go(), ht() (+20 more)

### Community 30 - "Ye"
Cohesion: 0.22
Nodes (19): _a(), da(), dt(), gc(), gh(), hh(), jd(), mh() (+11 more)

### Community 31 - "ir"
Cohesion: 0.16
Nodes (29): an(), bh(), bu(), di(), eh(), fi(), ft(), h0() (+21 more)

### Community 32 - "r"
Cohesion: 0.10
Nodes (26): ar(), Bt(), gd(), ge(), ke(), la(), Ln(), md() (+18 more)

### Community 33 - "uc"
Cohesion: 0.10
Nodes (34): a0(), bu(), er(), Fn(), ft(), gr(), I(), i0() (+26 more)

### Community 34 - "uc"
Cohesion: 0.15
Nodes (19): as(), br(), cr(), Fn(), gr(), id(), Jc(), ju() (+11 more)

### Community 35 - "l"
Cohesion: 0.09
Nodes (56): ar(), bi(), bo(), ch(), Ct(), dd(), df(), eo() (+48 more)

### Community 36 - "Qe"
Cohesion: 0.12
Nodes (34): am(), ap(), ax(), Bn, El(), ep(), Ex(), Fx() (+26 more)

### Community 37 - "rf"
Cohesion: 0.13
Nodes (28): af(), ao(), At(), fs(), gd(), gi(), Kl(), lf() (+20 more)

### Community 38 - "nf"
Cohesion: 0.14
Nodes (38): ot(), an(), ar(), bh(), bu(), di(), eh(), fi() (+30 more)

### Community 39 - "index-CoRpx3FC.js"
Cohesion: 0.08
Nodes (68): am(), ap(), ax(), Bn, Bx, cm(), cx(), de() (+60 more)

### Community 40 - "l"
Cohesion: 0.10
Nodes (62): af(), bu(), Ct(), dd(), df(), di(), eo(), fi() (+54 more)

### Community 41 - "Pt"
Cohesion: 0.19
Nodes (26): ap(), ep(), ex(), o(), Ha, ip(), ix(), Jx() (+18 more)

### Community 42 - "pr"
Cohesion: 0.05
Nodes (13): cf, du(), Hn(), lr(), lu(), _n, or(), pa() (+5 more)

### Community 43 - "Wh"
Cohesion: 0.15
Nodes (25): am(), $h(), hx(), C(), E(), bd(), D(), dh() (+17 more)

### Community 44 - "generate-draft/route.ts"
Cohesion: 0.04
Nodes (117): GET(), POST(), maxDuration, POST(), GenerateGroceryResponseSchema, POST(), maxDuration, POST() (+109 more)

### Community 45 - "bt"
Cohesion: 0.13
Nodes (25): af(), At(), da(), go(), Hr(), Ia(), Kl(), ls() (+17 more)

### Community 46 - "l"
Cohesion: 0.08
Nodes (64): ad(), bf(), bi(), bo(), ch(), co(), cs(), eo() (+56 more)

### Community 47 - "rf"
Cohesion: 0.16
Nodes (25): af(), ao(), At(), fs(), gi(), Kl(), lf(), ls() (+17 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "access.ts"
Cohesion: 0.06
Nodes (45): POST(), ExercisesPage(), ExerciseDetailPage(), dynamic, FitnessLayout(), NutritionLoading(), dynamic, NutritionContent() (+37 more)

### Community 50 - "Ih"
Cohesion: 0.04
Nodes (73): Ih(), A0(), an(), bh(), bm(), Cl(), cm(), cn() (+65 more)

### Community 51 - "dx"
Cohesion: 0.07
Nodes (54): am(), ap(), ax(), Bn, cm(), cx(), de(), Dn() (+46 more)

### Community 52 - "et"
Cohesion: 0.06
Nodes (42): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), Bd(), Bl() (+34 more)

### Community 53 - "of"
Cohesion: 0.13
Nodes (37): an(), At(), bh(), di(), eh(), fi(), h0(), ir() (+29 more)

### Community 54 - "Oi"
Cohesion: 0.10
Nodes (11): Ae(), br(), cr, a(), _f(), Oi(), qr(), Un (+3 more)

### Community 55 - "nn"
Cohesion: 0.10
Nodes (9): ar(), en(), ja(), ls(), nn(), ol(), ru, ur() (+1 more)

### Community 56 - "Ye"
Cohesion: 0.11
Nodes (35): _a(), bd(), Bt(), dh(), dt(), gc(), gh(), hh() (+27 more)

### Community 57 - "Ye"
Cohesion: 0.16
Nodes (27): aa(), Bt(), Da(), dh(), dt(), ea(), gh(), hh() (+19 more)

### Community 58 - "M0"
Cohesion: 0.14
Nodes (20): bc(), cd(), hd(), Hl(), hu(), I(), Il(), jc() (+12 more)

### Community 59 - "e"
Cohesion: 0.07
Nodes (36): ai(), At(), bi(), bo(), Cl(), cn(), co(), cs() (+28 more)

### Community 60 - "Ye"
Cohesion: 0.18
Nodes (24): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+16 more)

### Community 61 - "app/package.json"
Cohesion: 0.03
Nodes (65): config, updateSession(), config, middleware(), config, filteredRuntimeCaching, nextConfig, framer-motion (+57 more)

### Community 62 - "uc"
Cohesion: 0.08
Nodes (37): er(), Fa(), Fn(), ft(), gr(), I(), Ic(), Il() (+29 more)

### Community 63 - "(fitness)/page.tsx"
Cohesion: 0.07
Nodes (25): DashboardAboveFold(), DashboardBelow(), dynamic, revalidate, DashboardSkeleton(), ExerciseLibraryCard(), FitnessDashboard(), FitnessDashboardProps (+17 more)

### Community 64 - "lf"
Cohesion: 0.26
Nodes (15): ao(), fs(), gi(), lf(), ms(), no(), _o(), os() (+7 more)

### Community 65 - "r"
Cohesion: 0.18
Nodes (34): ai(), b0(), bu(), di(), Do(), eh(), fi(), gs() (+26 more)

### Community 66 - "tt"
Cohesion: 0.20
Nodes (22): ui(), ui(), ui(), ui(), ui(), b0(), co(), cs() (+14 more)

### Community 67 - "onboarding-flow.tsx"
Cohesion: 0.08
Nodes (23): saveFitnessOnboardingAction(), dynamic, OnboardingPage(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female (+15 more)

### Community 68 - "le"
Cohesion: 0.11
Nodes (38): bf(), ch(), Ct(), dc(), dd(), df(), gu(), hf() (+30 more)

### Community 69 - "createServerSupabase"
Cohesion: 0.03
Nodes (96): exportUserData(), exportWorkoutHistoryCSV(), approveFitnessPlanAdjustmentAction(), getUserSupportMessages(), submitSupportMessage(), dynamic, POST(), POST() (+88 more)

### Community 70 - "sf"
Cohesion: 0.10
Nodes (23): ad(), ah(), ar(), Bt(), cf(), Fu(), ke(), la() (+15 more)

### Community 71 - "_0"
Cohesion: 0.19
Nodes (22): _0(), ai(), Cl(), cm(), D0(), dn(), Ei(), fe() (+14 more)

### Community 72 - "F"
Cohesion: 0.07
Nodes (5): C, F, I, k(), q

### Community 73 - "AIPlanAnimation.tsx"
Cohesion: 0.09
Nodes (35): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+27 more)

### Community 74 - "Ih"
Cohesion: 0.05
Nodes (60): Ih(), ah(), as(), b0(), bf(), bm(), da(), dc() (+52 more)

### Community 75 - ".get"
Cohesion: 0.19
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "fitness-notifications.ts"
Cohesion: 0.17
Nodes (19): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), getUnreadNotificationsCountAction(), markAllNotificationsAsReadAction() (+11 more)

### Community 77 - "kf"
Cohesion: 0.10
Nodes (29): ai(), as(), cm(), Ct(), dc(), Es(), ff(), fl() (+21 more)

### Community 78 - "vc"
Cohesion: 0.07
Nodes (26): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+18 more)

### Community 79 - "r"
Cohesion: 0.09
Nodes (44): ai(), as(), At(), c0(), dn(), fo(), ge(), ha() (+36 more)

### Community 80 - "ee"
Cohesion: 0.17
Nodes (20): c0(), cf(), ci(), ee(), ef(), Fu(), hc(), hi() (+12 more)

### Community 81 - "Q"
Cohesion: 0.11
Nodes (9): r0(), r0(), r0(), r0(), r0(), r0(), r0(), Q() (+1 more)

### Community 82 - "uc"
Cohesion: 0.11
Nodes (29): er(), Fn(), ft(), gr(), Ic(), ir(), ju(), Kn() (+21 more)

### Community 83 - "Ph"
Cohesion: 0.04
Nodes (77): Ph(), A0(), ar(), b0(), Bt(), bu(), cf(), Cl() (+69 more)

### Community 84 - "ku"
Cohesion: 0.12
Nodes (13): df(), hf(), ic(), ku(), lf, _o(), a(), pf() (+5 more)

### Community 85 - "Ye"
Cohesion: 0.24
Nodes (21): Da(), dh(), dt(), ea(), fh(), gh(), hh(), jd() (+13 more)

### Community 86 - "l"
Cohesion: 0.07
Nodes (57): ar(), ch(), co(), cs(), Ct(), dd(), df(), Dl() (+49 more)

### Community 87 - "Ye"
Cohesion: 0.18
Nodes (24): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+16 more)

### Community 88 - "l"
Cohesion: 0.13
Nodes (33): bi(), bo(), co(), cs(), eo(), fo(), ho(), hs() (+25 more)

### Community 89 - "r"
Cohesion: 0.13
Nodes (41): S, ot(), an(), b0(), bu(), di(), Do(), eh() (+33 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.13
Nodes (21): updateRemindersAction(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS, REMINDER_TYPES, ReminderTypeSheet() (+13 more)

### Community 91 - "Ft"
Cohesion: 0.09
Nodes (39): c0(), cf(), ci(), Dl(), dn(), ee(), ef(), Fr() (+31 more)

### Community 92 - "fl"
Cohesion: 0.12
Nodes (26): an(), bc(), cd(), D(), E0(), ed(), Es(), Hl() (+18 more)

### Community 93 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 94 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+9 more)

### Community 95 - "fu"
Cohesion: 0.09
Nodes (27): bm(), ds(), $f(), G0(), Ga(), Gf(), If(), Jr() (+19 more)

### Community 96 - "uc"
Cohesion: 0.10
Nodes (29): ad(), as(), bd(), D(), dh(), fh(), Fn(), gr() (+21 more)

### Community 97 - "l"
Cohesion: 0.07
Nodes (71): ad(), b0(), Ba(), t(), bi(), bo(), co(), cs() (+63 more)

### Community 98 - "import-usda-foundation-foods.mjs"
Cohesion: 0.11
Nodes (17): buildRow(), DEFAULT_JSON_PATH, dryRun, findRecord(), IMPORT_MAP, missing, nutrient(), payload (+9 more)

### Community 99 - "rf"
Cohesion: 0.12
Nodes (32): _0(), c0(), cf(), ch(), ci(), ee(), ef(), Fr() (+24 more)

### Community 100 - "rf"
Cohesion: 0.12
Nodes (27): ad(), ao(), At(), fs(), gd(), gi(), Gt(), Hr() (+19 more)

### Community 101 - "l"
Cohesion: 0.08
Nodes (58): ar(), Ba(), t(), bi(), bo(), ch(), co(), cs() (+50 more)

### Community 102 - "Ih"
Cohesion: 0.05
Nodes (62): Ih(), bf(), bm(), cn(), co(), cs(), da(), dc() (+54 more)

### Community 103 - "_0"
Cohesion: 0.25
Nodes (18): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), Gl() (+10 more)

### Community 104 - "lf"
Cohesion: 0.26
Nodes (14): ao(), fs(), gi(), lf(), ms(), _o(), os(), Rl() (+6 more)

### Community 105 - "B"
Cohesion: 0.12
Nodes (51): Da(), dt(), ea(), gc(), gh(), hh(), jd(), mh() (+43 more)

### Community 106 - "ee"
Cohesion: 0.23
Nodes (16): _0(), ci(), Dl(), ee(), ef(), is(), jt(), lo() (+8 more)

### Community 107 - "D0"
Cohesion: 0.26
Nodes (17): D0(), dn(), Ei(), fe(), ff(), Fl(), Gl(), Gn() (+9 more)

### Community 108 - "c0"
Cohesion: 0.15
Nodes (24): bs(), bs(), bs(), bs(), c0(), D0(), df(), fe() (+16 more)

### Community 109 - "l"
Cohesion: 0.10
Nodes (56): ad(), Ba(), t(), bf(), bi(), bo(), ch(), Ct() (+48 more)

### Community 110 - "Ph"
Cohesion: 0.04
Nodes (99): Ph(), A0(), ai(), bc(), bf(), bh(), bm(), cd() (+91 more)

### Community 111 - "rf"
Cohesion: 0.12
Nodes (31): af(), ao(), ch(), cn(), fs(), gi(), Hr(), Kl() (+23 more)

### Community 112 - "ue"
Cohesion: 0.24
Nodes (11): ad(), ar(), Bt(), la(), Ln(), nr(), sc(), Sm() (+3 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "Ye"
Cohesion: 0.10
Nodes (25): aa(), Bt(), er(), ju(), ke(), lh(), Ln(), md() (+17 more)

### Community 115 - "s"
Cohesion: 0.19
Nodes (24): $h(), di(), fi(), oh(), Qu(), b(), f(), g() (+16 more)

### Community 116 - "ve"
Cohesion: 0.15
Nodes (30): _0(), ao(), ci(), D0(), df(), ee(), ef(), Ei() (+22 more)

### Community 117 - "lt"
Cohesion: 0.29
Nodes (7): ad(), lt(), mu(), qr(), ts(), wh(), x0()

### Community 118 - "D0"
Cohesion: 0.28
Nodes (16): D0(), dn(), Ei(), fe(), ff(), Fl(), Gl(), Gn() (+8 more)

### Community 119 - "af"
Cohesion: 0.24
Nodes (13): af(), Do(), en(), fs(), ll(), ms(), _o(), os() (+5 more)

### Community 120 - "mi"
Cohesion: 0.15
Nodes (23): c0(), cf(), ci(), ee(), ef(), Fu(), hc(), hi() (+15 more)

### Community 121 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 122 - "nu"
Cohesion: 0.07
Nodes (15): dl(), eu(), gf, ir(), jf(), jr, nu, pl (+7 more)

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "_0"
Cohesion: 0.24
Nodes (18): _0(), D0(), Ei(), fe(), ff(), gd(), Gl(), Gn() (+10 more)

### Community 125 - "yf"
Cohesion: 0.20
Nodes (7): hc, kc(), lc, mf(), ro, vf(), yf

### Community 126 - "ee"
Cohesion: 0.27
Nodes (14): c0(), cf(), ci(), ee(), ef(), is(), lo(), ml() (+6 more)

### Community 127 - "sf"
Cohesion: 0.09
Nodes (43): _0(), ao(), bc(), Bl(), bm(), cd(), ci(), Dd() (+35 more)

### Community 128 - "_o"
Cohesion: 0.50
Nodes (4): _o(), Pa(), qs(), vs()

### Community 129 - "r"
Cohesion: 0.13
Nodes (31): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+23 more)

### Community 131 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 132 - "l"
Cohesion: 0.09
Nodes (62): At(), bi(), bo(), Ct(), dd(), df(), ea(), eo() (+54 more)

### Community 133 - "dx"
Cohesion: 0.18
Nodes (25): dx(), $h(), hx(), C(), E(), bd(), D(), dh() (+17 more)

### Community 136 - "r"
Cohesion: 0.10
Nodes (54): $h(), af(), b0(), bh(), bu(), D(), di(), Do() (+46 more)

### Community 137 - "_0"
Cohesion: 0.24
Nodes (18): _0(), D0(), df(), Ei(), fe(), Gl(), Gn(), Lu() (+10 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 141 - "$h"
Cohesion: 0.14
Nodes (26): $h(), ct(), el(), g(), m(), r(), Re(), zt() (+18 more)

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
Cohesion: 0.18
Nodes (17): _a(), af(), ds(), fs(), G0(), Gt(), hn(), kr() (+9 more)

### Community 147 - "dx"
Cohesion: 0.07
Nodes (58): am(), ap(), ax(), Bn, cx(), de(), Dn(), dx() (+50 more)

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

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 158 - "next"
Cohesion: 0.04
Nodes (46): CoachPage(), metadata, metadata, metadata, ProfileLoading(), ProgressLoading(), dynamic, CoachHeader() (+38 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 164 - "nutrition-service.ts"
Cohesion: 0.06
Nodes (54): GET(), POST(), DELETE(), DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES, GET() (+46 more)

### Community 170 - "wf"
Cohesion: 0.10
Nodes (21): aa(), Ei(), hd(), I(), Ii(), js(), ke(), mn() (+13 more)

### Community 175 - "gsap-C8IefbVz.js"
Cohesion: 0.32
Nodes (5): e(), Ml(), Ol(), tr(), xa

## Knowledge Gaps
- **530 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+525 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 880 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `Ui`, `index-B23vSfwu.js`, `Ot`, `Ph`, `_c`, `index-Buds9Sm1.js`, `st`, `index-DtLkR01C.js`, `au`, `Bi`, `of`, `il`, `r`, `.add`, `uc`, `uc`, `index-CoRpx3FC.js`, `Pt`, `pr`, `wf`, `bt`, `gsap-C8IefbVz.js`, `Ih`, `dx`, `et`, `Oi`, `nn`, `Ye`, `M0`, `e`, `uc`, `tt`, `le`, `.get`, `kf`, `vc`, `Q`, `uc`, `ku`, `l`, `r`, `Ft`, `fl`, `fu`, `uc`, `rf`, `l`, `_0`, `B`, `c0`, `Ph`, `ve`, `mi`, `nu`, `yf`, `sf`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `index-B23vSfwu.js`, `l`, `st`, `Bi`, `r`, `il`, `uc`, `wf`, `dx`, `et`, `tt`, `sf`, `vc`, `ku`, `Ye`, `fl`, `fu`, `B`, `ee`, `c0`, `rf`, `s`, `D0`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `index-B23vSfwu.js`, `st`, `Bi`, `il`, `r`, `index-CoRpx3FC.js`, `l`, `wf`, `et`, `e`, `Ye`, `lf`, `tt`, `vc`, `ku`, `fl`, `rf`, `B`, `D0`, `c0`, `lt`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._