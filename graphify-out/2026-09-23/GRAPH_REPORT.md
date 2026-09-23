# Graph Report - web  (2026-09-23)

## Corpus Check
- 420 files · ~3,440,408 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6436 nodes · 22759 edges · 174 communities (162 shown, 12 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `11e2e579`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- af
- _
- fitness-notifications.ts
- index-Cq6kntJJ.js
- dx
- dx
- Ph
- index-B23vSfwu.js
- index-Buds9Sm1.js
- Ph
- uc
- B
- progress-view.tsx
- r
- dx
- pc
- Ih
- r
- analyze/route.ts
- log-food-modal.tsx
- createAdminClient
- lf
- import-usda-foundation-foods.mjs
- uf
- il
- l
- r
- l
- test_phase35_regression.mjs
- fu
- uc
- of
- Ot
- sf
- Ye
- zf
- uc
- $h
- index-DtLkR01C.js
- Ph
- l
- zn
- (fitness)/page.tsx
- et
- fitness-ai/generate-plan/route.ts
- $h
- l
- Ct
- dependencies
- uc
- nutrition-engine.ts
- lf
- AIPlanAnimation.tsx
- Ph
- onboarding-flow.tsx
- pr
- dx
- Ye
- springs.ts
- constants.ts
- c0
- dx
- rf
- Ih
- fitness-reminders/route.ts
- r
- sf
- yf
- Ye
- l
- Ye
- _0
- F
- _0
- access.ts
- ef
- rf
- rf
- vc
- on
- nutrition/types.ts
- of
- kf
- ee
- rf
- r
- grocery-view.tsx
- Ye
- rf
- Ft
- reminders-client.tsx
- c0
- users-table-client.tsx
- sf
- Ih
- l
- Ai
- tt
- wf
- Ta
- rf
- r
- app/package.json
- bt
- yf
- pl
- _0
- bf
- Ih
- n
- y0
- _0
- af
- compilerOptions
- _0
- r
- test_nutrition_engine.mjs
- st
- _0
- next
- l
- use-auth.ts
- .get
- manifest.json
- nn
- r
- coach/page.tsx
- af
- .add
- plan-setup/page.tsx
- l
- Wh
- wf
- Os
- c0
- devDependencies
- r
- scripts
- grocery-tab.tsx
- D0
- ue
- ee
- Ih
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- Wh
- ai-insight-card.tsx
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- one-rm.ts
- ff
- progression.ts
- admin-login/page.tsx
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- l
- coach.ts
- package.json
- firebase-messaging-sw.js
- Data import scripts
- nutrition-service.ts
- rules/graphify.md
- workflows/graphify.md
- le
- next-env.d.ts
- createServerSupabase
- ve

## God Nodes (most connected - your core abstractions)
1. `Ph()` - 359 edges
2. `Ph()` - 358 edges
3. `Ph()` - 358 edges
4. `Ih()` - 357 edges
5. `Ih()` - 357 edges
6. `Ih()` - 356 edges
7. `Ih()` - 354 edges
8. `Ph()` - 354 edges
9. `Ih()` - 354 edges
10. `_` - 351 edges

## Surprising Connections (you probably didn't know these)
- `3. Workout Logging & State Persistence` --references--> `WorkoutHeader()`  [INFERRED]
  .planning/codebase/TESTING.md → app/components/fitness/workout/workout-header.tsx
- `Recent Decisions` --references--> `FitnessLayout()`  [INFERRED]
  .planning/STATE.md → app/app/(fitness)/layout.tsx
- `Recent Decisions` --references--> `FitnessShell()`  [INFERRED]
  .planning/STATE.md → app/components/fitness/fitness-shell.tsx
- `Naming & File Conventions` --references--> `WorkoutSummaryCard()`  [INFERRED]
  .planning/codebase/STRUCTURE.md → app/components/fitness/workout/workout-summary-card.tsx
- `1. Performance Standards (Mobile 60fps Target)` --references--> `BottomNav()`  [INFERRED]
  .planning/codebase/CONVENTIONS.md → app/components/fitness/dashboard/bottom-nav.tsx

## Import Cycles
- None detected.

## Communities (174 total, 12 thin omitted)

### Community 0 - "af"
Cohesion: 0.24
Nodes (16): af(), fs(), io(), ll(), ms(), no(), _o(), os() (+8 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (125): _, aa, ac(), al(), ao(), As, at, Be() (+117 more)

### Community 2 - "fitness-notifications.ts"
Cohesion: 0.12
Nodes (23): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), getUnreadNotificationsCountAction(), markAllNotificationsAsReadAction() (+15 more)

### Community 3 - "index-Cq6kntJJ.js"
Cohesion: 0.09
Nodes (58): am(), ap(), ax(), Ba(), Bx, cx(), de(), Dn() (+50 more)

### Community 4 - "dx"
Cohesion: 0.09
Nodes (46): ap(), ax(), Bn, de(), Dn(), dx(), El(), ep() (+38 more)

### Community 5 - "dx"
Cohesion: 0.07
Nodes (62): am(), ap(), ax(), Bn, cx(), de(), Dn(), dx() (+54 more)

### Community 6 - "Ph"
Cohesion: 0.04
Nodes (82): Ph(), Bd(), bh(), Bl(), bm(), br(), cd(), cf() (+74 more)

### Community 7 - "index-B23vSfwu.js"
Cohesion: 0.06
Nodes (82): e(), app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, tr(), $, A, b, c() (+74 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.06
Nodes (64): $, A, b, c(), D, e(), f, g (+56 more)

### Community 9 - "Ph"
Cohesion: 0.04
Nodes (81): Ph(), bc(), Bd(), bh(), Bl(), bm(), cd(), cf() (+73 more)

### Community 10 - "uc"
Cohesion: 0.17
Nodes (16): as(), br(), cr(), Fn(), gr(), id(), ju(), Kn() (+8 more)

### Community 11 - "B"
Cohesion: 0.16
Nodes (21): Da(), dt(), ea(), gc(), gh(), hh(), jd(), mh() (+13 more)

### Community 12 - "progress-view.tsx"
Cohesion: 0.04
Nodes (71): GET(), POST(), GET(), GET(), MEASUREMENT_LIMITS, POST(), GET(), POST() (+63 more)

### Community 13 - "r"
Cohesion: 0.15
Nodes (28): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+20 more)

### Community 14 - "dx"
Cohesion: 0.08
Nodes (47): ap(), ax(), Bn, de(), Dn(), dx(), El(), ep() (+39 more)

### Community 15 - "pc"
Cohesion: 0.11
Nodes (35): _a(), ad(), Bt(), dt(), gc(), gh(), hh(), jd() (+27 more)

### Community 16 - "Ih"
Cohesion: 0.05
Nodes (78): Ih(), ah(), an(), bc(), bm(), cd(), Cl(), D() (+70 more)

### Community 17 - "r"
Cohesion: 0.16
Nodes (39): bu(), di(), Do(), fi(), Fr(), gs(), Gt(), hd() (+31 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.05
Nodes (53): POST(), maxDuration, POST(), stableStringify(), stripImagePayload(), AIStartingReportPage(), displayValue(), dynamic (+45 more)

### Community 19 - "log-food-modal.tsx"
Cohesion: 0.16
Nodes (15): FoodAvatar(), FoodAvatarProps, Food, FOOD_CATEGORIES, formatMealType(), LogFoodModal(), LogFoodModalProps, parsePlannedItems() (+7 more)

### Community 20 - "createAdminClient"
Cohesion: 0.04
Nodes (81): createCouponAction(), toggleCouponStatusAction(), getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), acceptFreePreviewAction() (+73 more)

### Community 21 - "lf"
Cohesion: 0.31
Nodes (13): ao(), fs(), gi(), lf(), ms(), no(), os(), Rl() (+5 more)

### Community 22 - "import-usda-foundation-foods.mjs"
Cohesion: 0.09
Nodes (22): ALLERGEN_MAP, content, filePath, lines, newLines, buildRow(), DEFAULT_JSON_PATH, dryRun (+14 more)

### Community 23 - "uf"
Cohesion: 0.07
Nodes (44): bc(), cd(), Cl(), cm(), D(), Fr(), go(), hc() (+36 more)

### Community 24 - "il"
Cohesion: 0.06
Nodes (20): bo(), n(), Co(), a(), Fi(), Fn(), hu(), il (+12 more)

### Community 25 - "l"
Cohesion: 0.06
Nodes (73): ar(), bi(), bo(), ch(), co(), cs(), Ct(), dd() (+65 more)

### Community 26 - "r"
Cohesion: 0.13
Nodes (44): af(), ai(), b0(), bh(), bu(), di(), Do(), eh() (+36 more)

### Community 27 - "l"
Cohesion: 0.08
Nodes (53): At(), Ba(), t(), bf(), bi(), ch(), Ct(), eo() (+45 more)

### Community 28 - "test_phase35_regression.mjs"
Cohesion: 0.11
Nodes (17): MEAL_STRUCTURES, parseBudget(), rankFoodsByProteinEfficiency(), FitnessGoal, buildNutritionUserContext(), calculateDailyBudget(), generateContextFingerprint(), NormalizedDiet (+9 more)

### Community 29 - "fu"
Cohesion: 0.07
Nodes (39): bm(), Dl(), ds(), ea(), $f(), Fa(), G0(), Ga() (+31 more)

### Community 30 - "uc"
Cohesion: 0.10
Nodes (31): a0(), er(), Fn(), ft(), gr(), i0(), Ic(), ir() (+23 more)

### Community 31 - "of"
Cohesion: 0.12
Nodes (52): ad(), an(), bo(), bu(), di(), ed(), eh(), fi() (+44 more)

### Community 32 - "Ot"
Cohesion: 0.06
Nodes (108): ap(), Bn, cm(), ep(), Fx(), ip(), ix(), Jx() (+100 more)

### Community 33 - "sf"
Cohesion: 0.18
Nodes (12): Bt(), ke(), la(), Ln(), md(), Mi(), sf(), ue() (+4 more)

### Community 34 - "Ye"
Cohesion: 0.11
Nodes (36): aa(), ar(), Bt(), Da(), dh(), dt(), ea(), ft() (+28 more)

### Community 35 - "zf"
Cohesion: 0.38
Nodes (7): mn(), Na(), Pa(), qs(), vs(), xn(), zf()

### Community 36 - "uc"
Cohesion: 0.10
Nodes (31): er(), Fa(), Fn(), ft(), gr(), i0(), Ic(), ir() (+23 more)

### Community 37 - "$h"
Cohesion: 0.16
Nodes (23): $h(), ct(), el(), ot(), r(), Re(), y(), zt() (+15 more)

### Community 38 - "index-DtLkR01C.js"
Cohesion: 0.04
Nodes (133): $, A, b, c(), D, e(), f, g (+125 more)

### Community 39 - "Ph"
Cohesion: 0.06
Nodes (52): Ph(), as(), bf(), bh(), Cn(), dc(), er(), Fn() (+44 more)

### Community 40 - "l"
Cohesion: 0.09
Nodes (47): a0(), ar(), bi(), bo(), co(), cs(), Ct(), dd() (+39 more)

### Community 41 - "zn"
Cohesion: 0.16
Nodes (26): _a(), ar(), Bt(), dt(), gc(), gh(), hh(), jd() (+18 more)

### Community 42 - "(fitness)/page.tsx"
Cohesion: 0.04
Nodes (47): DashboardBelow(), dynamic, revalidate, dynamic, WorkoutContent(), ActiveWorkoutContent(), dynamic, FitnessChatbot() (+39 more)

### Community 43 - "et"
Cohesion: 0.08
Nodes (13): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), rr(), rr() (+5 more)

