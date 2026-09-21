# Graph Report - web  (2026-09-21)

## Corpus Check
- 402 files · ~3,419,751 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6297 nodes · 22380 edges · 183 communities (170 shown, 13 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a3f341f2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Hl
- _
- fitness.ts
- yf
- rf
- createServerSupabase
- Ph
- uc
- index-Buds9Sm1.js
- Ph
- types/index.ts
- wf
- progress-view.tsx
- index-DtLkR01C.js
- constants.ts
- sf
- Ih
- uc
- analyze/route.ts
- lucide-react
- createAdminClient
- Hi
- Ot
- Ih
- bl
- he
- r
- .add
- of
- zn
- ee
- ir
- l
- fu
- createClient
- hl
- index-CqdT1wea.js
- bt
- ir
- index-CoRpx3FC.js
- s
- index-x6K-DhKZ.js
- Q
- uc
- generate-draft/route.ts
- lf
- je
- jn
- dependencies
- fitness-plan-profile.ts
- Ih
- index-B23vSfwu.js
- et
- l
- wf
- react
- Ye
- Ye
- st
- l
- r
- app/package.json
- rf
- y0
- rf
- r
- access.ts
- onboarding-flow.tsx
- Ye
- navigation-context.tsx
- Pt
- We
- F
- AIPlanAnimation.tsx
- Ih
- .get
- fitness-notifications.ts
- sf
- vc
- sf
- uf
- M0
- uc
- Ph
- Ye
- Ye
- l
- Ye
- l
- r
- reminders-client.tsx
- rf
- sf
- devDependencies
- _0
- nn
- workout/page.tsx
- of
- import-usda-foundation-foods.mjs
- r
- n
- le
- Ih
- _0
- exercise-detail.tsx
- Wh
- Ft
- ve
- c0
- l
- Ph
- groq/client.ts
- Ye
- compilerOptions
- B
- l
- _0
- r
- D0
- i
- _0
- users-table-client.tsx
- nu
- manifest.json
- _0
- yf
- of
- sf
- (fitness)/page.tsx
- fitness-dashboard.tsx
- mi
- fitness-reminders/route.ts
- e
- fl
- ie
- profile-content.tsx
- r
- _0
- grocery-tab.tsx
- sf
- nutrition-view.tsx
- r
- tt
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- Ta
- index-BM9U1lvA.js
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- uc
- (fitness)/support/page.tsx
- progression.ts
- ff
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- plan-setup/page.tsx
- coach.ts
- package.json
- workout-heatmap.tsx
- firebase-messaging-sw.js
- Data import scripts
- nutrition-service.ts
- rules/graphify.md
- workflows/graphify.md
- scripts
- r
- Rs
- next-env.d.ts
- dl
- ai-insight-card.tsx
- gsap-C8IefbVz.js
- next-pwa.d.ts
- fitness/page.tsx
- supabase/middleware.ts
- Ms
- next.config.ts

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

### Community 0 - "Hl"
Cohesion: 0.11
Nodes (26): A0(), ai(), b0(), Cl(), cm(), co(), cs(), Es() (+18 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (122): _, aa, ac(), ao(), As, at, Be(), bn (+114 more)

### Community 2 - "fitness.ts"
Cohesion: 0.07
Nodes (53): completeExerciseSetsAction(), completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), quickCompleteWorkoutAction(), reopenWorkoutAction() (+45 more)

### Community 3 - "yf"
Cohesion: 0.26
Nodes (13): ch(), Dl(), hf(), hn(), jf(), jt(), Kt(), mn() (+5 more)

### Community 4 - "rf"
Cohesion: 0.13
Nodes (28): af(), ao(), ch(), cn(), fs(), Kl(), lf(), ls() (+20 more)

### Community 5 - "createServerSupabase"
Cohesion: 0.04
Nodes (74): exportUserData(), exportWorkoutHistoryCSV(), dynamic, POST(), POST(), POST(), deleteR2File(), deleteScanPhotosFromR2() (+66 more)

### Community 6 - "Ph"
Cohesion: 0.04
Nodes (84): Ph(), Bd(), bh(), Bl(), bm(), cd(), cf(), Cn() (+76 more)

### Community 7 - "uc"
Cohesion: 0.11
Nodes (30): bu(), er(), Fn(), ft(), gr(), Ic(), ir(), ju() (+22 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.06
Nodes (85): $, A, b, c(), D, e(), f, g (+77 more)

### Community 9 - "Ph"
Cohesion: 0.04
Nodes (78): Ph(), bc(), Bd(), bh(), Bl(), bm(), cd(), cf() (+70 more)

### Community 10 - "types/index.ts"
Cohesion: 0.04
Nodes (46): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem (+38 more)

### Community 11 - "wf"
Cohesion: 0.10
Nodes (27): A0(), aa(), ai(), Ba(), t(), Cl(), cm(), Ei() (+19 more)

### Community 12 - "progress-view.tsx"
Cohesion: 0.07
Nodes (42): GET(), app_assets_images_placeholder_goal, AchievementsShowcase(), ActivityRecoveryAnalyticsCard(), AIProgressReviewCard(), BodyMeasurementsList(), BodyProgressPhotos(), NutritionAnalyticsCard() (+34 more)

### Community 13 - "index-DtLkR01C.js"
Cohesion: 0.03
Nodes (161): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+153 more)

### Community 14 - "constants.ts"
Cohesion: 0.05
Nodes (88): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), GroceryPage(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps (+80 more)

### Community 15 - "sf"
Cohesion: 0.07
Nodes (38): bf(), Ct(), dc(), dd(), Fu(), gu(), Ii(), Je() (+30 more)

### Community 16 - "Ih"
Cohesion: 0.05
Nodes (72): Ih(), ad(), ai(), an(), b0(), bc(), bf(), cd() (+64 more)

### Community 17 - "uc"
Cohesion: 0.11
Nodes (30): a0(), bu(), er(), Fn(), ft(), gr(), i0(), Ic() (+22 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.11
Nodes (29): POST(), POST(), stableStringify(), stripImagePayload(), POST(), AIStartingReportPage(), displayValue(), dynamic (+21 more)

### Community 19 - "lucide-react"
Cohesion: 0.03
Nodes (29): createCouponAction(), toggleCouponStatusAction(), ClientCouponForm(), CopyButton(), AdminCouponsPage(), ToggleCouponButton(), FIELD_CONFIGS, FieldConfig (+21 more)

### Community 20 - "createAdminClient"
Cohesion: 0.05
Nodes (62): getPlanPricesAction(), updatePlanPricesAction(), checkUserPremiumStatusAction(), claimSpinDiscountAction(), createMessageTopUpOrder(), createRazorpayOrder(), getSpinSecret(), getUserPremiumDetailsAction() (+54 more)

### Community 21 - "Hi"
Cohesion: 0.08
Nodes (32): bm(), dc(), Dl(), ds(), ea(), $f(), G0(), Ga() (+24 more)

### Community 22 - "Ot"
Cohesion: 0.16
Nodes (32): Vx(), Vx(), ap(), Bn(), Bx, ep(), ex(), o() (+24 more)

### Community 23 - "Ih"
Cohesion: 0.06
Nodes (58): $h(), Ih(), as(), bh(), ds(), er(), Es(), Fa() (+50 more)

### Community 24 - "bl"
Cohesion: 0.06
Nodes (13): bl(), a(), hu(), il, jr, nl(), qr(), tl() (+5 more)

### Community 25 - "he"
Cohesion: 0.13
Nodes (28): $h(), ct(), el(), m(), ot(), r(), Re(), y() (+20 more)

### Community 26 - "r"
Cohesion: 0.11
Nodes (46): af(), At(), b0(), bh(), bu(), cn(), di(), Do() (+38 more)

### Community 27 - ".add"
Cohesion: 0.08
Nodes (14): af, Cn(), Gn, Gu(), kl(), ks(), _l(), me() (+6 more)

### Community 28 - "of"
Cohesion: 0.16
Nodes (22): ao(), ci(), ee(), ef(), Gl(), is(), Jr(), lo() (+14 more)

### Community 29 - "zn"
Cohesion: 0.12
Nodes (36): hx(), C(), E(), _a(), ad(), ar(), bd(), Bt() (+28 more)

### Community 30 - "ee"
Cohesion: 0.31
Nodes (13): c0(), cf(), ci(), ee(), ef(), is(), lo(), ml() (+5 more)

### Community 31 - "ir"
Cohesion: 0.18
Nodes (28): ot(), an(), bu(), di(), eh(), fi(), ft(), Gt() (+20 more)

### Community 32 - "l"
Cohesion: 0.07
Nodes (68): ad(), bf(), bi(), bo(), ch(), co(), cs(), Ct() (+60 more)

### Community 33 - "fu"
Cohesion: 0.06
Nodes (45): a0(), ds(), er(), Fa(), Fn(), ft(), gr(), I() (+37 more)

### Community 34 - "createClient"
Cohesion: 0.09
Nodes (25): approveFitnessPlanAdjustmentAction(), POST(), POST(), GET(), FitnessProPage(), metadata, ProfileSubscriptionProps, PricingCard() (+17 more)

### Community 35 - "hl"
Cohesion: 0.07
Nodes (66): ar(), bi(), bo(), co(), cs(), Ct(), dd(), df() (+58 more)

### Community 36 - "index-CqdT1wea.js"
Cohesion: 0.09
Nodes (57): am(), ap(), ax(), Bn, Bx, cx(), de(), Dn() (+49 more)

### Community 37 - "bt"
Cohesion: 0.12
Nodes (32): af(), ao(), da(), fs(), go(), Kl(), lf(), ls() (+24 more)

### Community 38 - "ir"
Cohesion: 0.19
Nodes (27): an(), bu(), di(), eh(), fi(), ft(), Gt(), ir() (+19 more)

### Community 39 - "index-CoRpx3FC.js"
Cohesion: 0.09
Nodes (56): am(), ap(), ax(), Bn, Bx, cm(), cx(), de() (+48 more)

### Community 40 - "s"
Cohesion: 0.16
Nodes (29): $h(), D(), di(), fi(), Hl(), oh(), Qu(), b() (+21 more)

### Community 41 - "index-x6K-DhKZ.js"
Cohesion: 0.06
Nodes (80): $, A, b, c(), D, e(), f, g (+72 more)

### Community 42 - "Q"
Cohesion: 0.08
Nodes (15): r0(), r0(), r0(), r0(), r0(), r0(), r0(), Ae() (+7 more)

### Community 43 - "uc"
Cohesion: 0.15
Nodes (19): as(), br(), cr(), Fn(), gr(), id(), Jc(), ju() (+11 more)

### Community 44 - "generate-draft/route.ts"
Cohesion: 0.06
Nodes (86): GET(), POST(), maxDuration, POST(), maxDuration, POST(), POST(), POST() (+78 more)

### Community 45 - "lf"
Cohesion: 0.21
Nodes (17): ao(), fs(), gi(), lf(), ms(), _o(), os(), Pa() (+9 more)

### Community 46 - "je"
Cohesion: 0.10
Nodes (29): At(), bi(), co(), cs(), eo(), e(), gi(), hs() (+21 more)

### Community 47 - "jn"
Cohesion: 0.08
Nodes (49): ao(), bi(), bo(), cs(), fo(), fs(), gi(), go() (+41 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "fitness-plan-profile.ts"
Cohesion: 0.09
Nodes (35): GenerateGroceryResponseSchema, POST(), AVAILABLE_FOOD_ALIASES, buildGoalCalorieTarget(), cleanText(), expectedMealCount(), FILLER_WORDS, hasForbiddenFood() (+27 more)

### Community 50 - "Ih"
Cohesion: 0.05
Nodes (69): Ih(), A0(), an(), as(), bc(), cd(), da(), er() (+61 more)

### Community 51 - "index-B23vSfwu.js"
Cohesion: 0.08
Nodes (68): am(), ap(), ax(), Bn, Bx, cm(), cx(), de() (+60 more)

### Community 52 - "et"
Cohesion: 0.04
Nodes (26): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), rr(), rr() (+18 more)

### Community 53 - "l"
Cohesion: 0.11
Nodes (60): ad(), an(), bf(), bo(), ch(), di(), eh(), fi() (+52 more)

### Community 54 - "wf"
Cohesion: 0.18
Nodes (13): aa(), Ba(), t(), Ei(), hd(), Ii(), ke(), Mi() (+5 more)

### Community 55 - "react"
Cohesion: 0.08
Nodes (22): loginAdminAction(), getUnreadNotificationsCountAction(), AdminLogin(), handleSubmit(), metadata, RootLayout(), viewport, Providers() (+14 more)

### Community 56 - "Ye"
Cohesion: 0.14
Nodes (29): hx(), E(), M(), _a(), ad(), bd(), dh(), dt() (+21 more)

### Community 57 - "Ye"
Cohesion: 0.17
Nodes (25): Bt(), Da(), dh(), dt(), ea(), fh(), gh(), hh() (+17 more)

### Community 58 - "st"
Cohesion: 0.14
Nodes (26): T0(), E0(), E0(), T0(), E0(), E0(), E0(), E0() (+18 more)

### Community 59 - "l"
Cohesion: 0.07
Nodes (72): At(), bi(), bo(), co(), cs(), Ct(), dd(), df() (+64 more)

### Community 60 - "r"
Cohesion: 0.09
Nodes (29): as(), c0(), da(), fh(), Fr(), Fu(), gd(), ge() (+21 more)

### Community 61 - "app/package.json"
Cohesion: 0.06
Nodes (34): framer-motion, name, private, version, clsx, eslint, eslint-config-next, groq-sdk (+26 more)

### Community 62 - "rf"
Cohesion: 0.11
Nodes (32): af(), ao(), At(), da(), fs(), gi(), Ia(), Kl() (+24 more)

### Community 63 - "y0"
Cohesion: 0.10
Nodes (27): bm(), Dl(), ea(), $f(), G0(), Ga(), Gf(), If() (+19 more)

### Community 64 - "rf"
Cohesion: 0.13
Nodes (29): af(), ao(), ch(), cn(), fs(), Hr(), Kl(), lf() (+21 more)

### Community 65 - "r"
Cohesion: 0.13
Nodes (45): ai(), b0(), bu(), di(), Do(), eh(), fi(), Fr() (+37 more)

### Community 66 - "access.ts"
Cohesion: 0.05
Nodes (36): POST(), CoachPage(), metadata, CustomExercisePage(), metadata, ExercisesPage(), metadata, ExerciseDetailPage() (+28 more)

### Community 67 - "onboarding-flow.tsx"
Cohesion: 0.08
Nodes (21): saveFitnessOnboardingAction(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_left (+13 more)

### Community 68 - "Ye"
Cohesion: 0.10
Nodes (36): _a(), ad(), Bt(), dt(), ed(), gc(), gh(), hh() (+28 more)

### Community 69 - "navigation-context.tsx"
Cohesion: 0.10
Nodes (20): BottomNav(), TodaysWorkoutCard(), TodaysWorkoutCardProps, NavigationContext, NavigationContextType, NavigationProvider(), useInstantNav(), 1. Performance Standards (Mobile 60fps Target) (+12 more)

### Community 70 - "Pt"
Cohesion: 0.17
Nodes (28): ap(), Bn(), Bx, ep(), ex(), o(), Ha, ip() (+20 more)

### Community 71 - "We"
Cohesion: 0.09
Nodes (33): A0(), bc(), cd(), Cn(), D(), en(), Es(), fl() (+25 more)

### Community 72 - "F"
Cohesion: 0.07
Nodes (5): C, F, I, k(), q

### Community 73 - "AIPlanAnimation.tsx"
Cohesion: 0.13
Nodes (24): AICharacter(), AICharacterProps, AIPlanAnimation(), AIPlanAnimationProps, DEFAULT_FALLBACK_PROFILE, PILL_CONFIGS, PillConfig, ProfileSummary (+16 more)

### Community 74 - "Ih"
Cohesion: 0.05
Nodes (74): Ih(), ad(), ah(), an(), b0(), bc(), bf(), bm() (+66 more)

### Community 75 - ".get"
Cohesion: 0.19
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "fitness-notifications.ts"
Cohesion: 0.22
Nodes (15): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), markAllNotificationsAsReadAction(), markNotificationAsReadAction() (+7 more)

### Community 77 - "sf"
Cohesion: 0.13
Nodes (19): ar(), Bt(), Fu(), ke(), la(), Ln(), md(), Mi() (+11 more)

### Community 78 - "vc"
Cohesion: 0.07
Nodes (26): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+18 more)

### Community 79 - "sf"
Cohesion: 0.14
Nodes (29): ao(), c0(), ci(), dn(), ee(), ef(), ha(), hc() (+21 more)

### Community 80 - "uf"
Cohesion: 0.11
Nodes (33): c0(), cf(), ci(), ee(), ef(), Fr(), Fu(), hc() (+25 more)

### Community 81 - "M0"
Cohesion: 0.10
Nodes (29): bc(), cd(), Cl(), cm(), D(), Hl(), ht(), hu() (+21 more)

### Community 82 - "uc"
Cohesion: 0.15
Nodes (19): as(), br(), cr(), Fn(), gr(), id(), Jc(), ju() (+11 more)

### Community 83 - "Ph"
Cohesion: 0.04
Nodes (73): Ph(), b0(), bh(), bm(), Bt(), cf(), Cl(), dc() (+65 more)

### Community 84 - "Ye"
Cohesion: 0.18
Nodes (24): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+16 more)

