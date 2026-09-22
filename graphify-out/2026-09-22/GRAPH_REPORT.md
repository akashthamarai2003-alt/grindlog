# Graph Report - web  (2026-09-22)

## Corpus Check
- 408 files · ~3,423,316 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6343 nodes · 22492 edges · 172 communities (161 shown, 11 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `855e5d15`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- af
- _
- fitness.ts
- index-B23vSfwu.js
- M0
- index-BM9U1lvA.js
- Ph
- dx
- index-Buds9Sm1.js
- Ph
- react
- st
- progress-view.tsx
- index-DtLkR01C.js
- constants.ts
- uc
- Ih
- uf
- analyze/route.ts
- index-LDG-1p68.js
- createAdminClient
- nutrition-view.tsx
- lucide-react
- We
- il
- l
- r
- .add
- access.ts
- je
- uc
- n
- c0
- r0
- of
- l
- i
- lf
- n
- Ot
- r
- rf
- pr
- tt
- generate-draft/route.ts
- lf
- sf
- Wh
- dependencies
- Q
- Ih
- dx
- et
- Ph
- fitness-notifications.ts
- Rs
- dx
- r
- Ye
- ei
- uc
- B
- wf
- E
- rf
- r
- r
- onboarding-flow.tsx
- l
- getCachedUser
- Ye
- ve
- F
- lf
- Ih
- .get
- sf
- l
- vc
- bt
- mi
- bf
- Ih
- Hi
- createServerSupabase
- Ye
- (fitness)/page.tsx
- Ye
- We
- r
- reminders-client.tsx
- of
- dx
- users-table-client.tsx
- _0
- Wh
- Ph
- l
- import-usda-foundation-foods.mjs
- ie
- rf
- l
- Ih
- ee
- r
- uc
- yf
- D0
- c0
- l
- workout-view.tsx
- _0
- _0
- compilerOptions
- plan-setup/page.tsx
- r
- We
- fu
- ue
- yf
- uf
- ue
- nu
- manifest.json
- _0
- yf
- uc
- prompts.ts
- swap-meal/route.ts
- workout-heatmap.tsx
- Ft
- fitness-reminders/route.ts
- l
- dl
- Uo
- wf
- r
- _0
- grocery-tab.tsx
- le
- wf
- ox
- fitness/page.tsx
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- af
- ai-insight-card.tsx
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- use-auth.ts
- progression.ts
- springs.ts
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- coach.ts
- package.json
- app/package.json
- firebase-messaging-sw.js
- Data import scripts
- nutrition-service.ts
- rules/graphify.md
- workflows/graphify.md
- zn
- next-env.d.ts
- D0

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
- `1. Performance Standards (Mobile 60fps Target)` --references--> `BottomNav()`  [INFERRED]
  .planning/codebase/CONVENTIONS.md → app/components/fitness/dashboard/bottom-nav.tsx
- `Phase 1: Core Performance & Tab Optimization [COMPLETED]` --references--> `BottomNav()`  [INFERRED]
  .planning/ROADMAP.md → app/components/fitness/dashboard/bottom-nav.tsx
- `Naming & File Conventions` --references--> `WorkoutSummaryCard()`  [INFERRED]
  .planning/codebase/STRUCTURE.md → app/components/fitness/workout/workout-summary-card.tsx
- `Recent Decisions` --references--> `FitnessLayout()`  [INFERRED]
  .planning/STATE.md → app/app/(fitness)/layout.tsx

## Import Cycles
- None detected.

## Communities (172 total, 11 thin omitted)

### Community 0 - "af"
Cohesion: 0.24
Nodes (16): af(), fs(), hn(), io(), ll(), ms(), no(), _o() (+8 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (125): _, aa, ac(), ao(), As, at, Be(), bf() (+117 more)

### Community 2 - "fitness.ts"
Cohesion: 0.04
Nodes (81): completeExerciseSetsAction(), completeSetAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), reopenWorkoutAction(), resetWorkoutTimerAction(), resumeWorkoutSessionAction(), startWorkoutSessionAction() (+73 more)

### Community 3 - "index-B23vSfwu.js"
Cohesion: 0.07
Nodes (72): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+64 more)

