# Graph Report - web  (2026-09-22)

## Corpus Check
- 402 files · ~3,418,847 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6301 nodes · 22371 edges · 168 communities (156 shown, 12 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a3dcd686`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- uc
- _
- fitness.ts
- index-B23vSfwu.js
- index-LDG-1p68.js
- (fitness)/support/page.tsx
- Ph
- _c
- index-Buds9Sm1.js
- Ph
- react
- st
- lucide-react
- index-DtLkR01C.js
- constants.ts
- fitness-plan-profile.ts
- Ih
- Bi
- analyze/route.ts
- schemas.ts
- createAdminClient
- grocery-view.tsx
- au
- Ih
- il
- he
- r
- .add
- ie
- workout/page.tsx
- We
- r
- of
- uc
- uc
- l
- index-CqdT1wea.js
- rf
- n
- dx
- r
- prompts.ts
- Q
- fu
- generate-draft/route.ts
- rf
- l
- jn
- dependencies
- sf
- Ih
- Ot
- et
- of
- Hl
- n
- Ye
- r
- Vo
- l
- Ye
- app/package.json
- i
- Ta
- lf
- r
- springs.ts
- onboarding-flow.tsx
- le
- access.ts
- Hi
- We
- F
- AIPlanAnimation.tsx
- Ih
- .get
- fitness-notifications.ts
- uc
- vc
- of
- ee
- M0
- bf
- Ph
- sf
- r
- l
- B
- l
- r
- reminders-client.tsx
- bt
- sf
- devDependencies
- _0
- r0
- uc
- t
- import-usda-foundation-foods.mjs
- rf
- C
- l
- Ih
- _0
- rf
- Wh
- rf
- D0
- c0
- hl
- Ph
- lf
- zn
- compilerOptions
- pc
- r
- _0
- plan-setup/page.tsx
- D0
- af
- ve
- users-table-client.tsx
- nu
- manifest.json
- _0
- yf
- ee
- sf
- zod
- _f
- scripts
- fitness-reminders/route.ts
- l
- Ye
- ue
- gsap-C8IefbVz.js
- r
- _0
- grocery-tab.tsx
- ff
- nutrition-view.tsx
- $h
- tt
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- Wo
- dx
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- progression.ts
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- next
- coach.ts
- package.json
- firebase-messaging-sw.js
- Data import scripts
- createServerSupabase
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

## Communities (168 total, 12 thin omitted)

### Community 0 - "uc"
Cohesion: 0.07
Nodes (52): _a(), Bt(), bu(), dt(), er(), Fn(), ft(), gc() (+44 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (129): _, aa, ac(), al(), ao(), As, at, Be() (+121 more)

### Community 2 - "fitness.ts"
Cohesion: 0.04
Nodes (92): exportUserData(), exportWorkoutHistoryCSV(), completeExerciseSetsAction(), completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction() (+84 more)

### Community 3 - "index-B23vSfwu.js"
Cohesion: 0.06
Nodes (79): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+71 more)

### Community 4 - "index-LDG-1p68.js"
Cohesion: 0.09
Nodes (58): am(), ap(), ax(), Bn(), Bx, Cc(), cx(), de() (+50 more)

### Community 5 - "(fitness)/support/page.tsx"
Cohesion: 0.26
Nodes (9): getUserSupportMessages(), submitSupportMessage(), dynamic, FitnessSupportPage(), revalidate, SUPPORT_CATEGORIES, SupportClient(), SupportClientProps (+1 more)

### Community 6 - "Ph"
Cohesion: 0.04
Nodes (85): Ph(), as(), Bd(), bh(), Bl(), bm(), br(), cd() (+77 more)

### Community 7 - "_c"
Cohesion: 0.12
Nodes (34): am(), ap(), ax(), Bn, ep(), Fx(), Gx(), ip() (+26 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.05
Nodes (96): $, A, b, c(), D, e(), f, g (+88 more)

### Community 9 - "Ph"
Cohesion: 0.04
Nodes (87): Ih(), Ph(), aa(), Bd(), bh(), Bl(), bm(), Bt() (+79 more)

### Community 10 - "react"
Cohesion: 0.03
Nodes (69): loginAdminAction(), toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), AdminLogin(), handleSubmit(), dynamic, GET(), ForgotPasswordPage() (+61 more)

### Community 11 - "st"
Cohesion: 0.09
Nodes (42): T0(), E0(), E0(), T0(), E0(), E0(), E0(), A0() (+34 more)

### Community 12 - "lucide-react"
Cohesion: 0.03
Nodes (70): GET(), FIELD_CONFIGS, FieldConfig, LogMeasurementsPage(), LogWeightPage(), RecentLog, metadata, ProgressPage() (+62 more)

### Community 13 - "index-DtLkR01C.js"
Cohesion: 0.04
Nodes (113): $, A, b, c(), D, e(), f, g (+105 more)

### Community 14 - "constants.ts"
Cohesion: 0.06
Nodes (74): GroceryPage(), ACTIVITY_MULTIPLIERS, AUTHENTIC_INDIAN_RECIPES, AuthenticMealRecipe, BANNED_FOOD_PATTERNS, calculateWaterTarget(), CATEGORY_RETAIL_UNITS, CORE_MEAL_TYPES (+66 more)

### Community 15 - "fitness-plan-profile.ts"
Cohesion: 0.12
Nodes (30): GenerateGroceryResponseSchema, POST(), GeneratedGroceryItemSchema, AVAILABLE_FOOD_ALIASES, buildGoalCalorieTarget(), cleanText(), expectedMealCount(), FILLER_WORDS (+22 more)

### Community 16 - "Ih"
Cohesion: 0.04
Nodes (85): $h(), Ih(), ad(), ai(), an(), as(), bc(), c0() (+77 more)

### Community 17 - "Bi"
Cohesion: 0.15
Nodes (20): a0(), Fn(), gr(), i0(), ju(), l0(), ld(), oh() (+12 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.10
Nodes (30): POST(), POST(), stableStringify(), stripImagePayload(), POST(), AIStartingReportPage(), displayValue(), dynamic (+22 more)

### Community 19 - "schemas.ts"
Cohesion: 0.11
Nodes (23): GET(), CoachMessage(), CoachMessageProps, generateProNutritionLayer(), getProfileNutritionContext(), FITNESS_PLAN_SYSTEM_PROMPT, CoachResponseData, FITNESS_PLAN_JSON_SCHEMA (+15 more)

### Community 20 - "createAdminClient"
Cohesion: 0.04
Nodes (80): createCouponAction(), toggleCouponStatusAction(), getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), checkUserPremiumStatusAction() (+72 more)

### Community 21 - "grocery-view.tsx"
Cohesion: 0.27
Nodes (15): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps, getScaledPrice() (+7 more)

### Community 22 - "au"
Cohesion: 0.17
Nodes (29): ap(), Bn(), Bx, ep(), ex(), o(), Ha, ip() (+21 more)

### Community 23 - "Ih"
Cohesion: 0.04
Nodes (87): Ih(), bf(), bh(), bm(), Cl(), cm(), cn(), dc() (+79 more)

### Community 24 - "il"
Cohesion: 0.05
Nodes (18): du(), Fn(), hu(), il, jr, ls(), ma(), mu() (+10 more)

### Community 25 - "he"
Cohesion: 0.12
Nodes (27): bs(), bs(), bs(), bs(), $h(), ct(), el(), m() (+19 more)

### Community 26 - "r"
Cohesion: 0.14
Nodes (42): ai(), b0(), bh(), di(), Do(), eh(), fi(), Fr() (+34 more)

### Community 27 - ".add"
Cohesion: 0.08
Nodes (13): af, Cn(), Gn, Gu(), kl(), _l(), me(), Mn (+5 more)

### Community 28 - "ie"
Cohesion: 0.10
Nodes (31): ao(), At(), bi(), bo(), co(), cs(), fo(), go() (+23 more)

### Community 29 - "workout/page.tsx"
Cohesion: 0.10
Nodes (13): dynamic, dynamic, WorkoutContent(), DashboardSkeleton(), FitnessDashboard(), FitnessLandingPage(), AiCoachNote(), AiCoachNoteProps (+5 more)

### Community 30 - "We"
Cohesion: 0.09
Nodes (32): A0(), an(), as(), bc(), cd(), da(), Es(), Hl() (+24 more)

### Community 31 - "r"
Cohesion: 0.16
Nodes (38): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+30 more)

### Community 32 - "of"
Cohesion: 0.08
Nodes (49): ad(), bf(), bo(), ch(), Ct(), ds(), eo(), l() (+41 more)

### Community 33 - "uc"
Cohesion: 0.10
Nodes (32): a0(), er(), Fa(), Fn(), ft(), gr(), i0(), Ic() (+24 more)

### Community 34 - "uc"
Cohesion: 0.13
Nodes (24): br(), cr(), Fn(), ic(), id(), Il(), Jc(), ju() (+16 more)

### Community 35 - "l"
Cohesion: 0.09
Nodes (48): ar(), ch(), co(), cs(), Ct(), dd(), df(), eo() (+40 more)

### Community 36 - "index-CqdT1wea.js"
Cohesion: 0.09
Nodes (56): am(), ap(), ax(), Bn, Bx, cx(), de(), Dn() (+48 more)

### Community 37 - "rf"
Cohesion: 0.15
Nodes (27): ad(), af(), fs(), gi(), Kl(), lf(), ls(), ms() (+19 more)

### Community 38 - "n"
Cohesion: 0.21
Nodes (31): ot(), ad(), an(), bu(), di(), eh(), fi(), Gt() (+23 more)

### Community 39 - "dx"
Cohesion: 0.07
Nodes (62): am(), ap(), ax(), Bn, cm(), cx(), de(), Dn() (+54 more)

### Community 40 - "r"
Cohesion: 0.15
Nodes (40): af(), ai(), bu(), di(), Do(), fi(), ft(), gs() (+32 more)

### Community 41 - "prompts.ts"
Cohesion: 0.14
Nodes (25): POST(), POST(), buildFitnessCoachContext(), addUnique(), budgetPlanningReference(), buildCompactPlanProfile(), buildFitnessCoachPrompt(), buildFitnessPlanPrompt() (+17 more)

### Community 42 - "Q"
Cohesion: 0.07
Nodes (15): r0(), r0(), r0(), r0(), r0(), r0(), r0(), ar() (+7 more)

### Community 43 - "fu"
Cohesion: 0.08
Nodes (32): z0(), z0(), ah(), bm(), Dl(), ea(), $f(), G0() (+24 more)

### Community 44 - "generate-draft/route.ts"
Cohesion: 0.14
Nodes (41): maxDuration, POST(), maxDuration, POST(), POST(), POST(), getProfileContext(), maxDuration (+33 more)

### Community 45 - "rf"
Cohesion: 0.14
Nodes (27): ad(), af(), ao(), At(), fs(), gd(), gi(), Kl() (+19 more)

### Community 46 - "l"
Cohesion: 0.08
Nodes (64): ad(), bf(), bi(), bo(), ch(), co(), cs(), eo() (+56 more)

### Community 47 - "jn"
Cohesion: 0.12
Nodes (31): ao(), bi(), bo(), fo(), fs(), gi(), hs(), io() (+23 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "sf"
Cohesion: 0.22
Nodes (10): ah(), Fu(), ke(), la(), md(), Mi(), sf(), wd() (+2 more)

### Community 50 - "Ih"
Cohesion: 0.04
Nodes (90): Ih(), A0(), an(), as(), bc(), bm(), cd(), Cl() (+82 more)

### Community 51 - "Ot"
Cohesion: 0.07
Nodes (59): am(), ap(), ax(), Bn, cm(), de(), Dn(), dx() (+51 more)

### Community 52 - "et"
Cohesion: 0.04
Nodes (23): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), rr(), rr() (+15 more)

### Community 53 - "of"
Cohesion: 0.10
Nodes (50): af(), an(), At(), bh(), di(), eh(), fi(), fs() (+42 more)

### Community 54 - "Hl"
Cohesion: 0.11
Nodes (27): A0(), ai(), b0(), Cl(), cm(), co(), cs(), Es() (+19 more)

### Community 55 - "n"
Cohesion: 0.08
Nodes (20): bo(), n(), Co(), df(), a(), Fi(), hf(), ic() (+12 more)

### Community 56 - "Ye"
Cohesion: 0.17
Nodes (25): hx(), E(), M(), _a(), bd(), dh(), dt(), fh() (+17 more)

### Community 57 - "r"
Cohesion: 0.12
Nodes (38): aa(), ar(), Bt(), Da(), dh(), dt(), ea(), ft() (+30 more)

### Community 58 - "Vo"
Cohesion: 0.15
Nodes (16): bs(), Go(), ks(), re(), tn(), Vo(), G(), I() (+8 more)

### Community 59 - "l"
Cohesion: 0.09
Nodes (51): At(), bi(), bo(), Ct(), dd(), df(), eo(), fo() (+43 more)

### Community 60 - "Ye"
Cohesion: 0.18
Nodes (24): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+16 more)

### Community 61 - "app/package.json"
Cohesion: 0.04
Nodes (54): deleteR2File(), isR2Configured, POST(), POST(), generateAIResponse(), generateAIResponseJSON(), getGroqApiKeys(), getGroqClient() (+46 more)

### Community 62 - "i"
Cohesion: 0.17
Nodes (20): bi(), bo(), fo(), go(), gs(), ho(), hs(), je() (+12 more)

### Community 63 - "Ta"
Cohesion: 0.12
Nodes (23): bf(), ch(), Dl(), ds(), G0(), hn(), jt(), kr() (+15 more)

### Community 64 - "lf"
Cohesion: 0.27
Nodes (14): ao(), fs(), gi(), lf(), ms(), _o(), os(), qt() (+6 more)

### Community 65 - "r"
Cohesion: 0.11
Nodes (51): ai(), b0(), bu(), di(), Do(), eh(), fi(), Fr() (+43 more)

### Community 66 - "springs.ts"
Cohesion: 0.20
Nodes (8): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem

### Community 67 - "onboarding-flow.tsx"
Cohesion: 0.07
Nodes (24): saveFitnessOnboardingAction(), dynamic, OnboardingPage(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female (+16 more)

### Community 68 - "le"
Cohesion: 0.12
Nodes (33): bf(), ch(), dc(), dd(), df(), Fu(), gu(), hf() (+25 more)

### Community 69 - "access.ts"
Cohesion: 0.04
Nodes (59): approveFitnessPlanAdjustmentAction(), deleteR2File(), deleteScanPhotosFromR2(), isR2Configured, POST(), dynamic, GET(), POST() (+51 more)

### Community 70 - "Hi"
Cohesion: 0.10
Nodes (27): bm(), dc(), ds(), ea(), $f(), G0(), Ga(), Gf() (+19 more)

### Community 71 - "We"
Cohesion: 0.09
Nodes (34): A0(), ai(), bc(), cd(), Cl(), cm(), D(), en() (+26 more)

### Community 72 - "F"
Cohesion: 0.09
Nodes (4): F, I, k(), q

### Community 73 - "AIPlanAnimation.tsx"
Cohesion: 0.13
Nodes (24): AICharacter(), AICharacterProps, AIPlanAnimation(), AIPlanAnimationProps, DEFAULT_FALLBACK_PROFILE, PILL_CONFIGS, PillConfig, ProfileSummary (+16 more)

### Community 74 - "Ih"
Cohesion: 0.04
Nodes (82): Ih(), an(), bc(), cd(), Cl(), cn(), co(), cs() (+74 more)

### Community 75 - ".get"
Cohesion: 0.19
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "fitness-notifications.ts"
Cohesion: 0.17
Nodes (19): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), getUnreadNotificationsCountAction(), markAllNotificationsAsReadAction() (+11 more)

### Community 77 - "uc"
Cohesion: 0.13
Nodes (22): Bd(), br(), cr(), Fn(), ic(), id(), Ii(), Il() (+14 more)

### Community 78 - "vc"
Cohesion: 0.06
Nodes (30): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+22 more)

### Community 79 - "of"
Cohesion: 0.10
Nodes (38): ao(), At(), c0(), ci(), dn(), ee(), ef(), ha() (+30 more)

### Community 80 - "ee"
Cohesion: 0.29
Nodes (14): c0(), cf(), ci(), ee(), ef(), is(), lo(), ml() (+6 more)

### Community 81 - "M0"
Cohesion: 0.11
Nodes (28): bc(), cd(), Cl(), cm(), D(), Hl(), ht(), hu() (+20 more)

### Community 82 - "bf"
Cohesion: 0.22
Nodes (9): b0(), bf(), dc(), gu(), lh(), Nh(), sd(), tc() (+1 more)

### Community 83 - "Ph"
Cohesion: 0.04
Nodes (78): Ph(), A0(), b0(), bm(), Bt(), cf(), Cl(), dc() (+70 more)

### Community 84 - "sf"
Cohesion: 0.11
Nodes (21): ad(), ar(), Bt(), Fu(), ke(), la(), Ln(), md() (+13 more)

### Community 85 - "r"
Cohesion: 0.08
Nodes (50): aa(), ar(), bu(), Da(), dh(), dt(), ea(), fh() (+42 more)

### Community 86 - "l"
Cohesion: 0.08
Nodes (52): ar(), Bt(), ch(), Ct(), dd(), df(), eo(), hf() (+44 more)

### Community 87 - "B"
Cohesion: 0.09
Nodes (40): hx(), E(), M(), _a(), bd(), bh(), Bt(), dh() (+32 more)

### Community 88 - "l"
Cohesion: 0.09
Nodes (52): ar(), bi(), bo(), co(), cs(), Ct(), eo(), Fa() (+44 more)

### Community 89 - "r"
Cohesion: 0.14
Nodes (43): S, ot(), af(), an(), b0(), bu(), di(), Do() (+35 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.13
Nodes (21): updateRemindersAction(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS, REMINDER_TYPES, ReminderTypeSheet() (+13 more)

### Community 91 - "bt"
Cohesion: 0.07
Nodes (57): c0(), cf(), ci(), dn(), ee(), ef(), Fr(), Fu() (+49 more)

### Community 92 - "sf"
Cohesion: 0.12
Nodes (31): ao(), as(), c0(), ci(), dn(), ee(), ef(), gr() (+23 more)

### Community 93 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 94 - "_0"
Cohesion: 0.22
Nodes (19): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), Gl() (+11 more)

### Community 95 - "r0"
Cohesion: 0.13
Nodes (21): bm(), Dl(), ea(), $f(), G0(), Ga(), Gf(), If() (+13 more)

### Community 96 - "uc"
Cohesion: 0.17
Nodes (18): as(), Fn(), gr(), ju(), l0(), ld(), n0(), pr() (+10 more)

### Community 97 - "t"
Cohesion: 0.08
Nodes (50): af(), At(), Ba(), t(), bi(), co(), cs(), fs() (+42 more)

### Community 98 - "import-usda-foundation-foods.mjs"
Cohesion: 0.08
Nodes (25): main(), supabase, buildRow(), DEFAULT_JSON_PATH, dryRun, findRecord(), IMPORT_MAP, missing (+17 more)

### Community 99 - "rf"
Cohesion: 0.10
Nodes (42): _0(), as(), c0(), cf(), ch(), ci(), da(), ds() (+34 more)

### Community 100 - "C"
Cohesion: 0.15
Nodes (8): b0(), bf(), dc(), gu(), Kl(), mf(), Ut(), C

### Community 101 - "l"
Cohesion: 0.09
Nodes (46): At(), Ba(), t(), ch(), co(), cs(), Ct(), dd() (+38 more)

### Community 102 - "Ih"
Cohesion: 0.04
Nodes (78): Ih(), A0(), ad(), an(), as(), bh(), Bt(), cn() (+70 more)

### Community 103 - "_0"
Cohesion: 0.23
Nodes (19): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+11 more)

### Community 104 - "rf"
Cohesion: 0.12
Nodes (31): af(), ao(), At(), da(), fs(), gd(), Ia(), Kl() (+23 more)

### Community 105 - "Wh"
Cohesion: 0.15
Nodes (25): $h(), hx(), C(), E(), bd(), D(), dh(), fh() (+17 more)

### Community 106 - "rf"
Cohesion: 0.14
Nodes (26): _0(), cf(), ch(), ci(), ee(), ef(), Gl(), is() (+18 more)

### Community 107 - "D0"
Cohesion: 0.24
Nodes (18): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gl() (+10 more)

### Community 108 - "c0"
Cohesion: 0.28
Nodes (16): c0(), D0(), df(), fe(), Gl(), Gn(), Lu(), nt() (+8 more)

### Community 109 - "hl"
Cohesion: 0.08
Nodes (53): Ba(), t(), bi(), bo(), Ct(), eo(), gd(), e() (+45 more)

### Community 110 - "Ph"
Cohesion: 0.05
Nodes (67): Ph(), bf(), bh(), bm(), Cn(), dc(), Dl(), ds() (+59 more)

### Community 111 - "lf"
Cohesion: 0.31
Nodes (13): ao(), fs(), gi(), lf(), ms(), no(), os(), Rl() (+5 more)

### Community 112 - "zn"
Cohesion: 0.13
Nodes (35): ar(), bu(), Da(), dh(), dt(), ea(), er(), fh() (+27 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "pc"
Cohesion: 0.16
Nodes (30): bd(), Da(), dh(), dt(), ea(), fh(), gc(), gh() (+22 more)

### Community 115 - "r"
Cohesion: 0.16
Nodes (40): af(), bu(), D(), di(), fi(), Fr(), Gt(), lt() (+32 more)

### Community 116 - "_0"
Cohesion: 0.12
Nodes (30): _0(), D0(), df(), Do(), Ei(), en(), fe(), ff() (+22 more)

### Community 117 - "plan-setup/page.tsx"
Cohesion: 0.27
Nodes (11): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+3 more)

### Community 118 - "D0"
Cohesion: 0.25
Nodes (17): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gn() (+9 more)

### Community 119 - "af"
Cohesion: 0.36
Nodes (12): af(), fs(), io(), ms(), no(), _o(), os(), qt() (+4 more)

### Community 120 - "ve"
Cohesion: 0.11
Nodes (39): _0(), c0(), cf(), ci(), D0(), Dl(), dn(), ee() (+31 more)

### Community 121 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 122 - "nu"
Cohesion: 0.08
Nodes (12): dl(), eu(), gf, ir(), jf(), nu, pl, qi (+4 more)

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "_0"
Cohesion: 0.30
Nodes (15): _0(), D0(), Ei(), fe(), ff(), Gn(), Lu(), mn() (+7 more)

### Community 125 - "yf"
Cohesion: 0.18
Nodes (7): hc, kc(), lc, mf(), ro, vf(), yf

### Community 126 - "ee"
Cohesion: 0.23
Nodes (16): c0(), cf(), ci(), ee(), ef(), Fu(), is(), lo() (+8 more)

### Community 127 - "sf"
Cohesion: 0.09
Nodes (40): _0(), ao(), bc(), Bl(), cd(), ci(), Dd(), Dl() (+32 more)

### Community 128 - "zod"
Cohesion: 0.20
Nodes (6): s, safeNumber, GeneratedMealSchema, s, s, zod

### Community 129 - "_f"
Cohesion: 0.32
Nodes (6): Ae(), br(), cr, _f(), Un, Xo

### Community 130 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, import:usda, lint, start, type-check

### Community 131 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 132 - "l"
Cohesion: 0.07
Nodes (63): ar(), At(), bi(), bo(), co(), cs(), Ct(), dd() (+55 more)

### Community 133 - "Ye"
Cohesion: 0.09
Nodes (44): $h(), hx(), C(), E(), _a(), bd(), D(), dh() (+36 more)

### Community 134 - "ue"
Cohesion: 0.21
Nodes (12): aa(), ad(), ar(), Bt(), Ln(), nr(), sc(), Sm() (+4 more)

### Community 135 - "gsap-C8IefbVz.js"
Cohesion: 0.38
Nodes (4): e(), Ml(), Ol(), tr()

### Community 136 - "r"
Cohesion: 0.16
Nodes (39): ai(), b0(), bu(), di(), Do(), eh(), fi(), Fr() (+31 more)

### Community 137 - "_0"
Cohesion: 0.25
Nodes (17): _0(), D0(), df(), Ei(), fe(), Gl(), Gn(), Lu() (+9 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 140 - "nutrition-view.tsx"
Cohesion: 0.06
Nodes (41): NutritionLoading(), dynamic, NutritionContent(), TodaysGoalsCard(), TodaysGoalsCardProps, formatFoodItem(), TodaysNutritionCard(), TodaysNutritionCardProps (+33 more)

### Community 141 - "$h"
Cohesion: 0.14
Nodes (25): $h(), ct(), el(), g(), m(), r(), Re(), zt() (+17 more)

### Community 142 - "tt"
Cohesion: 0.23
Nodes (19): ui(), bf(), mf(), _o(), Pa(), qs(), ui(), vs() (+11 more)

### Community 143 - "Key Architectural Patterns"
Cohesion: 0.22
Nodes (8): 1. Parallel Batching vs. Sequential Waterfalls, 2. In-Memory Calendar & Status Math, 3. Immediate Suspense Streaming, 4. Router Caching & Optimistic Tab Transitions, 5. Theme Architecture (Dark & White), Architectural Overview, Architecture & Data Flow — GrindLog, Key Architectural Patterns

### Community 144 - "Technology Stack — GrindLog"
Cohesion: 0.22
Nodes (8): AI & LLM Integrations, Core Runtime & Framework, Data Layer & State, Mobile & PWA, Payments & Subscriptions, Styling & Design System, Technology Stack — GrindLog, Utilities & Validation

### Community 145 - "Critical Test Flows"
Cohesion: 0.22
Nodes (8): 1. Tab Navigation & Instant Switching, 2. Dual-Theme Verification (Dark vs. White), 3. Workout Logging & State Persistence, 4. Nutrition & Calorie Tracking, 5. Authentication & Subscription Guard Rails, Critical Test Flows, Testing & Verification Guide — GrindLog, Verification Commands

### Community 146 - "Wo"
Cohesion: 0.10
Nodes (28): _a(), ai(), as(), cm(), Ct(), ds(), Es(), ff() (+20 more)

### Community 147 - "dx"
Cohesion: 0.07
Nodes (62): am(), ap(), ax(), Bn, cx(), de(), Dn(), dx() (+54 more)

### Community 149 - "Concerns, Technical Debt & Watch-Outs — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Database Waterfall Regressions, 2. White Theme CSS Overrides, 3. PWA Service Worker Cache Invalidation, 4. Mobile Keyboard & Viewport Layout Shifts, 5. Razorpay Webhook Idempotency & Webhook Retries, Concerns, Technical Debt & Watch-Outs — GrindLog

### Community 150 - "External Integrations & Services — GrindLog"
Cohesion: 0.25
Nodes (7): 1. Supabase (Database, Auth, Storage), 2. Razorpay (Payment Gateway), 3. Google Gemini AI (@google/genai), 4. PWA Service Worker (Next-PWA & Workbox), 5. Resend (Email Service), 6. Developer Tooling & Agent Workflow Suite, External Integrations & Services — GrindLog

### Community 151 - "Product & Technical Requirements — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Performance & Latency Requirements, 2. Workout & Fitness Requirements, 3. Nutrition & Diet Requirements, 4. Design & Mobile Experience Requirements, 5. Security & Billing Requirements, Product & Technical Requirements — GrindLog

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 158 - "next"
Cohesion: 0.04
Nodes (51): CustomExercisePage(), metadata, generateMetadata(), ProfileLoading(), ProgressLoading(), FitnessChatbot(), Message, BottomNav() (+43 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 164 - "createServerSupabase"
Cohesion: 0.04
Nodes (88): dynamic, POST(), POST(), POST(), GET(), GET(), GET(), GET() (+80 more)

## Knowledge Gaps
- **526 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+521 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 875 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `uc`, `_f`, `index-B23vSfwu.js`, `index-LDG-1p68.js`, `Ye`, `Ph`, `_c`, `index-Buds9Sm1.js`, `ff`, `st`, `index-DtLkR01C.js`, `tt`, `Bi`, `Wo`, `of`, `au`, `Ih`, `il`, `he`, `.add`, `ie`, `uc`, `uc`, `index-CqdT1wea.js`, `Q`, `fu`, `jn`, `Ot`, `et`, `of`, `n`, `Vo`, `Ta`, `r`, `le`, `Hi`, `Ih`, `.get`, `uc`, `vc`, `Ph`, `bt`, `uc`, `rf`, `l`, `Ih`, `_0`, `hl`, `zn`, `pc`, `ve`, `nu`, `yf`, `sf`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `index-B23vSfwu.js`, `st`, `tt`, `Bi`, `he`, `dx`, `r`, `fu`, `et`, `n`, `l`, `Ye`, `lf`, `vc`, `bf`, `Ph`, `sf`, `B`, `rf`, `D0`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `index-B23vSfwu.js`, `r`, `st`, `tt`, `Bi`, `dx`, `he`, `l`, `Q`, `fu`, `et`, `n`, `Ye`, `i`, `Hi`, `Ih`, `vc`, `M0`, `Ph`, `B`, `rf`, `ve`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._