### Community 85 - "Ye"
Cohesion: 0.27
Nodes (21): Da(), dh(), dt(), ea(), gh(), hh(), jd(), mh() (+13 more)

### Community 86 - "l"
Cohesion: 0.08
Nodes (54): At(), bi(), bo(), ch(), co(), cs(), df(), eo() (+46 more)

### Community 87 - "Ye"
Cohesion: 0.18
Nodes (24): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+16 more)

### Community 88 - "l"
Cohesion: 0.11
Nodes (43): ar(), bf(), ch(), Ct(), dd(), df(), eo(), Gt() (+35 more)

### Community 89 - "r"
Cohesion: 0.13
Nodes (44): S, $h(), ct(), el(), g(), m(), ot(), r() (+36 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.13
Nodes (21): updateRemindersAction(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS, REMINDER_TYPES, ReminderTypeSheet() (+13 more)

### Community 91 - "rf"
Cohesion: 0.08
Nodes (50): as(), c0(), cf(), ci(), dn(), ds(), ee(), ef() (+42 more)

### Community 92 - "sf"
Cohesion: 0.12
Nodes (31): ao(), c0(), ci(), dn(), ee(), ef(), ha(), hc() (+23 more)

### Community 93 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 94 - "_0"
Cohesion: 0.17
Nodes (24): _0(), ai(), Cl(), cm(), D0(), dn(), Ei(), fe() (+16 more)

### Community 95 - "nn"
Cohesion: 0.09
Nodes (11): ar(), en(), ja(), ls(), nn(), Oi(), ol(), ru (+3 more)

### Community 96 - "workout/page.tsx"
Cohesion: 0.08
Nodes (19): CustomExerciseForm(), ExerciseBrowser(), ExerciseBrowserContent(), exerciseCache, LibraryExercise, PlanGeneration(), app_components_fitness_pro_upgrade_modal_proupgrademodal, ProUpgradeModalProps (+11 more)

### Community 97 - "of"
Cohesion: 0.16
Nodes (24): af(), At(), ed(), fs(), io(), Kl(), ls(), ms() (+16 more)

### Community 98 - "import-usda-foundation-foods.mjs"
Cohesion: 0.11
Nodes (17): buildRow(), DEFAULT_JSON_PATH, dryRun, findRecord(), IMPORT_MAP, missing, nutrient(), payload (+9 more)

### Community 99 - "r"
Cohesion: 0.10
Nodes (31): as(), c0(), da(), Fr(), gd(), ge(), hc(), hd() (+23 more)

### Community 100 - "n"
Cohesion: 0.09
Nodes (19): bo(), n(), Co(), df(), Fi(), hf(), ic(), ku() (+11 more)

### Community 101 - "le"
Cohesion: 0.10
Nodes (45): At(), Ba(), t(), ch(), co(), Ct(), dd(), df() (+37 more)

### Community 102 - "Ih"
Cohesion: 0.04
Nodes (79): Ih(), A0(), an(), bf(), bh(), bm(), Bt(), cn() (+71 more)

### Community 103 - "_0"
Cohesion: 0.23
Nodes (19): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+11 more)

### Community 104 - "exercise-detail.tsx"
Cohesion: 0.13
Nodes (21): ExerciseAnimationPlayer(), ExerciseAnimationPlayerProps, BODYWEIGHT_KEYWORDS, ExerciseDetail(), generateInstructions(), isBodyweightExercise(), playRestDoneChime(), Exercise (+13 more)

### Community 105 - "Wh"
Cohesion: 0.16
Nodes (24): $h(), hx(), C(), E(), bd(), D(), dh(), fh() (+16 more)

### Community 106 - "Ft"
Cohesion: 0.18
Nodes (19): _0(), cf(), ci(), Dl(), ee(), ef(), hc(), hi() (+11 more)

### Community 107 - "ve"
Cohesion: 0.14
Nodes (33): _0(), cf(), ci(), D0(), Dl(), dn(), ee(), ef() (+25 more)

### Community 108 - "c0"
Cohesion: 0.15
Nodes (24): bs(), bs(), bs(), bs(), c0(), D0(), df(), fe() (+16 more)

### Community 109 - "l"
Cohesion: 0.08
Nodes (62): ad(), bf(), bi(), bo(), ch(), Ct(), Dl(), eo() (+54 more)

### Community 110 - "Ph"
Cohesion: 0.05
Nodes (65): Ih(), Ph(), aa(), ad(), ar(), bf(), bh(), bm() (+57 more)

### Community 111 - "groq/client.ts"
Cohesion: 0.22
Nodes (10): GET(), AiWorkoutCoachService, generateAIResponse(), generateAIResponseJSON(), getGroqApiKeys(), getGroqClient(), getGroqClientForKey(), GROQ_MODELS (+2 more)

### Community 112 - "Ye"
Cohesion: 0.18
Nodes (24): Bt(), Da(), dh(), dt(), ea(), gh(), hh(), jd() (+16 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "B"
Cohesion: 0.15
Nodes (30): bd(), Da(), dh(), dt(), ea(), fh(), gc(), gh() (+22 more)

### Community 115 - "l"
Cohesion: 0.11
Nodes (57): bu(), Ct(), dd(), df(), di(), eo(), fi(), Gt() (+49 more)

### Community 116 - "_0"
Cohesion: 0.16
Nodes (24): _0(), D0(), df(), ds(), fe(), ff(), Gc(), Gl() (+16 more)

### Community 117 - "r"
Cohesion: 0.13
Nodes (29): $h(), ct(), el(), g(), m(), r(), Re(), zt() (+21 more)

### Community 118 - "D0"
Cohesion: 0.26
Nodes (17): D0(), dn(), Ei(), fe(), ff(), Fl(), Gl(), Gn() (+9 more)

### Community 119 - "i"
Cohesion: 0.13
Nodes (24): bm(), Do(), ea(), $f(), G0(), Ga(), Gf(), If() (+16 more)

### Community 120 - "_0"
Cohesion: 0.24
Nodes (18): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+10 more)

### Community 121 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 122 - "nu"
Cohesion: 0.11
Nodes (8): eu(), gf, ir(), jf(), nu, qu(), Rn(), Ss()

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "_0"
Cohesion: 0.24
Nodes (18): _0(), D0(), Ei(), fe(), ff(), gd(), Gl(), Gn() (+10 more)

### Community 125 - "yf"
Cohesion: 0.20
Nodes (7): hc, kc(), lc, mf(), ro, vf(), yf

### Community 126 - "of"
Cohesion: 0.17
Nodes (22): af(), At(), fs(), hn(), Kl(), ls(), ms(), nf() (+14 more)

### Community 127 - "sf"
Cohesion: 0.07
Nodes (51): _0(), A0(), ai(), as(), bc(), Bl(), cd(), cm() (+43 more)

### Community 128 - "(fitness)/page.tsx"
Cohesion: 0.13
Nodes (13): fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), AdminSupportInbox(), DashboardSkeleton(), FitnessDashboard(), HorizontalCalendar(), HorizontalCalendarProps (+5 more)

