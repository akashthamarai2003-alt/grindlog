# Graph Report - web  (2026-09-24)

## Corpus Check
- 426 files · ~3,441,076 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6456 nodes · 22786 edges · 177 communities (161 shown, 16 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b565e24a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- (fitness)/page.tsx
- _
- l
- Ot
- dx
- fitness.ts
- Ph
- index-B23vSfwu.js
- index-Buds9Sm1.js
- Ph
- react
- Ye
- progress-view.tsx
- dx
- dx
- M0
- Ih
- r
- analyze/route.ts
- rf
- createAdminClient
- rf
- import-usda-foundation-foods.mjs
- sf
- bl
- l
- r
- l
- af
- exercise-browser.tsx
- r
- r
- dx
- groq/client.ts
- B
- of
- Ye
- he
- index-DtLkR01C.js
- uc
- l
- zn
- navigation-context.tsx
- et
- fitness-ai/generate-plan/route.ts
- access.ts
- sf
- Ta
- dependencies
- Vc
- Q
- fitness-dashboard.tsx
- AIPlanAnimation.tsx
- Ph
- onboarding-flow.tsx
- index-LDG-1p68.js
- pr
- Ye
- swap-meal/route.ts
- constants.ts
- ve
- dx
- uf
- Ih
- fitness-reminders/route.ts
- r
- fu
- uc
- Ye
- sf
- We
- _0
- F
- _0
- workout-view.tsx
- .get
- fitness-notifications.ts
- rf
- ut
- sf
- i
- bt
- tt
- uc
- rf
- pc
- of
- uc
- ee
- uc
- reminders-client.tsx
- Wh
- users-table-client.tsx
- vc
- Ih
- l
- ki
- r
- r0
- Ph
- af
- r
- app/package.json
- ee
- yf
- t
- _0
- ei
- Ih
- r
- plan-setup/page.tsx
- _0
- of
- compilerOptions
- _0
- l
- test_nutrition_engine.mjs
- st
- _0
- ref_framer_motion
- l
- use-auth.ts
- nu
- manifest.json
- nn
- workout-heatmap.tsx
- Ye
- sf
- .add
- zf
- l
- wf
- sf
- C
- yf
- devDependencies
- r
- grocery-tab.tsx
- D0
- rf
- Ih
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- lucide-react
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- ee
- springs.ts
- progression.ts
- ue
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- sf
- coach.ts
- package.json
- next-pwa.d.ts
- firebase-messaging-sw.js
- Data import scripts
- nutrition-service.ts
- rules/graphify.md
- workflows/graphify.md
- (fitness)/support/page.tsx
- le
- next-env.d.ts
- createServerSupabase
- D0
- supabase/middleware.ts

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
- `Recent Decisions` --references--> `FitnessLayout()`  [INFERRED]
  .planning/STATE.md → app/app/(fitness)/layout.tsx
- `3. Workout Logging & State Persistence` --references--> `WorkoutHeader()`  [INFERRED]
  .planning/codebase/TESTING.md → app/components/fitness/workout/workout-header.tsx
- `1. Performance Standards (Mobile 60fps Target)` --references--> `BottomNav()`  [INFERRED]
  .planning/codebase/CONVENTIONS.md → app/components/fitness/dashboard/bottom-nav.tsx
- `Phase 1: Core Performance & Tab Optimization [COMPLETED]` --references--> `BottomNav()`  [INFERRED]
  .planning/ROADMAP.md → app/components/fitness/dashboard/bottom-nav.tsx
- `Recent Decisions` --references--> `FitnessShell()`  [INFERRED]
  .planning/STATE.md → app/components/fitness/fitness-shell.tsx

## Import Cycles
- None detected.

## Communities (177 total, 16 thin omitted)

### Community 0 - "(fitness)/page.tsx"
Cohesion: 0.09
Nodes (14): DashboardBelow(), dynamic, revalidate, dynamic, WorkoutContent(), DashboardInstantFallback(), DashboardSkeleton(), WorkoutInstantFallback() (+6 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (121): _, aa, ac(), ao(), As, at, Be(), bf() (+113 more)

### Community 2 - "l"
Cohesion: 0.09
Nodes (47): ao(), ar(), bi(), bo(), co(), cs(), eo(), fo() (+39 more)

### Community 3 - "Ot"
Cohesion: 0.06
Nodes (94): Xx(), Yx(), Xx(), ap(), ax(), Bn, cm(), ep() (+86 more)

### Community 4 - "dx"
Cohesion: 0.08
Nodes (26): e(), Ml(), Ol(), tr(), de(), Dn(), dx(), El() (+18 more)

### Community 5 - "fitness.ts"
Cohesion: 0.05
Nodes (72): completeExerciseSetsAction(), completeSetAction(), discardWorkoutSessionAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), reopenWorkoutAction(), resetWorkoutTimerAction(), resumeWorkoutSessionAction() (+64 more)

### Community 6 - "Ph"
Cohesion: 0.04
Nodes (82): Ph(), aa(), bc(), Bd(), Bl(), bm(), Bt(), cd() (+74 more)

### Community 7 - "index-B23vSfwu.js"
Cohesion: 0.08
Nodes (69): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+61 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.05
Nodes (105): $, A, b, c(), D, e(), f, g (+97 more)

### Community 9 - "Ph"
Cohesion: 0.04
Nodes (78): Ih(), Ph(), ad(), ar(), as(), bh(), br(), bu() (+70 more)

### Community 10 - "react"
Cohesion: 0.04
Nodes (32): loginAdminAction(), getUnreadNotificationsCountAction(), AdminLogin(), handleSubmit(), metadata, viewport, Providers(), DashboardHeader() (+24 more)

### Community 11 - "Ye"
Cohesion: 0.23
Nodes (21): bd(), Da(), dh(), dt(), ea(), fh(), gc(), gh() (+13 more)

### Community 12 - "progress-view.tsx"
Cohesion: 0.06
Nodes (48): ProgressContent(), app_assets_images_placeholder_goal, app_components_fitness_pro_upgrade_modal_proupgrademodal, AchievementsShowcase(), ActivityRecoveryAnalyticsCard(), AIProgressReviewCard(), BodyMeasurementsList(), BodyProgressPhotos() (+40 more)

### Community 13 - "dx"
Cohesion: 0.06
Nodes (66): am(), ap(), ax(), Bn, cx(), de(), Dn(), dx() (+58 more)

### Community 14 - "dx"
Cohesion: 0.06
Nodes (63): am(), ap(), ax(), Bn, cx(), de(), Dn(), dx() (+55 more)

### Community 15 - "M0"
Cohesion: 0.19
Nodes (16): hx(), C(), E(), bd(), D(), dh(), fh(), hu() (+8 more)

### Community 16 - "Ih"
Cohesion: 0.04
Nodes (81): Ih(), ad(), an(), as(), bc(), c0(), cd(), Cl() (+73 more)

### Community 17 - "r"
Cohesion: 0.14
Nodes (42): ai(), bu(), c0(), di(), Do(), fi(), Fr(), ft() (+34 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.05
Nodes (51): POST(), maxDuration, POST(), stableStringify(), stripImagePayload(), AIStartingReportPage(), displayValue(), dynamic (+43 more)

### Community 19 - "rf"
Cohesion: 0.08
Nodes (49): _0(), af(), ao(), At(), cf(), ch(), ci(), cn() (+41 more)

### Community 20 - "createAdminClient"
Cohesion: 0.05
Nodes (71): createCouponAction(), toggleCouponStatusAction(), getPlanPricesAction(), updatePlanPricesAction(), acceptFreePreviewAction(), checkUserPremiumStatusAction(), claimSpinDiscountAction(), createMessageTopUpOrder() (+63 more)

### Community 21 - "rf"
Cohesion: 0.13
Nodes (21): ad(), af(), At(), Hr(), Kl(), ls(), mu(), nn() (+13 more)

### Community 22 - "import-usda-foundation-foods.mjs"
Cohesion: 0.09
Nodes (22): ALLERGEN_MAP, content, filePath, lines, newLines, buildRow(), DEFAULT_JSON_PATH, dryRun (+14 more)

### Community 23 - "sf"
Cohesion: 0.20
Nodes (12): Ct(), Fu(), Jl(), ke(), la(), lh(), md(), Mi() (+4 more)

### Community 24 - "bl"
Cohesion: 0.06
Nodes (20): bl(), n(), a(), Fn(), hu(), il, jr, ma() (+12 more)

### Community 25 - "l"
Cohesion: 0.08
Nodes (53): ar(), At(), bi(), bo(), ch(), co(), cs(), df() (+45 more)

### Community 26 - "r"
Cohesion: 0.15
Nodes (40): ai(), b0(), bu(), di(), Do(), eh(), fi(), ft() (+32 more)

### Community 27 - "l"
Cohesion: 0.08
Nodes (37): aa(), Ba(), t(), bf(), ch(), Ct(), ds(), Ei() (+29 more)

### Community 28 - "af"
Cohesion: 0.21
Nodes (17): af(), bo(), fs(), hn(), io(), ll(), ms(), _o() (+9 more)

### Community 29 - "exercise-browser.tsx"
Cohesion: 0.16
Nodes (10): CustomExerciseForm(), ExerciseBrowser(), ExerciseBrowserContent(), exerciseCache, LibraryExercise, GENERATION_STEPS, PlanGeneration(), WorkoutHeader() (+2 more)

### Community 30 - "r"
Cohesion: 0.18
Nodes (33): ai(), bu(), di(), Do(), fi(), Fr(), Gt(), hd() (+25 more)

### Community 31 - "r"
Cohesion: 0.13
Nodes (43): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+35 more)

### Community 32 - "dx"
Cohesion: 0.07
Nodes (62): am(), ap(), ax(), Bn, cm(), cx(), de(), Dn() (+54 more)

### Community 33 - "groq/client.ts"
Cohesion: 0.26
Nodes (9): POST(), generateAIResponse(), getGroqApiKeys(), getGroqClient(), getGroqClientForKey(), GROQ_MODELS, groqClients, RouteModel (+1 more)

### Community 34 - "B"
Cohesion: 0.15
Nodes (29): Da(), dh(), dt(), ea(), fh(), gh(), hh(), ic() (+21 more)

### Community 35 - "of"
Cohesion: 0.15
Nodes (39): ot(), ad(), an(), bh(), di(), eh(), fi(), Gt() (+31 more)

### Community 36 - "Ye"
Cohesion: 0.12
Nodes (33): hx(), E(), M(), _a(), bd(), bh(), Bt(), dh() (+25 more)

### Community 37 - "he"
Cohesion: 0.11
Nodes (29): bs(), bs(), bs(), bs(), $h(), ct(), el(), m() (+21 more)

### Community 38 - "index-DtLkR01C.js"
Cohesion: 0.09
Nodes (58): am(), ap(), ax(), Bn(), Bx, Cc(), cx(), de() (+50 more)

### Community 39 - "uc"
Cohesion: 0.09
Nodes (36): er(), Fn(), ft(), gr(), Ic(), Il(), ir(), ju() (+28 more)

### Community 40 - "l"
Cohesion: 0.08
Nodes (57): a0(), ar(), bi(), co(), cs(), Ct(), dd(), df() (+49 more)

### Community 41 - "zn"
Cohesion: 0.29
Nodes (17): _a(), dt(), gc(), gh(), hh(), jd(), mh(), nd() (+9 more)

### Community 42 - "navigation-context.tsx"
Cohesion: 0.08
Nodes (24): BottomNav(), TodaysWorkoutCard(), TodaysWorkoutCardProps, FitnessShellInner(), NavigationContext, NavigationContextType, NavigationProvider(), useInstantNav() (+16 more)

### Community 43 - "et"
Cohesion: 0.08
Nodes (13): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), rr(), rr() (+5 more)