### Community 4 - "M0"
Cohesion: 0.13
Nodes (16): Cn(), dn(), hd(), hu(), I(), jc(), js(), M0() (+8 more)

### Community 5 - "index-BM9U1lvA.js"
Cohesion: 0.08
Nodes (68): am(), ap(), ax(), Bn, Bx, cx(), de(), Dn() (+60 more)

### Community 6 - "Ph"
Cohesion: 0.05
Nodes (77): Ph(), br(), cd(), cf(), cr(), dc(), Dl(), Do() (+69 more)

### Community 7 - "dx"
Cohesion: 0.09
Nodes (44): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+36 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.05
Nodes (98): $, A, b, c(), D, e(), f, g (+90 more)

### Community 9 - "Ph"
Cohesion: 0.05
Nodes (77): Ph(), ad(), Bd(), Bl(), bm(), br(), cf(), cr() (+69 more)

### Community 10 - "react"
Cohesion: 0.12
Nodes (25): AICharacter(), AICharacterProps, AIPlanAnimation(), AIPlanAnimationProps, DEFAULT_FALLBACK_PROFILE, PILL_CONFIGS, PillConfig, ProfileSummary (+17 more)

### Community 11 - "st"
Cohesion: 0.12
Nodes (28): T0(), E0(), E0(), T0(), E0(), E0(), E0(), E0() (+20 more)

### Community 12 - "progress-view.tsx"
Cohesion: 0.07
Nodes (37): app_assets_images_placeholder_goal, AchievementsShowcase(), ActivityRecoveryAnalyticsCard(), AIProgressReviewCard(), BodyMeasurementsList(), BodyProgressPhotos(), NutritionAnalyticsCard(), getPeriodDescription() (+29 more)

### Community 13 - "index-DtLkR01C.js"
Cohesion: 0.04
Nodes (112): $, A, b, c(), D, e(), f, g (+104 more)

