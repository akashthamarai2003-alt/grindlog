# Graph Report - web  (2026-09-24)

## Corpus Check
- 426 files · ~3,441,030 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6456 nodes · 22781 edges · 181 communities (162 shown, 19 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b565e24a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- (fitness)/page.tsx
- _
- le
- Ot
- dx
- react
- Ph
- index-B23vSfwu.js
- index-Buds9Sm1.js
- Ph
- app/layout.tsx
- Ye
- progress-view.tsx
- dx
- dx
- index-Cq6kntJJ.js
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
- s
- l
- af
- prompts.ts
- r
- r
- dx
- groq/client.ts
- B
- ir
- Ye
- r
- Zf
- uc
- l
- zn
- navigation-context.tsx
- Qt
- fitness-ai/generate-plan/route.ts
- access.ts
- l
- Ta
- dependencies
- Vc
- Q
- lucide-react
- AIPlanAnimation.tsx
- Ph
- onboarding-flow.tsx
- index-DtLkR01C.js
- pr
- Ye
- swap-meal/route.ts
- constants.ts
- of
- dx
- r
- Ih
- fitness-reminders/route.ts
- r
- i
- et
- a
- hl
- fl
- _0
- F
- _0
- $h
- n
- We
- bt
- ut
- Hl
- uf
- kf
- tt
- uc
- rf
- Ye
- of
- uc
- Ye
- uc
- reminders-client.tsx
- Wh
- users-table-client.tsx
- vc
- Ih
- l
- mi
- ie
- fu
- Ph
- rf
- r
- app/package.json
- coach-chat.tsx
- yf
- t
- _0
- of
- Ih
- r
- plan-setup/page.tsx
- _0
- Hi
- compilerOptions
- i
- l
- test_nutrition_engine.mjs
- st
- _0
- nutrition-view.tsx
- l
- use-auth.ts
- nu
- manifest.json
- nn
- workout-heatmap.tsx
- Ye
- c0
- .add
- ue
- l
- wf
- sf
- C
- ee
- devDependencies
- r
- grocery-tab.tsx
- ve
- uf
- Ih
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- ref_framer_motion
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- ee
- springs.ts
- progression.ts
- pl
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- workout-instant-fallback.tsx
- coach.ts
- package.json
- next-pwa.d.ts
- firebase-messaging-sw.js
- Data import scripts
- nutrition-service.ts
- rules/graphify.md
- workflows/graphify.md
- one-rm.ts
- (fitness)/support/page.tsx
- ai-insight-card.tsx
- next-env.d.ts
- createServerSupabase
- admin-login/page.tsx
- D0
- rf
- ff
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

## Communities (181 total, 19 thin omitted)

### Community 0 - "(fitness)/page.tsx"
Cohesion: 0.15
Nodes (9): DashboardBelow(), dynamic, revalidate, DashboardInstantFallback(), DashboardSkeleton(), SAMPLE_FREE_PLAN, SAMPLE_FREE_WEEK_DAYS, SAMPLE_FREE_WORKOUT (+1 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (119): _, aa, ac(), ao(), As, at, Be(), bo() (+111 more)

### Community 2 - "le"
Cohesion: 0.08
Nodes (64): ar(), bi(), bo(), ch(), co(), cs(), Ct(), dd() (+56 more)

### Community 3 - "Ot"
Cohesion: 0.05
Nodes (117): ap(), ax(), Bn, cm(), ep(), Fx(), Gx(), ip() (+109 more)

### Community 4 - "dx"
Cohesion: 0.08
Nodes (26): e(), Ml(), Ol(), tr(), de(), Dn(), dx(), El() (+18 more)

### Community 5 - "react"
Cohesion: 0.04
Nodes (87): completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), quickCompleteWorkoutAction(), reopenWorkoutAction(), resetWorkoutTimerAction() (+79 more)

### Community 6 - "Ph"
Cohesion: 0.04
Nodes (78): Ph(), bc(), Bd(), bh(), Bl(), bm(), cd(), Cn() (+70 more)

### Community 7 - "index-B23vSfwu.js"
Cohesion: 0.08
Nodes (74): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+66 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.06
Nodes (83): $, A, b, c(), D, e(), f, g (+75 more)

### Community 9 - "Ph"
Cohesion: 0.04
Nodes (78): Ih(), Ph(), ad(), ar(), as(), bh(), br(), bu() (+70 more)

### Community 10 - "app/layout.tsx"
Cohesion: 0.09
Nodes (22): getUnreadNotificationsCountAction(), metadata, viewport, Providers(), DashboardHeader(), fetchUnreadCount(), DashboardHeaderProps, FitnessBottomNav() (+14 more)

### Community 11 - "Ye"
Cohesion: 0.11
Nodes (35): aa(), ad(), ar(), Bt(), Da(), dt(), ea(), Fu() (+27 more)

### Community 12 - "progress-view.tsx"
Cohesion: 0.07
Nodes (43): ProgressContent(), app_assets_images_placeholder_goal, AchievementsShowcase(), ActivityRecoveryAnalyticsCard(), AIProgressReviewCard(), BodyMeasurementsList(), BodyProgressPhotos(), NutritionAnalyticsCard() (+35 more)

### Community 13 - "dx"
Cohesion: 0.08
Nodes (41): am(), cx(), de(), Dn(), dx(), El(), Ex(), $h() (+33 more)

### Community 14 - "dx"
Cohesion: 0.11
Nodes (32): de(), Dn(), dx(), El(), Ex(), $h(), Ha(), re() (+24 more)

### Community 15 - "index-Cq6kntJJ.js"
Cohesion: 0.09
Nodes (57): am(), ap(), ax(), Ba(), Bx, cx(), de(), Dn() (+49 more)

### Community 16 - "Ih"
Cohesion: 0.04
Nodes (67): Ih(), ad(), ah(), as(), b0(), bf(), Bt(), Cl() (+59 more)

### Community 17 - "r"
Cohesion: 0.09
Nodes (54): _a(), bh(), bu(), di(), dt(), er(), fi(), ft() (+46 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.05
Nodes (52): POST(), maxDuration, POST(), stableStringify(), stripImagePayload(), POST(), AIStartingReportPage(), displayValue() (+44 more)

### Community 19 - "rf"
Cohesion: 0.12
Nodes (30): ad(), af(), ao(), ch(), cn(), fs(), Hr(), Kl() (+22 more)

### Community 20 - "createAdminClient"
Cohesion: 0.04
Nodes (86): createCouponAction(), toggleCouponStatusAction(), getPlanPricesAction(), updatePlanPricesAction(), clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable() (+78 more)

### Community 21 - "rf"
Cohesion: 0.12
Nodes (32): ad(), af(), ao(), At(), fs(), gi(), Kl(), lf() (+24 more)

### Community 22 - "import-usda-foundation-foods.mjs"
Cohesion: 0.09
Nodes (22): ALLERGEN_MAP, content, filePath, lines, newLines, buildRow(), DEFAULT_JSON_PATH, dryRun (+14 more)

### Community 23 - "sf"
Cohesion: 0.11
Nodes (23): ad(), Bt(), ed(), Jn(), ke(), la(), lh(), Ln() (+15 more)

### Community 24 - "bl"
Cohesion: 0.06
Nodes (14): bl(), br(), a(), hu(), il, jr, nl(), qr() (+6 more)

### Community 25 - "l"
Cohesion: 0.08
Nodes (52): ar(), bi(), ch(), co(), cs(), df(), eo(), fo() (+44 more)

### Community 26 - "s"
Cohesion: 0.16
Nodes (31): bh(), bu(), di(), eh(), er(), fi(), ft(), Gt() (+23 more)

### Community 27 - "l"
Cohesion: 0.08
Nodes (37): aa(), Ba(), t(), bf(), ch(), Ct(), ds(), Ei() (+29 more)

### Community 28 - "af"
Cohesion: 0.36
Nodes (11): af(), fs(), hn(), ms(), _o(), os(), Rl(), Sa() (+3 more)

### Community 29 - "prompts.ts"
Cohesion: 0.09
Nodes (30): approveFitnessPlanAdjustmentAction(), dynamic, GET(), POST(), revalidate, POST(), GET(), buildFitnessCoachContext() (+22 more)

### Community 30 - "r"
Cohesion: 0.13
Nodes (47): ai(), c0(), di(), Do(), fi(), Fr(), Gt(), hd() (+39 more)

### Community 31 - "r"
Cohesion: 0.13
Nodes (43): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+35 more)

### Community 32 - "dx"
Cohesion: 0.11
Nodes (30): am(), de(), Dn(), dx(), El(), Ex(), $h(), Ha() (+22 more)

### Community 33 - "groq/client.ts"
Cohesion: 0.22
Nodes (11): POST(), AiWorkoutCoachService, generateAIResponse(), generateAIResponseJSON(), getGroqApiKeys(), getGroqClient(), getGroqClientForKey(), GROQ_MODELS (+3 more)

### Community 34 - "B"
Cohesion: 0.15
Nodes (29): Da(), dh(), dt(), ea(), fh(), gh(), hh(), ic() (+21 more)

### Community 35 - "ir"
Cohesion: 0.14
Nodes (33): ot(), an(), Bt(), bu(), di(), eh(), fi(), ft() (+25 more)

### Community 36 - "Ye"
Cohesion: 0.20
Nodes (23): hx(), E(), M(), _a(), bd(), bh(), dt(), gc() (+15 more)

### Community 37 - "r"
Cohesion: 0.15
Nodes (25): $h(), ct(), el(), m(), ot(), r(), Re(), y() (+17 more)

### Community 38 - "Zf"
Cohesion: 0.29
Nodes (7): Xx(), Yx(), Xx(), Yx(), Vx(), Vx(), Zf()

### Community 39 - "uc"
Cohesion: 0.08
Nodes (36): Cn(), er(), Fn(), ft(), gr(), I(), Ic(), ir() (+28 more)

### Community 40 - "l"
Cohesion: 0.09
Nodes (54): ar(), At(), Bt(), dd(), df(), eo(), gs(), Gt() (+46 more)

### Community 41 - "zn"
Cohesion: 0.11
Nodes (35): _a(), Bt(), dt(), Fu(), gc(), gh(), hh(), jd() (+27 more)

### Community 42 - "navigation-context.tsx"
Cohesion: 0.08
Nodes (25): FitnessLayout(), BottomNav(), TodaysWorkoutCard(), TodaysWorkoutCardProps, FitnessShellInner(), NavigationContext, NavigationContextType, NavigationProvider() (+17 more)

### Community 43 - "Qt"
Cohesion: 0.11
Nodes (4): cf, nr(), pa(), Qt()

### Community 44 - "fitness-ai/generate-plan/route.ts"
Cohesion: 0.05
Nodes (97): maxDuration, POST(), GenerateGroceryResponseSchema, POST(), maxDuration, POST(), POST(), POST() (+89 more)

### Community 45 - "access.ts"
Cohesion: 0.05
Nodes (44): deleteR2File(), deleteScanPhotosFromR2(), isR2Configured, POST(), GET(), POST(), POST(), generateSlug() (+36 more)

### Community 46 - "l"
Cohesion: 0.11
Nodes (61): an(), bf(), bo(), ch(), di(), eh(), fi(), gd() (+53 more)

### Community 47 - "Ta"
Cohesion: 0.07
Nodes (42): A0(), ai(), as(), bc(), Bl(), bm(), cd(), Cl() (+34 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "Vc"
Cohesion: 0.08
Nodes (32): Bd(), Bl(), bm(), dc(), Dl(), ed(), G0(), gu() (+24 more)

### Community 50 - "Q"
Cohesion: 0.09
Nodes (14): r0(), r0(), r0(), r0(), r0(), r0(), r0(), Ae() (+6 more)

### Community 51 - "lucide-react"
Cohesion: 0.05
Nodes (27): FitnessTableClient(), FitnessUserDetails, formatDate(), dynamic, FitnessAdminDashboard(), CoachHeader(), ExerciseLibraryCard(), FitnessDashboard() (+19 more)

### Community 52 - "AIPlanAnimation.tsx"
Cohesion: 0.13
Nodes (24): AICharacter(), AICharacterProps, AIPlanAnimation(), AIPlanAnimationProps, DEFAULT_FALLBACK_PROFILE, PILL_CONFIGS, PillConfig, ProfileSummary (+16 more)

### Community 53 - "Ph"
Cohesion: 0.04
Nodes (85): Ph(), ad(), ar(), b0(), Bd(), bh(), br(), Bt() (+77 more)

### Community 54 - "onboarding-flow.tsx"
Cohesion: 0.09
Nodes (20): app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_left, app_assets_images_placeholder_left_female (+12 more)

### Community 55 - "index-DtLkR01C.js"
Cohesion: 0.04
Nodes (141): $, A, b, c(), D, e(), f, g (+133 more)

### Community 56 - "pr"
Cohesion: 0.08
Nodes (10): du(), Hn(), lr(), lu(), _n, or(), pr, pu() (+2 more)

### Community 57 - "Ye"
Cohesion: 0.26
Nodes (19): Da(), dh(), dt(), ea(), gh(), hh(), jd(), mh() (+11 more)

### Community 58 - "swap-meal/route.ts"
Cohesion: 0.11
Nodes (22): ALLOWED_MEAL_TYPES, isDietCompatible(), isFoodAvailable(), isFoodBlocked(), matchesTerm(), normalize(), POST(), profileTerms() (+14 more)

### Community 59 - "constants.ts"
Cohesion: 0.05
Nodes (89): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), GroceryPage(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps (+81 more)

### Community 60 - "of"
Cohesion: 0.08
Nodes (48): bs(), bs(), bs(), bs(), _0(), ao(), At(), cf() (+40 more)

### Community 61 - "dx"
Cohesion: 0.06
Nodes (64): am(), ap(), ax(), Bn, cm(), cx(), de(), Dn() (+56 more)

### Community 62 - "r"
Cohesion: 0.09
Nodes (44): ai(), b0(), bc(), cd(), Cl(), cm(), Do(), ea() (+36 more)

### Community 63 - "Ih"
Cohesion: 0.05
Nodes (68): Ih(), ah(), ai(), an(), b0(), bc(), bf(), cd() (+60 more)

### Community 64 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 65 - "r"
Cohesion: 0.11
Nodes (49): ai(), b0(), bh(), bu(), di(), Do(), eh(), fi() (+41 more)

### Community 66 - "i"
Cohesion: 0.11
Nodes (26): bm(), Dl(), ds(), ea(), $f(), G0(), Ga(), Gf() (+18 more)

### Community 67 - "et"
Cohesion: 0.09
Nodes (30): Bl(), Bl(), Bl(), Bl(), bm(), ds(), ea(), $f() (+22 more)

### Community 68 - "a"
Cohesion: 0.08
Nodes (23): bf(), df(), a(), El(), u(), Gt(), H(), hf() (+15 more)

### Community 69 - "hl"
Cohesion: 0.09
Nodes (32): bf(), Ct(), dc(), dd(), Fu(), gu(), Ii(), Je() (+24 more)

### Community 70 - "fl"
Cohesion: 0.10
Nodes (25): A0(), an(), cn(), ed(), Es(), j0(), Jn(), K0() (+17 more)

### Community 71 - "_0"
Cohesion: 0.19
Nodes (21): _0(), D0(), da(), dn(), Ei(), fe(), ff(), Fl() (+13 more)

### Community 72 - "F"
Cohesion: 0.09
Nodes (4): F, I, k(), q

### Community 73 - "_0"
Cohesion: 0.19
Nodes (21): _0(), D0(), da(), dn(), Ei(), fe(), ff(), Fl() (+13 more)

### Community 74 - "$h"
Cohesion: 0.14
Nodes (28): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+20 more)

### Community 75 - "n"
Cohesion: 0.22
Nodes (11): bc(), n(), Ct(), ef, ic(), nf(), oe(), qc() (+3 more)

### Community 76 - "We"
Cohesion: 0.10
Nodes (28): an(), bc(), cd(), D(), dh(), E0(), Es(), hu() (+20 more)

### Community 77 - "bt"
Cohesion: 0.10
Nodes (37): ad(), af(), ao(), At(), da(), fs(), gd(), Hr() (+29 more)

### Community 78 - "ut"
Cohesion: 0.22
Nodes (9): lh(), ui(), wf(), jn(), lf, Oo(), rr(), ut() (+1 more)

### Community 79 - "Hl"
Cohesion: 0.11
Nodes (26): A0(), ai(), b0(), Cl(), cm(), co(), cs(), Es() (+18 more)

### Community 80 - "uf"
Cohesion: 0.10
Nodes (26): as(), c0(), da(), Do(), Fr(), Fu(), hc(), hd() (+18 more)

### Community 81 - "kf"
Cohesion: 0.14
Nodes (20): dc(), ed(), gr(), gu(), h0(), If(), Jn(), Kf() (+12 more)

### Community 82 - "tt"
Cohesion: 0.10
Nodes (30): bi(), bo(), co(), cs(), Fa(), fo(), gi(), go() (+22 more)

### Community 83 - "uc"
Cohesion: 0.15
Nodes (19): as(), br(), cr(), Fn(), gr(), id(), Jc(), ju() (+11 more)

### Community 84 - "rf"
Cohesion: 0.15
Nodes (26): af(), ao(), ch(), fs(), gd(), gi(), Kl(), lf() (+18 more)

### Community 85 - "Ye"
Cohesion: 0.15
Nodes (31): aa(), Da(), dh(), dt(), ea(), gh(), hh(), jd() (+23 more)

### Community 86 - "of"
Cohesion: 0.13
Nodes (32): ao(), bo(), c0(), ci(), ee(), ef(), a(), i() (+24 more)

### Community 87 - "uc"
Cohesion: 0.08
Nodes (40): a0(), bu(), er(), Fa(), fh(), Fn(), ft(), gr() (+32 more)

### Community 88 - "Ye"
Cohesion: 0.23
Nodes (19): _a(), bd(), dh(), dt(), gc(), gh(), hh(), jd() (+11 more)

### Community 89 - "uc"
Cohesion: 0.12
Nodes (27): hx(), E(), M(), a0(), bd(), Fn(), gr(), i0() (+19 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.10
Nodes (27): toggleRemindersEnabledAction(), updateRemindersAction(), ProfileLoading(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS (+19 more)

### Community 91 - "Wh"
Cohesion: 0.15
Nodes (24): am(), $h(), hx(), C(), E(), bd(), D(), dh() (+16 more)

### Community 92 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 93 - "vc"
Cohesion: 0.11
Nodes (18): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+10 more)

### Community 94 - "Ih"
Cohesion: 0.04
Nodes (95): Ih(), A0(), an(), as(), bc(), bm(), cd(), D() (+87 more)

### Community 95 - "l"
Cohesion: 0.07
Nodes (64): ar(), bi(), bo(), ch(), co(), cs(), Ct(), dd() (+56 more)

### Community 96 - "mi"
Cohesion: 0.18
Nodes (19): c0(), cf(), ci(), Dl(), ee(), ef(), hc(), hi() (+11 more)

### Community 97 - "ie"
Cohesion: 0.11
Nodes (27): bi(), co(), cs(), eo(), gi(), hs(), je(), ji() (+19 more)

### Community 98 - "fu"
Cohesion: 0.09
Nodes (30): bm(), ds(), ea(), $f(), G0(), Ga(), Gf(), If() (+22 more)

### Community 99 - "Ph"
Cohesion: 0.03
Nodes (126): Ph(), _0(), A0(), ai(), as(), bc(), bf(), bh() (+118 more)

### Community 100 - "rf"
Cohesion: 0.14
Nodes (26): af(), ao(), At(), cn(), fs(), Kl(), lf(), ls() (+18 more)

### Community 101 - "r"
Cohesion: 0.09
Nodes (72): S, af(), an(), ao(), b0(), bu(), di(), dn() (+64 more)

### Community 102 - "app/package.json"
Cohesion: 0.04
Nodes (43): FitnessChatbot(), Message, config, filteredRuntimeCaching, nextConfig, framer-motion, name, private (+35 more)

### Community 103 - "coach-chat.tsx"
Cohesion: 0.17
Nodes (10): CoachChat(), CoachInput(), CoachInputProps, CoachLoading(), CoachMessage(), CoachMessageProps, CoachSuggestions(), CoachSuggestionsProps (+2 more)

### Community 104 - "yf"
Cohesion: 0.15
Nodes (9): bn, dc(), hc, kc(), lc, mf(), ro, vf() (+1 more)

### Community 105 - "t"
Cohesion: 0.09
Nodes (48): af(), At(), b0(), bi(), co(), cs(), fs(), gd() (+40 more)

### Community 106 - "_0"
Cohesion: 0.13
Nodes (28): _0(), D0(), df(), ds(), en(), fe(), ff(), Gc() (+20 more)

### Community 107 - "of"
Cohesion: 0.09
Nodes (48): ao(), At(), c0(), cf(), ci(), dn(), ee(), ef() (+40 more)

### Community 108 - "Ih"
Cohesion: 0.05
Nodes (69): Ih(), as(), bf(), bm(), dc(), ds(), $f(), Fa() (+61 more)

### Community 109 - "r"
Cohesion: 0.14
Nodes (28): $h(), ct(), el(), g(), m(), r(), Re(), zt() (+20 more)

### Community 110 - "plan-setup/page.tsx"
Cohesion: 0.27
Nodes (11): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+3 more)

### Community 111 - "_0"
Cohesion: 0.10
Nodes (40): _0(), c0(), cf(), ci(), Cl(), cm(), D0(), dn() (+32 more)

### Community 112 - "Hi"
Cohesion: 0.13
Nodes (28): _a(), af(), ds(), fs(), G0(), go(), gs(), io() (+20 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "i"
Cohesion: 0.24
Nodes (15): bi(), bo(), fo(), gs(), ho(), hs(), je(), jo() (+7 more)

### Community 115 - "l"
Cohesion: 0.11
Nodes (39): ar(), At(), Ct(), dd(), df(), eo(), hf(), hn() (+31 more)

### Community 116 - "test_nutrition_engine.mjs"
Cohesion: 0.17
Nodes (4): NutritionValidationEngine, TEST_PROFILES, ref_node_assert, ref_node_crypto

### Community 117 - "st"
Cohesion: 0.13
Nodes (30): T0(), E0(), E0(), T0(), E0(), bo(), E0(), qo() (+22 more)

### Community 118 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+9 more)

### Community 119 - "nutrition-view.tsx"
Cohesion: 0.06
Nodes (45): DailyActivityCard(), DailyActivityCardProps, FitnessDashboardBottom(), FitnessDashboardBottomProps, TodaysGoalsCard(), TodaysGoalsCardProps, formatFoodItem(), TodaysNutritionCard() (+37 more)

### Community 120 - "l"
Cohesion: 0.08
Nodes (59): ad(), bf(), bi(), bo(), ch(), Ct(), Dl(), eo() (+51 more)

### Community 121 - "use-auth.ts"
Cohesion: 0.06
Nodes (44): updateFitnessProfilePartialAction(), ForgotPasswordPage(), ResetPasswordPage(), SignInContent(), SignUpContent(), RoadmapPage(), PlanPreview(), PlanPreviewProps (+36 more)

### Community 122 - "nu"
Cohesion: 0.09
Nodes (9): eu(), gf, ir(), jf(), nu, qu(), Rn(), Ss() (+1 more)

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "nn"
Cohesion: 0.09
Nodes (11): ar(), en(), ja(), ls(), nn(), Oi(), ol(), ru (+3 more)

### Community 125 - "workout-heatmap.tsx"
Cohesion: 0.24
Nodes (9): CellData, DAY_LABELS, formatDate(), getIntensityClass(), HeatmapCell, HeatmapProps, INTENSITY_COLORS, MONTH_LABELS (+1 more)

### Community 126 - "Ye"
Cohesion: 0.17
Nodes (25): am(), hx(), C(), E(), _a(), bd(), dh(), dt() (+17 more)

### Community 127 - "c0"
Cohesion: 0.30
Nodes (15): c0(), D0(), df(), fe(), Gn(), Gt(), Lu(), nt() (+7 more)

### Community 128 - ".add"
Cohesion: 0.08
Nodes (14): af, Cn(), Gn, Gu(), kl(), ks(), _l(), me() (+6 more)

### Community 129 - "ue"
Cohesion: 0.15
Nodes (13): Bt(), cn(), ed(), j0(), Jn(), Ln(), Ns(), qe() (+5 more)

### Community 130 - "l"
Cohesion: 0.07
Nodes (59): Ba(), t(), bi(), bo(), ch(), co(), cs(), Ct() (+51 more)

### Community 131 - "wf"
Cohesion: 0.18
Nodes (13): aa(), Ba(), t(), Ei(), hd(), Ii(), ke(), Mi() (+5 more)

### Community 132 - "sf"
Cohesion: 0.08
Nodes (45): A0(), ai(), bc(), Cl(), cm(), Dd(), dn(), Es() (+37 more)

### Community 134 - "ee"
Cohesion: 0.23
Nodes (16): _0(), cf(), ci(), Dl(), ee(), ef(), is(), jt() (+8 more)

### Community 135 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 136 - "r"
Cohesion: 0.17
Nodes (33): ai(), b0(), bu(), di(), Do(), eh(), fi(), Gt() (+25 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 139 - "ve"
Cohesion: 0.12
Nodes (37): _0(), cf(), ci(), D0(), Dl(), dn(), ee(), ef() (+29 more)

### Community 141 - "uf"
Cohesion: 0.06
Nodes (56): A0(), an(), as(), bc(), cd(), D(), Es(), fh() (+48 more)

### Community 142 - "Ih"
Cohesion: 0.06
Nodes (53): Ih(), bf(), bh(), dc(), er(), Fa(), Fn(), ft() (+45 more)

### Community 143 - "Key Architectural Patterns"
Cohesion: 0.22
Nodes (8): 1. Parallel Batching vs. Sequential Waterfalls, 2. In-Memory Calendar & Status Math, 3. Immediate Suspense Streaming, 4. Router Caching & Optimistic Tab Transitions, 5. Theme Architecture (Dark & White), Architectural Overview, Architecture & Data Flow — GrindLog, Key Architectural Patterns

### Community 144 - "Technology Stack — GrindLog"
Cohesion: 0.22
Nodes (8): AI & LLM Integrations, Core Runtime & Framework, Data Layer & State, Mobile & PWA, Payments & Subscriptions, Styling & Design System, Technology Stack — GrindLog, Utilities & Validation

### Community 145 - "Critical Test Flows"
Cohesion: 0.22
Nodes (8): 1. Tab Navigation & Instant Switching, 2. Dual-Theme Verification (Dark vs. White), 3. Workout Logging & State Persistence, 4. Nutrition & Calorie Tracking, 5. Authentication & Subscription Guard Rails, Critical Test Flows, Testing & Verification Guide — GrindLog, Verification Commands

### Community 147 - "ref_framer_motion"
Cohesion: 0.04
Nodes (24): completeExerciseSetsAction(), FIELD_CONFIGS, FieldConfig, LogMeasurementsPage(), DietPlanCardProps, FitnessHeaderProps, TodayPlanCardProps, NodeItem (+16 more)

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
Cohesion: 0.20
Nodes (18): c0(), cf(), ci(), Cl(), cm(), ee(), ef(), is() (+10 more)

### Community 153 - "springs.ts"
Cohesion: 0.20
Nodes (8): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem

### Community 155 - "pl"
Cohesion: 0.22
Nodes (5): pl, qi, qn(), sn(), yu()

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
Cohesion: 0.06
Nodes (52): saveFitnessOnboardingAction(), GET(), POST(), DELETE(), DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES (+44 more)

### Community 168 - "one-rm.ts"
Cohesion: 0.36
Nodes (5): bestEstimated1RM(), epley1RM(), estimated1RM(), format1RM(), ONE_RM_REP_CAP

### Community 169 - "(fitness)/support/page.tsx"
Cohesion: 0.18
Nodes (14): fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), getUserSupportMessages(), submitSupportMessage(), AdminSupportInbox(), dynamic, FitnessSupportPage() (+6 more)

### Community 170 - "ai-insight-card.tsx"
Cohesion: 0.40
Nodes (3): PlanAdjustment, ProgressReview, WeeklyWorkoutStats

### Community 175 - "createServerSupabase"
Cohesion: 0.03
Nodes (78): exportUserData(), exportWorkoutHistoryCSV(), dynamic, POST(), POST(), POST(), GET(), GET() (+70 more)

### Community 176 - "admin-login/page.tsx"
Cohesion: 0.70
Nodes (3): loginAdminAction(), AdminLogin(), handleSubmit()

### Community 177 - "D0"
Cohesion: 0.22
Nodes (19): D0(), dn(), Ei(), fe(), ff(), Fl(), Gl(), Gn() (+11 more)

### Community 182 - "supabase/middleware.ts"
Cohesion: 0.38
Nodes (5): config, updateSession(), config, middleware(), @supabase/ssr

## Knowledge Gaps
- **559 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+554 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 934 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `.add`, `l`, `Ot`, `dx`, `le`, `index-B23vSfwu.js`, `index-Buds9Sm1.js`, `Ph`, `ve`, `dx`, `Ih`, `index-Cq6kntJJ.js`, `of`, `rf`, `bl`, `pl`, `af`, `r`, `Zf`, `uc`, `zn`, `Qt`, `Ta`, `Q`, `ff`, `rf`, `Ph`, `index-DtLkR01C.js`, `pr`, `of`, `r`, `r`, `et`, `a`, `hl`, `fl`, `n`, `bt`, `ut`, `kf`, `tt`, `uc`, `Ye`, `uc`, `uc`, `vc`, `Ih`, `l`, `mi`, `ie`, `fu`, `Ph`, `yf`, `of`, `Ih`, `_0`, `Hi`, `st`, `nu`, `nn`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `le`, `Ot`, `dx`, `index-B23vSfwu.js`, `rf`, `s`, `B`, `zn`, `Q`, `Ph`, `of`, `r`, `et`, `fl`, `_0`, `n`, `Wh`, `vc`, `Ih`, `mi`, `fu`, `st`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `Ot`, `index-B23vSfwu.js`, `r`, `uf`, `dx`, `sf`, `ee`, `B`, `Q`, `Ph`, `of`, `i`, `et`, `fl`, `_0`, `n`, `Ye`, `vc`, `Ih`, `l`, `fu`, `rf`, `st`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._