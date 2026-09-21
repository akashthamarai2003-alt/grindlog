# Graph Report - web  (2026-09-21)

## Corpus Check
- 399 files · ~3,411,056 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6283 nodes · 22293 edges · 170 communities (155 shown, 15 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2679 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `df49b421`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- createServerSupabase
- _
- fitness.ts
- lucide-react
- Ta
- createAdminClient
- Ph
- Ph
- index-Buds9Sm1.js
- Ph
- react
- We
- Ih
- index-DtLkR01C.js
- constants.ts
- index-BM9U1lvA.js
- Ih
- uc
- analyze/route.ts
- nutrition-service.ts
- app/package.json
- Ih
- dx
- _c
- il
- r
- r
- l
- r
- uf
- l
- l
- of
- l
- index-LDG-1p68.js
- l
- dx
- ee
- n
- index-B23vSfwu.js
- r
- dx
- pr
- bl
- generate-draft/route.ts
- fitness-dashboard.tsx
- l
- rf
- dependencies
- bt
- Ih
- uc
- et
- n
- springs.ts
- uc
- uc
- Ye
- yf
- l
- r
- l
- tt
- fu
- rf
- r
- sf
- onboarding-flow.tsx
- on
- r
- $h
- _0
- F
- AIPlanAnimation.tsx
- i
- .get
- fitness-notifications.ts
- schemas.ts
- vc
- Ft
- Ye
- Ui
- uc
- Ph
- B
- zn
- grocery-view.tsx
- Ye
- fitness-plan-profile.ts
- r
- reminders-client.tsx
- r0
- Z
- of
- _0
- nn
- rf
- Ye
- import-usda-foundation-foods.mjs
- users-table-client.tsx
- D0
- Ye
- Ih
- _0
- kl
- ee
- Ye
- D0
- c0
- r
- subscription/types.ts
- af
- wf
- compilerOptions
- prompts.ts
- sf
- st
- uc
- l
- af
- ve
- sf
- nu
- manifest.json
- _0
- yf
- types/index.ts
- le
- ee
- C
- wf
- fitness-reminders/route.ts
- rf
- _0
- rf
- plan-setup/page.tsx
- vf
- ee
- grocery-tab.tsx
- Q
- ai-insight-card.tsx
- devDependencies
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- scripts
- gsap-C8IefbVz.js
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- BottomNav
- progression.ts
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- coach.ts
- package.json
- ff
- firebase-messaging-sw.js
- Data import scripts
- next
- rules/graphify.md
- workflows/graphify.md
- next-env.d.ts

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
- `Recent Decisions` --references--> `BottomNav()`  [INFERRED]
  .planning/STATE.md → app/components/fitness/dashboard/bottom-nav.tsx
- `Naming & File Conventions` --references--> `WorkoutSummaryCard()`  [INFERRED]
  .planning/codebase/STRUCTURE.md → app/components/fitness/workout/workout-summary-card.tsx

## Import Cycles
- None detected.

## Communities (170 total, 15 thin omitted)

### Community 0 - "createServerSupabase"
Cohesion: 0.03
Nodes (106): exportUserData(), exportWorkoutHistoryCSV(), approveFitnessPlanAdjustmentAction(), quickCompleteWorkoutAction(), dynamic, POST(), POST(), POST() (+98 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (123): _, aa, ac(), al(), ao(), As, at, Be() (+115 more)

### Community 2 - "fitness.ts"
Cohesion: 0.05
Nodes (72): completeExerciseSetsAction(), completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), reopenWorkoutAction(), resetWorkoutTimerAction() (+64 more)

### Community 3 - "lucide-react"
Cohesion: 0.03
Nodes (65): FIELD_CONFIGS, FieldConfig, LogMeasurementsPage(), LogWeightPage(), RecentLog, DietPlanCardProps, FitnessHeaderProps, HorizontalWorkoutListProps (+57 more)

### Community 4 - "Ta"
Cohesion: 0.05
Nodes (60): A0(), ai(), as(), bc(), Bl(), bm(), cd(), Cl() (+52 more)

### Community 5 - "createAdminClient"
Cohesion: 0.04
Nodes (68): createCouponAction(), toggleCouponStatusAction(), getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), getUserSupportMessages() (+60 more)