### Community 14 - "constants.ts"
Cohesion: 0.05
Nodes (88): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), GroceryPage(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps (+80 more)

### Community 15 - "uc"
Cohesion: 0.09
Nodes (43): _a(), dt(), er(), Fn(), gc(), gh(), gr(), hh() (+35 more)

### Community 16 - "Ih"
Cohesion: 0.05
Nodes (80): Ih(), a0(), ad(), an(), bc(), cd(), Cl(), D() (+72 more)

### Community 17 - "uf"
Cohesion: 0.10
Nodes (36): _0(), as(), b0(), c0(), cf(), ci(), dc(), ee() (+28 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.08
Nodes (33): POST(), POST(), stableStringify(), stripImagePayload(), AIStartingReportPage(), displayValue(), dynamic, isRecord() (+25 more)

### Community 19 - "index-LDG-1p68.js"
Cohesion: 0.07
Nodes (73): am(), ap(), ax(), Bn(), Bx, Cc(), cx(), de() (+65 more)

### Community 20 - "createAdminClient"
Cohesion: 0.05
Nodes (70): createCouponAction(), toggleCouponStatusAction(), getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), checkUserPremiumStatusAction() (+62 more)

### Community 21 - "nutrition-view.tsx"
Cohesion: 0.06
Nodes (45): DailyActivityCard(), DailyActivityCardProps, FitnessDashboardBottom(), FitnessDashboardBottomProps, TodaysGoalsCard(), TodaysGoalsCardProps, formatFoodItem(), TodaysNutritionCard() (+37 more)

### Community 22 - "lucide-react"
Cohesion: 0.03
Nodes (34): loginAdminAction(), AdminLogin(), handleSubmit(), FIELD_CONFIGS, FieldConfig, LogMeasurementsPage(), LogWeightPage(), RecentLog (+26 more)

### Community 23 - "We"
Cohesion: 0.15
Nodes (19): A0(), an(), bc(), cd(), Es(), K0(), Kf(), Ko() (+11 more)

### Community 24 - "il"
Cohesion: 0.06
Nodes (16): n(), a(), Fn(), hu(), il, jr, ma(), nf() (+8 more)

### Community 25 - "l"
Cohesion: 0.08
Nodes (60): ar(), bi(), bo(), ch(), co(), cs(), Ct(), dd() (+52 more)

### Community 26 - "r"
Cohesion: 0.07
Nodes (72): ad(), af(), as(), At(), b0(), bh(), bu(), da() (+64 more)

### Community 27 - ".add"
Cohesion: 0.07
Nodes (19): af, Cn(), Gn, Gu(), kl(), _l(), me(), Mn (+11 more)

### Community 28 - "access.ts"
Cohesion: 0.11
Nodes (22): POST(), FitnessProPage(), metadata, ProfileSubscriptionProps, PricingCard(), PricingCardProps, ProPageClient(), ProPageClientProps (+14 more)

### Community 29 - "je"
Cohesion: 0.10
Nodes (33): At(), bi(), bo(), co(), cs(), fo(), gi(), gs() (+25 more)

### Community 30 - "uc"
Cohesion: 0.18
Nodes (17): as(), Fn(), gr(), ju(), l0(), ld(), pr(), Qa() (+9 more)

### Community 31 - "n"
Cohesion: 0.13
Nodes (42): ot(), an(), bh(), bu(), di(), eh(), fi(), ft() (+34 more)

### Community 32 - "c0"
Cohesion: 0.16
Nodes (22): _0(), c0(), cf(), ci(), ee(), ef(), Fu(), is() (+14 more)

### Community 33 - "r0"
Cohesion: 0.09
Nodes (30): ah(), bm(), Dl(), ds(), ea(), $f(), G0(), Ga() (+22 more)

### Community 34 - "of"
Cohesion: 0.09
Nodes (46): ao(), as(), bo(), c0(), ci(), dn(), ee(), ef() (+38 more)

### Community 35 - "l"
Cohesion: 0.08
Nodes (59): ar(), bi(), bo(), co(), cs(), Ct(), dd(), df() (+51 more)

### Community 36 - "i"
Cohesion: 0.10
Nodes (29): bm(), ea(), $f(), Fa(), G0(), Ga(), Gf(), If() (+21 more)

### Community 37 - "lf"
Cohesion: 0.27
Nodes (14): ao(), fs(), gi(), lf(), ms(), _o(), os(), qt() (+6 more)

### Community 38 - "n"
Cohesion: 0.14
Nodes (40): ot(), an(), bh(), Bt(), bu(), di(), eh(), fi() (+32 more)

### Community 39 - "Ot"
Cohesion: 0.08
Nodes (70): Jx(), Kx(), Vx(), Xx(), Yx(), Vx(), am(), ap() (+62 more)

### Community 40 - "r"
Cohesion: 0.13
Nodes (45): ai(), as(), bu(), di(), Do(), ds(), fi(), Fr() (+37 more)

### Community 41 - "rf"
Cohesion: 0.13
Nodes (29): af(), ao(), ch(), cn(), fs(), gi(), Kl(), lf() (+21 more)

### Community 42 - "pr"
Cohesion: 0.05
Nodes (18): Ae(), br(), cr, du(), _f(), Hn(), lr(), lu() (+10 more)

### Community 43 - "tt"
Cohesion: 0.19
Nodes (23): ui(), ui(), ui(), ui(), bi(), hs(), q0(), uf() (+15 more)

### Community 44 - "generate-draft/route.ts"
Cohesion: 0.05
Nodes (97): GET(), POST(), maxDuration, POST(), GenerateGroceryResponseSchema, POST(), maxDuration, POST() (+89 more)

### Community 45 - "lf"
Cohesion: 0.27
Nodes (14): ao(), fs(), gi(), lf(), ms(), _o(), os(), qt() (+6 more)

### Community 46 - "sf"
Cohesion: 0.18
Nodes (37): ot(), ad(), an(), bo(), di(), eh(), fi(), gs() (+29 more)

### Community 47 - "Wh"
Cohesion: 0.16
Nodes (24): $h(), hx(), C(), E(), bd(), D(), dh(), fh() (+16 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "Q"
Cohesion: 0.07
Nodes (34): r0(), r0(), ah(), bm(), Dl(), ea(), $f(), G0() (+26 more)

### Community 50 - "Ih"
Cohesion: 0.04
Nodes (80): Ih(), A0(), an(), bc(), bf(), bm(), cd(), cn() (+72 more)

### Community 51 - "dx"
Cohesion: 0.06
Nodes (64): am(), ap(), ax(), Bn, cm(), cx(), de(), Dn() (+56 more)

### Community 52 - "et"
Cohesion: 0.08
Nodes (14): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), rr(), rr() (+6 more)

### Community 53 - "Ph"
Cohesion: 0.05
Nodes (64): Ph(), aa(), bh(), Bt(), Cl(), Do(), ed(), en() (+56 more)

### Community 54 - "fitness-notifications.ts"
Cohesion: 0.15
Nodes (21): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), getUnreadNotificationsCountAction(), markAllNotificationsAsReadAction() (+13 more)

