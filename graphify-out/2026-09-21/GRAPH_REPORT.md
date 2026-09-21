# Graph Report - web  (2026-09-21)

## Corpus Check
- 402 files · ~3,418,299 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6300 nodes · 22370 edges · 179 communities (167 shown, 12 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `29884bad`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- nutrition-service.ts
- _
- fitness.ts
- progress-view.tsx
- uf
- (fitness)/page.tsx
- Ph
- Ph
- index-Buds9Sm1.js
- Ph
- types/index.ts
- le
- lucide-react
- index-LDG-1p68.js
- constants.ts
- index-B23vSfwu.js
- Ih
- uc
- analyze/route.ts
- app/package.json
- createAdminClient
- Ih
- index-DtLkR01C.js
- uc
- il
- r
- r
- .add
- Ta
- rf
- l
- lf
- nf
- motion
- access.ts
- l
- dx
- M0
- n
- Ot
- r
- dx
- _f
- r
- generate-draft/route.ts
- lf
- l
- sf
- dependencies
- Ye
- r0
- dx
- et
- n
- ai-insight-service.ts
- uc
- Ye
- B
- st
- l
- r
- l
- rf
- Ih
- rf
- r
- sf
- onboarding-flow.tsx
- Ye
- yf
- y0
- fu
- F
- AIPlanAnimation.tsx
- Ih
- .get
- fitness-notifications.ts
- Ye
- vc
- of
- Wh
- y0
- $h
- Ph
- kf
- Ye
- sf
- Ye
- sf
- r
- reminders-client.tsx
- ee
- r
- devDependencies
- _0
- tu
- bt
- Wh
- import-usda-foundation-foods.mjs
- users-table-client.tsx
- n
- l
- Ih
- _0
- he
- uc
- ee
- D0
- c0
- l
- tt
- Hi
- Ye
- compilerOptions
- sf
- l
- _0
- ku
- Ms
- ue
- ve
- i
- nu
- manifest.json
- _0
- yf
- dx
- of
- react
- wf
- fitness-dashboard.tsx
- fitness-reminders/route.ts
- lf
- ue
- l
- af
- r
- _0
- grocery-tab.tsx
- profile-content.tsx
- nutrition-view.tsx
- xf
- Q
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- plan-setup/page.tsx
- dx
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- ya
- uf
- progression.ts
- add-scan/route.ts
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- swap-meal/route.ts
- coach.ts
- package.json
- Os
- firebase-messaging-sw.js
- Data import scripts
- createServerSupabase
- rules/graphify.md
- workflows/graphify.md
- scripts
- workout-heatmap.tsx
- next.config.ts
- next-env.d.ts
- supabase/middleware.ts
- gsap-C8IefbVz.js
- ai-insight-card.tsx
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
- `Phase 1: Core Performance & Tab Optimization [COMPLETED]` --references--> `BottomNav()`  [INFERRED]
  .planning/ROADMAP.md → app/components/fitness/dashboard/bottom-nav.tsx
- `Recent Decisions` --references--> `FitnessShell()`  [INFERRED]
  .planning/STATE.md → app/components/fitness/fitness-shell.tsx

## Import Cycles
- None detected.

## Communities (179 total, 12 thin omitted)

### Community 0 - "nutrition-service.ts"
Cohesion: 0.07
Nodes (41): GET(), POST(), DELETE(), DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES, GET() (+33 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (122): _, aa, ac(), al(), ao(), As, at, Be() (+114 more)

### Community 2 - "fitness.ts"
Cohesion: 0.05
Nodes (73): completeExerciseSetsAction(), completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), quickCompleteWorkoutAction(), reopenWorkoutAction() (+65 more)

### Community 3 - "progress-view.tsx"
Cohesion: 0.08
Nodes (32): app_assets_images_placeholder_goal, AchievementsShowcase(), ActivityRecoveryAnalyticsCard(), AIProgressReviewCard(), BodyMeasurementsList(), BodyProgressPhotos(), NutritionAnalyticsCard(), getPeriodDescription() (+24 more)

### Community 4 - "uf"
Cohesion: 0.10
Nodes (35): _0(), as(), c0(), ci(), Dl(), ee(), ef(), Fr() (+27 more)

### Community 5 - "(fitness)/page.tsx"
Cohesion: 0.04
Nodes (38): NutritionLoading(), dynamic, NutritionContent(), dynamic, ProfileLoading(), ProgressLoading(), ActiveWorkoutContent(), dynamic (+30 more)

### Community 6 - "Ph"
Cohesion: 0.05
Nodes (70): Ih(), Ph(), Bd(), bh(), Bl(), bm(), cd(), cf() (+62 more)

### Community 7 - "Ph"
Cohesion: 0.04
Nodes (91): Ph(), A0(), ad(), ai(), as(), bc(), bf(), cd() (+83 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.06
Nodes (82): $, A, b, c(), D, e(), f, g (+74 more)

### Community 9 - "Ph"
Cohesion: 0.04
Nodes (81): Ph(), bc(), Bd(), Bl(), bm(), br(), cd(), Cn() (+73 more)

### Community 10 - "types/index.ts"
Cohesion: 0.06
Nodes (36): ForgotPasswordPage(), ResetPasswordPage(), SignInContent(), SignUpContent(), RoadmapPage(), Providers(), FitnessThemeProvider(), PlanPreview() (+28 more)

### Community 11 - "le"
Cohesion: 0.09
Nodes (41): b0(), bf(), Ct(), dc(), df(), gu(), hf(), hn() (+33 more)

### Community 12 - "lucide-react"
Cohesion: 0.03
Nodes (35): loginAdminAction(), createCouponAction(), toggleCouponStatusAction(), ClientCouponForm(), CopyButton(), AdminCouponsPage(), ToggleCouponButton(), FitnessTableClient() (+27 more)

### Community 13 - "index-LDG-1p68.js"
Cohesion: 0.04
Nodes (118): $, A, b, c(), D, e(), f, g (+110 more)

### Community 14 - "constants.ts"
Cohesion: 0.05
Nodes (89): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), GroceryPage(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps (+81 more)

### Community 15 - "index-B23vSfwu.js"
Cohesion: 0.06
Nodes (87): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+79 more)

### Community 16 - "Ih"
Cohesion: 0.04
Nodes (98): Ih(), ad(), ah(), ai(), an(), bc(), bm(), cd() (+90 more)

### Community 17 - "uc"
Cohesion: 0.10
Nodes (33): a0(), bu(), er(), Fa(), Fn(), ft(), gr(), i0() (+25 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.08
Nodes (38): POST(), POST(), stableStringify(), stripImagePayload(), POST(), AIStartingReportPage(), displayValue(), dynamic (+30 more)

### Community 19 - "app/package.json"
Cohesion: 0.06
Nodes (34): framer-motion, name, private, version, clsx, eslint, eslint-config-next, groq-sdk (+26 more)

### Community 20 - "createAdminClient"
Cohesion: 0.05
Nodes (71): getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), checkUserPremiumStatusAction(), claimSpinDiscountAction(), createMessageTopUpOrder() (+63 more)

### Community 21 - "Ih"
Cohesion: 0.06
Nodes (53): Ih(), as(), ds(), er(), Es(), Fa(), Fn(), ft() (+45 more)

### Community 22 - "index-DtLkR01C.js"
Cohesion: 0.09
Nodes (58): am(), ap(), ax(), Bn(), Bx, Cc(), cx(), de() (+50 more)

### Community 23 - "uc"
Cohesion: 0.09
Nodes (37): as(), bu(), er(), Fn(), ft(), gr(), I(), Ic() (+29 more)

### Community 24 - "il"
Cohesion: 0.06
Nodes (13): du(), Fn(), hu(), il, jr, ma(), mu(), nl() (+5 more)

### Community 25 - "r"
Cohesion: 0.15
Nodes (25): $h(), ct(), el(), m(), r(), Re(), y(), zt() (+17 more)

### Community 26 - "r"
Cohesion: 0.13
Nodes (44): af(), b0(), bh(), bu(), di(), Do(), eh(), fi() (+36 more)

### Community 27 - ".add"
Cohesion: 0.09
Nodes (12): af, Cn(), Gn, Gu(), kl(), _l(), me(), Mn (+4 more)

### Community 28 - "Ta"
Cohesion: 0.07
Nodes (47): A0(), ai(), b0(), Ba(), t(), bf(), ch(), Cl() (+39 more)

### Community 29 - "rf"
Cohesion: 0.07
Nodes (56): At(), c0(), cf(), ci(), Dl(), dn(), ds(), ee() (+48 more)

### Community 30 - "l"
Cohesion: 0.08
Nodes (54): At(), bi(), bo(), ch(), co(), cs(), df(), eo() (+46 more)

### Community 31 - "lf"
Cohesion: 0.25
Nodes (15): ao(), fs(), gi(), Gt(), lf(), ms(), _o(), os() (+7 more)

### Community 32 - "nf"
Cohesion: 0.13
Nodes (38): ot(), an(), bh(), Bt(), bu(), di(), eh(), fi() (+30 more)

### Community 33 - "motion"
Cohesion: 0.07
Nodes (25): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem (+17 more)

### Community 34 - "access.ts"
Cohesion: 0.06
Nodes (55): approveFitnessPlanAdjustmentAction(), dynamic, GET(), POST(), revalidate, POST(), GenerateGroceryResponseSchema, POST() (+47 more)

### Community 35 - "l"
Cohesion: 0.11
Nodes (40): ar(), bi(), bo(), co(), cs(), df(), eo(), fo() (+32 more)

### Community 36 - "dx"
Cohesion: 0.08
Nodes (47): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+39 more)