### Community 6 - "Ph"
Cohesion: 0.05
Nodes (76): Ph(), Bd(), Bl(), bm(), cd(), cf(), Cn(), dc() (+68 more)

### Community 7 - "Ph"
Cohesion: 0.04
Nodes (102): Ih(), Ph(), A0(), bc(), bf(), bh(), bm(), cd() (+94 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.06
Nodes (85): $, A, b, c(), D, e(), f, g (+77 more)

### Community 9 - "Ph"
Cohesion: 0.05
Nodes (75): Ph(), Bd(), bh(), Bl(), bm(), cd(), cf(), Cn() (+67 more)

### Community 10 - "react"
Cohesion: 0.04
Nodes (56): loginAdminAction(), toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), AdminLogin(), handleSubmit(), dynamic, GET(), ForgotPasswordPage() (+48 more)

### Community 11 - "We"
Cohesion: 0.08
Nodes (35): A0(), ai(), an(), bc(), cd(), Cl(), cm(), D() (+27 more)

### Community 12 - "Ih"
Cohesion: 0.04
Nodes (73): $h(), Ih(), bf(), bh(), Cl(), cm(), cn(), dc() (+65 more)

### Community 13 - "index-DtLkR01C.js"
Cohesion: 0.04
Nodes (141): $, A, b, c(), D, e(), f, g (+133 more)

### Community 14 - "constants.ts"
Cohesion: 0.06
Nodes (73): ACTIVITY_MULTIPLIERS, AUTHENTIC_INDIAN_RECIPES, AuthenticMealRecipe, BANNED_FOOD_PATTERNS, calculateWaterTarget(), CATEGORY_RETAIL_UNITS, CORE_MEAL_TYPES, DAILY_FOOD_CAPS (+65 more)

### Community 15 - "index-BM9U1lvA.js"
Cohesion: 0.07
Nodes (72): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+64 more)

### Community 16 - "Ih"
Cohesion: 0.04
Nodes (81): Ih(), ad(), an(), as(), bc(), c0(), cd(), Cl() (+73 more)