### Community 129 - "fitness-dashboard.tsx"
Cohesion: 0.16
Nodes (13): DailyActivityCard(), DailyActivityCardProps, ExerciseLibraryCard(), FitnessDashboardProps, ProNutritionGenerationCard(), TransformationCard(), TransformationCardProps, BillingManagementClientProps (+5 more)

### Community 130 - "mi"
Cohesion: 0.17
Nodes (20): c0(), cf(), ci(), ee(), ef(), Fu(), hc(), hi() (+12 more)

### Community 131 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 132 - "e"
Cohesion: 0.16
Nodes (19): At(), bi(), bo(), fo(), gs(), ho(), hs(), Ii() (+11 more)

### Community 133 - "fl"
Cohesion: 0.07
Nodes (41): A0(), an(), bc(), cd(), Cl(), cm(), cn(), D() (+33 more)

### Community 134 - "ie"
Cohesion: 0.10
Nodes (32): bi(), bo(), co(), cs(), fo(), go(), gs(), ho() (+24 more)

### Community 135 - "profile-content.tsx"
Cohesion: 0.20
Nodes (12): toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), RoadmapPage(), MyDetailsContent(), ProfileContentProps, ProfileContent(), ProfileContentProps, compressImage() (+4 more)

### Community 136 - "r"
Cohesion: 0.14
Nodes (42): ai(), b0(), bu(), di(), Do(), eh(), fi(), Fr() (+34 more)