### Community 37 - "M0"
Cohesion: 0.11
Nodes (27): A0(), ai(), an(), bc(), cd(), Cl(), cm(), D() (+19 more)

### Community 38 - "n"
Cohesion: 0.15
Nodes (38): $h(), ct(), el(), g(), m(), ot(), Re(), zt() (+30 more)

### Community 39 - "Ot"
Cohesion: 0.07
Nodes (74): Xx(), Yx(), Xx(), Yx(), Vx(), am(), ap(), ax() (+66 more)

### Community 40 - "r"
Cohesion: 0.09
Nodes (54): as(), c0(), di(), fi(), Fr(), ge(), Gt(), hd() (+46 more)

### Community 41 - "dx"
Cohesion: 0.08
Nodes (47): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+39 more)

### Community 42 - "_f"
Cohesion: 0.28
Nodes (6): Ae(), br(), cr, _f(), Un, Xo

### Community 43 - "r"
Cohesion: 0.12
Nodes (27): aa(), ar(), Bt(), ge(), hd(), ju(), ke(), Ln() (+19 more)

### Community 44 - "generate-draft/route.ts"
Cohesion: 0.05
Nodes (101): GET(), maxDuration, POST(), maxDuration, POST(), POST(), POST(), generateProNutritionLayer() (+93 more)

