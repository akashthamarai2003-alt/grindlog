# Graph Report - web  (2026-09-21)

## Corpus Check
- 409 files · ~3,421,643 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6317 nodes · 22395 edges · 183 communities (170 shown, 13 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2684 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f15402f9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- nutrition-service.ts
- _
- fitness.ts
- progress-view.tsx
- ee
- navigation-context.tsx
- Ph
- Ph
- index-Buds9Sm1.js
- Ph
- types/index.ts
- sf
- ref_framer_motion
- index-DtLkR01C.js
- constants.ts
- index-B23vSfwu.js
- Ih
- uc
- analyze/route.ts
- app/package.json
- createAdminClient
- Ih
- dx
- uc
- il
- r
- r
- .add
- sf
- ee
- l
- Ai
- n
- lucide-react
- access.ts
- le
- dx
- r
- ir
- Ot
- r
- _c
- pr
- uc
- generate-draft/route.ts
- lf
- l
- sf
- dependencies
- Ye
- fu
- dx
- et
- sf
- ai-insight-service.ts
- Bi
- pc
- r
- st
- l
- r
- l
- rf
- uc
- lf
- n
- Ta
- onboarding-flow.tsx
- uc
- ee
- i
- uf
- F
- react
- Ih
- .get
- fitness-notifications.ts
- nutrition-engine.ts
- vc
- ve
- Wh
- Ih
- r
- Ph
- zn
- Ye
- grocery-view.tsx
- B
- fitness-plan-profile.ts
- r
- reminders-client.tsx
- c0
- uc
- devDependencies
- _0
- nn
- rf
- Wh
- import-usda-foundation-foods.mjs
- users-table-client.tsx
- D0
- l
- Ih
- _0
- $h
- uc
- ee
- D0
- c0
- l
- tt
- of
- Ye
- compilerOptions
- nutrition/types.ts
- l
- ei
- t0
- bt
- af
- _0
- of
- nu
- manifest.json
- rf
- yf
- Ye
- ee
- exercise-browser.tsx
- wf
- fitness-dashboard.tsx
- fitness-reminders/route.ts
- rf
- C
- l
- af
- r
- _0
- grocery-tab.tsx
- dashboard-header.tsx
- nutrition-view.tsx
- Wh
- (fitness)/support/page.tsx
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- plan-setup/page.tsx
- dx
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- ee
- We
- progression.ts
- i
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- ur
- coach.ts
- package.json
- ff
- firebase-messaging-sw.js
- Data import scripts
- createServerSupabase
- rules/graphify.md
- workflows/graphify.md
- [workoutId]/page.tsx
- workout-heatmap.tsx
- app/layout.tsx
- next-env.d.ts
- bf
- supabase/middleware.ts
- gsap-C8IefbVz.js
- nutrition/page.tsx
- ai-insight-card.tsx
- admin-login/page.tsx
- log-measurements/page.tsx
- next-pwa.d.ts

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

## Communities (183 total, 13 thin omitted)

### Community 0 - "nutrition-service.ts"
Cohesion: 0.06
Nodes (48): GET(), POST(), DELETE(), GET(), GET(), ALLOWED_MEAL_TYPES, GET(), isDietCompatible() (+40 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (119): _, aa, ac(), ao(), As, at, Be(), bf() (+111 more)

### Community 2 - "fitness.ts"
Cohesion: 0.05
Nodes (61): completeExerciseSetsAction(), completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), quickCompleteWorkoutAction(), reopenWorkoutAction() (+53 more)

### Community 3 - "progress-view.tsx"
Cohesion: 0.08
Nodes (33): app_assets_images_placeholder_goal, AchievementsShowcase(), ActivityRecoveryAnalyticsCard(), AIProgressReviewCard(), BodyMeasurementsList(), BodyProgressPhotos(), NutritionAnalyticsCard(), getPeriodDescription() (+25 more)

### Community 4 - "ee"
Cohesion: 0.23
Nodes (16): _0(), cf(), ci(), ee(), ef(), hc(), hi(), is() (+8 more)

### Community 5 - "navigation-context.tsx"
Cohesion: 0.09
Nodes (22): BottomNav(), TodaysWorkoutCard(), TodaysWorkoutCardProps, FitnessShellInner(), NavigationContext, NavigationContextType, NavigationProvider(), useInstantNav() (+14 more)

### Community 6 - "Ph"
Cohesion: 0.05
Nodes (72): Ph(), aa(), Ba(), t(), cd(), cf(), Cn(), Do() (+64 more)

### Community 7 - "Ph"
Cohesion: 0.04
Nodes (98): Ph(), A0(), ai(), bc(), bf(), bh(), bm(), cd() (+90 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.06
Nodes (83): $, A, b, c(), D, e(), f, g (+75 more)

### Community 9 - "Ph"
Cohesion: 0.05
Nodes (72): Ph(), cd(), cf(), Cn(), dc(), Dl(), Do(), ds() (+64 more)

### Community 10 - "types/index.ts"
Cohesion: 0.06
Nodes (40): toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), ForgotPasswordPage(), ResetPasswordPage(), SignInContent(), SignUpContent(), RoadmapPage(), PlanPreview() (+32 more)

### Community 11 - "sf"
Cohesion: 0.16
Nodes (15): Bt(), Fu(), ke(), la(), Ln(), md(), Mi(), sc() (+7 more)

### Community 12 - "ref_framer_motion"
Cohesion: 0.04
Nodes (32): DietPlanCardProps, FitnessHeaderProps, TodayPlanCardProps, NodeItem, NODES_DATA, FitnessLandingPage(), ExerciseAnimationPlayer(), ExerciseAnimationPlayerProps (+24 more)

### Community 13 - "index-DtLkR01C.js"
Cohesion: 0.03
Nodes (156): $, A, b, c(), D, e(), f, g (+148 more)

### Community 14 - "constants.ts"
Cohesion: 0.12
Nodes (27): AUTHENTIC_INDIAN_RECIPES, AuthenticMealRecipe, BANNED_FOOD_PATTERNS, CATEGORY_RETAIL_UNITS, CORE_MEAL_TYPES, DAILY_FOOD_CAPS, DEFAULT_MEAL_STRUCTURE, FoodServingLimit (+19 more)

### Community 15 - "index-B23vSfwu.js"
Cohesion: 0.07
Nodes (75): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+67 more)