### Community 137 - "_0"
Cohesion: 0.14
Nodes (27): _0(), D0(), df(), ds(), fe(), ff(), Gc(), Gl() (+19 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 139 - "sf"
Cohesion: 0.14
Nodes (18): ah(), ar(), Bt(), ke(), la(), Ln(), md(), Mi() (+10 more)

### Community 140 - "nutrition-view.tsx"
Cohesion: 0.06
Nodes (38): TodaysGoalsCard(), TodaysGoalsCardProps, formatFoodItem(), TodaysNutritionCard(), TodaysNutritionCardProps, FoodAvatar(), FoodAvatarProps, Food (+30 more)

### Community 141 - "r"
Cohesion: 0.13
Nodes (31): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+23 more)

### Community 142 - "tt"
Cohesion: 0.14
Nodes (14): ai(), Cl(), Do(), Fa(), G0(), li(), qo(), rm() (+6 more)

### Community 143 - "Key Architectural Patterns"
Cohesion: 0.22
Nodes (8): 1. Parallel Batching vs. Sequential Waterfalls, 2. In-Memory Calendar & Status Math, 3. Immediate Suspense Streaming, 4. Router Caching & Optimistic Tab Transitions, 5. Theme Architecture (Dark & White), Architectural Overview, Architecture & Data Flow — GrindLog, Key Architectural Patterns