### Community 44 - "fitness-ai/generate-plan/route.ts"
Cohesion: 0.04
Nodes (136): approveFitnessPlanAdjustmentAction(), dynamic, GET(), POST(), revalidate, POST(), maxDuration, POST() (+128 more)

### Community 45 - "$h"
Cohesion: 0.15
Nodes (25): $h(), ct(), el(), g(), m(), r(), Re(), zt() (+17 more)

### Community 46 - "l"
Cohesion: 0.14
Nodes (51): ad(), an(), bo(), di(), eh(), fi(), gd(), l() (+43 more)

### Community 47 - "Ct"
Cohesion: 0.16
Nodes (17): ai(), cm(), Ct(), ff(), fl(), Gc(), hf(), Hr() (+9 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "uc"
Cohesion: 0.11
Nodes (28): er(), Fa(), Fn(), ft(), gr(), ir(), ju(), Kn() (+20 more)

### Community 50 - "nutrition-engine.ts"
Cohesion: 0.14
Nodes (23): ACTIVITY_MULTIPLIERS, calculateWaterTarget(), DEFAULT_ACTIVITY_MULTIPLIER, DEFAULT_GOAL_CONFIG, generateGuidance(), getCompatibleDietTypes(), GOAL_CONFIGS, isBannedFood() (+15 more)

### Community 51 - "lf"
Cohesion: 0.33
Nodes (12): ao(), fs(), gi(), lf(), ms(), os(), Rl(), rs() (+4 more)

### Community 52 - "AIPlanAnimation.tsx"
Cohesion: 0.13
Nodes (24): AICharacter(), AICharacterProps, AIPlanAnimation(), AIPlanAnimationProps, DEFAULT_FALLBACK_PROFILE, PILL_CONFIGS, PillConfig, ProfileSummary (+16 more)

### Community 53 - "Ph"
Cohesion: 0.04
Nodes (89): Ph(), A0(), as(), b0(), bh(), br(), Bt(), cf() (+81 more)

### Community 54 - "onboarding-flow.tsx"
Cohesion: 0.07
Nodes (24): saveFitnessOnboardingAction(), dynamic, OnboardingPage(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female (+16 more)

### Community 55 - "pr"
Cohesion: 0.06
Nodes (16): Ae(), br(), cr, _f(), Hn(), lr(), lu(), _n (+8 more)

### Community 56 - "dx"
Cohesion: 0.08
Nodes (38): am(), cx(), de(), Dn(), dx(), El(), Ex(), $h() (+30 more)

### Community 57 - "Ye"
Cohesion: 0.16
Nodes (28): ar(), Da(), dh(), dt(), ea(), fh(), ft(), gh() (+20 more)

### Community 58 - "springs.ts"
Cohesion: 0.20
Nodes (8): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem

### Community 59 - "constants.ts"
Cohesion: 0.12
Nodes (26): AUTHENTIC_INDIAN_RECIPES, AuthenticMealRecipe, BANNED_FOOD_PATTERNS, CATEGORY_RETAIL_UNITS, CORE_MEAL_TYPES, DAILY_FOOD_CAPS, DEFAULT_MEAL_STRUCTURE, FoodServingLimit (+18 more)

### Community 60 - "c0"
Cohesion: 0.28
Nodes (16): c0(), D0(), df(), Ei(), fe(), Gn(), Lu(), nt() (+8 more)

### Community 61 - "dx"
Cohesion: 0.09
Nodes (34): Ml(), Ol(), am(), de(), Dn(), dx(), El(), Ex() (+26 more)

### Community 62 - "rf"
Cohesion: 0.09
Nodes (45): as(), c0(), cf(), ci(), ee(), ef(), hc(), hd() (+37 more)

### Community 63 - "Ih"
Cohesion: 0.04
Nodes (75): Ih(), ad(), ah(), an(), as(), b0(), bf(), bm() (+67 more)

### Community 64 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 65 - "r"
Cohesion: 0.18
Nodes (33): ai(), b0(), bu(), di(), Do(), eh(), fi(), ft() (+25 more)

### Community 66 - "sf"
Cohesion: 0.11
Nodes (25): b0(), bf(), Ct(), dc(), dd(), gu(), Ii(), Jl() (+17 more)

### Community 67 - "yf"
Cohesion: 0.21
Nodes (15): fh(), hf(), hn(), I(), Il(), jc(), jf(), Kt() (+7 more)

### Community 68 - "Ye"
Cohesion: 0.18
Nodes (24): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+16 more)

### Community 69 - "l"
Cohesion: 0.11
Nodes (36): At(), bi(), bo(), co(), cs(), Ct(), eo(), fo() (+28 more)

### Community 70 - "Ye"
Cohesion: 0.09
Nodes (42): hx(), E(), M(), _a(), ad(), bd(), Bt(), dh() (+34 more)

### Community 71 - "_0"
Cohesion: 0.24
Nodes (18): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+10 more)