### Community 45 - "lf"
Cohesion: 0.19
Nodes (19): ao(), fs(), gi(), Kf(), lf(), ms(), no(), _o() (+11 more)

### Community 46 - "l"
Cohesion: 0.07
Nodes (57): At(), b0(), bf(), bi(), bo(), ch(), co(), en() (+49 more)

### Community 47 - "sf"
Cohesion: 0.10
Nodes (24): aa(), Bt(), ed(), $f(), If(), Jn(), ke(), lh() (+16 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "Ye"
Cohesion: 0.17
Nodes (25): hx(), C(), E(), _a(), bd(), dh(), dt(), fh() (+17 more)

### Community 50 - "r0"
Cohesion: 0.11
Nodes (22): ah(), bm(), Dl(), ds(), ea(), $f(), G0(), Ga() (+14 more)

### Community 51 - "dx"
Cohesion: 0.09
Nodes (46): am(), ap(), ax(), Bn, cm(), de(), Dn(), dx() (+38 more)

### Community 52 - "et"
Cohesion: 0.04
Nodes (22): Bl(), Bl(), Bl(), bm(), Bl(), rr(), Bl(), rr() (+14 more)

### Community 53 - "n"
Cohesion: 0.16
Nodes (38): ot(), ad(), an(), di(), eh(), fi(), go(), gs() (+30 more)

### Community 54 - "ai-insight-service.ts"
Cohesion: 0.11
Nodes (22): GET(), POST(), GET(), POST(), ProgressPage(), activeUserGenerations, AIInsightService, DAILY_AI_REVIEW_LIMIT (+14 more)

### Community 55 - "uc"
Cohesion: 0.11
Nodes (29): a0(), er(), Fn(), ft(), gr(), i0(), Ic(), ir() (+21 more)

### Community 56 - "Ye"
Cohesion: 0.11
Nodes (35): hx(), E(), M(), _a(), ad(), bd(), Bt(), dh() (+27 more)

### Community 57 - "B"
Cohesion: 0.13
Nodes (42): Da(), dt(), ea(), gc(), gh(), hh(), jd(), mh() (+34 more)

### Community 58 - "st"
Cohesion: 0.11
Nodes (32): T0(), E0(), bo(), E0(), on(), qo(), T0(), E0() (+24 more)

### Community 59 - "l"
Cohesion: 0.11
Nodes (39): ar(), At(), Ct(), dd(), df(), eo(), hf(), hn() (+31 more)

### Community 60 - "r"
Cohesion: 0.12
Nodes (39): $h(), Bt(), D(), di(), fi(), ge(), Ln(), lr() (+31 more)

### Community 61 - "l"
Cohesion: 0.08
Nodes (65): ad(), af(), bi(), bo(), cf(), cs(), Ct(), en() (+57 more)

### Community 62 - "rf"
Cohesion: 0.10
Nodes (34): af(), ao(), At(), da(), fs(), gi(), go(), Ia() (+26 more)

### Community 63 - "Ih"
Cohesion: 0.06
Nodes (55): Ih(), as(), ds(), er(), Es(), Fa(), Fn(), ft() (+47 more)

### Community 64 - "rf"
Cohesion: 0.12
Nodes (37): af(), ao(), bi(), bo(), ch(), Do(), fo(), fs() (+29 more)

### Community 65 - "r"
Cohesion: 0.10
Nodes (55): af(), b0(), bh(), bu(), cn(), da(), di(), Do() (+47 more)

### Community 66 - "sf"
Cohesion: 0.07
Nodes (46): A0(), ai(), b0(), bc(), Cl(), cm(), co(), cs() (+38 more)

### Community 67 - "onboarding-flow.tsx"
Cohesion: 0.08
Nodes (21): saveFitnessOnboardingAction(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_left (+13 more)

### Community 68 - "Ye"
Cohesion: 0.17
Nodes (25): hx(), C(), E(), _a(), bd(), dh(), dt(), fh() (+17 more)

### Community 69 - "yf"
Cohesion: 0.29
Nodes (12): ch(), hf(), hn(), jf(), jt(), Kt(), mn(), Na() (+4 more)

### Community 70 - "y0"
Cohesion: 0.09
Nodes (28): bm(), Dl(), ea(), $f(), G0(), Ga(), Gf(), If() (+20 more)

### Community 71 - "fu"
Cohesion: 0.06
Nodes (45): A0(), an(), bc(), cd(), Cl(), cm(), D(), Es() (+37 more)

### Community 72 - "F"
Cohesion: 0.07
Nodes (5): C, F, I, k(), q

### Community 73 - "AIPlanAnimation.tsx"
Cohesion: 0.13
Nodes (24): AICharacter(), AICharacterProps, AIPlanAnimation(), AIPlanAnimationProps, DEFAULT_FALLBACK_PROFILE, PILL_CONFIGS, PillConfig, ProfileSummary (+16 more)

### Community 74 - "Ih"
Cohesion: 0.05
Nodes (72): Ih(), ad(), an(), b0(), bc(), bf(), Bt(), cd() (+64 more)

### Community 75 - ".get"
Cohesion: 0.19
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "fitness-notifications.ts"
Cohesion: 0.22
Nodes (15): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), markAllNotificationsAsReadAction(), markNotificationAsReadAction() (+7 more)

### Community 77 - "Ye"
Cohesion: 0.16
Nodes (24): _a(), bh(), dt(), Fu(), gc(), gh(), hh(), jd() (+16 more)

### Community 78 - "vc"
Cohesion: 0.05
Nodes (38): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+30 more)