### Community 144 - "Technology Stack — GrindLog"
Cohesion: 0.22
Nodes (8): AI & LLM Integrations, Core Runtime & Framework, Data Layer & State, Mobile & PWA, Payments & Subscriptions, Styling & Design System, Technology Stack — GrindLog, Utilities & Validation

### Community 145 - "Critical Test Flows"
Cohesion: 0.22
Nodes (8): 1. Tab Navigation & Instant Switching, 2. Dual-Theme Verification (Dark vs. White), 3. Workout Logging & State Persistence, 4. Nutrition & Calorie Tracking, 5. Authentication & Subscription Guard Rails, Critical Test Flows, Testing & Verification Guide — GrindLog, Verification Commands

### Community 146 - "Ta"
Cohesion: 0.14
Nodes (25): _a(), af(), ds(), fs(), G0(), io(), kr(), _o() (+17 more)

### Community 147 - "index-BM9U1lvA.js"
Cohesion: 0.07
Nodes (71): H, app_public_assets_icons_buvcj6jz_m, am(), ap(), ax(), Bn, Bx, cx() (+63 more)

### Community 149 - "Concerns, Technical Debt & Watch-Outs — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Database Waterfall Regressions, 2. White Theme CSS Overrides, 3. PWA Service Worker Cache Invalidation, 4. Mobile Keyboard & Viewport Layout Shifts, 5. Razorpay Webhook Idempotency & Webhook Retries, Concerns, Technical Debt & Watch-Outs — GrindLog