### Community 72 - "F"
Cohesion: 0.09
Nodes (4): F, I, k(), q

### Community 73 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), Gl() (+9 more)

### Community 74 - "access.ts"
Cohesion: 0.06
Nodes (38): POST(), FitnessProPage(), metadata, ExerciseLibraryCard(), FitnessDashboardProps, HorizontalCalendar(), HorizontalCalendarProps, ProNutritionGenerationCard() (+30 more)

### Community 75 - "ef"
Cohesion: 0.20
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "rf"
Cohesion: 0.12
Nodes (31): af(), ao(), At(), ch(), cn(), fs(), gi(), Kl() (+23 more)

### Community 77 - "rf"
Cohesion: 0.15
Nodes (25): af(), ao(), At(), fs(), gd(), Hr(), Kl(), lf() (+17 more)

### Community 78 - "vc"
Cohesion: 0.07
Nodes (26): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+18 more)

### Community 79 - "on"
Cohesion: 0.12
Nodes (21): A0(), ai(), b0(), Cl(), cm(), co(), cs(), Es() (+13 more)

### Community 80 - "nutrition/types.ts"
Cohesion: 0.12
Nodes (19): getRetailUnit(), parseServingGrams(), calculateGroceryList(), getGrocerySummary(), optimizeBudget(), AssembledMeal, DeterministicNutritionPlan, DietType (+11 more)