### Community 55 - "Rs"
Cohesion: 0.07
Nodes (14): ar(), en(), H(), ja(), ls(), nn(), Oi(), ol() (+6 more)

### Community 56 - "dx"
Cohesion: 0.11
Nodes (20): e(), Ml(), Ol(), tr(), de(), Dn(), dx(), El() (+12 more)

### Community 57 - "r"
Cohesion: 0.10
Nodes (41): ar(), b0(), Cn(), Da(), dh(), dt(), ea(), er() (+33 more)

### Community 58 - "Ye"
Cohesion: 0.30
Nodes (17): Da(), dh(), dt(), ea(), gh(), hh(), jd(), mh() (+9 more)

### Community 59 - "ei"
Cohesion: 0.13
Nodes (23): as(), er(), Fn(), gr(), ju(), Kn(), l0(), ld() (+15 more)

### Community 60 - "uc"
Cohesion: 0.10
Nodes (30): a0(), er(), Fa(), Fn(), gr(), i0(), Ic(), ir() (+22 more)

### Community 61 - "B"
Cohesion: 0.17
Nodes (25): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+17 more)

### Community 62 - "wf"
Cohesion: 0.08
Nodes (40): A0(), ai(), bc(), Bl(), cd(), cm(), Ct(), D() (+32 more)

### Community 63 - "E"
Cohesion: 0.46
Nodes (8): ic(), Il(), nc(), ud(), z(), xx(), E(), M()

### Community 64 - "rf"
Cohesion: 0.12
Nodes (30): af(), ao(), ch(), cn(), fs(), gi(), Kl(), lf() (+22 more)

### Community 65 - "r"
Cohesion: 0.08
Nodes (64): ad(), af(), as(), At(), b0(), bh(), bu(), di() (+56 more)

### Community 66 - "r"
Cohesion: 0.11
Nodes (21): ar(), Bt(), Fr(), ge(), Ln(), nd(), Ns(), qe() (+13 more)