### Community 16 - "Ih"
Cohesion: 0.04
Nodes (89): Ih(), ad(), ah(), an(), as(), bc(), bm(), cd() (+81 more)

### Community 17 - "uc"
Cohesion: 0.10
Nodes (33): a0(), bu(), er(), Fa(), Fn(), ft(), gr(), i0() (+25 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.08
Nodes (33): POST(), POST(), stableStringify(), stripImagePayload(), AIStartingReportPage(), displayValue(), dynamic, isRecord() (+25 more)

### Community 19 - "app/package.json"
Cohesion: 0.04
Nodes (48): FitnessChatbot(), Message, config, filteredRuntimeCaching, nextConfig, framer-motion, name, private (+40 more)

### Community 20 - "createAdminClient"
Cohesion: 0.03
Nodes (87): createCouponAction(), toggleCouponStatusAction(), getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), checkUserPremiumStatusAction() (+79 more)

### Community 21 - "Ih"
Cohesion: 0.05
Nodes (59): Ih(), bf(), Bt(), cn(), da(), dc(), ed(), Fu() (+51 more)

### Community 22 - "dx"
Cohesion: 0.08
Nodes (47): am(), ap(), ax(), Bn, cm(), de(), Dn(), dx() (+39 more)

### Community 23 - "uc"
Cohesion: 0.09
Nodes (34): ad(), ds(), er(), Fn(), ft(), gr(), Ic(), ir() (+26 more)

### Community 24 - "il"
Cohesion: 0.04
Nodes (25): bo(), n(), Co(), Fi(), Fn(), hu(), il, jr (+17 more)

### Community 25 - "r"
Cohesion: 0.08
Nodes (47): $h(), ct(), el(), m(), ot(), r(), Re(), y() (+39 more)