### Community 150 - "External Integrations & Services — GrindLog"
Cohesion: 0.25
Nodes (7): 1. Supabase (Database, Auth, Storage), 2. Razorpay (Payment Gateway), 3. Google Gemini AI (@google/genai), 4. PWA Service Worker (Next-PWA & Workbox), 5. Resend (Email Service), 6. Developer Tooling & Agent Workflow Suite, External Integrations & Services — GrindLog

### Community 151 - "Product & Technical Requirements — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Performance & Latency Requirements, 2. Workout & Fitness Requirements, 3. Nutrition & Diet Requirements, 4. Design & Mobile Experience Requirements, 5. Security & Billing Requirements, Product & Technical Requirements — GrindLog

### Community 152 - "uc"
Cohesion: 0.18
Nodes (14): as(), Fn(), gr(), I(), jc(), ju(), ld(), pr() (+6 more)

### Community 153 - "(fitness)/support/page.tsx"
Cohesion: 0.26
Nodes (9): getUserSupportMessages(), submitSupportMessage(), dynamic, FitnessSupportPage(), revalidate, SUPPORT_CATEGORIES, SupportClient(), SupportClientProps (+1 more)

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 158 - "plan-setup/page.tsx"
Cohesion: 0.27
Nodes (11): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+3 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 161 - "workout-heatmap.tsx"
Cohesion: 0.24
Nodes (9): CellData, DAY_LABELS, formatDate(), getIntensityClass(), HeatmapCell, HeatmapProps, INTENSITY_COLORS, MONTH_LABELS (+1 more)