### Community 67 - "onboarding-flow.tsx"
Cohesion: 0.08
Nodes (21): saveFitnessOnboardingAction(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_left (+13 more)

### Community 68 - "l"
Cohesion: 0.07
Nodes (68): ar(), bi(), bo(), ch(), co(), cs(), Ct(), dd() (+60 more)

### Community 69 - "getCachedUser"
Cohesion: 0.03
Nodes (63): CoachPage(), metadata, CustomExercisePage(), metadata, ExercisesPage(), metadata, ExerciseDetailPage(), generateMetadata() (+55 more)

### Community 70 - "Ye"
Cohesion: 0.17
Nodes (25): hx(), E(), M(), _a(), bd(), dh(), dt(), fh() (+17 more)

### Community 71 - "ve"
Cohesion: 0.13
Nodes (34): _0(), c0(), ci(), D0(), Dl(), dn(), ea(), ee() (+26 more)

### Community 72 - "F"
Cohesion: 0.07
Nodes (5): C, F, I, k(), q

### Community 73 - "lf"
Cohesion: 0.31
Nodes (13): ao(), fs(), lf(), ms(), no(), _o(), os(), qt() (+5 more)

### Community 74 - "Ih"
Cohesion: 0.04
Nodes (77): Ih(), an(), b0(), bc(), bf(), cd(), Cl(), co() (+69 more)

### Community 75 - ".get"
Cohesion: 0.19
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "sf"
Cohesion: 0.13
Nodes (22): bf(), Ct(), dd(), Fu(), gu(), Ii(), Jl(), ke() (+14 more)

### Community 77 - "l"
Cohesion: 0.09
Nodes (44): b0(), co(), cs(), fo(), gd(), e(), l(), t() (+36 more)

### Community 78 - "vc"
Cohesion: 0.07
Nodes (26): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+18 more)

### Community 79 - "bt"
Cohesion: 0.10
Nodes (43): ao(), as(), c0(), ci(), dn(), ee(), ef(), ha() (+35 more)

### Community 80 - "mi"
Cohesion: 0.27
Nodes (15): c0(), cf(), ci(), ee(), ef(), is(), lo(), ml() (+7 more)

### Community 81 - "bf"
Cohesion: 0.14
Nodes (20): bf(), bm(), ch(), dc(), Dl(), eo(), gf(), gu() (+12 more)

### Community 82 - "Ih"
Cohesion: 0.05
Nodes (59): Ih(), bf(), Bt(), cn(), da(), dc(), ed(), Fu() (+51 more)

### Community 83 - "Hi"
Cohesion: 0.15
Nodes (17): Dl(), ds(), G0(), Hr(), jt(), kr(), ma(), oc() (+9 more)

### Community 84 - "createServerSupabase"
Cohesion: 0.04
Nodes (81): exportUserData(), exportWorkoutHistoryCSV(), discardWorkoutSessionAction(), quickCompleteWorkoutAction(), dynamic, POST(), POST(), POST() (+73 more)

### Community 85 - "Ye"
Cohesion: 0.25
Nodes (21): Da(), dh(), dt(), ea(), gh(), hh(), jd(), mh() (+13 more)

### Community 86 - "(fitness)/page.tsx"
Cohesion: 0.06
Nodes (30): getUserSupportMessages(), submitSupportMessage(), DashboardBelow(), dynamic, revalidate, dynamic, FitnessSupportPage(), revalidate (+22 more)

### Community 87 - "Ye"
Cohesion: 0.16
Nodes (25): _a(), bd(), bh(), Bt(), dt(), gc(), gh(), hh() (+17 more)

### Community 88 - "We"
Cohesion: 0.09
Nodes (35): A0(), ai(), b0(), bc(), Cl(), cm(), co(), D() (+27 more)