### Community 26 - "r"
Cohesion: 0.08
Nodes (64): ad(), af(), as(), At(), b0(), bh(), bu(), di() (+56 more)

### Community 27 - ".add"
Cohesion: 0.06
Nodes (23): af, Cn(), a(), Gn, Gu(), kl(), ks(), _l() (+15 more)

### Community 28 - "sf"
Cohesion: 0.07
Nodes (48): A0(), ai(), bc(), Bd(), Bl(), bm(), c0(), Cl() (+40 more)

### Community 29 - "ee"
Cohesion: 0.21
Nodes (17): c0(), cf(), ci(), ee(), ef(), Fu(), ha(), is() (+9 more)

### Community 30 - "l"
Cohesion: 0.09
Nodes (50): ar(), bf(), ch(), Ct(), dd(), df(), Dl(), ea() (+42 more)

### Community 31 - "Ai"
Cohesion: 0.14
Nodes (24): ao(), dn(), fs(), gi(), hu(), lf(), M0(), ms() (+16 more)

### Community 32 - "n"
Cohesion: 0.13
Nodes (46): ad(), an(), bh(), bo(), bu(), di(), eh(), fi() (+38 more)

### Community 33 - "lucide-react"
Cohesion: 0.05
Nodes (29): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem (+21 more)

### Community 34 - "access.ts"
Cohesion: 0.07
Nodes (34): approveFitnessPlanAdjustmentAction(), POST(), GET(), normalizeMealType(), POST(), VALID_MEAL_TYPES, POST(), CoachPage() (+26 more)

### Community 35 - "le"
Cohesion: 0.09
Nodes (50): ar(), At(), ch(), Ct(), dd(), df(), eo(), hf() (+42 more)

### Community 36 - "dx"
Cohesion: 0.08
Nodes (47): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+39 more)

### Community 37 - "r"
Cohesion: 0.10
Nodes (31): as(), b0(), da(), Fr(), ge(), hc(), hd(), hi() (+23 more)

### Community 38 - "ir"
Cohesion: 0.15
Nodes (35): $h(), ct(), el(), g(), ot(), Re(), zt(), an() (+27 more)

### Community 39 - "Ot"
Cohesion: 0.09
Nodes (62): Xx(), Yx(), Vx(), Xx(), Yx(), Vx(), Xx(), Yx() (+54 more)

### Community 40 - "r"
Cohesion: 0.10
Nodes (54): af(), ch(), cn(), di(), Do(), ea(), fi(), Fr() (+46 more)

### Community 41 - "_c"
Cohesion: 0.07
Nodes (54): hx(), im(), am(), ap(), ax(), Bn, de(), Dn() (+46 more)

### Community 42 - "pr"
Cohesion: 0.05
Nodes (25): r0(), r0(), r0(), r0(), r0(), r0(), r0(), Ae() (+17 more)

### Community 43 - "uc"
Cohesion: 0.09
Nodes (34): as(), er(), Fn(), ft(), gr(), Ic(), ir(), ju() (+26 more)

### Community 44 - "generate-draft/route.ts"
Cohesion: 0.05
Nodes (96): GET(), POST(), POST(), maxDuration, POST(), maxDuration, POST(), POST() (+88 more)

### Community 45 - "lf"
Cohesion: 0.27
Nodes (14): ao(), fs(), gi(), lf(), ms(), _o(), os(), qt() (+6 more)

### Community 46 - "l"
Cohesion: 0.08
Nodes (66): ad(), bf(), bi(), bo(), ch(), co(), cs(), eo() (+58 more)

### Community 47 - "sf"
Cohesion: 0.12
Nodes (17): aa(), ad(), Bt(), ke(), lh(), Ln(), md(), Mi() (+9 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "Ye"
Cohesion: 0.10
Nodes (35): _a(), ad(), Bt(), dt(), Fu(), gc(), gh(), hh() (+27 more)

### Community 50 - "fu"
Cohesion: 0.09
Nodes (29): z0(), z0(), bm(), ds(), $f(), G0(), Ga(), Gf() (+21 more)

### Community 51 - "dx"
Cohesion: 0.08
Nodes (49): am(), ap(), ax(), Bn, cm(), de(), Dn(), dx() (+41 more)

### Community 52 - "et"
Cohesion: 0.07
Nodes (14): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), rr(), rr() (+6 more)