### Community 81 - "of"
Cohesion: 0.08
Nodes (49): _0(), ao(), bc(), Bl(), cd(), ci(), Dd(), dn() (+41 more)

### Community 82 - "kf"
Cohesion: 0.11
Nodes (26): Dl(), ds(), ed(), G0(), If(), Jn(), Jr(), jt() (+18 more)

### Community 83 - "ee"
Cohesion: 0.23
Nodes (16): c0(), cf(), ci(), ee(), ef(), Fu(), is(), lo() (+8 more)

### Community 84 - "rf"
Cohesion: 0.13
Nodes (29): af(), ao(), ch(), cn(), fs(), gd(), Hr(), Kl() (+21 more)

### Community 85 - "r"
Cohesion: 0.10
Nodes (45): aa(), ar(), bu(), Da(), dh(), dt(), ea(), ft() (+37 more)

### Community 86 - "grocery-view.tsx"
Cohesion: 0.27
Nodes (15): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps, getScaledPrice() (+7 more)

### Community 87 - "Ye"
Cohesion: 0.28
Nodes (17): _a(), bd(), bh(), dt(), gc(), gh(), hh(), jd() (+9 more)

### Community 88 - "rf"
Cohesion: 0.08
Nodes (49): At(), c0(), cf(), ci(), dn(), ds(), ee(), ef() (+41 more)