### Community 89 - "r"
Cohesion: 0.11
Nodes (57): S, ot(), af(), an(), b0(), bu(), di(), Do() (+49 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.08
Nodes (33): toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), updateRemindersAction(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS (+25 more)

### Community 91 - "of"
Cohesion: 0.08
Nodes (41): _0(), ao(), At(), cf(), ci(), dn(), ee(), ef() (+33 more)

### Community 92 - "dx"
Cohesion: 0.07
Nodes (62): am(), ap(), ax(), Bn, cm(), cx(), de(), Dn() (+54 more)

### Community 93 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 94 - "_0"
Cohesion: 0.16
Nodes (25): _0(), ai(), Cl(), cm(), D0(), dn(), Ei(), fe() (+17 more)

### Community 95 - "Wh"
Cohesion: 0.16
Nodes (24): $h(), hx(), C(), E(), bd(), D(), dh(), fh() (+16 more)

### Community 96 - "Ph"
Cohesion: 0.04
Nodes (97): Ph(), A0(), ai(), bc(), bf(), bh(), bm(), cd() (+89 more)

### Community 97 - "l"
Cohesion: 0.08
Nodes (55): af(), At(), bf(), bi(), ch(), cs(), Ct(), eo() (+47 more)

### Community 98 - "import-usda-foundation-foods.mjs"
Cohesion: 0.11
Nodes (17): buildRow(), DEFAULT_JSON_PATH, dryRun, findRecord(), IMPORT_MAP, missing, nutrient(), payload (+9 more)

### Community 99 - "ie"
Cohesion: 0.22
Nodes (17): bi(), bo(), fo(), go(), gs(), ho(), hs(), je() (+9 more)

### Community 100 - "rf"
Cohesion: 0.13
Nodes (28): af(), ao(), At(), fs(), gd(), gi(), Hr(), Kl() (+20 more)

### Community 101 - "l"
Cohesion: 0.10
Nodes (38): Ba(), t(), ch(), Ct(), dd(), df(), eo(), hf() (+30 more)

### Community 102 - "Ih"
Cohesion: 0.04
Nodes (84): Ih(), A0(), ad(), an(), bf(), bh(), bm(), Bt() (+76 more)

### Community 103 - "ee"
Cohesion: 0.23
Nodes (16): c0(), cf(), ci(), Dl(), ee(), ef(), is(), jt() (+8 more)

### Community 104 - "r"
Cohesion: 0.15
Nodes (19): ar(), bu(), ft(), ge(), Kn(), la(), lr(), qr() (+11 more)

### Community 105 - "uc"
Cohesion: 0.06
Nodes (56): _a(), Bt(), dt(), er(), Fn(), Fu(), gc(), gh() (+48 more)

### Community 106 - "yf"
Cohesion: 0.33
Nodes (11): hf(), hn(), jf(), Kt(), mn(), Na(), pf(), rh() (+3 more)

### Community 107 - "D0"
Cohesion: 0.24
Nodes (18): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gl() (+10 more)

### Community 108 - "c0"
Cohesion: 0.38
Nodes (13): c0(), D0(), df(), fe(), Gl(), Gn(), Lu(), nt() (+5 more)

### Community 109 - "l"
Cohesion: 0.07
Nodes (65): ad(), At(), Ba(), t(), bf(), bi(), bo(), ch() (+57 more)

### Community 110 - "workout-view.tsx"
Cohesion: 0.22
Nodes (10): endWorkoutAction(), ActiveWorkoutResumeCard(), ActiveWorkoutResumeCardProps, AiCoachNote(), AiCoachNoteProps, WeeklyWorkoutView(), WorkoutViewProps, memoryWorkoutCache (+2 more)

### Community 111 - "_0"
Cohesion: 0.15
Nodes (26): _0(), ai(), Cl(), cm(), D0(), dn(), Ei(), fe() (+18 more)

### Community 112 - "_0"
Cohesion: 0.34
Nodes (14): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+6 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "plan-setup/page.tsx"
Cohesion: 0.24
Nodes (12): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+4 more)

### Community 115 - "r"
Cohesion: 0.19
Nodes (31): ai(), bu(), di(), Do(), fi(), Gt(), js(), lr() (+23 more)

### Community 116 - "We"
Cohesion: 0.09
Nodes (35): A0(), ai(), bc(), Bd(), Bl(), bm(), Cl(), cm() (+27 more)

### Community 117 - "fu"
Cohesion: 0.17
Nodes (12): ed(), J0(), Jn(), K0(), z0(), z0(), z0(), z0() (+4 more)