### Community 79 - "of"
Cohesion: 0.10
Nodes (39): ao(), At(), bo(), c0(), ci(), ee(), ef(), ha() (+31 more)

### Community 80 - "Wh"
Cohesion: 0.27
Nodes (14): $h(), w(), X(), r(), rx(), Wh(), ct(), el() (+6 more)

### Community 81 - "y0"
Cohesion: 0.09
Nodes (28): bm(), Dl(), ea(), $f(), G0(), Ga(), Gf(), If() (+20 more)

### Community 82 - "$h"
Cohesion: 0.17
Nodes (22): $h(), ct(), el(), g(), m(), r(), Re(), zt() (+14 more)

### Community 83 - "Ph"
Cohesion: 0.05
Nodes (71): Ph(), ar(), as(), bh(), br(), Bt(), bu(), cr() (+63 more)

### Community 84 - "kf"
Cohesion: 0.13
Nodes (22): bm(), dc(), ed(), _f(), gu(), If(), Jn(), Kf() (+14 more)

### Community 85 - "Ye"
Cohesion: 0.14
Nodes (29): aa(), Da(), dh(), dt(), ea(), fh(), gh(), hh() (+21 more)

### Community 86 - "sf"
Cohesion: 0.14
Nodes (21): bf(), Ct(), dc(), dd(), gu(), Ii(), Je(), Jl() (+13 more)