### Community 44 - "fitness-ai/generate-plan/route.ts"
Cohesion: 0.04
Nodes (114): maxDuration, POST(), GenerateGroceryResponseSchema, POST(), maxDuration, POST(), POST(), POST() (+106 more)

### Community 45 - "access.ts"
Cohesion: 0.04
Nodes (57): approveFitnessPlanAdjustmentAction(), deleteR2File(), deleteScanPhotosFromR2(), isR2Configured, POST(), dynamic, GET(), POST() (+49 more)

### Community 46 - "sf"
Cohesion: 0.12
Nodes (49): ad(), ai(), an(), b0(), bo(), di(), eh(), fi() (+41 more)

### Community 47 - "Ta"
Cohesion: 0.05
Nodes (56): A0(), as(), bc(), Bl(), bm(), cd(), Cl(), Ct() (+48 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "Vc"
Cohesion: 0.08
Nodes (32): Bd(), Bl(), bm(), dc(), Dl(), ed(), G0(), gu() (+24 more)

### Community 50 - "Q"
Cohesion: 0.08
Nodes (15): r0(), r0(), r0(), r0(), r0(), r0(), r0(), Ae() (+7 more)

### Community 51 - "fitness-dashboard.tsx"
Cohesion: 0.13
Nodes (16): ExerciseLibraryCard(), FitnessDashboard(), FitnessDashboardProps, HorizontalCalendar(), HorizontalCalendarProps, ProNutritionGenerationCard(), TransformationCard(), TransformationCardProps (+8 more)

### Community 52 - "AIPlanAnimation.tsx"
Cohesion: 0.13
Nodes (24): AICharacter(), AICharacterProps, AIPlanAnimation(), AIPlanAnimationProps, DEFAULT_FALLBACK_PROFILE, PILL_CONFIGS, PillConfig, ProfileSummary (+16 more)

### Community 53 - "Ph"
Cohesion: 0.05
Nodes (72): Ph(), ar(), Bd(), bh(), br(), Bt(), bu(), cr() (+64 more)

### Community 54 - "onboarding-flow.tsx"
Cohesion: 0.09
Nodes (20): app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_left, app_assets_images_placeholder_left_female (+12 more)

### Community 55 - "index-LDG-1p68.js"
Cohesion: 0.04
Nodes (120): $, A, b, c(), D, e(), f, g (+112 more)

### Community 56 - "pr"
Cohesion: 0.09
Nodes (10): du(), Hn(), lr(), lu(), _n, or(), pr, pu() (+2 more)

### Community 57 - "Ye"
Cohesion: 0.14
Nodes (32): ar(), bu(), Da(), dh(), dt(), ea(), er(), ft() (+24 more)

### Community 58 - "swap-meal/route.ts"
Cohesion: 0.11
Nodes (22): ALLOWED_MEAL_TYPES, isDietCompatible(), isFoodAvailable(), isFoodBlocked(), matchesTerm(), normalize(), POST(), profileTerms() (+14 more)

### Community 59 - "constants.ts"
Cohesion: 0.05
Nodes (89): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), GroceryPage(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps (+81 more)

### Community 60 - "ve"
Cohesion: 0.10
Nodes (44): ao(), c0(), cf(), ci(), cm(), D0(), df(), Dl() (+36 more)

### Community 61 - "dx"
Cohesion: 0.11
Nodes (30): am(), de(), Dn(), dx(), El(), Ex(), $h(), Ha() (+22 more)

### Community 62 - "uf"
Cohesion: 0.08
Nodes (45): as(), c0(), cf(), ci(), Cl(), cm(), ee(), ef() (+37 more)

### Community 63 - "Ih"
Cohesion: 0.04
Nodes (79): Ih(), ah(), an(), as(), b0(), bc(), bf(), bm() (+71 more)

### Community 64 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 65 - "r"
Cohesion: 0.14
Nodes (41): b0(), bh(), bu(), di(), Do(), eh(), fi(), Fr() (+33 more)

### Community 66 - "fu"
Cohesion: 0.06
Nodes (40): bm(), Dl(), ds(), ea(), $f(), G0(), Ga(), Gf() (+32 more)

### Community 67 - "uc"
Cohesion: 0.14
Nodes (20): Fn(), gr(), I(), jc(), ju(), ld(), n0(), Pn() (+12 more)

### Community 68 - "Ye"
Cohesion: 0.20
Nodes (23): hx(), E(), M(), _a(), bd(), bh(), dt(), gc() (+15 more)

### Community 69 - "sf"
Cohesion: 0.11
Nodes (26): bf(), Ct(), dc(), dd(), gu(), Ii(), Je(), Jl() (+18 more)

### Community 70 - "We"
Cohesion: 0.15
Nodes (20): A0(), an(), bc(), cd(), Es(), Hl(), K0(), Kf() (+12 more)

### Community 71 - "_0"
Cohesion: 0.25
Nodes (17): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+9 more)