### Community 53 - "sf"
Cohesion: 0.12
Nodes (42): _0(), ai(), an(), bc(), cd(), Dd(), di(), dn() (+34 more)

### Community 54 - "ai-insight-service.ts"
Cohesion: 0.10
Nodes (24): dynamic, GET(), revalidate, GET(), POST(), GET(), POST(), activeUserGenerations (+16 more)

### Community 55 - "Bi"
Cohesion: 0.10
Nodes (26): er(), Fn(), gr(), i0(), Ic(), ju(), l0(), ld() (+18 more)

### Community 56 - "pc"
Cohesion: 0.21
Nodes (21): _a(), bd(), dh(), dt(), fh(), gc(), gh(), hh() (+13 more)

### Community 57 - "r"
Cohesion: 0.12
Nodes (38): ar(), b0(), Bt(), Da(), dh(), dt(), ea(), ft() (+30 more)

### Community 58 - "st"
Cohesion: 0.13
Nodes (27): T0(), E0(), E0(), T0(), E0(), E0(), E0(), E0() (+19 more)

### Community 59 - "l"
Cohesion: 0.07
Nodes (62): At(), bi(), bo(), co(), cs(), Ct(), dd(), df() (+54 more)

### Community 60 - "r"
Cohesion: 0.13
Nodes (45): ai(), bu(), c0(), di(), fi(), Fr(), ft(), Gt() (+37 more)

### Community 61 - "l"
Cohesion: 0.07
Nodes (53): At(), Ba(), t(), bf(), bi(), ch(), co(), cs() (+45 more)

### Community 62 - "rf"
Cohesion: 0.16
Nodes (25): af(), ao(), fs(), Hr(), Kl(), lf(), ls(), ms() (+17 more)

### Community 63 - "uc"
Cohesion: 0.11
Nodes (30): er(), Fa(), Fn(), ft(), gr(), Ic(), ir(), Kn() (+22 more)

### Community 64 - "lf"
Cohesion: 0.29
Nodes (13): ao(), fs(), gi(), Gt(), lf(), ms(), os(), Rl() (+5 more)

### Community 65 - "n"
Cohesion: 0.19
Nodes (27): bh(), bu(), di(), Do(), eh(), fi(), gs(), h0() (+19 more)

### Community 66 - "Ta"
Cohesion: 0.06
Nodes (52): A0(), ai(), as(), bc(), Bd(), Bl(), bm(), Cl() (+44 more)

### Community 67 - "onboarding-flow.tsx"
Cohesion: 0.08
Nodes (21): saveFitnessOnboardingAction(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_left (+13 more)

### Community 68 - "uc"
Cohesion: 0.09
Nodes (43): _a(), dt(), er(), Fn(), gc(), gh(), gr(), hh() (+35 more)

### Community 69 - "ee"
Cohesion: 0.25
Nodes (15): c0(), cf(), ci(), Dl(), ee(), ef(), is(), jt() (+7 more)

### Community 70 - "i"
Cohesion: 0.10
Nodes (29): bm(), ea(), $f(), Fa(), G0(), Ga(), Gf(), If() (+21 more)

### Community 71 - "uf"
Cohesion: 0.07
Nodes (50): A0(), an(), as(), bc(), cd(), D(), Es(), Fr() (+42 more)

### Community 72 - "F"
Cohesion: 0.09
Nodes (4): F, I, k(), q

### Community 73 - "react"
Cohesion: 0.12
Nodes (25): AICharacter(), AICharacterProps, AIPlanAnimation(), AIPlanAnimationProps, DEFAULT_FALLBACK_PROFILE, PILL_CONFIGS, PillConfig, ProfileSummary (+17 more)

### Community 74 - "Ih"
Cohesion: 0.05
Nodes (72): Ih(), ad(), ah(), an(), ar(), as(), bc(), Bt() (+64 more)

### Community 75 - ".get"
Cohesion: 0.13
Nodes (14): Ct(), ef, gf, ir(), jf(), oe(), qc(), qu() (+6 more)

### Community 76 - "fitness-notifications.ts"
Cohesion: 0.22
Nodes (15): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), markAllNotificationsAsReadAction(), markNotificationAsReadAction() (+7 more)