### Community 17 - "uc"
Cohesion: 0.10
Nodes (31): a0(), ds(), er(), Fn(), ft(), gr(), i0(), Ic() (+23 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.08
Nodes (29): POST(), stableStringify(), stripImagePayload(), BODY_SCAN_RESPONSE_INSTRUCTIONS, BodyScanAnalysis, BodyScanAnalysisSchema, parseBodyScanAnalysis(), parseJson() (+21 more)

### Community 19 - "nutrition-service.ts"
Cohesion: 0.07
Nodes (37): GET(), POST(), DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES, GET(), GET() (+29 more)

### Community 20 - "app/package.json"
Cohesion: 0.03
Nodes (77): checkUserPremiumStatusAction(), claimSpinDiscountAction(), createMessageTopUpOrder(), createRazorpayOrder(), getSpinSecret(), getUserPremiumDetailsAction(), razorpay, signSpinDiscountPayload() (+69 more)

### Community 21 - "Ih"
Cohesion: 0.04
Nodes (89): Ih(), A0(), an(), as(), bc(), bf(), bh(), bm() (+81 more)

### Community 22 - "dx"
Cohesion: 0.07
Nodes (59): am(), ap(), ax(), Bn, cm(), de(), Dn(), dx() (+51 more)

### Community 23 - "_c"
Cohesion: 0.06
Nodes (70): am(), ap(), ax(), Bn, cx(), de(), Dn(), dx() (+62 more)

### Community 24 - "il"
Cohesion: 0.05
Nodes (20): bc(), n(), Fn(), hu(), il, jr, ma(), nf() (+12 more)

### Community 25 - "r"
Cohesion: 0.14
Nodes (27): $h(), ct(), el(), m(), r(), Re(), y(), zt() (+19 more)

### Community 26 - "r"
Cohesion: 0.11
Nodes (56): $h(), ai(), b0(), D(), di(), Do(), eh(), fi() (+48 more)

### Community 27 - "l"
Cohesion: 0.09
Nodes (49): ar(), bi(), bo(), co(), cs(), df(), ea(), eo() (+41 more)

### Community 28 - "r"
Cohesion: 0.12
Nodes (30): as(), bc(), c0(), Dd(), dn(), fo(), ge(), gr() (+22 more)

### Community 29 - "uf"
Cohesion: 0.10
Nodes (28): bs(), bs(), bs(), dn(), Fr(), hc(), hi(), ht() (+20 more)

### Community 30 - "l"
Cohesion: 0.06
Nodes (71): ar(), bi(), bo(), ch(), co(), cs(), Ct(), dd() (+63 more)

### Community 31 - "l"
Cohesion: 0.08
Nodes (61): ar(), Ba(), t(), bi(), bo(), ch(), co(), cs() (+53 more)

### Community 32 - "of"
Cohesion: 0.15
Nodes (43): ot(), ad(), an(), bo(), di(), eh(), fi(), Gt() (+35 more)

### Community 33 - "l"
Cohesion: 0.06
Nodes (68): bi(), bo(), ch(), co(), cs(), Ct(), dd(), df() (+60 more)

### Community 34 - "index-LDG-1p68.js"
Cohesion: 0.09
Nodes (57): am(), ap(), ax(), Bn(), Bx, Cc(), cx(), de() (+49 more)

### Community 35 - "l"
Cohesion: 0.10
Nodes (57): af(), ar(), bu(), ch(), co(), cs(), Ct(), df() (+49 more)

### Community 36 - "dx"
Cohesion: 0.08
Nodes (50): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+42 more)

### Community 37 - "ee"
Cohesion: 0.18
Nodes (19): c0(), cf(), ci(), ee(), ef(), Fu(), hc(), hi() (+11 more)

### Community 38 - "n"
Cohesion: 0.12
Nodes (44): $h(), ct(), el(), g(), m(), ot(), Re(), zt() (+36 more)

### Community 39 - "index-B23vSfwu.js"
Cohesion: 0.08
Nodes (68): am(), ap(), ax(), Bn, Bx, cm(), cx(), de() (+60 more)

### Community 40 - "r"
Cohesion: 0.16
Nodes (39): ai(), bu(), di(), Do(), fi(), Fr(), gs(), Gt() (+31 more)

### Community 41 - "dx"
Cohesion: 0.08
Nodes (47): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+39 more)

### Community 42 - "pr"
Cohesion: 0.05
Nodes (16): Ae(), br(), cr, du(), _f(), Hn(), lr(), lu() (+8 more)

### Community 43 - "bl"
Cohesion: 0.07
Nodes (28): bf(), bl(), Cn(), a(), El(), a(), u(), Gn (+20 more)

### Community 44 - "generate-draft/route.ts"
Cohesion: 0.13
Nodes (39): maxDuration, POST(), maxDuration, POST(), POST(), getProfileContext(), maxDuration, NUTRITION_JSON_SCHEMA (+31 more)

### Community 45 - "fitness-dashboard.tsx"
Cohesion: 0.04
Nodes (55): DailyActivityCard(), DailyActivityCardProps, ExerciseLibraryCard(), FitnessDashboard(), FitnessDashboardProps, HorizontalCalendar(), HorizontalCalendarProps, ProNutritionGenerationCard() (+47 more)

