# Graph Report - web  (2026-09-24)

## Corpus Check
- 426 files · ~3,442,869 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6460 nodes · 22792 edges · 182 communities (167 shown, 15 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `68607735`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- getCachedUser
- _
- l
- dx
- gsap-C8IefbVz.js
- fitness.ts
- Ph
- index-B23vSfwu.js
- index-Buds9Sm1.js
- Ph
- react
- Ye
- progress-view.tsx
- dx
- prompts.ts
- rf
- Ih
- Ye
- analyze/route.ts
- app/layout.tsx
- createAdminClient
- rf
- import-usda-foundation-foods.mjs
- Ye
- il
- le
- r
- hl
- pr
- test_phase35_regression.mjs
- r
- ir
- dx
- y0
- Ye
- of
- B
- r
- Ot
- index-LDG-1p68.js
- l
- Ye
- navigation-context.tsx
- et
- fitness-ai/generate-plan/route.ts
- access.ts
- l
- uc
- dependencies
- We
- y0
- fitness-dashboard.tsx
- AIPlanAnimation.tsx
- Ph
- onboarding-flow.tsx
- index-DtLkR01C.js
- Q
- Ye
- lf
- constants.ts
- of
- dx
- ee
- Ih
- fitness-reminders/route.ts
- r
- Ih
- $h
- n
- nutrition/types.ts
- fl
- Ta
- F
- _0
- y0
- .get
- grocery-view.tsx
- rf
- sf
- _0
- bt
- fitness-notifications.ts
- rf
- uc
- ve
- zn
- r
- uc
- fu
- Bi
- reminders-client.tsx
- Wh
- users-table-client.tsx
- bl
- Ih
- l
- sf
- t
- i
- Ph
- rf
- r
- app/package.json
- nutrition-engine.ts
- yf
- of
- _0
- sf
- Ih
- r
- plan-setup/page.tsx
- ee
- bf
- compilerOptions
- _0
- tt
- test_nutrition_engine.mjs
- st
- _0
- nutrition-view.tsx
- je
- use-auth.ts
- nu
- manifest.json
- nn
- workout-heatmap.tsx
- Ye
- c0
- .add
- jn
- l
- wf
- sf
- C
- r
- devDependencies
- r
- grocery-tab.tsx
- D0
- _0
- uc
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- lucide-react
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- Ft
- springs.ts
- progression.ts
- lf
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- ee
- coach.ts
- package.json
- wf
- firebase-messaging-sw.js
- Data import scripts
- nutrition-service.ts
- rules/graphify.md
- workflows/graphify.md
- exercise-detail.tsx
- (fitness)/support/page.tsx
- ai-insight-card.tsx
- next-env.d.ts
- createServerSupabase
- ee
- sf
- fitness/page.tsx
- ff
- supabase/middleware.ts
- Project State — GrindLog

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

## Communities (182 total, 15 thin omitted)

### Community 0 - "getCachedUser"
Cohesion: 0.04
Nodes (38): CustomExercisePage(), metadata, ExercisesPage(), metadata, ExerciseDetailPage(), generateMetadata(), dynamic, FitnessLayoutContent() (+30 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (131): _, aa, ac(), al(), ao(), As, at, Be() (+123 more)

### Community 2 - "l"
Cohesion: 0.07
Nodes (57): At(), bi(), bo(), ch(), co(), cs(), df(), eo() (+49 more)

### Community 3 - "dx"
Cohesion: 0.08
Nodes (48): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+40 more)

### Community 4 - "gsap-C8IefbVz.js"
Cohesion: 0.32
Nodes (5): e(), Ml(), Ol(), tr(), xa

### Community 5 - "fitness.ts"
Cohesion: 0.07
Nodes (42): completeSetAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), reopenWorkoutAction(), resumeWorkoutSessionAction(), startWorkoutSessionAction(), ExerciseCardProps, ExerciseDetailProps (+34 more)