### Community 89 - "Ft"
Cohesion: 0.12
Nodes (34): ao(), bc(), c0(), ci(), D(), Dd(), dn(), ee() (+26 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.13
Nodes (21): updateRemindersAction(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS, REMINDER_TYPES, ReminderTypeSheet() (+13 more)

### Community 91 - "c0"
Cohesion: 0.23
Nodes (16): ao(), c0(), ci(), ee(), ef(), Fu(), ha(), is() (+8 more)

### Community 92 - "users-table-client.tsx"
Cohesion: 0.18
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 93 - "sf"
Cohesion: 0.12
Nodes (19): aa(), ad(), Bt(), ke(), lh(), Ln(), md(), Mi() (+11 more)

### Community 94 - "Ih"
Cohesion: 0.04
Nodes (81): rh(), Ih(), A0(), an(), as(), bc(), bh(), cd() (+73 more)

### Community 95 - "l"
Cohesion: 0.08
Nodes (60): ar(), bi(), bo(), ch(), co(), cs(), Ct(), dd() (+52 more)

### Community 96 - "Ai"
Cohesion: 0.13
Nodes (23): ai(), bc(), c0(), cd(), Cl(), D(), Hl(), hu() (+15 more)

### Community 97 - "tt"
Cohesion: 0.11
Nodes (40): ui(), ui(), ui(), ui(), At(), bi(), co(), cs() (+32 more)

### Community 98 - "wf"
Cohesion: 0.15
Nodes (16): aa(), Bt(), hd(), ke(), Ln(), Mi(), nd(), sc() (+8 more)

### Community 99 - "Ta"
Cohesion: 0.05
Nodes (60): r0(), A0(), bc(), bm(), cd(), Cl(), cm(), ed() (+52 more)

### Community 100 - "rf"
Cohesion: 0.15
Nodes (26): af(), ao(), At(), fs(), gi(), Kl(), lf(), ls() (+18 more)

### Community 101 - "r"
Cohesion: 0.13
Nodes (45): S, ot(), af(), ai(), an(), b0(), bu(), di() (+37 more)

### Community 102 - "app/package.json"
Cohesion: 0.05
Nodes (40): config, updateSession(), config, middleware(), config, filteredRuntimeCaching, nextConfig, framer-motion (+32 more)

### Community 103 - "bt"
Cohesion: 0.08
Nodes (47): c0(), cf(), ci(), da(), ee(), ef(), Fr(), Fu() (+39 more)

### Community 104 - "yf"
Cohesion: 0.15
Nodes (10): df(), hc, hf(), kc(), lc, mf(), pf(), ro (+2 more)

### Community 105 - "pl"
Cohesion: 0.22
Nodes (5): pl, qi, qn(), sn(), yu()

### Community 106 - "_0"
Cohesion: 0.18
Nodes (22): _0(), D0(), df(), fe(), ff(), Gl(), Gn(), Le() (+14 more)

### Community 107 - "bf"
Cohesion: 0.14
Nodes (20): bf(), bm(), ch(), dc(), eo(), gf(), gu(), hn() (+12 more)

### Community 108 - "Ih"
Cohesion: 0.04
Nodes (90): Ih(), A0(), ad(), an(), bc(), bm(), cd(), Cl() (+82 more)

### Community 109 - "n"
Cohesion: 0.17
Nodes (39): ot(), ad(), an(), bo(), bu(), di(), eh(), fi() (+31 more)

### Community 110 - "y0"
Cohesion: 0.08
Nodes (33): bf(), bm(), dc(), Dl(), ds(), ea(), $f(), G0() (+25 more)

### Community 111 - "_0"
Cohesion: 0.23
Nodes (19): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), Gl() (+11 more)

### Community 112 - "af"
Cohesion: 0.13
Nodes (26): _a(), af(), ds(), fs(), G0(), go(), gs(), io() (+18 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "_0"
Cohesion: 0.24
Nodes (18): _0(), D0(), Ei(), fe(), ff(), gd(), Gl(), Gn() (+10 more)

### Community 115 - "r"
Cohesion: 0.18
Nodes (36): ai(), bu(), di(), fi(), Fr(), gs(), Gt(), Hl() (+28 more)

### Community 116 - "test_nutrition_engine.mjs"
Cohesion: 0.17
Nodes (4): NutritionValidationEngine, TEST_PROFILES, ref_node_assert, ref_node_crypto

### Community 117 - "st"
Cohesion: 0.10
Nodes (33): T0(), E0(), bo(), E0(), on(), qo(), T0(), E0() (+25 more)

### Community 118 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+8 more)

### Community 119 - "next"
Cohesion: 0.02
Nodes (163): completeExerciseSetsAction(), completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), reopenWorkoutAction(), resetWorkoutTimerAction() (+155 more)

### Community 120 - "l"
Cohesion: 0.09
Nodes (46): At(), Ba(), t(), bf(), bi(), ch(), Ct(), eo() (+38 more)

### Community 121 - "use-auth.ts"
Cohesion: 0.07
Nodes (32): dynamic, GET(), ForgotPasswordPage(), SignInContent(), SignUpContent(), fetchProfileDeduped(), inFlightProfiles, setupAuthListener() (+24 more)

### Community 122 - ".get"
Cohesion: 0.08
Nodes (18): eu(), gf, Gn, Gu(), ic(), jf(), nu, _o() (+10 more)

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "nn"
Cohesion: 0.08
Nodes (12): ar(), en(), ja(), ls(), nn(), Oi(), ol(), ru (+4 more)

### Community 125 - "r"
Cohesion: 0.16
Nodes (20): as(), ge(), gr(), ht(), Kl(), ls(), ma(), O0() (+12 more)

### Community 126 - "coach/page.tsx"
Cohesion: 0.13
Nodes (13): CoachPage(), metadata, CoachChat(), CoachHeader(), CoachInput(), CoachInputProps, CoachLoading(), CoachMessage() (+5 more)

### Community 127 - "af"
Cohesion: 0.24
Nodes (16): af(), fs(), hn(), io(), ll(), ms(), no(), _o() (+8 more)

### Community 128 - ".add"
Cohesion: 0.10
Nodes (9): af, Cn(), kl(), _l(), me(), Mn, oc(), ti() (+1 more)

### Community 129 - "plan-setup/page.tsx"
Cohesion: 0.27
Nodes (11): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+3 more)