### Community 164 - "nutrition-service.ts"
Cohesion: 0.07
Nodes (43): DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES, GET(), ALLOWED_MEAL_TYPES, GET(), isDietCompatible() (+35 more)

### Community 168 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, import:usda, lint, start, type-check

### Community 169 - "r"
Cohesion: 0.07
Nodes (47): aa(), ar(), br(), bu(), cr(), er(), Fn(), ft() (+39 more)

### Community 170 - "Rs"
Cohesion: 0.20
Nodes (9): bf(), Ci(), Gt(), H(), If(), ql(), Rs(), to() (+1 more)

### Community 175 - "dl"
Cohesion: 0.25
Nodes (4): dl(), pl, qi, sn()

### Community 176 - "ai-insight-card.tsx"
Cohesion: 0.40
Nodes (3): PlanAdjustment, ProgressReview, WeeklyWorkoutStats

### Community 177 - "gsap-C8IefbVz.js"
Cohesion: 0.38
Nodes (4): e(), Ml(), Ol(), tr()

### Community 179 - "fitness/page.tsx"
Cohesion: 0.43
Nodes (5): FitnessTableClient(), FitnessUserDetails, formatDate(), dynamic, FitnessAdminDashboard()

### Community 180 - "supabase/middleware.ts"
Cohesion: 0.38
Nodes (5): config, updateSession(), config, middleware(), @supabase/ssr