### Community 6 - "Ph"
Cohesion: 0.04
Nodes (86): Ph(), Bd(), bf(), bh(), Bl(), bm(), cd(), cf() (+78 more)

### Community 7 - "index-B23vSfwu.js"
Cohesion: 0.06
Nodes (87): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+79 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.06
Nodes (60): $, A, b, c(), D, e(), f, g (+52 more)

### Community 9 - "Ph"
Cohesion: 0.05
Nodes (76): Ph(), A0(), b0(), bm(), br(), cd(), co(), cr() (+68 more)

### Community 10 - "react"
Cohesion: 0.05
Nodes (48): completeExerciseSetsAction(), discardWorkoutSessionAction(), endWorkoutAction(), quickCompleteWorkoutAction(), resetWorkoutTimerAction(), LogWeightPage(), RecentLog, CustomExerciseForm() (+40 more)

### Community 11 - "Ye"
Cohesion: 0.16
Nodes (27): aa(), ad(), Bt(), Da(), dt(), ea(), gc(), gh() (+19 more)

### Community 12 - "progress-view.tsx"
Cohesion: 0.08
Nodes (34): app_assets_images_placeholder_goal, AchievementsShowcase(), ActivityRecoveryAnalyticsCard(), AIProgressReviewCard(), BodyMeasurementsList(), BodyProgressPhotos(), NutritionAnalyticsCard(), getPeriodDescription() (+26 more)

### Community 13 - "dx"
Cohesion: 0.07
Nodes (62): am(), ap(), ax(), Bn, cx(), de(), Dn(), dx() (+54 more)

### Community 14 - "prompts.ts"
Cohesion: 0.07
Nodes (43): approveFitnessPlanAdjustmentAction(), POST(), GET(), POST(), POST(), CoachPage(), metadata, buildFitnessCoachContext() (+35 more)

### Community 15 - "rf"
Cohesion: 0.08
Nodes (49): At(), c0(), cf(), ci(), dn(), ds(), ee(), ef() (+41 more)

### Community 16 - "Ih"
Cohesion: 0.05
Nodes (73): Ih(), ad(), an(), as(), bc(), c0(), cd(), Cl() (+65 more)

### Community 17 - "Ye"
Cohesion: 0.10
Nodes (36): _a(), ad(), bd(), bh(), Bt(), dh(), dt(), Fu() (+28 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.05
Nodes (55): POST(), maxDuration, POST(), stableStringify(), stripImagePayload(), POST(), AIStartingReportPage(), displayValue() (+47 more)

### Community 19 - "app/layout.tsx"
Cohesion: 0.09
Nodes (22): getUnreadNotificationsCountAction(), metadata, viewport, Providers(), DashboardHeader(), fetchUnreadCount(), DashboardHeaderProps, FitnessBottomNav() (+14 more)

### Community 20 - "createAdminClient"
Cohesion: 0.04
Nodes (75): createCouponAction(), toggleCouponStatusAction(), getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), acceptFreePreviewAction() (+67 more)

### Community 21 - "rf"
Cohesion: 0.12
Nodes (31): af(), ao(), cn(), ed(), fs(), gi(), j0(), Jn() (+23 more)

### Community 22 - "import-usda-foundation-foods.mjs"
Cohesion: 0.08
Nodes (24): supabase, ALLERGEN_MAP, content, filePath, lines, newLines, buildRow(), DEFAULT_JSON_PATH (+16 more)

### Community 23 - "Ye"
Cohesion: 0.16
Nodes (27): hx(), E(), M(), _a(), ad(), bd(), dh(), dt() (+19 more)

### Community 24 - "il"
Cohesion: 0.08
Nodes (9): Fn(), hu(), il, jr, nl(), tl(), Ts, Ue() (+1 more)

### Community 25 - "le"
Cohesion: 0.08
Nodes (65): ar(), bi(), bo(), ch(), co(), cs(), Ct(), dd() (+57 more)

### Community 26 - "r"
Cohesion: 0.14
Nodes (43): b0(), bu(), di(), Do(), eh(), fi(), Fr(), Gt() (+35 more)