### Community 46 - "l"
Cohesion: 0.09
Nodes (44): bi(), co(), cs(), eo(), gd(), e(), l(), t() (+36 more)

### Community 47 - "rf"
Cohesion: 0.12
Nodes (32): af(), ao(), At(), ds(), fs(), gi(), Kl(), lf() (+24 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "bt"
Cohesion: 0.09
Nodes (44): _0(), ao(), At(), ci(), dn(), ee(), ef(), ha() (+36 more)

### Community 50 - "Ih"
Cohesion: 0.04
Nodes (80): Ih(), ad(), an(), as(), b0(), bc(), bf(), c0() (+72 more)

### Community 51 - "uc"
Cohesion: 0.09
Nodes (34): bu(), er(), Fn(), ft(), gr(), I(), Ic(), Il() (+26 more)

### Community 52 - "et"
Cohesion: 0.07
Nodes (16): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), bm(), rr() (+8 more)

### Community 53 - "n"
Cohesion: 0.16
Nodes (39): ot(), ad(), an(), bo(), di(), eh(), fi(), go() (+31 more)

### Community 54 - "springs.ts"
Cohesion: 0.20
Nodes (8): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem

### Community 55 - "uc"
Cohesion: 0.10
Nodes (31): a0(), ds(), er(), Fn(), ft(), gr(), i0(), Ic() (+23 more)

### Community 56 - "uc"
Cohesion: 0.10
Nodes (31): er(), Fa(), Fn(), ft(), gr(), Ic(), ir(), Kn() (+23 more)

### Community 57 - "Ye"
Cohesion: 0.14
Nodes (32): ar(), Bt(), Da(), dh(), dt(), ea(), fh(), gh() (+24 more)

### Community 58 - "yf"
Cohesion: 0.26
Nodes (13): Dl(), hf(), hn(), jf(), jt(), Kt(), mn(), Na() (+5 more)

### Community 59 - "l"
Cohesion: 0.11
Nodes (38): ar(), At(), Ct(), dd(), df(), eo(), hf(), hn() (+30 more)

### Community 60 - "r"
Cohesion: 0.18
Nodes (33): ai(), bu(), di(), Do(), fi(), Fr(), Gt(), hd() (+25 more)

### Community 61 - "l"
Cohesion: 0.09
Nodes (47): At(), Ba(), t(), bf(), bi(), ch(), Ct(), eo() (+39 more)

### Community 62 - "tt"
Cohesion: 0.09
Nodes (37): ao(), b0(), bi(), bo(), Do(), fo(), fs(), gi() (+29 more)

### Community 63 - "fu"
Cohesion: 0.08
Nodes (31): z0(), z0(), ah(), bm(), Dl(), ea(), $f(), G0() (+23 more)

### Community 64 - "rf"
Cohesion: 0.10
Nodes (36): _0(), af(), cf(), ch(), ci(), cn(), ee(), ef() (+28 more)

### Community 65 - "r"
Cohesion: 0.11
Nodes (53): ai(), bu(), D(), di(), eh(), fi(), Fr(), Gt() (+45 more)

### Community 66 - "sf"
Cohesion: 0.08
Nodes (46): A0(), ai(), as(), b0(), bc(), c0(), Cl(), cm() (+38 more)