### Community 181 - "Ms"
Cohesion: 0.33
Nodes (7): go(), gs(), po(), Wa(), xo(), Ms(), rt

### Community 182 - "next.config.ts"
Cohesion: 0.40
Nodes (4): config, filteredRuntimeCaching, nextConfig, @ducanh2912/next-pwa

## Knowledge Gaps
- **519 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+514 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 868 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `mi`, `fl`, `ie`, `uc`, `index-Buds9Sm1.js`, `index-DtLkR01C.js`, `tt`, `sf`, `uc`, `Ta`, `index-BM9U1lvA.js`, `of`, `Hi`, `Ot`, `Ih`, `uc`, `he`, `bl`, `.add`, `ff`, `of`, `zn`, `fu`, `hl`, `index-CqdT1wea.js`, `bt`, `index-CoRpx3FC.js`, `index-x6K-DhKZ.js`, `Q`, `uc`, `Rs`, `r`, `dl`, `jn`, `Ih`, `index-B23vSfwu.js`, `et`, `Ms`, `st`, `r`, `Pt`, `.get`, `vc`, `uc`, `Ph`, `Ye`, `rf`, `nn`, `n`, `le`, `_0`, `Ft`, `ve`, `c0`, `l`, `nu`, `yf`, `sf`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `fl`, `index-DtLkR01C.js`, `tt`, `uc`, `Ih`, `index-CoRpx3FC.js`, `s`, `index-x6K-DhKZ.js`, `et`, `st`, `l`, `rf`, `sf`, `vc`, `Ph`, `Ye`, `r`, `n`, `ve`, `c0`, `B`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `fl`, `ie`, `index-DtLkR01C.js`, `Hi`, `Ih`, `r`, `fu`, `index-x6K-DhKZ.js`, `Q`, `lf`, `et`, `st`, `Ye`, `vc`, `uf`, `Ph`, `l`, `_0`, `n`, `Wh`, `c0`, `B`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._