### Community 27 - "hl"
Cohesion: 0.10
Nodes (53): ad(), bi(), bo(), cf(), Ct(), gd(), e(), l() (+45 more)

### Community 28 - "pr"
Cohesion: 0.09
Nodes (10): du(), Hn(), lr(), lu(), _n, or(), pr, pu() (+2 more)

### Community 29 - "test_phase35_regression.mjs"
Cohesion: 0.14
Nodes (13): buildNutritionUserContext(), calculateDailyBudget(), generateContextFingerprint(), NormalizedDiet, NormalizedEnvironment, normalizeDietType(), NormalizedMealSlot, normalizeFoodEnvironment() (+5 more)

### Community 30 - "r"
Cohesion: 0.16
Nodes (35): af(), ai(), bu(), di(), Do(), fi(), fo(), ge() (+27 more)

### Community 31 - "ir"
Cohesion: 0.14
Nodes (36): ot(), an(), bh(), Bt(), bu(), di(), eh(), fi() (+28 more)

### Community 32 - "dx"
Cohesion: 0.07
Nodes (62): am(), ap(), ax(), Bn, cm(), cx(), de(), Dn() (+54 more)

### Community 33 - "y0"
Cohesion: 0.11
Nodes (25): bm(), Dl(), ed(), $f(), G0(), Gf(), If(), Jn() (+17 more)

### Community 34 - "Ye"
Cohesion: 0.17
Nodes (27): ar(), Da(), dh(), dt(), ea(), ft(), gh(), hh() (+19 more)

### Community 35 - "of"
Cohesion: 0.13
Nodes (51): ad(), an(), bo(), bu(), di(), eh(), fi(), gd() (+43 more)

### Community 36 - "B"
Cohesion: 0.18
Nodes (24): hx(), E(), M(), _a(), bd(), bh(), dt(), gc() (+16 more)

### Community 37 - "r"
Cohesion: 0.09
Nodes (41): $h(), ct(), el(), m(), ot(), r(), Re(), y() (+33 more)

### Community 38 - "Ot"
Cohesion: 0.08
Nodes (68): Xx(), Yx(), Xx(), Yx(), ap(), Bn(), ep(), o() (+60 more)

### Community 39 - "index-LDG-1p68.js"
Cohesion: 0.07
Nodes (73): am(), ap(), ax(), Bn(), Bx, Cc(), cx(), de() (+65 more)

### Community 40 - "l"
Cohesion: 0.08
Nodes (63): ar(), bi(), Ct(), dd(), df(), ea(), eo(), fo() (+55 more)

### Community 41 - "Ye"
Cohesion: 0.10
Nodes (36): hx(), C(), E(), _a(), ad(), ar(), bd(), Bt() (+28 more)

### Community 42 - "navigation-context.tsx"
Cohesion: 0.10
Nodes (20): FitnessLayout(), BottomNav(), TodaysWorkoutCard(), TodaysWorkoutCardProps, FitnessShellInner(), NavigationContext, NavigationContextType, NavigationProvider() (+12 more)

### Community 43 - "et"
Cohesion: 0.08
Nodes (13): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), rr(), rr() (+5 more)

### Community 44 - "fitness-ai/generate-plan/route.ts"
Cohesion: 0.05
Nodes (100): dynamic, GET(), POST(), revalidate, maxDuration, POST(), GenerateGroceryResponseSchema, POST() (+92 more)

### Community 45 - "access.ts"
Cohesion: 0.10
Nodes (25): POST(), FitnessProPage(), metadata, ProfileSubscriptionProps, PricingCard(), PricingCardProps, ProPageClient(), ProPageClientProps (+17 more)

### Community 46 - "l"
Cohesion: 0.11
Nodes (55): ad(), an(), bo(), di(), eh(), Ei(), fi(), l() (+47 more)