### Community 67 - "onboarding-flow.tsx"
Cohesion: 0.07
Nodes (24): saveFitnessOnboardingAction(), dynamic, OnboardingPage(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female (+16 more)

### Community 68 - "on"
Cohesion: 0.09
Nodes (29): A0(), ai(), b0(), Cl(), cm(), co(), cs(), Es() (+21 more)

### Community 69 - "r"
Cohesion: 0.08
Nodes (47): as(), At(), c0(), cf(), da(), Fr(), Fu(), gd() (+39 more)

### Community 70 - "$h"
Cohesion: 0.17
Nodes (22): $h(), ct(), el(), g(), m(), r(), Re(), zt() (+14 more)

### Community 71 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+8 more)

### Community 72 - "F"
Cohesion: 0.09
Nodes (4): F, I, k(), q

### Community 73 - "AIPlanAnimation.tsx"
Cohesion: 0.13
Nodes (24): AICharacter(), AICharacterProps, AIPlanAnimation(), AIPlanAnimationProps, DEFAULT_FALLBACK_PROFILE, PILL_CONFIGS, PillConfig, ProfileSummary (+16 more)

### Community 74 - "i"
Cohesion: 0.10
Nodes (39): ao(), bi(), bo(), co(), cs(), Fa(), fo(), fs() (+31 more)

### Community 75 - ".get"
Cohesion: 0.19
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "fitness-notifications.ts"
Cohesion: 0.17
Nodes (19): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), getUnreadNotificationsCountAction(), markAllNotificationsAsReadAction() (+11 more)

### Community 77 - "schemas.ts"
Cohesion: 0.11
Nodes (19): generateProNutritionLayer(), getProfileNutritionContext(), CoachResponseSchema, FITNESS_PLAN_JSON_SCHEMA, GeneratedExerciseSchema, GeneratedGroceryItemSchema, GeneratedLifestyleSchema, GeneratedMealSchema (+11 more)

### Community 78 - "vc"
Cohesion: 0.11
Nodes (18): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+10 more)

### Community 79 - "Ft"
Cohesion: 0.14
Nodes (23): ao(), bo(), ci(), ee(), ef(), hc(), hi(), i() (+15 more)

### Community 80 - "Ye"
Cohesion: 0.11
Nodes (35): hx(), C(), E(), _a(), ad(), bd(), Bt(), dh() (+27 more)

### Community 81 - "Ui"
Cohesion: 0.08
Nodes (38): as(), er(), Fa(), Fn(), ft(), gr(), Ia(), Ic() (+30 more)

### Community 82 - "uc"
Cohesion: 0.08
Nodes (37): ar(), br(), bu(), cr(), er(), Fn(), ft(), i0() (+29 more)

### Community 83 - "Ph"
Cohesion: 0.05
Nodes (70): Ph(), ar(), b0(), bh(), br(), Bt(), bu(), cf() (+62 more)

### Community 84 - "B"
Cohesion: 0.09
Nodes (43): r(), mx(), as(), bd(), Da(), dh(), dt(), ea() (+35 more)

### Community 85 - "zn"
Cohesion: 0.16
Nodes (30): aa(), Da(), dh(), dt(), ea(), gh(), hh(), jd() (+22 more)

