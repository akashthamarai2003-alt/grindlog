# Graph Report - web  (2026-09-24)

## Corpus Check
- 426 files · ~3,442,623 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6459 nodes · 22789 edges · 180 communities (163 shown, 17 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2b4d9b20`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- (fitness)/page.tsx
- _
- l
- dx
- gsap-C8IefbVz.js
- fitness.ts
- Ph
- index-CoRpx3FC.js
- index-Buds9Sm1.js
- Ph
- react
- B
- progress-view.tsx
- index-BM9U1lvA.js
- Wh
- M0
- Ih
- Ye
- analyze/route.ts
- We
- createAdminClient
- lf
- import-usda-foundation-foods.mjs
- Ye
- il
- l
- r
- l
- bf
- uc
- r
- n
- index-B23vSfwu.js
- y0
- Ye
- l
- zn
- he
- index-DtLkR01C.js
- $h
- r
- uc
- navigation-context.tsx
- et
- fitness-ai/generate-plan/route.ts
- access.ts
- l
- Ui
- dependencies
- fu
- Wh
- fitness-dashboard.tsx
- AIPlanAnimation.tsx
- Ph
- onboarding-flow.tsx
- index-LDG-1p68.js
- pr
- Ye
- rf
- constants.ts
- of
- dx
- uf
- Ih
- fitness-reminders/route.ts
- r
- y0
- r0
- n
- hl
- fl
- Ta
- F
- _0
- ie
- .get
- st
- rf
- le
- _0
- rf
- uc
- e
- uc
- rf
- r
- r
- Bi
- Wh
- uc
- reminders-client.tsx
- Wh
- users-table-client.tsx
- vc
- Ih
- l
- sf
- je
- r0
- Ph
- rf
- r
- app/package.json
- coach-chat.tsx
- yf
- af
- bt
- c0
- Ih
- $h
- plan-setup/page.tsx
- uf
- af
- compilerOptions
- _0
- l
- test_nutrition_engine.mjs
- Vo
- _0
- nutrition-view.tsx
- je
- profile-content.tsx
- nu
- manifest.json
- Rs
- workout-heatmap.tsx
- Ye
- c0
- .add
- Hl
- l
- wf
- tt
- C
- Wh
- devDependencies
- r
- grocery-tab.tsx
- D0
- i
- Ih
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- lucide-react
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- ve
- springs.ts
- progression.ts
- dl
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- zf
- coach.ts
- package.json
- Uo
- firebase-messaging-sw.js
- Data import scripts
- nutrition-service.ts
- rules/graphify.md
- workflows/graphify.md
- exercise-detail.tsx
- scripts
- ai-insight-card.tsx
- next-env.d.ts
- createServerSupabase
- admin-login/page.tsx
- D0
- cf
- ff

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

## Communities (180 total, 17 thin omitted)

### Community 0 - "(fitness)/page.tsx"
Cohesion: 0.09
Nodes (19): fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), AdminSupportInbox(), DashboardBelow(), dynamic, revalidate, DashboardInstantFallback() (+11 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (120): _, aa, ac(), ao(), As, at, Be(), bf() (+112 more)

### Community 2 - "l"
Cohesion: 0.11
Nodes (45): ar(), bf(), ch(), Ct(), dd(), df(), eo(), Gt() (+37 more)

### Community 3 - "dx"
Cohesion: 0.07
Nodes (51): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+43 more)

### Community 4 - "gsap-C8IefbVz.js"
Cohesion: 0.32
Nodes (5): e(), Ml(), Ol(), tr(), xa

### Community 5 - "fitness.ts"
Cohesion: 0.07
Nodes (53): completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), quickCompleteWorkoutAction(), reopenWorkoutAction(), resetWorkoutTimerAction() (+45 more)

### Community 6 - "Ph"
Cohesion: 0.04
Nodes (80): Ph(), A0(), ai(), bc(), Bd(), bh(), Bl(), bm() (+72 more)

### Community 7 - "index-CoRpx3FC.js"
Cohesion: 0.05
Nodes (111): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+103 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.05
Nodes (99): $, A, b, c(), D, e(), f, g (+91 more)

### Community 9 - "Ph"
Cohesion: 0.04
Nodes (81): Ph(), Bd(), bh(), Bl(), bm(), cd(), cf(), Cn() (+73 more)

### Community 10 - "react"
Cohesion: 0.09
Nodes (23): FitnessTableClient(), FitnessUserDetails, formatDate(), dynamic, FitnessAdminDashboard(), CustomExerciseForm(), ExerciseBrowser(), ExerciseBrowserContent() (+15 more)

### Community 11 - "B"
Cohesion: 0.14
Nodes (29): bd(), Bt(), Da(), dh(), dt(), ea(), gc(), gh() (+21 more)

### Community 12 - "progress-view.tsx"
Cohesion: 0.06
Nodes (52): GET(), POST(), GET(), POST(), ProgressContent(), AchievementsShowcase(), ActivityRecoveryAnalyticsCard(), BodyMeasurementsList() (+44 more)

### Community 13 - "index-BM9U1lvA.js"
Cohesion: 0.09
Nodes (56): am(), ap(), ax(), Bn, Bx, cx(), de(), Dn() (+48 more)

### Community 14 - "Wh"
Cohesion: 0.17
Nodes (22): $h(), hx(), C(), E(), bd(), D(), dh(), fh() (+14 more)

### Community 15 - "M0"
Cohesion: 0.12
Nodes (28): c0(), cd(), cf(), ci(), dn(), ee(), ef(), Fu() (+20 more)

### Community 16 - "Ih"
Cohesion: 0.04
Nodes (70): Ih(), ah(), ar(), as(), b0(), bf(), Bt(), ci() (+62 more)

### Community 17 - "Ye"
Cohesion: 0.18
Nodes (24): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+16 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.05
Nodes (50): POST(), maxDuration, POST(), stableStringify(), stripImagePayload(), AIStartingReportPage(), displayValue(), dynamic (+42 more)

### Community 19 - "We"
Cohesion: 0.12
Nodes (25): an(), bc(), cd(), D(), E0(), Es(), fh(), Hl() (+17 more)

### Community 20 - "createAdminClient"
Cohesion: 0.04
Nodes (78): getPlanPricesAction(), updatePlanPricesAction(), clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications() (+70 more)

### Community 21 - "lf"
Cohesion: 0.21
Nodes (17): ao(), fs(), gi(), lf(), ms(), _o(), os(), Pa() (+9 more)

### Community 22 - "import-usda-foundation-foods.mjs"
Cohesion: 0.09
Nodes (22): ALLERGEN_MAP, content, filePath, lines, newLines, buildRow(), DEFAULT_JSON_PATH, dryRun (+14 more)

### Community 23 - "Ye"
Cohesion: 0.11
Nodes (33): _a(), Bt(), dt(), Fu(), gc(), gh(), jd(), ju() (+25 more)

### Community 24 - "il"
Cohesion: 0.07
Nodes (11): a(), hu(), il, jr, nl(), qr(), tl(), Ts (+3 more)

### Community 25 - "l"
Cohesion: 0.08
Nodes (60): ar(), bi(), bo(), ch(), co(), cs(), Ct(), dd() (+52 more)

### Community 26 - "r"
Cohesion: 0.11
Nodes (44): af(), At(), b0(), bh(), bu(), di(), Do(), eh() (+36 more)

### Community 27 - "l"
Cohesion: 0.07
Nodes (57): At(), Ba(), t(), bf(), bi(), ch(), cs(), Ct() (+49 more)

### Community 28 - "bf"
Cohesion: 0.23
Nodes (13): bf(), ch(), Dl(), eo(), gf(), hn(), jt(), Kt() (+5 more)

### Community 29 - "uc"
Cohesion: 0.11
Nodes (28): er(), Fn(), ft(), gr(), Ic(), ir(), ju(), Kn() (+20 more)

### Community 30 - "r"
Cohesion: 0.12
Nodes (47): ai(), bu(), c0(), di(), fi(), Fr(), ft(), Gt() (+39 more)

### Community 31 - "n"
Cohesion: 0.18
Nodes (35): ot(), ad(), an(), bu(), di(), eh(), fi(), go() (+27 more)

### Community 32 - "index-B23vSfwu.js"
Cohesion: 0.09
Nodes (55): am(), ap(), ax(), Bn, Bx, cm(), cx(), de() (+47 more)

### Community 33 - "y0"
Cohesion: 0.10
Nodes (26): bm(), Dl(), ds(), ed(), $f(), G0(), Gf(), If() (+18 more)

### Community 34 - "Ye"
Cohesion: 0.11
Nodes (38): aa(), ar(), Bt(), Da(), dh(), dt(), ea(), fh() (+30 more)

### Community 35 - "l"
Cohesion: 0.11
Nodes (59): ad(), an(), co(), di(), eh(), fi(), fo(), gd() (+51 more)

### Community 36 - "zn"
Cohesion: 0.26
Nodes (19): _a(), bh(), dt(), gc(), gh(), hh(), jd(), jh() (+11 more)

### Community 37 - "he"
Cohesion: 0.09
Nodes (32): bs(), bs(), bs(), bs(), $h(), ct(), el(), m() (+24 more)

### Community 38 - "index-DtLkR01C.js"
Cohesion: 0.09
Nodes (58): am(), ap(), ax(), Bn(), Bx, Cc(), cx(), de() (+50 more)

### Community 39 - "$h"
Cohesion: 0.15
Nodes (25): $h(), ct(), el(), g(), m(), r(), Re(), zt() (+17 more)

### Community 40 - "r"
Cohesion: 0.09
Nodes (67): af(), b0(), bu(), dd(), df(), di(), ea(), eo() (+59 more)

### Community 41 - "uc"
Cohesion: 0.10
Nodes (39): _a(), dt(), er(), Fa(), Fn(), ft(), gc(), gh() (+31 more)

### Community 42 - "navigation-context.tsx"
Cohesion: 0.08
Nodes (25): FitnessLayout(), BottomNav(), TodaysWorkoutCard(), TodaysWorkoutCardProps, FitnessShellInner(), NavigationContext, NavigationContextType, NavigationProvider() (+17 more)

### Community 43 - "et"
Cohesion: 0.08
Nodes (15): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), rr(), rr() (+7 more)

### Community 44 - "fitness-ai/generate-plan/route.ts"
Cohesion: 0.05
Nodes (113): maxDuration, POST(), GenerateGroceryResponseSchema, POST(), maxDuration, POST(), POST(), POST() (+105 more)

### Community 45 - "access.ts"
Cohesion: 0.04
Nodes (64): approveFitnessPlanAdjustmentAction(), deleteR2File(), deleteScanPhotosFromR2(), isR2Configured, POST(), dynamic, GET(), POST() (+56 more)

### Community 46 - "l"
Cohesion: 0.13
Nodes (54): ot(), ad(), an(), bo(), di(), eh(), fi(), gd() (+46 more)

### Community 47 - "Ui"
Cohesion: 0.11
Nodes (25): as(), br(), cr(), Fn(), gr(), i0(), id(), ju() (+17 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "fu"
Cohesion: 0.10
Nodes (25): z0(), z0(), z0(), A0(), an(), bc(), Es(), K0() (+17 more)

### Community 50 - "Wh"
Cohesion: 0.16
Nodes (23): $h(), hx(), E(), M(), bd(), D(), dh(), Kc() (+15 more)

### Community 51 - "fitness-dashboard.tsx"
Cohesion: 0.09
Nodes (22): getUnreadNotificationsCountAction(), DashboardHeader(), fetchUnreadCount(), DashboardHeaderProps, ExerciseLibraryCard(), FitnessDashboardProps, FitnessHeaderProps, TransformationCard() (+14 more)

### Community 52 - "AIPlanAnimation.tsx"
Cohesion: 0.13
Nodes (24): AICharacter(), AICharacterProps, AIPlanAnimation(), AIPlanAnimationProps, DEFAULT_FALLBACK_PROFILE, PILL_CONFIGS, PillConfig, ProfileSummary (+16 more)

### Community 53 - "Ph"
Cohesion: 0.04
Nodes (91): Ph(), _a(), A0(), ai(), b0(), bf(), bh(), bm() (+83 more)

### Community 54 - "onboarding-flow.tsx"
Cohesion: 0.07
Nodes (22): app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_goal, app_assets_images_placeholder_left (+14 more)

### Community 55 - "index-LDG-1p68.js"
Cohesion: 0.04
Nodes (154): $, A, b, c(), D, e(), f, g (+146 more)

### Community 56 - "pr"
Cohesion: 0.04
Nodes (26): r0(), r0(), r0(), r0(), r0(), r0(), r0(), Ae() (+18 more)

### Community 57 - "Ye"
Cohesion: 0.19
Nodes (23): Bt(), Da(), dh(), dt(), ea(), gh(), hh(), jd() (+15 more)

### Community 58 - "rf"
Cohesion: 0.14
Nodes (24): ao(), At(), fs(), gd(), Hr(), lf(), ls(), ma() (+16 more)

### Community 59 - "constants.ts"
Cohesion: 0.05
Nodes (86): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), GroceryPage(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps (+78 more)

### Community 60 - "of"
Cohesion: 0.08
Nodes (54): _0(), ao(), bc(), Bl(), cd(), cf(), ci(), Dd() (+46 more)

### Community 61 - "dx"
Cohesion: 0.08
Nodes (47): am(), ap(), ax(), Bn, cm(), de(), Dn(), dx() (+39 more)

### Community 62 - "uf"
Cohesion: 0.10
Nodes (36): as(), c0(), cf(), ci(), ee(), ef(), Fr(), Fu() (+28 more)

### Community 63 - "Ih"
Cohesion: 0.05
Nodes (54): Ih(), ad(), ai(), ar(), bf(), Bt(), Cl(), cn() (+46 more)

### Community 64 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 65 - "r"
Cohesion: 0.21
Nodes (29): b0(), bu(), di(), Do(), eh(), fi(), ge(), Gt() (+21 more)

### Community 66 - "y0"
Cohesion: 0.08
Nodes (33): bf(), bm(), dc(), ea(), $f(), G0(), Ga(), Gf() (+25 more)

### Community 67 - "r0"
Cohesion: 0.12
Nodes (22): ah(), bm(), $f(), G0(), Ga(), Gf(), If(), Jr() (+14 more)

### Community 68 - "n"
Cohesion: 0.09
Nodes (18): bo(), n(), Co(), df(), Fi(), hf(), ic(), ku() (+10 more)

### Community 69 - "hl"
Cohesion: 0.15
Nodes (19): Ct(), Fu(), Ii(), Jl(), md(), mf(), Mi(), Oa() (+11 more)

### Community 70 - "fl"
Cohesion: 0.12
Nodes (25): A0(), an(), bc(), cd(), Es(), I(), Il(), jc() (+17 more)

### Community 71 - "Ta"
Cohesion: 0.14
Nodes (19): ds(), G0(), Jr(), kr(), Le(), t(), Pu(), Ra() (+11 more)

### Community 72 - "F"
Cohesion: 0.09
Nodes (4): F, I, k(), q

### Community 73 - "_0"
Cohesion: 0.14
Nodes (28): _0(), ai(), Cl(), cm(), D0(), da(), dn(), Ei() (+20 more)

### Community 74 - "ie"
Cohesion: 0.20
Nodes (18): bi(), bo(), fo(), go(), gs(), ho(), hs(), jo() (+10 more)

### Community 75 - ".get"
Cohesion: 0.11
Nodes (21): bc(), Ct(), a(), ef, El(), u(), gf, _o() (+13 more)

### Community 76 - "st"
Cohesion: 0.15
Nodes (27): an(), bo(), Do(), E0(), Es(), Fa(), Ko(), ol() (+19 more)

### Community 77 - "rf"
Cohesion: 0.11
Nodes (32): af(), ao(), At(), cn(), ed(), fs(), gi(), Hr() (+24 more)

### Community 78 - "le"
Cohesion: 0.11
Nodes (32): aa(), ch(), df(), en(), hf(), hn(), jf(), ke() (+24 more)

### Community 79 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+9 more)

### Community 80 - "rf"
Cohesion: 0.10
Nodes (43): _0(), as(), c0(), cf(), ch(), ci(), ds(), ee() (+35 more)

### Community 81 - "uc"
Cohesion: 0.15
Nodes (17): br(), cr(), Fn(), id(), Jc(), ju(), Kn(), l0() (+9 more)

### Community 82 - "e"
Cohesion: 0.08
Nodes (38): ao(), At(), bi(), bo(), co(), cs(), fo(), fs() (+30 more)

### Community 83 - "uc"
Cohesion: 0.08
Nodes (35): as(), br(), bu(), cr(), er(), Fn(), ft(), gr() (+27 more)

### Community 84 - "rf"
Cohesion: 0.09
Nodes (39): _0(), ad(), af(), ao(), At(), cf(), ch(), cn() (+31 more)

### Community 85 - "r"
Cohesion: 0.10
Nodes (47): aa(), ar(), bu(), Da(), dh(), dt(), ea(), er() (+39 more)

### Community 86 - "r"
Cohesion: 0.08
Nodes (50): ao(), as(), c0(), ci(), dn(), ee(), ef(), Gc() (+42 more)

### Community 87 - "Bi"
Cohesion: 0.10
Nodes (28): a0(), bc(), cd(), fh(), Fn(), gr(), I(), i0() (+20 more)

### Community 88 - "Wh"
Cohesion: 0.16
Nodes (23): $h(), hx(), E(), M(), bd(), D(), dh(), fh() (+15 more)

### Community 89 - "uc"
Cohesion: 0.10
Nodes (32): a0(), er(), Fa(), Fn(), ft(), gr(), i0(), Ic() (+24 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.13
Nodes (21): updateRemindersAction(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS, REMINDER_TYPES, ReminderTypeSheet() (+13 more)

### Community 91 - "Wh"
Cohesion: 0.16
Nodes (24): $h(), hx(), C(), E(), bd(), D(), dh(), fh() (+16 more)

### Community 92 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 93 - "vc"
Cohesion: 0.11
Nodes (18): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+10 more)

### Community 94 - "Ih"
Cohesion: 0.05
Nodes (69): Ih(), bf(), bh(), bm(), da(), dc(), Dl(), ds() (+61 more)

### Community 95 - "l"
Cohesion: 0.11
Nodes (42): ar(), ch(), Ct(), dd(), df(), eo(), hf(), hn() (+34 more)

### Community 96 - "sf"
Cohesion: 0.14
Nodes (17): ad(), Bt(), Je(), ke(), la(), Ln(), md(), Mi() (+9 more)

### Community 97 - "je"
Cohesion: 0.09
Nodes (30): At(), bi(), co(), cs(), e(), gi(), hs(), Ii() (+22 more)

### Community 98 - "r0"
Cohesion: 0.16
Nodes (18): bm(), ds(), $f(), G0(), Ga(), Gf(), If(), Jr() (+10 more)

### Community 99 - "Ph"
Cohesion: 0.04
Nodes (82): Ph(), A0(), ad(), as(), bc(), bf(), Cn(), D() (+74 more)

### Community 100 - "rf"
Cohesion: 0.14
Nodes (27): af(), ao(), At(), fs(), gd(), Hr(), Kl(), lf() (+19 more)

### Community 101 - "r"
Cohesion: 0.15
Nodes (40): S, ot(), af(), an(), b0(), bh(), bu(), di() (+32 more)

### Community 102 - "app/package.json"
Cohesion: 0.04
Nodes (51): Providers(), FitnessBottomNav(), tabs, TimePicker12h(), TimePicker12hProps, config, updateSession(), cn() (+43 more)

### Community 103 - "coach-chat.tsx"
Cohesion: 0.17
Nodes (10): CoachChat(), CoachInput(), CoachInputProps, CoachLoading(), CoachMessage(), CoachMessageProps, CoachSuggestions(), CoachSuggestionsProps (+2 more)

### Community 104 - "yf"
Cohesion: 0.18
Nodes (7): hc, kc(), lc, mf(), ro, vf(), yf

### Community 105 - "af"
Cohesion: 0.23
Nodes (16): af(), bo(), fs(), io(), ll(), ms(), no(), _o() (+8 more)

### Community 106 - "bt"
Cohesion: 0.09
Nodes (44): _0(), ar(), At(), b0(), D0(), df(), dn(), fe() (+36 more)

### Community 107 - "c0"
Cohesion: 0.23
Nodes (16): ao(), c0(), ci(), ee(), ef(), Fu(), ha(), is() (+8 more)

### Community 108 - "Ih"
Cohesion: 0.05
Nodes (63): Ih(), bm(), cn(), co(), cs(), dc(), Dl(), ds() (+55 more)

### Community 109 - "$h"
Cohesion: 0.16
Nodes (25): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+17 more)

### Community 110 - "plan-setup/page.tsx"
Cohesion: 0.27
Nodes (11): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+3 more)

### Community 111 - "uf"
Cohesion: 0.08
Nodes (48): ai(), as(), c0(), cd(), cf(), ci(), Cl(), cm() (+40 more)

### Community 112 - "af"
Cohesion: 0.22
Nodes (17): af(), fs(), G0(), go(), hn(), io(), _o(), os() (+9 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), Ei(), fe(), ff(), Gl(), Gn(), Lu() (+8 more)

### Community 115 - "l"
Cohesion: 0.08
Nodes (66): bi(), co(), cs(), Ct(), dd(), df(), ea(), eo() (+58 more)

### Community 116 - "test_nutrition_engine.mjs"
Cohesion: 0.17
Nodes (4): NutritionValidationEngine, TEST_PROFILES, ref_node_assert, ref_node_crypto

### Community 117 - "Vo"
Cohesion: 0.14
Nodes (16): bs(), ks(), re(), tn(), Vo(), G(), I(), K() (+8 more)

### Community 118 - "_0"
Cohesion: 0.21
Nodes (20): _0(), D0(), df(), Ei(), fe(), ff(), Gl(), Gn() (+12 more)

### Community 119 - "nutrition-view.tsx"
Cohesion: 0.05
Nodes (49): DailyActivityCard(), DailyActivityCardProps, FitnessDashboardBottom(), FitnessDashboardBottomProps, ProNutritionGenerationCard(), TodaysGoalsCard(), TodaysGoalsCardProps, formatFoodItem() (+41 more)

### Community 120 - "je"
Cohesion: 0.11
Nodes (33): af(), bi(), bo(), cs(), fs(), gi(), hs(), io() (+25 more)

### Community 121 - "profile-content.tsx"
Cohesion: 0.04
Nodes (58): toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), ForgotPasswordPage(), ResetPasswordPage(), SignInContent(), SignUpContent(), ProfileLoading(), RoadmapPage() (+50 more)

### Community 122 - "nu"
Cohesion: 0.11
Nodes (4): eu(), Mn, nc(), nu

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "Rs"
Cohesion: 0.08
Nodes (13): ar(), en(), H(), ja(), ls(), nn(), Oi(), ol() (+5 more)

### Community 125 - "workout-heatmap.tsx"
Cohesion: 0.24
Nodes (9): CellData, DAY_LABELS, formatDate(), getIntensityClass(), HeatmapCell, HeatmapProps, INTENSITY_COLORS, MONTH_LABELS (+1 more)

### Community 126 - "Ye"
Cohesion: 0.16
Nodes (25): _a(), ad(), Bt(), dt(), gc(), gh(), hh(), jd() (+17 more)

### Community 127 - "c0"
Cohesion: 0.19
Nodes (20): c0(), D0(), df(), Ei(), fe(), Gn(), Lu(), ma() (+12 more)

### Community 128 - ".add"
Cohesion: 0.11
Nodes (11): af, Cn(), Gn, Gu(), kl(), _l(), me(), oc() (+3 more)

### Community 129 - "Hl"
Cohesion: 0.18
Nodes (16): ai(), Cl(), cm(), fl(), Hl(), ht(), K0(), Kf() (+8 more)

### Community 130 - "l"
Cohesion: 0.08
Nodes (53): ar(), Ba(), t(), bi(), bo(), co(), cs(), Ct() (+45 more)

### Community 131 - "wf"
Cohesion: 0.15
Nodes (17): aa(), Ba(), t(), Ct(), Ei(), hd(), hf(), Ii() (+9 more)

### Community 132 - "tt"
Cohesion: 0.12
Nodes (36): ui(), ui(), ui(), ui(), ui(), ui(), A0(), ai() (+28 more)

### Community 134 - "Wh"
Cohesion: 0.27
Nodes (14): $h(), w(), X(), r(), rx(), Wh(), ct(), el() (+6 more)

### Community 135 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 136 - "r"
Cohesion: 0.10
Nodes (51): ad(), as(), b0(), bh(), bu(), di(), Do(), eh() (+43 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 139 - "D0"
Cohesion: 0.25
Nodes (17): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gn() (+9 more)

### Community 141 - "i"
Cohesion: 0.11
Nodes (30): bi(), bo(), co(), cs(), fo(), gi(), go(), gs() (+22 more)

### Community 142 - "Ih"
Cohesion: 0.05
Nodes (71): Ih(), A0(), an(), bc(), cn(), da(), ds(), ed() (+63 more)

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
Cohesion: 0.03
Nodes (34): createCouponAction(), toggleCouponStatusAction(), ClientCouponForm(), CopyButton(), AdminCouponsPage(), ToggleCouponButton(), FIELD_CONFIGS, FieldConfig (+26 more)

### Community 149 - "Concerns, Technical Debt & Watch-Outs — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Database Waterfall Regressions, 2. White Theme CSS Overrides, 3. PWA Service Worker Cache Invalidation, 4. Mobile Keyboard & Viewport Layout Shifts, 5. Razorpay Webhook Idempotency & Webhook Retries, Concerns, Technical Debt & Watch-Outs — GrindLog

### Community 150 - "External Integrations & Services — GrindLog"
Cohesion: 0.25
Nodes (7): 1. Supabase (Database, Auth, Storage), 2. Razorpay (Payment Gateway), 3. Google Gemini AI (@google/genai), 4. PWA Service Worker (Next-PWA & Workbox), 5. Resend (Email Service), 6. Developer Tooling & Agent Workflow Suite, External Integrations & Services — GrindLog

### Community 151 - "Product & Technical Requirements — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Performance & Latency Requirements, 2. Workout & Fitness Requirements, 3. Nutrition & Diet Requirements, 4. Design & Mobile Experience Requirements, 5. Security & Billing Requirements, Product & Technical Requirements — GrindLog

### Community 152 - "ve"
Cohesion: 0.10
Nodes (42): _0(), ai(), c0(), cd(), cf(), ci(), Cl(), cm() (+34 more)

### Community 153 - "springs.ts"
Cohesion: 0.20
Nodes (8): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem

### Community 155 - "dl"
Cohesion: 0.12
Nodes (10): dl(), ir(), jf(), pl, qi, qn(), Rn(), sn() (+2 more)

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 158 - "zf"
Cohesion: 0.28
Nodes (9): hd(), I(), Il(), jc(), mn(), Na(), oh(), xn() (+1 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 161 - "Uo"
Cohesion: 0.25
Nodes (8): I(), js(), mn(), oh(), Pl(), qd(), jc(), Uo

### Community 164 - "nutrition-service.ts"
Cohesion: 0.04
Nodes (80): saveFitnessOnboardingAction(), GET(), POST(), DELETE(), DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES (+72 more)

### Community 168 - "exercise-detail.tsx"
Cohesion: 0.11
Nodes (24): completeExerciseSetsAction(), ExerciseAnimationPlayer(), ExerciseAnimationPlayerProps, BODYWEIGHT_KEYWORDS, ExerciseDetail(), generateInstructions(), isBodyweightExercise(), playRestDoneChime() (+16 more)

### Community 169 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, import:usda, lint, start, type-check

### Community 170 - "ai-insight-card.tsx"
Cohesion: 0.40
Nodes (3): PlanAdjustment, ProgressReview, WeeklyWorkoutStats

### Community 175 - "createServerSupabase"
Cohesion: 0.03
Nodes (77): exportUserData(), exportWorkoutHistoryCSV(), getUserSupportMessages(), submitSupportMessage(), dynamic, POST(), POST(), POST() (+69 more)

### Community 176 - "admin-login/page.tsx"
Cohesion: 0.70
Nodes (3): loginAdminAction(), AdminLogin(), handleSubmit()

### Community 177 - "D0"
Cohesion: 0.10
Nodes (32): D0(), da(), dn(), Ei(), fe(), ff(), Fl(), gd() (+24 more)

## Knowledge Gaps
- **561 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+556 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 936 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `.add`, `dx`, `tt`, `gsap-C8IefbVz.js`, `index-CoRpx3FC.js`, `index-Buds9Sm1.js`, `index-BM9U1lvA.js`, `Ih`, `of`, `il`, `l`, `ve`, `dl`, `uc`, `index-B23vSfwu.js`, `Uo`, `zn`, `he`, `index-DtLkR01C.js`, `uc`, `et`, `Ui`, `fu`, `cf`, `ff`, `Ph`, `index-LDG-1p68.js`, `pr`, `rf`, `of`, `Ih`, `n`, `hl`, `fl`, `Ta`, `_0`, `ie`, `.get`, `st`, `le`, `rf`, `uc`, `uc`, `r`, `Bi`, `uc`, `vc`, `Ph`, `yf`, `bt`, `uf`, `Vo`, `je`, `nu`, `Rs`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `tt`, `index-CoRpx3FC.js`, `r`, `B`, `index-BM9U1lvA.js`, `i`, `Ye`, `ve`, `Uo`, `he`, `et`, `fu`, `pr`, `y0`, `n`, `fl`, `st`, `Bi`, `Wh`, `vc`, `l`, `rf`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `l`, `tt`, `index-CoRpx3FC.js`, `B`, `lf`, `r`, `Uo`, `he`, `uc`, `et`, `fu`, `pr`, `uf`, `n`, `fl`, `_0`, `ie`, `st`, `Bi`, `Wh`, `vc`, `sf`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._