### Community 77 - "nutrition-engine.ts"
Cohesion: 0.13
Nodes (25): ACTIVITY_MULTIPLIERS, calculateWaterTarget(), DEFAULT_ACTIVITY_MULTIPLIER, DEFAULT_GOAL_CONFIG, generateGuidance(), getCompatibleDietTypes(), GOAL_CONFIGS, isBannedFood() (+17 more)

### Community 78 - "vc"
Cohesion: 0.07
Nodes (26): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+18 more)

### Community 79 - "ve"
Cohesion: 0.09
Nodes (49): _0(), ao(), c0(), ci(), D0(), df(), Dl(), dn() (+41 more)

### Community 80 - "Wh"
Cohesion: 0.16
Nodes (24): $h(), hx(), C(), E(), bd(), D(), dh(), fh() (+16 more)

### Community 81 - "Ih"
Cohesion: 0.04
Nodes (78): Ih(), A0(), an(), bc(), bm(), cd(), cn(), co() (+70 more)

### Community 82 - "r"
Cohesion: 0.15
Nodes (27): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+19 more)

### Community 83 - "Ph"
Cohesion: 0.04
Nodes (82): Ph(), A0(), b0(), bh(), Bl(), bm(), Bt(), cf() (+74 more)

### Community 84 - "zn"
Cohesion: 0.31
Nodes (18): Da(), dt(), ea(), gc(), gh(), hh(), jd(), mh() (+10 more)

### Community 85 - "Ye"
Cohesion: 0.16
Nodes (29): aa(), Da(), dh(), dt(), ea(), gh(), hh(), jd() (+21 more)

### Community 86 - "grocery-view.tsx"
Cohesion: 0.24
Nodes (17): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), GroceryPage(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps (+9 more)

### Community 87 - "B"
Cohesion: 0.16
Nodes (27): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+19 more)

### Community 88 - "fitness-plan-profile.ts"
Cohesion: 0.13
Nodes (28): GenerateGroceryResponseSchema, POST(), AVAILABLE_FOOD_ALIASES, buildGoalCalorieTarget(), cleanText(), expectedMealCount(), FILLER_WORDS, hasForbiddenFood() (+20 more)