### Community 87 - "Ye"
Cohesion: 0.17
Nodes (25): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+17 more)

### Community 88 - "sf"
Cohesion: 0.14
Nodes (21): bf(), Ct(), dc(), dd(), gu(), Ii(), Je(), Jl() (+13 more)

### Community 89 - "r"
Cohesion: 0.14
Nodes (39): S, af(), an(), b0(), bh(), bu(), di(), Do() (+31 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.18
Nodes (15): updateRemindersAction(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS, REMINDER_TYPES, ReminderTypeSheet() (+7 more)

### Community 91 - "ee"
Cohesion: 0.16
Nodes (22): _0(), cf(), ci(), cs(), ee(), ef(), gs(), ho() (+14 more)

### Community 92 - "r"
Cohesion: 0.09
Nodes (39): ar(), as(), At(), dn(), Fu(), Gc(), ge(), gr() (+31 more)

### Community 93 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 94 - "_0"
Cohesion: 0.25
Nodes (18): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), Gl() (+10 more)

### Community 95 - "tu"
Cohesion: 0.06
Nodes (13): ar(), en(), H(), ja(), ls(), nn(), Oi(), ol() (+5 more)

### Community 96 - "bt"
Cohesion: 0.10
Nodes (35): af(), ao(), At(), ch(), cn(), da(), fs(), gi() (+27 more)

### Community 97 - "Wh"
Cohesion: 0.27
Nodes (14): $h(), w(), X(), r(), rx(), Wh(), ct(), el() (+6 more)

### Community 98 - "import-usda-foundation-foods.mjs"
Cohesion: 0.11
Nodes (17): buildRow(), DEFAULT_JSON_PATH, dryRun, findRecord(), IMPORT_MAP, missing, nutrient(), payload (+9 more)

### Community 99 - "users-table-client.tsx"
Cohesion: 0.17
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 100 - "n"
Cohesion: 0.10
Nodes (12): bo(), n(), Co(), Fi(), nf(), pl, qi, qn() (+4 more)

### Community 101 - "l"
Cohesion: 0.07
Nodes (65): ar(), Ba(), t(), bi(), ch(), co(), cs(), Ct() (+57 more)

### Community 102 - "Ih"
Cohesion: 0.06
Nodes (51): Ih(), bf(), bh(), bm(), cn(), dc(), ds(), ea() (+43 more)

### Community 103 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), Gl() (+9 more)

### Community 104 - "he"
Cohesion: 0.13
Nodes (29): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+21 more)

### Community 105 - "uc"
Cohesion: 0.09
Nodes (32): r(), mx(), ad(), as(), br(), cr(), Fn(), go() (+24 more)

### Community 106 - "ee"
Cohesion: 0.23
Nodes (16): c0(), cf(), ci(), ee(), ef(), Fu(), is(), lo() (+8 more)

### Community 107 - "D0"
Cohesion: 0.16
Nodes (25): ai(), Cl(), D0(), dn(), Ei(), fe(), ff(), Fl() (+17 more)

### Community 108 - "c0"
Cohesion: 0.31
Nodes (15): c0(), D0(), df(), fe(), Gl(), Gn(), Lu(), nt() (+7 more)

### Community 109 - "l"
Cohesion: 0.09
Nodes (49): Ba(), t(), bf(), bi(), ch(), Ct(), eo(), gd() (+41 more)

### Community 110 - "tt"
Cohesion: 0.22
Nodes (21): ui(), ui(), of(), q0(), ui(), We(), zd(), ui() (+13 more)