### Community 72 - "F"
Cohesion: 0.09
Nodes (4): F, I, k(), q

### Community 73 - "_0"
Cohesion: 0.19
Nodes (21): _0(), D0(), da(), dn(), Ei(), fe(), ff(), Fl() (+13 more)

### Community 74 - "workout-view.tsx"
Cohesion: 0.17
Nodes (13): endWorkoutAction(), quickCompleteWorkoutAction(), ActiveWorkoutResumeCard(), ActiveWorkoutResumeCardProps, AiCoachNote(), AiCoachNoteProps, WeeklyWorkoutView(), WorkoutView() (+5 more)

### Community 75 - ".get"
Cohesion: 0.19
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "fitness-notifications.ts"
Cohesion: 0.22
Nodes (15): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), markAllNotificationsAsReadAction(), markNotificationAsReadAction() (+7 more)

### Community 77 - "rf"
Cohesion: 0.15
Nodes (26): af(), ao(), fs(), gd(), Hr(), Kl(), lf(), ls() (+18 more)

### Community 78 - "ut"
Cohesion: 0.07
Nodes (44): A0(), ai(), bc(), bo(), cd(), Cl(), cm(), Cn() (+36 more)

### Community 79 - "sf"
Cohesion: 0.07
Nodes (47): A0(), ai(), as(), b0(), Cl(), cm(), Dd(), dn() (+39 more)