### Community 86 - "grocery-view.tsx"
Cohesion: 0.25
Nodes (16): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), GroceryPage(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps (+8 more)

### Community 87 - "Ye"
Cohesion: 0.12
Nodes (33): hx(), E(), M(), _a(), bd(), bh(), Bt(), dh() (+25 more)

### Community 88 - "fitness-plan-profile.ts"
Cohesion: 0.16
Nodes (25): AVAILABLE_FOOD_ALIASES, cleanText(), expectedMealCount(), FILLER_WORDS, hasForbiddenFood(), hasRestrictionConflict(), hasUnselectedAvailableFood(), isExactClockTime() (+17 more)

### Community 89 - "r"
Cohesion: 0.11
Nodes (49): S, $h(), ct(), el(), g(), m(), ot(), Re() (+41 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.11
Nodes (23): updateRemindersAction(), metadata, RemindersPage(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS (+15 more)

### Community 91 - "r0"
Cohesion: 0.16
Nodes (17): bm(), $f(), G0(), Ga(), Gf(), If(), Jr(), of() (+9 more)

### Community 92 - "Z"
Cohesion: 0.15
Nodes (16): bs(), ks(), re(), tn(), Vo(), G(), I(), K() (+8 more)

### Community 93 - "of"
Cohesion: 0.15
Nodes (26): af(), At(), fs(), io(), Kl(), ls(), ms(), nf() (+18 more)

### Community 94 - "_0"
Cohesion: 0.16
Nodes (24): _0(), D0(), da(), dn(), Ei(), fe(), ff(), Fl() (+16 more)

### Community 95 - "nn"
Cohesion: 0.07
Nodes (15): ar(), en(), Gt(), H(), ja(), ls(), nn(), ol() (+7 more)

### Community 96 - "rf"
Cohesion: 0.10
Nodes (42): _0(), af(), ao(), At(), cf(), ch(), ci(), ee() (+34 more)

### Community 97 - "Ye"
Cohesion: 0.09
Nodes (41): hx(), C(), E(), _a(), ad(), ar(), bd(), Bt() (+33 more)

### Community 98 - "import-usda-foundation-foods.mjs"
Cohesion: 0.11
Nodes (18): buildRow(), DEFAULT_JSON_PATH, dryRun, findRecord(), IMPORT_MAP, missing, nutrient(), payload (+10 more)

### Community 99 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 100 - "D0"
Cohesion: 0.25
Nodes (17): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gn() (+9 more)

### Community 101 - "Ye"
Cohesion: 0.10
Nodes (36): _a(), ad(), bd(), Bt(), dh(), dt(), gc(), gh() (+28 more)

### Community 102 - "Ih"
Cohesion: 0.05
Nodes (56): Ih(), bf(), bh(), bm(), cn(), dc(), ds(), ea() (+48 more)

### Community 103 - "_0"
Cohesion: 0.20
Nodes (20): _0(), D0(), da(), dn(), Ei(), fe(), ff(), Fl() (+12 more)

### Community 104 - "kl"
Cohesion: 0.18
Nodes (4): af, kl(), oc(), zs()

### Community 105 - "ee"
Cohesion: 0.19
Nodes (19): c0(), cf(), ci(), ee(), ef(), Fu(), ha(), is() (+11 more)

### Community 106 - "Ye"
Cohesion: 0.11
Nodes (36): hx(), E(), M(), _a(), bd(), bh(), Bt(), dt() (+28 more)

### Community 107 - "D0"
Cohesion: 0.19
Nodes (20): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gn() (+12 more)

### Community 108 - "c0"
Cohesion: 0.31
Nodes (15): c0(), D0(), df(), fe(), Gl(), Gn(), Lu(), nt() (+7 more)

### Community 109 - "r"
Cohesion: 0.12
Nodes (27): bi(), co(), cs(), Fr(), ge(), gi(), hs(), je() (+19 more)

### Community 110 - "subscription/types.ts"
Cohesion: 0.13
Nodes (18): POST(), FitnessProPage(), metadata, ProfileSubscriptionProps, PricingCard(), PricingCardProps, ProPageClient(), ProPageClientProps (+10 more)

### Community 111 - "af"
Cohesion: 0.17
Nodes (21): _a(), af(), ds(), fs(), G0(), io(), kr(), _o() (+13 more)

### Community 112 - "wf"
Cohesion: 0.11
Nodes (35): aa(), Bt(), Da(), dh(), dt(), ea(), Ei(), fh() (+27 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "prompts.ts"
Cohesion: 0.14
Nodes (25): GET(), addUnique(), budgetPlanningReference(), buildCompactPlanProfile(), buildFitnessPlanPrompt(), buildPlanReportInsights(), buildPlanSafetyBrief(), compactList() (+17 more)

### Community 115 - "sf"
Cohesion: 0.09
Nodes (29): ah(), b0(), bf(), Ct(), dc(), dd(), gu(), Ii() (+21 more)

### Community 116 - "st"
Cohesion: 0.11
Nodes (34): T0(), E0(), E0(), T0(), E0(), A0(), an(), b0() (+26 more)

### Community 117 - "uc"
Cohesion: 0.11
Nodes (27): r(), mx(), ad(), br(), cr(), Fn(), ic(), id() (+19 more)

### Community 118 - "l"
Cohesion: 0.10
Nodes (41): Ba(), t(), bf(), ch(), Ct(), eo(), gd(), e() (+33 more)

### Community 119 - "af"
Cohesion: 0.26
Nodes (15): af(), fs(), hn(), io(), ll(), ms(), _o(), os() (+7 more)

### Community 120 - "ve"
Cohesion: 0.18
Nodes (26): _0(), ci(), D0(), Dl(), dn(), ee(), ef(), Ei() (+18 more)

### Community 121 - "sf"
Cohesion: 0.11
Nodes (21): aa(), ad(), Bt(), er(), ke(), Ln(), lr(), md() (+13 more)

### Community 122 - "nu"
Cohesion: 0.09
Nodes (10): eu(), gf, ir(), jf(), nc(), nu, qu(), Rn() (+2 more)

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "_0"
Cohesion: 0.22
Nodes (19): _0(), D0(), Ei(), fe(), ff(), gd(), Gl(), Gn() (+11 more)

### Community 125 - "yf"
Cohesion: 0.13
Nodes (12): bn, dc(), df(), hc, hf(), kc(), lc, mf() (+4 more)

### Community 126 - "types/index.ts"
Cohesion: 0.12
Nodes (16): Achievement, AchievementCategory, AIHabitPlan, AIHabitPlanItem, AISession, AISessionType, Habit, HabitCategory (+8 more)

### Community 127 - "le"
Cohesion: 0.15
Nodes (28): bf(), ch(), en(), gf(), hd(), hf(), hn(), Ii() (+20 more)

### Community 128 - "ee"
Cohesion: 0.21
Nodes (17): c0(), cf(), ci(), ee(), ef(), hc(), hi(), is() (+9 more)

### Community 130 - "wf"
Cohesion: 0.22
Nodes (10): aa(), Ei(), hd(), ke(), Mi(), Qc(), wd(), wf() (+2 more)

### Community 131 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 132 - "rf"
Cohesion: 0.15
Nodes (26): af(), ao(), fs(), gd(), Kl(), lf(), ls(), ms() (+18 more)

### Community 133 - "_0"
Cohesion: 0.34
Nodes (14): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+6 more)

### Community 134 - "rf"
Cohesion: 0.13
Nodes (28): af(), ao(), At(), fs(), gi(), Kl(), lf(), ls() (+20 more)

### Community 135 - "plan-setup/page.tsx"
Cohesion: 0.27
Nodes (11): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+3 more)

### Community 136 - "vf"
Cohesion: 0.20
Nodes (14): dd(), Ii(), jf(), mn(), Na(), Oa(), t(), Sn() (+6 more)

### Community 137 - "ee"
Cohesion: 0.30
Nodes (12): ao(), ci(), ee(), ef(), is(), lo(), ml(), od() (+4 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 139 - "Q"
Cohesion: 0.25
Nodes (8): r0(), r0(), r0(), r0(), r0(), r0(), r0(), Q()

### Community 140 - "ai-insight-card.tsx"
Cohesion: 0.40
Nodes (3): PlanAdjustment, ProgressReview, WeeklyWorkoutStats

### Community 141 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 143 - "Key Architectural Patterns"
Cohesion: 0.22
Nodes (8): 1. Parallel Batching vs. Sequential Waterfalls, 2. In-Memory Calendar & Status Math, 3. Immediate Suspense Streaming, 4. Router Caching & Optimistic Tab Transitions, 5. Theme Architecture (Dark & White), Architectural Overview, Architecture & Data Flow — GrindLog, Key Architectural Patterns

### Community 144 - "Technology Stack — GrindLog"
Cohesion: 0.22
Nodes (8): AI & LLM Integrations, Core Runtime & Framework, Data Layer & State, Mobile & PWA, Payments & Subscriptions, Styling & Design System, Technology Stack — GrindLog, Utilities & Validation

### Community 145 - "Critical Test Flows"
Cohesion: 0.22
Nodes (8): 1. Tab Navigation & Instant Switching, 2. Dual-Theme Verification (Dark vs. White), 3. Workout Logging & State Persistence, 4. Nutrition & Calorie Tracking, 5. Authentication & Subscription Guard Rails, Critical Test Flows, Testing & Verification Guide — GrindLog, Verification Commands

### Community 146 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, import:usda, lint, start, type-check

### Community 147 - "gsap-C8IefbVz.js"
Cohesion: 0.38
Nodes (4): e(), Ml(), Ol(), tr()

### Community 149 - "Concerns, Technical Debt & Watch-Outs — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Database Waterfall Regressions, 2. White Theme CSS Overrides, 3. PWA Service Worker Cache Invalidation, 4. Mobile Keyboard & Viewport Layout Shifts, 5. Razorpay Webhook Idempotency & Webhook Retries, Concerns, Technical Debt & Watch-Outs — GrindLog

### Community 150 - "External Integrations & Services — GrindLog"
Cohesion: 0.25
Nodes (7): 1. Supabase (Database, Auth, Storage), 2. Razorpay (Payment Gateway), 3. Google Gemini AI (@google/genai), 4. PWA Service Worker (Next-PWA & Workbox), 5. Resend (Email Service), 6. Developer Tooling & Agent Workflow Suite, External Integrations & Services — GrindLog

### Community 151 - "Product & Technical Requirements — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Performance & Latency Requirements, 2. Workout & Fitness Requirements, 3. Nutrition & Diet Requirements, 4. Design & Mobile Experience Requirements, 5. Security & Billing Requirements, Product & Technical Requirements — GrindLog

### Community 152 - "BottomNav"
Cohesion: 0.09
Nodes (18): BottomNav(), 1. Performance Standards (Mobile 60fps Target), 2. Design System & Theming, 3. Server vs. Client Boundary Rules, 4. TypeScript & Error Handling, Coding Conventions & Standards — GrindLog, Codebase Structure & Directory Layout — GrindLog, Naming & File Conventions (+10 more)

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

### Community 164 - "next"
Cohesion: 0.04
Nodes (41): CoachPage(), metadata, CustomExercisePage(), metadata, ExercisesPage(), metadata, ExerciseDetailPage(), generateMetadata() (+33 more)

## Knowledge Gaps
- **520 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+515 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 873 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `rf`, `Ta`, `rf`, `Ph`, `index-Buds9Sm1.js`, `Q`, `index-DtLkR01C.js`, `index-BM9U1lvA.js`, `Ih`, `uc`, `of`, `_c`, `il`, `r`, `uf`, `l`, `l`, `ff`, `index-LDG-1p68.js`, `index-B23vSfwu.js`, `pr`, `bl`, `l`, `rf`, `bt`, `uc`, `et`, `uc`, `uc`, `Ye`, `tt`, `fu`, `rf`, `r`, `.get`, `vc`, `Ft`, `Ui`, `uc`, `Ph`, `B`, `zn`, `r`, `Z`, `of`, `_0`, `nn`, `kl`, `ee`, `st`, `uc`, `ve`, `nu`, `_0`, `yf`, `le`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `Ph`, `vf`, `We`, `Q`, `index-BM9U1lvA.js`, `Ih`, `_c`, `uf`, `l`, `et`, `uc`, `tt`, `fu`, `r`, `vc`, `B`, `Ye`, `st`, `ve`, `_0`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `ee`, `_`, `rf`, `Ph`, `Q`, `index-BM9U1lvA.js`, `Ih`, `r`, `uf`, `l`, `dx`, `uc`, `et`, `fu`, `vc`, `B`, `_0`, `Ye`, `st`, `_0`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._