### Community 111 - "Hi"
Cohesion: 0.15
Nodes (24): _a(), af(), Dl(), ds(), fs(), io(), jt(), kr() (+16 more)

### Community 112 - "Ye"
Cohesion: 0.19
Nodes (24): Da(), dh(), dt(), ea(), ft(), gh(), hh(), jd() (+16 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "sf"
Cohesion: 0.15
Nodes (19): Ct(), dd(), Fu(), Ii(), Jl(), ke(), la(), md() (+11 more)

### Community 115 - "l"
Cohesion: 0.09
Nodes (56): ar(), bi(), bo(), bu(), co(), cs(), dd(), ea() (+48 more)

### Community 116 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), df(), Ei(), fe(), Gl(), Gn(), Lu() (+8 more)

### Community 117 - "ku"
Cohesion: 0.08
Nodes (37): A0(), ai(), bc(), Bl(), cd(), Cl(), cm(), Ct() (+29 more)

### Community 118 - "Ms"
Cohesion: 0.40
Nodes (6): go(), gs(), po(), xo(), Ms(), rt

### Community 119 - "ue"
Cohesion: 0.16
Nodes (15): ad(), ar(), Bt(), ed(), Jn(), ke(), la(), Ln() (+7 more)

### Community 120 - "ve"
Cohesion: 0.12
Nodes (38): _0(), c0(), cf(), ci(), D0(), Dl(), dn(), ee() (+30 more)

### Community 121 - "i"
Cohesion: 0.22
Nodes (17): ao(), c0(), ci(), ee(), ef(), i(), is(), lo() (+9 more)

### Community 122 - "nu"
Cohesion: 0.09
Nodes (11): u0(), eu(), gf, ir(), jf(), nu, qu(), Rn() (+3 more)

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "_0"
Cohesion: 0.30
Nodes (15): _0(), D0(), Ei(), fe(), ff(), Gn(), Lu(), mn() (+7 more)

### Community 125 - "yf"
Cohesion: 0.15
Nodes (9): bn, dc(), hc, kc(), lc, mf(), ro, vf() (+1 more)

### Community 126 - "dx"
Cohesion: 0.17
Nodes (25): dx(), $h(), hx(), E(), M(), bd(), D(), dh() (+17 more)

### Community 127 - "of"
Cohesion: 0.08
Nodes (48): _0(), ao(), cf(), ci(), cs(), dn(), ee(), ef() (+40 more)

### Community 128 - "react"
Cohesion: 0.10
Nodes (19): dynamic, CustomExerciseForm(), ExerciseBrowser(), ExerciseBrowserContent(), exerciseCache, LibraryExercise, GENERATION_STEPS, PlanGeneration() (+11 more)

### Community 129 - "wf"
Cohesion: 0.22
Nodes (10): aa(), Ei(), hd(), ke(), Mi(), Qc(), wd(), wf() (+2 more)

### Community 130 - "fitness-dashboard.tsx"
Cohesion: 0.09
Nodes (22): DailyActivityCard(), DailyActivityCardProps, ExerciseLibraryCard(), FitnessDashboard(), FitnessDashboardProps, HorizontalCalendar(), HorizontalCalendarProps, ProNutritionGenerationCard() (+14 more)

### Community 131 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 132 - "lf"
Cohesion: 0.13
Nodes (26): ao(), fs(), gi(), K0(), Kf(), Le(), t(), lf() (+18 more)

### Community 133 - "ue"
Cohesion: 0.16
Nodes (15): ad(), ar(), Bt(), ed(), Jn(), ke(), la(), Ln() (+7 more)

### Community 134 - "l"
Cohesion: 0.07
Nodes (57): At(), bi(), bo(), ch(), cn(), co(), cs(), df() (+49 more)

### Community 135 - "af"
Cohesion: 0.24
Nodes (16): af(), fs(), hn(), io(), ll(), ms(), no(), _o() (+8 more)

### Community 136 - "r"
Cohesion: 0.16
Nodes (37): ai(), b0(), di(), Do(), eh(), fi(), Fr(), Gt() (+29 more)

### Community 137 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+8 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 139 - "profile-content.tsx"
Cohesion: 0.11
Nodes (22): getUnreadNotificationsCountAction(), toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), DashboardHeader(), fetchUnreadCount(), DashboardHeaderProps, FitnessTheme, FitnessThemeContext (+14 more)