### Community 89 - "r"
Cohesion: 0.14
Nodes (46): S, af(), an(), b0(), bu(), di(), Do(), eh() (+38 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.13
Nodes (21): updateRemindersAction(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS, REMINDER_TYPES, ReminderTypeSheet() (+13 more)

### Community 91 - "c0"
Cohesion: 0.13
Nodes (25): _0(), c0(), cf(), ci(), Dl(), ee(), ef(), Fu() (+17 more)

### Community 92 - "uc"
Cohesion: 0.17
Nodes (17): as(), br(), cr(), Fn(), gr(), id(), ju(), Kn() (+9 more)

### Community 93 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 94 - "_0"
Cohesion: 0.15
Nodes (26): _0(), ai(), Cl(), cm(), D0(), dn(), Ei(), fe() (+18 more)

### Community 95 - "nn"
Cohesion: 0.13
Nodes (8): ar(), en(), ja(), ls(), nn(), ol(), ur(), vs()

### Community 96 - "rf"
Cohesion: 0.13
Nodes (29): af(), At(), ch(), cn(), fs(), gi(), Kl(), lf() (+21 more)

### Community 97 - "Wh"
Cohesion: 0.16
Nodes (24): $h(), hx(), C(), E(), bd(), D(), dh(), fh() (+16 more)

### Community 98 - "import-usda-foundation-foods.mjs"
Cohesion: 0.11
Nodes (17): buildRow(), DEFAULT_JSON_PATH, dryRun, findRecord(), IMPORT_MAP, missing, nutrient(), payload (+9 more)

### Community 99 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 100 - "D0"
Cohesion: 0.16
Nodes (23): D0(), da(), dn(), Ei(), fe(), ff(), Fl(), gd() (+15 more)

### Community 101 - "l"
Cohesion: 0.08
Nodes (51): ar(), Ba(), t(), bi(), bo(), ch(), Ct(), dd() (+43 more)

### Community 102 - "Ih"
Cohesion: 0.04
Nodes (72): Ih(), bf(), bh(), bm(), Bt(), Cl(), cm(), cn() (+64 more)

### Community 103 - "_0"
Cohesion: 0.16
Nodes (25): _0(), ai(), Cl(), cm(), D0(), dn(), Ei(), fe() (+17 more)

### Community 104 - "$h"
Cohesion: 0.15
Nodes (25): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+17 more)

### Community 105 - "uc"
Cohesion: 0.14
Nodes (23): br(), cr(), Fn(), ic(), id(), Il(), Jc(), ju() (+15 more)

### Community 106 - "ee"
Cohesion: 0.23
Nodes (16): c0(), cf(), ci(), Dl(), ee(), ef(), is(), jt() (+8 more)

### Community 107 - "D0"
Cohesion: 0.17
Nodes (24): ai(), Cl(), D0(), dn(), Ei(), fe(), ff(), Fl() (+16 more)

### Community 108 - "c0"
Cohesion: 0.13
Nodes (27): bs(), bs(), bs(), bs(), c0(), D0(), df(), Ei() (+19 more)

### Community 109 - "l"
Cohesion: 0.08
Nodes (61): ad(), bf(), bi(), ch(), cs(), Ct(), eo(), gd() (+53 more)

### Community 110 - "tt"
Cohesion: 0.20
Nodes (19): ui(), ui(), ui(), ui(), ui(), ui(), ui(), ui() (+11 more)

### Community 111 - "of"
Cohesion: 0.13
Nodes (30): _a(), af(), At(), ds(), fs(), G0(), io(), Kl() (+22 more)

### Community 112 - "Ye"
Cohesion: 0.11
Nodes (35): ar(), Bt(), Da(), dh(), dt(), ea(), fh(), ft() (+27 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "nutrition/types.ts"
Cohesion: 0.12
Nodes (20): getRetailUnit(), parseServingGrams(), calculateGroceryList(), getGrocerySummary(), optimizeBudget(), AssembledMeal, BudgetTier, DeterministicNutritionPlan (+12 more)

### Community 115 - "l"
Cohesion: 0.07
Nodes (65): a0(), ao(), ar(), bi(), bo(), co(), cs(), Ct() (+57 more)

### Community 116 - "ei"
Cohesion: 0.13
Nodes (21): bi(), bo(), co(), cs(), fo(), gi(), hs(), ja() (+13 more)

### Community 117 - "t0"
Cohesion: 0.12
Nodes (21): as(), cm(), Es(), ff(), fl(), Gc(), gr(), Hr() (+13 more)

### Community 118 - "bt"
Cohesion: 0.13
Nodes (25): At(), bo(), a(), Kl(), Ko(), ls(), ma(), mu() (+17 more)

### Community 119 - "af"
Cohesion: 0.24
Nodes (16): af(), fs(), hn(), io(), ll(), ms(), no(), _o() (+8 more)

### Community 120 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+9 more)

### Community 121 - "of"
Cohesion: 0.15
Nodes (21): ao(), ci(), ed(), ee(), ef(), is(), lo(), ls() (+13 more)

### Community 122 - "nu"
Cohesion: 0.14
Nodes (3): eu(), Mn, nu

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "rf"
Cohesion: 0.12
Nodes (33): _0(), At(), D0(), ds(), Ei(), fe(), ff(), gd() (+25 more)

### Community 125 - "yf"
Cohesion: 0.15
Nodes (9): bn, dc(), hc, kc(), lc, mf(), ro, vf() (+1 more)

### Community 126 - "Ye"
Cohesion: 0.11
Nodes (40): $h(), hx(), E(), M(), _a(), bd(), bh(), D() (+32 more)

### Community 127 - "ee"
Cohesion: 0.23
Nodes (14): ao(), ci(), ee(), ef(), is(), Jr(), lo(), od() (+6 more)

### Community 128 - "exercise-browser.tsx"
Cohesion: 0.16
Nodes (10): CustomExerciseForm(), ExerciseBrowser(), ExerciseBrowserContent(), exerciseCache, LibraryExercise, GENERATION_STEPS, PlanGeneration(), WorkoutHeader() (+2 more)

### Community 129 - "wf"
Cohesion: 0.22
Nodes (10): aa(), Ei(), hd(), ke(), Mi(), Qc(), wd(), wf() (+2 more)

### Community 130 - "fitness-dashboard.tsx"
Cohesion: 0.09
Nodes (22): DailyActivityCard(), DailyActivityCardProps, ExerciseLibraryCard(), FitnessDashboard(), FitnessDashboardProps, HorizontalCalendar(), HorizontalCalendarProps, ProNutritionGenerationCard() (+14 more)

### Community 131 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 132 - "rf"
Cohesion: 0.15
Nodes (26): af(), ao(), At(), fs(), gi(), Kl(), lf(), ls() (+18 more)

### Community 133 - "C"
Cohesion: 0.13
Nodes (9): b0(), bf(), dc(), gu(), Kr(), Pu(), tc(), Ut() (+1 more)

### Community 134 - "l"
Cohesion: 0.08
Nodes (60): ar(), bi(), bo(), ch(), co(), cs(), Ct(), dd() (+52 more)

### Community 135 - "af"
Cohesion: 0.26
Nodes (15): af(), fs(), hn(), io(), ll(), ms(), _o(), os() (+7 more)

### Community 136 - "r"
Cohesion: 0.16
Nodes (38): ai(), b0(), bu(), di(), Do(), eh(), fi(), gs() (+30 more)

### Community 137 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+8 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 139 - "dashboard-header.tsx"
Cohesion: 0.20
Nodes (11): getUnreadNotificationsCountAction(), DashboardHeader(), fetchUnreadCount(), DashboardHeaderProps, FitnessTheme, FitnessThemeContext, FitnessThemeContextType, FitnessThemeProvider() (+3 more)

### Community 140 - "nutrition-view.tsx"
Cohesion: 0.08
Nodes (33): FoodAvatar(), FoodAvatarProps, Food, FOOD_CATEGORIES, formatMealType(), LogFoodModal(), LogFoodModalProps, parsePlannedItems() (+25 more)

### Community 141 - "Wh"
Cohesion: 0.29
Nodes (13): $h(), D(), hu(), X(), r(), Wh(), ct(), el() (+5 more)

### Community 142 - "(fitness)/support/page.tsx"
Cohesion: 0.23
Nodes (10): getUserSupportMessages(), submitSupportMessage(), dynamic, FitnessSupportPage(), revalidate, SUPPORT_CATEGORIES, SupportClient(), SupportClientProps (+2 more)

### Community 143 - "Key Architectural Patterns"
Cohesion: 0.22
Nodes (8): 1. Parallel Batching vs. Sequential Waterfalls, 2. In-Memory Calendar & Status Math, 3. Immediate Suspense Streaming, 4. Router Caching & Optimistic Tab Transitions, 5. Theme Architecture (Dark & White), Architectural Overview, Architecture & Data Flow — GrindLog, Key Architectural Patterns

### Community 144 - "Technology Stack — GrindLog"
Cohesion: 0.22
Nodes (8): AI & LLM Integrations, Core Runtime & Framework, Data Layer & State, Mobile & PWA, Payments & Subscriptions, Styling & Design System, Technology Stack — GrindLog, Utilities & Validation

### Community 145 - "Critical Test Flows"
Cohesion: 0.22
Nodes (8): 1. Tab Navigation & Instant Switching, 2. Dual-Theme Verification (Dark vs. White), 3. Workout Logging & State Persistence, 4. Nutrition & Calorie Tracking, 5. Authentication & Subscription Guard Rails, Critical Test Flows, Testing & Verification Guide — GrindLog, Verification Commands

### Community 146 - "plan-setup/page.tsx"
Cohesion: 0.24
Nodes (12): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+4 more)

### Community 147 - "dx"
Cohesion: 0.06
Nodes (67): am(), ap(), ax(), Bn, cx(), de(), Dn(), dx() (+59 more)

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
Cohesion: 0.31
Nodes (13): c0(), cf(), ci(), ee(), ef(), is(), lo(), ml() (+5 more)

### Community 153 - "We"
Cohesion: 0.15
Nodes (19): A0(), an(), bc(), cd(), Es(), K0(), Kf(), Ko() (+11 more)

### Community 155 - "i"
Cohesion: 0.23
Nodes (14): bi(), bo(), fo(), go(), hs(), jo(), ld(), i() (+6 more)

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 158 - "ur"
Cohesion: 0.23
Nodes (12): bu(), er(), ft(), Kn(), la(), lr(), Pc(), tr() (+4 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 164 - "createServerSupabase"
Cohesion: 0.03
Nodes (80): exportUserData(), exportWorkoutHistoryCSV(), dynamic, POST(), POST(), POST(), deleteR2File(), deleteScanPhotosFromR2() (+72 more)

### Community 168 - "[workoutId]/page.tsx"
Cohesion: 0.24
Nodes (3): ActiveWorkoutContent(), dynamic, WorkoutSkeleton()

### Community 169 - "workout-heatmap.tsx"
Cohesion: 0.24
Nodes (9): CellData, DAY_LABELS, formatDate(), getIntensityClass(), HeatmapCell, HeatmapProps, INTENSITY_COLORS, MONTH_LABELS (+1 more)

### Community 170 - "app/layout.tsx"
Cohesion: 0.28
Nodes (6): metadata, RootLayout(), viewport, Providers(), InstallModal(), app_styles_globals

### Community 175 - "bf"
Cohesion: 0.25
Nodes (8): b0(), bf(), dc(), gu(), Kr(), Pu(), tc(), Ut()

### Community 176 - "supabase/middleware.ts"
Cohesion: 0.38
Nodes (5): config, updateSession(), config, middleware(), @supabase/ssr

### Community 177 - "gsap-C8IefbVz.js"
Cohesion: 0.38
Nodes (4): e(), Ml(), Ol(), tr()

### Community 178 - "nutrition/page.tsx"
Cohesion: 0.40
Nodes (3): NutritionLoading(), dynamic, NutritionContent()

### Community 179 - "ai-insight-card.tsx"
Cohesion: 0.40
Nodes (3): PlanAdjustment, ProgressReview, WeeklyWorkoutStats

### Community 180 - "admin-login/page.tsx"
Cohesion: 0.70
Nodes (3): loginAdminAction(), AdminLogin(), handleSubmit()

### Community 181 - "log-measurements/page.tsx"
Cohesion: 0.40
Nodes (3): FIELD_CONFIGS, FieldConfig, LogMeasurementsPage()

## Knowledge Gaps
- **530 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+525 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 879 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `Ph`, `index-Buds9Sm1.js`, `Ph`, `index-DtLkR01C.js`, `index-B23vSfwu.js`, `Ih`, `uc`, `of`, `uc`, `il`, `r`, `.add`, `Ai`, `ff`, `le`, `Ot`, `_c`, `pr`, `uc`, `fu`, `et`, `Bi`, `pc`, `r`, `st`, `uc`, `Ta`, `uc`, `uf`, `.get`, `vc`, `ve`, `zn`, `uc`, `_0`, `nn`, `l`, `Ih`, `uc`, `c0`, `l`, `tt`, `ei`, `bt`, `nu`, `rf`, `yf`, `ee`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `Ph`, `index-B23vSfwu.js`, `Ih`, `uc`, `dx`, `il`, `r`, `bf`, `fu`, `et`, `Bi`, `st`, `l`, `lf`, `vc`, `B`, `c0`, `D0`, `c0`, `tt`, `rf`, `Ye`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `l`, `Ph`, `index-B23vSfwu.js`, `Ih`, `il`, `We`, `r`, `_c`, `pr`, `lf`, `fu`, `et`, `Bi`, `st`, `uc`, `i`, `vc`, `B`, `_0`, `Wh`, `ee`, `c0`, `tt`, `rf`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._