### Community 47 - "uc"
Cohesion: 0.20
Nodes (14): as(), br(), cr(), Fn(), gr(), id(), ju(), l0() (+6 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "We"
Cohesion: 0.09
Nodes (31): A0(), an(), bc(), cd(), Cl(), cm(), Es(), Fa() (+23 more)

### Community 50 - "y0"
Cohesion: 0.11
Nodes (26): bm(), Dl(), ds(), ea(), $f(), G0(), Ga(), Gf() (+18 more)

### Community 51 - "fitness-dashboard.tsx"
Cohesion: 0.14
Nodes (15): ExerciseLibraryCard(), FitnessDashboard(), FitnessDashboardProps, HorizontalCalendar(), HorizontalCalendarProps, TransformationCard(), TransformationCardProps, BillingManagementClientProps (+7 more)

### Community 52 - "AIPlanAnimation.tsx"
Cohesion: 0.13
Nodes (24): AICharacter(), AICharacterProps, AIPlanAnimation(), AIPlanAnimationProps, DEFAULT_FALLBACK_PROFILE, PILL_CONFIGS, PillConfig, ProfileSummary (+16 more)

### Community 53 - "Ph"
Cohesion: 0.04
Nodes (88): Ph(), A0(), aa(), ai(), b0(), bh(), bm(), Bt() (+80 more)

### Community 54 - "onboarding-flow.tsx"
Cohesion: 0.09
Nodes (20): app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_left, app_assets_images_placeholder_left_female (+12 more)

### Community 55 - "index-DtLkR01C.js"
Cohesion: 0.04
Nodes (139): $, A, b, c(), D, e(), f, g (+131 more)

### Community 56 - "Q"
Cohesion: 0.08
Nodes (15): r0(), r0(), r0(), r0(), r0(), r0(), r0(), Ae() (+7 more)

### Community 57 - "Ye"
Cohesion: 0.10
Nodes (39): ar(), Bt(), Da(), dh(), dt(), ea(), er(), fh() (+31 more)

### Community 58 - "lf"
Cohesion: 0.23
Nodes (16): ao(), fs(), gi(), Gt(), lf(), ms(), _o(), os() (+8 more)

### Community 59 - "constants.ts"
Cohesion: 0.09
Nodes (37): ACTIVITY_MULTIPLIERS, AUTHENTIC_INDIAN_RECIPES, AuthenticMealRecipe, BANNED_FOOD_PATTERNS, CATEGORY_RETAIL_UNITS, CORE_MEAL_TYPES, DAILY_FOOD_CAPS, DEFAULT_ACTIVITY_MULTIPLIER (+29 more)

### Community 60 - "of"
Cohesion: 0.08
Nodes (47): _0(), ao(), bc(), Bl(), cd(), ci(), cs(), Dd() (+39 more)

### Community 61 - "dx"
Cohesion: 0.07
Nodes (60): am(), ap(), ax(), Bn, cm(), cx(), de(), Dn() (+52 more)

### Community 62 - "ee"
Cohesion: 0.31
Nodes (13): c0(), cf(), ci(), ee(), ef(), is(), lo(), ml() (+5 more)

### Community 63 - "Ih"
Cohesion: 0.04
Nodes (92): $h(), Ih(), ah(), an(), b0(), bc(), bf(), bm() (+84 more)

### Community 64 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 65 - "r"
Cohesion: 0.11
Nodes (55): $h(), ai(), b0(), D(), di(), Do(), eh(), fi() (+47 more)

### Community 66 - "Ih"
Cohesion: 0.05
Nodes (64): Ih(), bf(), bh(), bm(), Bt(), cn(), da(), dc() (+56 more)

### Community 67 - "$h"
Cohesion: 0.16
Nodes (24): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+16 more)

### Community 68 - "n"
Cohesion: 0.08
Nodes (16): bo(), n(), Co(), dl(), Fi(), ku(), lf, ma() (+8 more)

### Community 69 - "nutrition/types.ts"
Cohesion: 0.13
Nodes (18): getRetailUnit(), parseServingGrams(), calculateGroceryList(), AssembledMeal, BudgetTier, DeterministicNutritionPlan, DietType, FitnessGoal (+10 more)