### Community 140 - "nutrition-view.tsx"
Cohesion: 0.08
Nodes (33): FoodAvatar(), FoodAvatarProps, Food, FOOD_CATEGORIES, formatMealType(), LogFoodModal(), LogFoodModalProps, parsePlannedItems() (+25 more)

### Community 141 - "xf"
Cohesion: 0.19
Nodes (13): Dl(), ds(), G0(), jt(), kr(), _s(), ta(), tc() (+5 more)

### Community 142 - "Q"
Cohesion: 0.18
Nodes (11): x0(), r0(), G0(), r0(), G0(), r0(), r0(), r0() (+3 more)

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

### Community 152 - "ya"
Cohesion: 0.21
Nodes (18): c0(), cf(), ci(), ee(), ef(), Fu(), is(), lo() (+10 more)

### Community 153 - "uf"
Cohesion: 0.07
Nodes (45): A0(), ai(), an(), bc(), cd(), Cl(), cm(), D() (+37 more)

### Community 155 - "add-scan/route.ts"
Cohesion: 0.27
Nodes (8): deleteR2File(), deleteScanPhotosFromR2(), isR2Configured, POST(), deleteR2File(), isR2Configured, POST(), @aws-sdk/client-s3

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 158 - "swap-meal/route.ts"
Cohesion: 0.44
Nodes (9): ALLOWED_MEAL_TYPES, isDietCompatible(), isFoodAvailable(), isFoodBlocked(), matchesTerm(), normalize(), POST(), profileTerms() (+1 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 161 - "Os"
Cohesion: 0.22
Nodes (9): bs(), bs(), bs(), bs(), bs(), bs(), bs(), bs() (+1 more)

### Community 164 - "createServerSupabase"
Cohesion: 0.04
Nodes (71): exportUserData(), exportWorkoutHistoryCSV(), getUserSupportMessages(), submitSupportMessage(), dynamic, POST(), POST(), POST() (+63 more)

### Community 168 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, import:usda, lint, start, type-check

### Community 169 - "workout-heatmap.tsx"
Cohesion: 0.24
Nodes (9): CellData, DAY_LABELS, formatDate(), getIntensityClass(), HeatmapCell, HeatmapProps, INTENSITY_COLORS, MONTH_LABELS (+1 more)

### Community 170 - "next.config.ts"
Cohesion: 0.40
Nodes (4): config, filteredRuntimeCaching, nextConfig, @ducanh2912/next-pwa

### Community 176 - "supabase/middleware.ts"
Cohesion: 0.38
Nodes (5): config, updateSession(), config, middleware(), @supabase/ssr

### Community 177 - "gsap-C8IefbVz.js"
Cohesion: 0.32
Nodes (5): e(), Ml(), Ol(), tr(), xa

### Community 179 - "ai-insight-card.tsx"
Cohesion: 0.40
Nodes (3): PlanAdjustment, ProgressReview, WeeklyWorkoutStats

## Knowledge Gaps
- **525 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+520 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 874 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `uf`, `Ph`, `Ph`, `index-Buds9Sm1.js`, `Ph`, `le`, `index-LDG-1p68.js`, `Q`, `index-B23vSfwu.js`, `Ih`, `uc`, `of`, `Ih`, `index-DtLkR01C.js`, `uc`, `il`, `r`, `ya`, `.add`, `Ta`, `Os`, `Ot`, `_f`, `l`, `gsap-C8IefbVz.js`, `et`, `uc`, `B`, `st`, `l`, `Ih`, `r`, `fu`, `.get`, `vc`, `of`, `Ph`, `kf`, `Ye`, `r`, `_0`, `tu`, `bt`, `n`, `l`, `he`, `uc`, `tt`, `Hi`, `ku`, `Ms`, `ve`, `nu`, `yf`, `of`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `Ph`, `index-B23vSfwu.js`, `Ih`, `uc`, `Os`, `Ot`, `r`, `r0`, `et`, `B`, `st`, `l`, `rf`, `Ye`, `vc`, `Ph`, `ee`, `n`, `D0`, `tt`, `dx`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `uf`, `Ph`, `le`, `Q`, `index-B23vSfwu.js`, `Os`, `dx`, `et`, `uc`, `B`, `st`, `r`, `vc`, `Ph`, `Ye`, `bt`, `n`, `tt`, `l`, `nu`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._