### Community 80 - "i"
Cohesion: 0.11
Nodes (26): bm(), Dl(), ds(), ea(), $f(), G0(), Ga(), Gf() (+18 more)

### Community 81 - "bt"
Cohesion: 0.19
Nodes (13): _0(), dn(), lf(), ma(), mu(), oc(), pd(), sh() (+5 more)

### Community 82 - "tt"
Cohesion: 0.13
Nodes (19): bo(), da(), Fa(), fo(), go(), hs(), ll(), oc() (+11 more)

### Community 83 - "uc"
Cohesion: 0.15
Nodes (18): br(), cr(), Fn(), id(), ju(), Kn(), l0(), Mr() (+10 more)

### Community 84 - "rf"
Cohesion: 0.10
Nodes (42): _0(), af(), ao(), At(), cf(), ch(), ci(), ee() (+34 more)

### Community 85 - "pc"
Cohesion: 0.14
Nodes (31): aa(), Da(), dh(), dt(), ea(), gh(), hh(), jd() (+23 more)

### Community 86 - "of"
Cohesion: 0.13
Nodes (32): ao(), bo(), c0(), ci(), ee(), ef(), a(), i() (+24 more)

### Community 87 - "uc"
Cohesion: 0.10
Nodes (31): a0(), ds(), er(), Fn(), ft(), gr(), i0(), Ic() (+23 more)