### Community 130 - "l"
Cohesion: 0.07
Nodes (69): ar(), Ba(), t(), bi(), ch(), co(), cs(), Ct() (+61 more)

### Community 131 - "Wh"
Cohesion: 0.15
Nodes (24): am(), $h(), hx(), C(), E(), bd(), D(), dh() (+16 more)

### Community 132 - "wf"
Cohesion: 0.07
Nodes (46): A0(), ai(), b0(), Cl(), cm(), co(), cs(), dn() (+38 more)

### Community 133 - "Os"
Cohesion: 0.22
Nodes (9): bs(), bs(), bs(), bs(), bs(), bs(), bs(), bs() (+1 more)

### Community 134 - "c0"
Cohesion: 0.12
Nodes (20): as(), c0(), da(), ds(), Fu(), go(), ht(), Ia() (+12 more)

### Community 135 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 136 - "r"
Cohesion: 0.16
Nodes (35): ai(), b0(), bu(), di(), Do(), eh(), fi(), ft() (+27 more)

### Community 137 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, import:usda, lint, start, type-check

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 139 - "D0"
Cohesion: 0.16
Nodes (24): D0(), da(), dn(), Ei(), fe(), ff(), Fl(), gd() (+16 more)

### Community 140 - "ue"
Cohesion: 0.16
Nodes (15): ad(), ar(), Bt(), ke(), la(), Ln(), mu(), nr() (+7 more)