### Community 70 - "fl"
Cohesion: 0.12
Nodes (28): A0(), ai(), an(), bc(), cd(), Cl(), cm(), D() (+20 more)

### Community 71 - "Ta"
Cohesion: 0.13
Nodes (22): bf(), ch(), ds(), eo(), G0(), hn(), kr(), Kt() (+14 more)

### Community 72 - "F"
Cohesion: 0.09
Nodes (4): F, I, k(), q

### Community 73 - "_0"
Cohesion: 0.20
Nodes (21): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+13 more)

### Community 74 - "y0"
Cohesion: 0.10
Nodes (27): bm(), Dl(), ds(), ea(), $f(), G0(), Ga(), Gf() (+19 more)

### Community 75 - ".get"
Cohesion: 0.19
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "grocery-view.tsx"
Cohesion: 0.27
Nodes (15): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps, getScaledPrice() (+7 more)

### Community 77 - "rf"
Cohesion: 0.10
Nodes (35): af(), ao(), At(), cn(), ed(), fs(), gi(), j0() (+27 more)

### Community 78 - "sf"
Cohesion: 0.15
Nodes (19): Ct(), dd(), Fu(), Ii(), Jl(), ke(), la(), lh() (+11 more)

### Community 79 - "_0"
Cohesion: 0.20
Nodes (20): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+12 more)

### Community 80 - "bt"
Cohesion: 0.13
Nodes (22): c0(), ch(), da(), Do(), Fr(), hc(), hd(), hi() (+14 more)

### Community 81 - "fitness-notifications.ts"
Cohesion: 0.22
Nodes (15): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), markAllNotificationsAsReadAction(), markNotificationAsReadAction() (+7 more)

### Community 82 - "rf"
Cohesion: 0.13
Nodes (29): _0(), af(), ao(), At(), cf(), fs(), gi(), Gl() (+21 more)

### Community 83 - "uc"
Cohesion: 0.12
Nodes (24): as(), br(), cr(), Fn(), gr(), i0(), id(), Jc() (+16 more)

### Community 84 - "ve"
Cohesion: 0.08
Nodes (51): _0(), cf(), ch(), ci(), cn(), D0(), dn(), ee() (+43 more)

### Community 85 - "zn"
Cohesion: 0.16
Nodes (31): Da(), dh(), dt(), ea(), gh(), hh(), jd(), Ln() (+23 more)

### Community 86 - "r"
Cohesion: 0.11
Nodes (32): bc(), c0(), D(), Dd(), dn(), fh(), fo(), Fu() (+24 more)

### Community 87 - "uc"
Cohesion: 0.08
Nodes (36): a0(), er(), Fa(), fh(), Fn(), ft(), gr(), I() (+28 more)

### Community 88 - "fu"
Cohesion: 0.06
Nodes (51): A0(), ai(), an(), bc(), cd(), Cl(), cm(), D() (+43 more)

### Community 89 - "Bi"
Cohesion: 0.07
Nodes (41): a0(), as(), er(), Fa(), Fn(), ft(), gr(), ht() (+33 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.09
Nodes (30): toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), updateRemindersAction(), ProfileLoading(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient() (+22 more)

### Community 91 - "Wh"
Cohesion: 0.24
Nodes (15): $h(), hh(), w(), X(), r(), rx(), Wh(), ct() (+7 more)

### Community 92 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 93 - "bl"
Cohesion: 0.05
Nodes (39): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+31 more)

### Community 94 - "Ih"
Cohesion: 0.05
Nodes (61): Ih(), as(), bf(), bh(), bu(), da(), dc(), er() (+53 more)

### Community 95 - "l"
Cohesion: 0.08
Nodes (50): ar(), At(), bi(), bo(), ch(), co(), cs(), df() (+42 more)

### Community 96 - "sf"
Cohesion: 0.12
Nodes (23): Ct(), dd(), Fu(), Ii(), Je(), Jl(), ke(), la() (+15 more)