### Community 118 - "ue"
Cohesion: 0.20
Nodes (12): ad(), ar(), Bt(), Ln(), mu(), nr(), sc(), ue() (+4 more)

### Community 119 - "yf"
Cohesion: 0.33
Nodes (11): ch(), hf(), hn(), jf(), Kt(), mn(), Na(), pf() (+3 more)

### Community 120 - "uf"
Cohesion: 0.07
Nodes (48): bc(), cd(), Cl(), cm(), D(), Fr(), Fu(), hc() (+40 more)

### Community 121 - "ue"
Cohesion: 0.24
Nodes (11): aa(), ad(), ar(), Bt(), Ln(), nr(), sc(), Sm() (+3 more)

### Community 122 - "nu"
Cohesion: 0.10
Nodes (10): u0(), eu(), gf, ir(), jf(), nu, qu(), Rn() (+2 more)

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "_0"
Cohesion: 0.24
Nodes (18): _0(), D0(), Ei(), fe(), ff(), Gl(), Gn(), Hr() (+10 more)

### Community 125 - "yf"
Cohesion: 0.20
Nodes (7): hc, kc(), lc, ro, vf(), p(), yf

### Community 126 - "uc"
Cohesion: 0.13
Nodes (23): as(), Bd(), br(), cr(), Fn(), gr(), ic(), id() (+15 more)

### Community 127 - "prompts.ts"
Cohesion: 0.08
Nodes (39): approveFitnessPlanAdjustmentAction(), POST(), GET(), POST(), POST(), POST(), buildFitnessCoachContext(), addUnique() (+31 more)

### Community 128 - "swap-meal/route.ts"
Cohesion: 0.44
Nodes (9): ALLOWED_MEAL_TYPES, isDietCompatible(), isFoodAvailable(), isFoodBlocked(), matchesTerm(), normalize(), POST(), profileTerms() (+1 more)

### Community 129 - "workout-heatmap.tsx"
Cohesion: 0.24
Nodes (9): CellData, DAY_LABELS, formatDate(), getIntensityClass(), HeatmapCell, HeatmapProps, INTENSITY_COLORS, MONTH_LABELS (+1 more)

### Community 130 - "Ft"
Cohesion: 0.17
Nodes (20): c0(), cf(), ci(), ee(), ef(), Fu(), ha(), hc() (+12 more)

### Community 131 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 132 - "l"
Cohesion: 0.10
Nodes (43): ar(), At(), bi(), bo(), co(), cs(), df(), eo() (+35 more)

### Community 133 - "dl"
Cohesion: 0.22
Nodes (5): dl(), pl, qi, qn(), yu()

### Community 134 - "Uo"
Cohesion: 0.22
Nodes (11): Ba(), t(), Cn(), I(), Ii(), js(), oh(), Pl() (+3 more)

### Community 135 - "wf"
Cohesion: 0.22
Nodes (10): aa(), Ei(), hd(), ke(), Mi(), Qc(), wd(), wf() (+2 more)

### Community 136 - "r"
Cohesion: 0.17
Nodes (34): ai(), b0(), bu(), di(), Do(), eh(), fi(), ft() (+26 more)