### Community 88 - "ee"
Cohesion: 0.25
Nodes (15): c0(), cf(), ci(), ee(), ef(), gs(), is(), lo() (+7 more)

### Community 89 - "uc"
Cohesion: 0.10
Nodes (28): er(), fh(), Fn(), gr(), I(), i0(), Ic(), Il() (+20 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.09
Nodes (30): toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), updateRemindersAction(), ProfileLoading(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient() (+22 more)

### Community 91 - "Wh"
Cohesion: 0.16
Nodes (24): am(), $h(), hx(), C(), E(), bd(), D(), dh() (+16 more)

### Community 92 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 93 - "vc"
Cohesion: 0.07
Nodes (26): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+18 more)

### Community 94 - "Ih"
Cohesion: 0.05
Nodes (79): Ih(), A0(), ad(), an(), as(), bc(), Bt(), cd() (+71 more)

### Community 95 - "l"
Cohesion: 0.06
Nodes (72): ar(), At(), b0(), bi(), bo(), ch(), co(), cs() (+64 more)

### Community 96 - "ki"
Cohesion: 0.11
Nodes (18): bf(), dc(), jh(), Ki(), Kl(), Kr(), mf(), Nh() (+10 more)

### Community 97 - "r"
Cohesion: 0.08
Nodes (53): bf(), bi(), ch(), co(), cs(), eo(), fo(), gd() (+45 more)