### Community 141 - "ee"
Cohesion: 0.17
Nodes (20): _0(), cf(), ci(), ee(), ef(), Fu(), hc(), hi() (+12 more)

### Community 142 - "Ih"
Cohesion: 0.05
Nodes (60): Ih(), A0(), an(), as(), bf(), bh(), cn(), da() (+52 more)

### Community 143 - "Key Architectural Patterns"
Cohesion: 0.22
Nodes (8): 1. Parallel Batching vs. Sequential Waterfalls, 2. In-Memory Calendar & Status Math, 3. Immediate Suspense Streaming, 4. Router Caching & Optimistic Tab Transitions, 5. Theme Architecture (Dark & White), Architectural Overview, Architecture & Data Flow — GrindLog, Key Architectural Patterns

### Community 144 - "Technology Stack — GrindLog"
Cohesion: 0.22
Nodes (8): AI & LLM Integrations, Core Runtime & Framework, Data Layer & State, Mobile & PWA, Payments & Subscriptions, Styling & Design System, Technology Stack — GrindLog, Utilities & Validation

### Community 145 - "Critical Test Flows"
Cohesion: 0.22
Nodes (8): 1. Tab Navigation & Instant Switching, 2. Dual-Theme Verification (Dark vs. White), 3. Workout Logging & State Persistence, 4. Nutrition & Calorie Tracking, 5. Authentication & Subscription Guard Rails, Critical Test Flows, Testing & Verification Guide — GrindLog, Verification Commands