### Community 137 - "_0"
Cohesion: 0.23
Nodes (18): _0(), cd(), D0(), df(), fe(), Gl(), Gn(), jh() (+10 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 139 - "le"
Cohesion: 0.11
Nodes (47): At(), Ct(), dd(), df(), eo(), hf(), hn(), Ii() (+39 more)

### Community 140 - "wf"
Cohesion: 0.22
Nodes (10): aa(), Ei(), hd(), ke(), Mi(), Qc(), wd(), wf() (+2 more)

### Community 141 - "ox"
Cohesion: 0.07
Nodes (43): bs(), bs(), bs(), bs(), bs(), de(), Dn(), Dx() (+35 more)

### Community 142 - "fitness/page.tsx"
Cohesion: 0.43
Nodes (5): FitnessTableClient(), FitnessUserDetails, formatDate(), dynamic, FitnessAdminDashboard()

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
Cohesion: 0.16
Nodes (24): _a(), af(), ds(), fs(), G0(), Hr(), io(), kr() (+16 more)

### Community 147 - "ai-insight-card.tsx"
Cohesion: 0.40
Nodes (3): PlanAdjustment, ProgressReview, WeeklyWorkoutStats

### Community 149 - "Concerns, Technical Debt & Watch-Outs — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Database Waterfall Regressions, 2. White Theme CSS Overrides, 3. PWA Service Worker Cache Invalidation, 4. Mobile Keyboard & Viewport Layout Shifts, 5. Razorpay Webhook Idempotency & Webhook Retries, Concerns, Technical Debt & Watch-Outs — GrindLog

### Community 150 - "External Integrations & Services — GrindLog"
Cohesion: 0.25
Nodes (7): 1. Supabase (Database, Auth, Storage), 2. Razorpay (Payment Gateway), 3. Google Gemini AI (@google/genai), 4. PWA Service Worker (Next-PWA & Workbox), 5. Resend (Email Service), 6. Developer Tooling & Agent Workflow Suite, External Integrations & Services — GrindLog

### Community 151 - "Product & Technical Requirements — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Performance & Latency Requirements, 2. Workout & Fitness Requirements, 3. Nutrition & Diet Requirements, 4. Design & Mobile Experience Requirements, 5. Security & Billing Requirements, Product & Technical Requirements — GrindLog

### Community 152 - "use-auth.ts"
Cohesion: 0.05
Nodes (49): ForgotPasswordPage(), ResetPasswordPage(), SignInContent(), SignUpContent(), RoadmapPage(), metadata, viewport, Providers() (+41 more)

### Community 155 - "springs.ts"
Cohesion: 0.20
Nodes (8): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem

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

### Community 161 - "app/package.json"
Cohesion: 0.03
Nodes (61): FitnessChatbot(), Message, config, updateSession(), config, middleware(), config, filteredRuntimeCaching (+53 more)

### Community 164 - "nutrition-service.ts"
Cohesion: 0.06
Nodes (46): GET(), POST(), DELETE(), DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES, GET() (+38 more)

### Community 170 - "zn"
Cohesion: 0.20
Nodes (26): bd(), Da(), dh(), dt(), ea(), gc(), gh(), hh() (+18 more)

### Community 177 - "D0"
Cohesion: 0.13
Nodes (28): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gl() (+20 more)

## Knowledge Gaps
- **535 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+530 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 887 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `Ft`, `index-B23vSfwu.js`, `M0`, `index-BM9U1lvA.js`, `Ph`, `dl`, `index-Buds9Sm1.js`, `Ph`, `Uo`, `st`, `le`, `index-DtLkR01C.js`, `ox`, `uc`, `Ih`, `uf`, `index-LDG-1p68.js`, `of`, `il`, `.add`, `uc`, `c0`, `Ot`, `r`, `pr`, `zn`, `tt`, `Q`, `et`, `Ph`, `Rs`, `dx`, `ei`, `uc`, `rf`, `ve`, `Ih`, `.get`, `vc`, `bt`, `mi`, `Hi`, `Ye`, `We`, `of`, `Ph`, `ie`, `l`, `uc`, `_0`, `fu`, `nu`, `_0`, `yf`, `uc`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `index-B23vSfwu.js`, `index-BM9U1lvA.js`, `Uo`, `r`, `Ph`, `st`, `ox`, `uc`, `l`, `tt`, `Q`, `et`, `B`, `Ye`, `ve`, `Ih`, `vc`, `rf`, `fu`, `yf`, `uf`, `_0`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `index-B23vSfwu.js`, `l`, `Uo`, `Ph`, `st`, `ox`, `uf`, `r0`, `rf`, `tt`, `D0`, `dx`, `et`, `B`, `Ih`, `sf`, `vc`, `Ye`, `yf`, `r`, `fu`, `_0`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._