### Community 97 - "t"
Cohesion: 0.09
Nodes (35): At(), Bd(), bi(), co(), gd(), e(), t(), hs() (+27 more)

### Community 98 - "i"
Cohesion: 0.11
Nodes (26): bm(), Dl(), ds(), ea(), $f(), G0(), Ga(), Gf() (+18 more)

### Community 99 - "Ph"
Cohesion: 0.06
Nodes (62): Ph(), as(), bf(), bu(), Cn(), dc(), en(), er() (+54 more)

### Community 100 - "rf"
Cohesion: 0.15
Nodes (26): af(), ao(), fs(), gd(), gi(), Kl(), lf(), ls() (+18 more)

### Community 101 - "r"
Cohesion: 0.13
Nodes (38): S, af(), an(), b0(), bh(), di(), Do(), eh() (+30 more)

### Community 102 - "app/package.json"
Cohesion: 0.04
Nodes (45): FitnessChatbot(), Message, config, filteredRuntimeCaching, nextConfig, framer-motion, name, private (+37 more)

### Community 103 - "nutrition-engine.ts"
Cohesion: 0.25
Nodes (16): GroceryPage(), generateGuidance(), isBannedFood(), parseBudget(), filterByBudget(), getAvailableFoodMatches(), getCarbSources(), getProteinSources() (+8 more)

### Community 104 - "yf"
Cohesion: 0.18
Nodes (7): hc, kc(), lc, mf(), ro, vf(), yf

### Community 105 - "of"
Cohesion: 0.15
Nodes (27): af(), At(), fs(), io(), Kl(), ll(), ls(), ms() (+19 more)

### Community 106 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+8 more)

### Community 107 - "sf"
Cohesion: 0.09
Nodes (40): bs(), bs(), bs(), bs(), bs(), ao(), bs(), c0() (+32 more)

### Community 108 - "Ih"
Cohesion: 0.05
Nodes (63): Ih(), as(), bf(), bh(), da(), dc(), er(), Fa() (+55 more)

### Community 109 - "r"
Cohesion: 0.12
Nodes (33): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+25 more)

### Community 110 - "plan-setup/page.tsx"
Cohesion: 0.27
Nodes (11): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+3 more)

### Community 111 - "ee"
Cohesion: 0.27
Nodes (14): c0(), cf(), ci(), ee(), ef(), is(), lo(), ml() (+6 more)

### Community 112 - "bf"
Cohesion: 0.09
Nodes (40): _a(), af(), bf(), ch(), Dl(), ds(), eo(), fs() (+32 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), Ei(), fe(), ff(), Gl(), Gn(), Hr() (+9 more)

### Community 115 - "tt"
Cohesion: 0.07
Nodes (63): At(), bi(), bo(), co(), cs(), Ct(), dd(), df() (+55 more)

### Community 116 - "test_nutrition_engine.mjs"
Cohesion: 0.17
Nodes (4): NutritionValidationEngine, TEST_PROFILES, ref_node_assert, ref_node_crypto

### Community 117 - "st"
Cohesion: 0.13
Nodes (29): T0(), E0(), E0(), T0(), E0(), E0(), E0(), go() (+21 more)

### Community 118 - "_0"
Cohesion: 0.08
Nodes (40): _0(), ai(), as(), Cl(), cm(), D0(), df(), Do() (+32 more)

### Community 119 - "nutrition-view.tsx"
Cohesion: 0.05
Nodes (50): DailyActivityCard(), DailyActivityCardProps, FitnessDashboardBottom(), FitnessDashboardBottomProps, ProNutritionGenerationCard(), TodaysGoalsCard(), TodaysGoalsCardProps, formatFoodItem() (+42 more)

### Community 120 - "je"
Cohesion: 0.09
Nodes (39): af(), At(), bi(), cs(), fs(), e(), gi(), hs() (+31 more)