### Community 98 - "r0"
Cohesion: 0.16
Nodes (17): bm(), $f(), G0(), Ga(), Gf(), If(), Jr(), of() (+9 more)

### Community 99 - "Ph"
Cohesion: 0.04
Nodes (77): Ph(), aa(), ad(), as(), bf(), bh(), bm(), Bt() (+69 more)

### Community 100 - "af"
Cohesion: 0.18
Nodes (19): af(), ao(), fs(), lf(), ls(), ms(), nn(), no() (+11 more)

### Community 101 - "r"
Cohesion: 0.09
Nodes (68): S, af(), an(), ao(), b0(), bu(), di(), dn() (+60 more)

### Community 102 - "app/package.json"
Cohesion: 0.04
Nodes (43): FitnessChatbot(), Message, config, filteredRuntimeCaching, nextConfig, framer-motion, name, private (+35 more)

### Community 103 - "ee"
Cohesion: 0.14
Nodes (23): c0(), cf(), ci(), ee(), ef(), Fu(), hc(), hi() (+15 more)

### Community 104 - "yf"
Cohesion: 0.15
Nodes (10): df(), hc, hf(), kc(), lc, mf(), pf(), ro (+2 more)

### Community 105 - "t"
Cohesion: 0.09
Nodes (48): af(), At(), b0(), bi(), co(), cs(), fs(), gd() (+40 more)

### Community 106 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+8 more)

### Community 107 - "ei"
Cohesion: 0.23
Nodes (16): ao(), c0(), ci(), ee(), ef(), is(), lo(), ml() (+8 more)

### Community 108 - "Ih"
Cohesion: 0.04
Nodes (85): Ih(), bf(), bh(), bm(), cn(), dc(), Dl(), ds() (+77 more)

### Community 109 - "r"
Cohesion: 0.15
Nodes (27): $h(), ct(), el(), g(), m(), r(), Re(), zt() (+19 more)

### Community 110 - "plan-setup/page.tsx"
Cohesion: 0.27
Nodes (11): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+3 more)

### Community 111 - "_0"
Cohesion: 0.17
Nodes (24): _0(), ai(), Cl(), cm(), D0(), dn(), Ei(), fe() (+16 more)