### Community 146 - "Wh"
Cohesion: 0.16
Nodes (24): am(), $h(), hx(), C(), E(), bd(), D(), dh() (+16 more)

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

### Community 152 - "one-rm.ts"
Cohesion: 0.36
Nodes (5): bestEstimated1RM(), epley1RM(), estimated1RM(), format1RM(), ONE_RM_REP_CAP

### Community 155 - "admin-login/page.tsx"
Cohesion: 0.70
Nodes (3): loginAdminAction(), AdminLogin(), handleSubmit()

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 158 - "l"
Cohesion: 0.08
Nodes (52): At(), bi(), bo(), co(), cs(), df(), eo(), fo() (+44 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 164 - "nutrition-service.ts"
Cohesion: 0.04
Nodes (68): GET(), POST(), DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES, dynamic, GET() (+60 more)

### Community 170 - "le"
Cohesion: 0.11
Nodes (36): bf(), ch(), dc(), dd(), df(), Fu(), gu(), hf() (+28 more)

### Community 175 - "createServerSupabase"
Cohesion: 0.03
Nodes (80): exportUserData(), exportWorkoutHistoryCSV(), quickCompleteWorkoutAction(), getUserSupportMessages(), submitSupportMessage(), dynamic, POST(), POST() (+72 more)

### Community 177 - "ve"
Cohesion: 0.13
Nodes (35): _0(), cf(), ci(), D0(), Dl(), dn(), ee(), ef() (+27 more)

## Knowledge Gaps
- **557 isolated node(s):** `metadata`, `MAIN_PAGES`, `LibraryExercise`, `ActiveWorkoutResumeCardProps`, `AiCoachNoteProps` (+552 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 923 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `.add`, `af`, `l`, `index-Cq6kntJJ.js`, `Os`, `Ph`, `index-B23vSfwu.js`, `index-Buds9Sm1.js`, `uc`, `B`, `Ih`, `pc`, `dx`, `of`, `il`, `l`, `ff`, `fu`, `uc`, `Ot`, `uc`, `$h`, `index-DtLkR01C.js`, `Ph`, `zn`, `le`, `et`, `uc`, `ve`, `pr`, `dx`, `rf`, `ef`, `vc`, `of`, `kf`, `r`, `rf`, `Ft`, `sf`, `Ih`, `Ai`, `tt`, `Ta`, `bt`, `yf`, `pl`, `_0`, `Ih`, `_0`, `st`, `.get`, `nn`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `Os`, `c0`, `index-B23vSfwu.js`, `Ph`, `B`, `ue`, `il`, `l`, `uc`, `Ot`, `et`, `ve`, `dx`, `sf`, `vc`, `rf`, `Ye`, `Ih`, `tt`, `r`, `st`, `.get`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `Ph()` connect `Ph` to `l`, `Os`, `Ph`, `index-B23vSfwu.js`, `index-Buds9Sm1.js`, `B`, `il`, `fu`, `et`, `$h`, `lf`, `vc`, `rf`, `sf`, `Ih`, `tt`, `Ta`, `r`, `_0`, `st`, `.get`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._