### Community 121 - "use-auth.ts"
Cohesion: 0.06
Nodes (41): ForgotPasswordPage(), ResetPasswordPage(), SignInContent(), SignUpContent(), RoadmapPage(), PlanPreview(), PlanPreviewProps, compressImage() (+33 more)

### Community 122 - "nu"
Cohesion: 0.09
Nodes (11): eu(), gf, ir(), jf(), nu, qu(), Rn(), sn() (+3 more)

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
Cohesion: 0.10
Nodes (39): hx(), C(), E(), _a(), ad(), bd(), Bt(), dh() (+31 more)

### Community 127 - "c0"
Cohesion: 0.31
Nodes (15): c0(), D0(), df(), fe(), Gl(), Gn(), Lu(), nt() (+7 more)

### Community 128 - ".add"
Cohesion: 0.08
Nodes (14): af, Cn(), Gn, Gu(), kl(), ks(), _l(), me() (+6 more)

### Community 129 - "jn"
Cohesion: 0.10
Nodes (30): A0(), ai(), bc(), cd(), Cl(), cm(), Es(), fl() (+22 more)

### Community 130 - "l"
Cohesion: 0.06
Nodes (72): ar(), Ba(), t(), bi(), bo(), ch(), co(), cs() (+64 more)

### Community 131 - "wf"
Cohesion: 0.07
Nodes (41): A0(), aa(), ai(), b0(), Ba(), t(), Cl(), cm() (+33 more)

### Community 132 - "sf"
Cohesion: 0.14
Nodes (18): ah(), ar(), Bt(), ke(), la(), Ln(), md(), Mi() (+10 more)

### Community 133 - "C"
Cohesion: 0.13
Nodes (9): b0(), bf(), dc(), gu(), Kr(), Pu(), tc(), Ut() (+1 more)

### Community 134 - "r"
Cohesion: 0.16
Nodes (34): ai(), bu(), D(), di(), fi(), Gt(), lt(), ni() (+26 more)