### Community 112 - "of"
Cohesion: 0.10
Nodes (38): _a(), af(), At(), ds(), fs(), G0(), Gc(), hf() (+30 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "_0"
Cohesion: 0.20
Nodes (20): _0(), D0(), Ei(), en(), fe(), ff(), Gl(), Gn() (+12 more)

### Community 115 - "l"
Cohesion: 0.09
Nodes (49): ar(), bi(), bo(), co(), cs(), df(), ea(), eo() (+41 more)

### Community 116 - "test_nutrition_engine.mjs"
Cohesion: 0.17
Nodes (4): NutritionValidationEngine, TEST_PROFILES, ref_node_assert, ref_node_crypto

### Community 117 - "st"
Cohesion: 0.12
Nodes (30): T0(), E0(), E0(), T0(), E0(), E0(), E0(), E0() (+22 more)

### Community 118 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+9 more)

### Community 119 - "ref_framer_motion"
Cohesion: 0.04
Nodes (54): FIELD_CONFIGS, FieldConfig, LogMeasurementsPage(), LogWeightPage(), RecentLog, DailyActivityCard(), DailyActivityCardProps, FitnessDashboardBottom() (+46 more)

### Community 120 - "l"
Cohesion: 0.07
Nodes (63): At(), Ba(), t(), bf(), bi(), ch(), co(), cs() (+55 more)

### Community 121 - "use-auth.ts"
Cohesion: 0.06
Nodes (41): ForgotPasswordPage(), ResetPasswordPage(), SignInContent(), SignUpContent(), RoadmapPage(), PlanPreview(), PlanPreviewProps, compressImage() (+33 more)

### Community 122 - "nu"
Cohesion: 0.08
Nodes (8): eu(), gf, ir(), Mn, nu, qu(), Rn(), uc()

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "nn"
Cohesion: 0.07
Nodes (15): ar(), en(), H(), ja(), ls(), nn(), Oi(), ol() (+7 more)

### Community 125 - "workout-heatmap.tsx"
Cohesion: 0.24
Nodes (9): CellData, DAY_LABELS, formatDate(), getIntensityClass(), HeatmapCell, HeatmapProps, INTENSITY_COLORS, MONTH_LABELS (+1 more)

### Community 126 - "Ye"
Cohesion: 0.14
Nodes (29): _a(), dt(), er(), Fa(), ft(), gc(), gh(), hh() (+21 more)

### Community 127 - "sf"
Cohesion: 0.10
Nodes (22): ad(), Bt(), ed(), Jn(), ke(), la(), Ln(), md() (+14 more)

### Community 128 - ".add"
Cohesion: 0.07
Nodes (22): af, Cn(), Gn, Gu(), jf(), kl(), ks(), _l() (+14 more)

### Community 129 - "zf"
Cohesion: 0.32
Nodes (8): mn(), Na(), _o(), Pa(), qs(), vs(), xn(), zf()

### Community 130 - "l"
Cohesion: 0.07
Nodes (61): ar(), Ba(), t(), bi(), ch(), co(), cs(), Ct() (+53 more)

### Community 131 - "wf"
Cohesion: 0.25
Nodes (8): Ei(), hd(), Mi(), Qc(), wd(), wf(), zd(), zf()

### Community 132 - "sf"
Cohesion: 0.08
Nodes (45): A0(), ai(), bc(), Cl(), cm(), Dd(), dn(), Es() (+37 more)

### Community 134 - "yf"
Cohesion: 0.26
Nodes (13): Dl(), hf(), hn(), jf(), jt(), Kt(), mn(), Na() (+5 more)

### Community 135 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 136 - "r"
Cohesion: 0.15
Nodes (37): ai(), bh(), bu(), di(), eh(), fi(), ft(), ge() (+29 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 139 - "D0"
Cohesion: 0.25
Nodes (17): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gn() (+9 more)

### Community 141 - "rf"
Cohesion: 0.10
Nodes (41): as(), bc(), c0(), cd(), cf(), D(), Fr(), Gl() (+33 more)

### Community 142 - "Ih"
Cohesion: 0.06
Nodes (59): Ih(), _a(), A0(), ad(), an(), bd(), Bt(), cn() (+51 more)

### Community 143 - "Key Architectural Patterns"
Cohesion: 0.22
Nodes (8): 1. Parallel Batching vs. Sequential Waterfalls, 2. In-Memory Calendar & Status Math, 3. Immediate Suspense Streaming, 4. Router Caching & Optimistic Tab Transitions, 5. Theme Architecture (Dark & White), Architectural Overview, Architecture & Data Flow — GrindLog, Key Architectural Patterns

### Community 144 - "Technology Stack — GrindLog"
Cohesion: 0.22
Nodes (8): AI & LLM Integrations, Core Runtime & Framework, Data Layer & State, Mobile & PWA, Payments & Subscriptions, Styling & Design System, Technology Stack — GrindLog, Utilities & Validation

### Community 145 - "Critical Test Flows"
Cohesion: 0.22
Nodes (8): 1. Tab Navigation & Instant Switching, 2. Dual-Theme Verification (Dark vs. White), 3. Workout Logging & State Persistence, 4. Nutrition & Calorie Tracking, 5. Authentication & Subscription Guard Rails, Critical Test Flows, Testing & Verification Guide — GrindLog, Verification Commands

### Community 147 - "lucide-react"
Cohesion: 0.04
Nodes (24): FitnessTableClient(), FitnessUserDetails, formatDate(), dynamic, FitnessAdminDashboard(), CoachChat(), CoachHeader(), CoachInput() (+16 more)

### Community 149 - "Concerns, Technical Debt & Watch-Outs — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Database Waterfall Regressions, 2. White Theme CSS Overrides, 3. PWA Service Worker Cache Invalidation, 4. Mobile Keyboard & Viewport Layout Shifts, 5. Razorpay Webhook Idempotency & Webhook Retries, Concerns, Technical Debt & Watch-Outs — GrindLog

### Community 150 - "External Integrations & Services — GrindLog"
Cohesion: 0.25
Nodes (7): 1. Supabase (Database, Auth, Storage), 2. Razorpay (Payment Gateway), 3. Google Gemini AI (@google/genai), 4. PWA Service Worker (Next-PWA & Workbox), 5. Resend (Email Service), 6. Developer Tooling & Agent Workflow Suite, External Integrations & Services — GrindLog

### Community 151 - "Product & Technical Requirements — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Performance & Latency Requirements, 2. Workout & Fitness Requirements, 3. Nutrition & Diet Requirements, 4. Design & Mobile Experience Requirements, 5. Security & Billing Requirements, Product & Technical Requirements — GrindLog

### Community 152 - "ee"
Cohesion: 0.30
Nodes (12): ci(), Cl(), cm(), ee(), ef(), is(), lo(), ml() (+4 more)

### Community 153 - "springs.ts"
Cohesion: 0.20
Nodes (8): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem

### Community 155 - "ue"
Cohesion: 0.40
Nodes (5): Bt(), Ln(), Sm(), ue(), Zn()

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 158 - "sf"
Cohesion: 0.09
Nodes (29): ah(), b0(), bf(), Ct(), dc(), dd(), gu(), Ii() (+21 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 164 - "nutrition-service.ts"
Cohesion: 0.05
Nodes (53): GET(), POST(), DELETE(), DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES, dynamic (+45 more)

### Community 169 - "(fitness)/support/page.tsx"
Cohesion: 0.18
Nodes (14): fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), getUserSupportMessages(), submitSupportMessage(), AdminSupportInbox(), dynamic, FitnessSupportPage() (+6 more)

### Community 170 - "le"
Cohesion: 0.10
Nodes (39): ch(), Ct(), dd(), df(), Fu(), hf(), hn(), Ii() (+31 more)

### Community 175 - "createServerSupabase"
Cohesion: 0.03
Nodes (78): exportUserData(), exportWorkoutHistoryCSV(), saveFitnessOnboardingAction(), dynamic, POST(), POST(), POST(), GET() (+70 more)

### Community 177 - "D0"
Cohesion: 0.25
Nodes (17): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gn() (+9 more)

### Community 182 - "supabase/middleware.ts"
Cohesion: 0.38
Nodes (5): config, updateSession(), config, middleware(), @supabase/ssr

## Knowledge Gaps
- **559 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+554 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 934 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `.add`, `l`, `Ot`, `dx`, `index-B23vSfwu.js`, `index-Buds9Sm1.js`, `Ph`, `dx`, `Ih`, `rf`, `of`, `rf`, `bl`, `af`, `he`, `index-DtLkR01C.js`, `uc`, `zn`, `le`, `et`, `Ta`, `Q`, `Ph`, `index-LDG-1p68.js`, `pr`, `Ye`, `ve`, `uf`, `fu`, `uc`, `_0`, `.get`, `ut`, `bt`, `tt`, `uc`, `pc`, `uc`, `uc`, `vc`, `Ih`, `ki`, `r`, `yf`, `ei`, `Ih`, `_0`, `of`, `st`, `nu`, `nn`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `l`, `Ot`, `dx`, `index-B23vSfwu.js`, `Ih`, `rf`, `r`, `ue`, `B`, `he`, `zn`, `le`, `et`, `Q`, `Ph`, `uf`, `fu`, `We`, `_0`, `Wh`, `vc`, `st`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `index-B23vSfwu.js`, `r`, `dx`, `rf`, `Ih`, `sf`, `ee`, `B`, `he`, `et`, `Q`, `Ph`, `fu`, `uc`, `_0`, `_0`, `vc`, `l`, `ki`, `af`, `st`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._