### Community 135 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 136 - "r"
Cohesion: 0.14
Nodes (45): b0(), bu(), di(), Do(), eh(), fi(), Fr(), gs() (+37 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 139 - "D0"
Cohesion: 0.25
Nodes (17): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gn() (+9 more)

### Community 141 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), Gl() (+9 more)

### Community 142 - "uc"
Cohesion: 0.09
Nodes (34): as(), er(), Fa(), Fn(), ft(), gr(), Ic(), ir() (+26 more)

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
Nodes (30): loginAdminAction(), AdminLogin(), handleSubmit(), FIELD_CONFIGS, FieldConfig, LogMeasurementsPage(), CoachChat(), CoachHeader() (+22 more)

### Community 149 - "Concerns, Technical Debt & Watch-Outs — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Database Waterfall Regressions, 2. White Theme CSS Overrides, 3. PWA Service Worker Cache Invalidation, 4. Mobile Keyboard & Viewport Layout Shifts, 5. Razorpay Webhook Idempotency & Webhook Retries, Concerns, Technical Debt & Watch-Outs — GrindLog

### Community 150 - "External Integrations & Services — GrindLog"
Cohesion: 0.25
Nodes (7): 1. Supabase (Database, Auth, Storage), 2. Razorpay (Payment Gateway), 3. Google Gemini AI (@google/genai), 4. PWA Service Worker (Next-PWA & Workbox), 5. Resend (Email Service), 6. Developer Tooling & Agent Workflow Suite, External Integrations & Services — GrindLog

### Community 151 - "Product & Technical Requirements — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Performance & Latency Requirements, 2. Workout & Fitness Requirements, 3. Nutrition & Diet Requirements, 4. Design & Mobile Experience Requirements, 5. Security & Billing Requirements, Product & Technical Requirements — GrindLog

### Community 152 - "Ft"
Cohesion: 0.19
Nodes (19): c0(), cf(), ci(), ee(), ef(), hc(), hi(), is() (+11 more)

### Community 153 - "springs.ts"
Cohesion: 0.20
Nodes (8): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem

### Community 155 - "lf"
Cohesion: 0.25
Nodes (15): ao(), fs(), gi(), Gt(), lf(), ms(), _o(), os() (+7 more)

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 158 - "ee"
Cohesion: 0.23
Nodes (15): ao(), ci(), ee(), ef(), is(), Jr(), lo(), ml() (+7 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 161 - "wf"
Cohesion: 0.10
Nodes (24): aa(), Ba(), t(), Bd(), Bl(), Cn(), Ei(), hd() (+16 more)

### Community 164 - "nutrition-service.ts"
Cohesion: 0.06
Nodes (56): saveFitnessOnboardingAction(), GET(), POST(), DELETE(), DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES (+48 more)

### Community 168 - "exercise-detail.tsx"
Cohesion: 0.14
Nodes (18): ExerciseAnimationPlayer(), ExerciseAnimationPlayerProps, BODYWEIGHT_KEYWORDS, ExerciseDetail(), generateInstructions(), isBodyweightExercise(), playRestDoneChime(), bestEstimated1RM() (+10 more)

### Community 169 - "(fitness)/support/page.tsx"
Cohesion: 0.23
Nodes (10): getUserSupportMessages(), submitSupportMessage(), dynamic, FitnessSupportPage(), revalidate, SUPPORT_CATEGORIES, SupportClient(), SupportClientProps (+2 more)

### Community 170 - "ai-insight-card.tsx"
Cohesion: 0.40
Nodes (3): PlanAdjustment, ProgressReview, WeeklyWorkoutStats

### Community 175 - "createServerSupabase"
Cohesion: 0.04
Nodes (75): exportUserData(), exportWorkoutHistoryCSV(), dynamic, POST(), POST(), POST(), deleteR2File(), deleteScanPhotosFromR2() (+67 more)

### Community 176 - "ee"
Cohesion: 0.27
Nodes (13): ci(), Cl(), Dl(), ee(), ef(), is(), jt(), lo() (+5 more)

### Community 177 - "sf"
Cohesion: 0.20
Nodes (11): Fu(), Je(), ke(), la(), lh(), md(), Mi(), sf() (+3 more)

### Community 178 - "fitness/page.tsx"
Cohesion: 0.43
Nodes (5): FitnessTableClient(), FitnessUserDetails, formatDate(), dynamic, FitnessAdminDashboard()

### Community 180 - "supabase/middleware.ts"
Cohesion: 0.38
Nodes (5): config, updateSession(), config, middleware(), @supabase/ssr

### Community 181 - "Project State — GrindLog"
Cohesion: 0.40
Nodes (4): main(), Blockers & Open Items, Current Status, Project State — GrindLog

## Knowledge Gaps
- **561 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+556 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 936 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `.add`, `jn`, `l`, `l`, `dx`, `gsap-C8IefbVz.js`, `index-B23vSfwu.js`, `index-Buds9Sm1.js`, `Ph`, `uc`, `rf`, `of`, `il`, `Ft`, `le`, `hl`, `pr`, `ee`, `wf`, `r`, `Ot`, `index-LDG-1p68.js`, `et`, `ff`, `Ph`, `index-DtLkR01C.js`, `Q`, `of`, `Ih`, `n`, `fl`, `Ta`, `_0`, `.get`, `rf`, `bt`, `uc`, `ve`, `zn`, `uc`, `fu`, `Bi`, `bl`, `Ih`, `t`, `Ph`, `yf`, `sf`, `Ih`, `r`, `bf`, `tt`, `st`, `_0`, `nu`, `nn`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `index-B23vSfwu.js`, `r`, `dx`, `_0`, `uc`, `Ye`, `Ft`, `wf`, `B`, `et`, `Q`, `n`, `fl`, `sf`, `fu`, `Bi`, `bl`, `l`, `rf`, `sf`, `st`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `sf`, `C`, `index-B23vSfwu.js`, `lf`, `r`, `dx`, `wf`, `B`, `et`, `n`, `fl`, `ve`, `uc`, `Bi`, `bl`, `i`, `sf`, `tt`, `st`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._