# Graph Report - web  (2026-09-23)

## Corpus Check
- 420 files · ~3,440,463 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6438 nodes · 22772 edges · 172 communities (159 shown, 13 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d6f5249d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- (fitness)/page.tsx
- _
- fitness-notifications.ts
- Ot
- index-x6K-DhKZ.js
- fitness.ts
- Ph
- index-BM9U1lvA.js
- index-Buds9Sm1.js
- Ph
- uc
- Ye
- progress-view.tsx
- $h
- index-CqdT1wea.js
- Ye
- Ih
- r
- admin.ts
- We
- createAdminClient
- rf
- import-usda-foundation-foods.mjs
- uf
- il
- l
- n
- l
- of
- fu
- r
- n
- index-B23vSfwu.js
- $h
- zn
- zf
- e
- r
- index-DtLkR01C.js
- uc
- hl
- Ye
- fitness-shell.tsx
- et
- fitness-ai/generate-plan/route.ts
- access.ts
- of
- y0
- dependencies
- he
- Q
- lf
- AIPlanAnimation.tsx
- Ph
- onboarding-flow.tsx
- Qe
- gsap-C8IefbVz.js
- B
- test_phase35_regression.mjs
- constants.ts
- c0
- index-CoRpx3FC.js
- ee
- Ih
- fitness-reminders/route.ts
- r
- c0
- uc
- Ye
- i
- Ye
- ve
- F
- _0
- grocery-view.tsx
- n
- lf
- lf
- vc
- r
- uc
- sf
- Hi
- i
- rf
- Ye
- sf
- uc
- rf
- D0
- reminders-client.tsx
- Le
- users-table-client.tsx
- a
- Ih
- l
- st
- l
- E
- Ph
- bt
- r
- app/package.json
- ee
- yf
- tt
- _0
- wf
- Ih
- n
- y0
- _0
- af
- compilerOptions
- _0
- r
- test_nutrition_engine.mjs
- Vo
- _0
- next
- l
- use-auth.ts
- nu
- manifest.json
- Rs
- swap-meal/route.ts
- sf
- log-food/route.ts
- .add
- plan-setup/page.tsx
- l
- wf
- r
- ue
- one-rm.ts
- devDependencies
- r
- zf
- grocery-tab.tsx
- rf
- le
- rf
- Ih
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- ai-insight-card.tsx
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- ff
- progression.ts
- admin-login/page.tsx
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- sf
- coach.ts
- package.json
- firebase-messaging-sw.js
- Data import scripts
- nutrition-service.ts
- rules/graphify.md
- workflows/graphify.md
- l
- next-env.d.ts
- createServerSupabase
- D0

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
- `Naming & File Conventions` --references--> `WorkoutSummaryCard()`  [INFERRED]
  .planning/codebase/STRUCTURE.md → app/components/fitness/workout/workout-summary-card.tsx
- `Recent Decisions` --references--> `FitnessShell()`  [INFERRED]
  .planning/STATE.md → app/components/fitness/fitness-shell.tsx
- `1. Performance Standards (Mobile 60fps Target)` --references--> `BottomNav()`  [INFERRED]
  .planning/codebase/CONVENTIONS.md → app/components/fitness/dashboard/bottom-nav.tsx

## Import Cycles
- None detected.

## Communities (172 total, 13 thin omitted)

### Community 0 - "(fitness)/page.tsx"
Cohesion: 0.05
Nodes (35): DashboardBelow(), dynamic, revalidate, dynamic, WorkoutContent(), ActiveWorkoutContent(), dynamic, DashboardSkeleton() (+27 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (127): _, aa, ac(), ao(), As, at, Be(), bf() (+119 more)

### Community 2 - "fitness-notifications.ts"
Cohesion: 0.17
Nodes (19): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), getUnreadNotificationsCountAction(), markAllNotificationsAsReadAction() (+11 more)

### Community 3 - "Ot"
Cohesion: 0.08
Nodes (76): ap(), ep(), Fx(), ip(), ix(), Kx(), lp(), lu() (+68 more)

### Community 4 - "index-x6K-DhKZ.js"
Cohesion: 0.09
Nodes (57): am(), ap(), ax(), Bn, Bx, cx(), de(), Dn() (+49 more)

### Community 5 - "fitness.ts"
Cohesion: 0.09
Nodes (36): completeSetAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), resumeWorkoutSessionAction(), startWorkoutSessionAction(), ExerciseCardProps, ExerciseDetailProps, SetRow() (+28 more)

### Community 6 - "Ph"
Cohesion: 0.04
Nodes (83): Ih(), Ph(), Bd(), bh(), Bl(), bm(), br(), cd() (+75 more)

### Community 7 - "index-BM9U1lvA.js"
Cohesion: 0.06
Nodes (60): $, A, b, c(), D, e(), f, g (+52 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.06
Nodes (83): $, A, b, c(), D, e(), f, g (+75 more)

### Community 9 - "Ph"
Cohesion: 0.05
Nodes (74): Ph(), bc(), Bd(), Bl(), bm(), cd(), cf(), Cn() (+66 more)

### Community 10 - "uc"
Cohesion: 0.19
Nodes (15): br(), cr(), Fn(), gr(), id(), ju(), Kn(), l0() (+7 more)

### Community 11 - "Ye"
Cohesion: 0.12
Nodes (33): aa(), ad(), Bt(), Da(), dt(), ea(), gc(), gh() (+25 more)

### Community 12 - "progress-view.tsx"
Cohesion: 0.04
Nodes (68): GET(), POST(), GET(), POST(), ProgressLoading(), metadata, ProgressContent(), ProgressPage() (+60 more)

### Community 13 - "$h"
Cohesion: 0.17
Nodes (24): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+16 more)

### Community 14 - "index-CqdT1wea.js"
Cohesion: 0.08
Nodes (68): am(), ap(), ax(), Bn, Bx, cx(), de(), Dn() (+60 more)

### Community 15 - "Ye"
Cohesion: 0.12
Nodes (32): hx(), C(), E(), _a(), bd(), Bt(), dh(), dt() (+24 more)

### Community 16 - "Ih"
Cohesion: 0.04
Nodes (77): Ih(), ad(), an(), as(), b0(), bc(), bf(), cd() (+69 more)

### Community 17 - "r"
Cohesion: 0.12
Nodes (31): af(), bu(), cn(), di(), fi(), gd(), ge(), ls() (+23 more)

### Community 18 - "admin.ts"
Cohesion: 0.06
Nodes (48): maxDuration, POST(), stableStringify(), stripImagePayload(), POST(), dynamic, AIStartingReportPage(), displayValue() (+40 more)

### Community 19 - "We"
Cohesion: 0.10
Nodes (28): ad(), ai(), an(), bc(), cd(), E0(), Es(), Hl() (+20 more)

### Community 20 - "createAdminClient"
Cohesion: 0.04
Nodes (74): createCouponAction(), toggleCouponStatusAction(), getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), acceptFreePreviewAction() (+66 more)

### Community 21 - "rf"
Cohesion: 0.13
Nodes (29): af(), ao(), At(), fs(), gd(), gi(), Hr(), Kl() (+21 more)

### Community 22 - "import-usda-foundation-foods.mjs"
Cohesion: 0.07
Nodes (28): main(), supabase, ALLERGEN_MAP, content, filePath, lines, newLines, buildRow() (+20 more)

### Community 23 - "uf"
Cohesion: 0.07
Nodes (46): A0(), an(), as(), bc(), cd(), D(), Es(), Fr() (+38 more)

### Community 24 - "il"
Cohesion: 0.06
Nodes (15): Ae(), br(), cr, _f(), hu(), il, jr, nl() (+7 more)

### Community 25 - "l"
Cohesion: 0.10
Nodes (47): ar(), bi(), bo(), Ct(), dd(), ea(), eo(), fo() (+39 more)

### Community 26 - "n"
Cohesion: 0.13
Nodes (38): $h(), bh(), bu(), D(), di(), Do(), eh(), fi() (+30 more)

### Community 27 - "l"
Cohesion: 0.06
Nodes (71): af(), At(), Ba(), t(), bf(), bi(), bo(), ch() (+63 more)

### Community 28 - "of"
Cohesion: 0.14
Nodes (28): af(), fs(), io(), Kl(), ll(), ls(), ms(), nf() (+20 more)

### Community 29 - "fu"
Cohesion: 0.08
Nodes (28): z0(), z0(), z0(), z0(), z0(), z0(), A0(), an() (+20 more)

### Community 30 - "r"
Cohesion: 0.12
Nodes (27): as(), b0(), da(), Fr(), ge(), hd(), ht(), hu() (+19 more)

### Community 31 - "n"
Cohesion: 0.14
Nodes (40): ad(), an(), b0(), bh(), di(), eh(), fi(), go() (+32 more)

### Community 32 - "index-B23vSfwu.js"
Cohesion: 0.07
Nodes (71): am(), ap(), ax(), Bn, Bx, cm(), cx(), de() (+63 more)

### Community 33 - "$h"
Cohesion: 0.15
Nodes (26): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+18 more)

### Community 34 - "zn"
Cohesion: 0.14
Nodes (34): ar(), bu(), Da(), dh(), dt(), ea(), ft(), gh() (+26 more)

### Community 35 - "zf"
Cohesion: 0.20
Nodes (12): hd(), I(), Il(), jc(), mn(), Na(), oh(), Pa() (+4 more)

### Community 36 - "e"
Cohesion: 0.11
Nodes (29): At(), bi(), bo(), co(), cs(), Fa(), fo(), gi() (+21 more)

### Community 37 - "r"
Cohesion: 0.09
Nodes (39): $h(), ct(), el(), m(), r(), Re(), y(), zt() (+31 more)

### Community 38 - "index-DtLkR01C.js"
Cohesion: 0.03
Nodes (147): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+139 more)

### Community 39 - "uc"
Cohesion: 0.10
Nodes (31): er(), Fn(), ft(), gr(), Ic(), ir(), ju(), Kn() (+23 more)

### Community 40 - "hl"
Cohesion: 0.09
Nodes (61): bi(), bo(), co(), cs(), Ct(), dd(), df(), eo() (+53 more)

### Community 41 - "Ye"
Cohesion: 0.17
Nodes (25): hx(), C(), E(), _a(), bd(), dh(), dt(), fh() (+17 more)

### Community 42 - "fitness-shell.tsx"
Cohesion: 0.06
Nodes (32): NutritionLoading(), dynamic, NutritionContent(), revalidate, ProfileLoading(), FitnessChatbot(), Message, BottomNav() (+24 more)

### Community 43 - "et"
Cohesion: 0.04
Nodes (28): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), rr(), rr() (+20 more)

### Community 44 - "fitness-ai/generate-plan/route.ts"
Cohesion: 0.04
Nodes (118): maxDuration, POST(), GenerateGroceryResponseSchema, POST(), maxDuration, POST(), POST(), POST() (+110 more)

### Community 45 - "access.ts"
Cohesion: 0.04
Nodes (59): approveFitnessPlanAdjustmentAction(), deleteR2File(), deleteScanPhotosFromR2(), isR2Configured, POST(), dynamic, GET(), POST() (+51 more)

### Community 46 - "of"
Cohesion: 0.15
Nodes (43): ot(), ad(), an(), bo(), di(), eh(), fi(), Gt() (+35 more)

### Community 47 - "y0"
Cohesion: 0.11
Nodes (24): _a(), A0(), ai(), cm(), Ct(), Es(), ff(), fl() (+16 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "he"
Cohesion: 0.15
Nodes (26): $h(), hx(), E(), M(), bd(), D(), dh(), Kc() (+18 more)

### Community 50 - "Q"
Cohesion: 0.11
Nodes (9): r0(), r0(), r0(), r0(), r0(), r0(), r0(), Q() (+1 more)

### Community 51 - "lf"
Cohesion: 0.27
Nodes (14): ao(), fs(), gi(), lf(), ms(), _o(), os(), qt() (+6 more)

### Community 52 - "AIPlanAnimation.tsx"
Cohesion: 0.13
Nodes (24): AICharacter(), AICharacterProps, AIPlanAnimation(), AIPlanAnimationProps, DEFAULT_FALLBACK_PROFILE, PILL_CONFIGS, PillConfig, ProfileSummary (+16 more)

### Community 53 - "Ph"
Cohesion: 0.05
Nodes (78): Ph(), aa(), bf(), bh(), bm(), Bt(), cf(), Cl() (+70 more)

### Community 54 - "onboarding-flow.tsx"
Cohesion: 0.08
Nodes (22): saveFitnessOnboardingAction(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_goal (+14 more)

### Community 55 - "Qe"
Cohesion: 0.18
Nodes (27): ap(), Bn(), Bx, ep(), ex(), o(), Ha, ip() (+19 more)

### Community 56 - "gsap-C8IefbVz.js"
Cohesion: 0.38
Nodes (4): e(), Ml(), Ol(), tr()

### Community 57 - "B"
Cohesion: 0.08
Nodes (37): zs(), ar(), Bt(), Da(), dh(), dt(), ea(), fh() (+29 more)

### Community 58 - "test_phase35_regression.mjs"
Cohesion: 0.14
Nodes (13): buildNutritionUserContext(), calculateDailyBudget(), generateContextFingerprint(), NormalizedDiet, NormalizedEnvironment, normalizeDietType(), NormalizedMealSlot, normalizeFoodEnvironment() (+5 more)

### Community 59 - "constants.ts"
Cohesion: 0.06
Nodes (71): ACTIVITY_MULTIPLIERS, AUTHENTIC_INDIAN_RECIPES, AuthenticMealRecipe, BANNED_FOOD_PATTERNS, calculateWaterTarget(), CATEGORY_RETAIL_UNITS, CORE_MEAL_TYPES, DAILY_FOOD_CAPS (+63 more)

### Community 60 - "c0"
Cohesion: 0.26
Nodes (17): c0(), D0(), df(), fe(), Gl(), Gn(), ic(), Lu() (+9 more)

### Community 61 - "index-CoRpx3FC.js"
Cohesion: 0.09
Nodes (56): am(), ap(), ax(), Bn, Bx, cm(), cx(), de() (+48 more)

### Community 62 - "ee"
Cohesion: 0.20
Nodes (18): c0(), cf(), ci(), ee(), ef(), hc(), hi(), is() (+10 more)

### Community 63 - "Ih"
Cohesion: 0.04
Nodes (94): Ih(), a0(), b0(), bf(), bm(), Cl(), dc(), Dl() (+86 more)

### Community 64 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 65 - "r"
Cohesion: 0.09
Nodes (59): af(), as(), At(), b0(), bh(), bu(), da(), di() (+51 more)

### Community 66 - "c0"
Cohesion: 0.12
Nodes (27): _0(), c0(), cf(), ci(), ee(), ef(), Fu(), hc() (+19 more)

### Community 67 - "uc"
Cohesion: 0.13
Nodes (23): er(), Fn(), gr(), Ic(), ju(), l0(), Pc(), Pn() (+15 more)

### Community 68 - "Ye"
Cohesion: 0.10
Nodes (36): _a(), ah(), ar(), bh(), Bt(), dt(), Fu(), gc() (+28 more)

### Community 69 - "i"
Cohesion: 0.11
Nodes (29): bi(), bo(), co(), cs(), fo(), go(), gs(), ho() (+21 more)

### Community 70 - "Ye"
Cohesion: 0.12
Nodes (33): hx(), E(), M(), _a(), ad(), bd(), Bt(), dh() (+25 more)

### Community 71 - "ve"
Cohesion: 0.12
Nodes (39): _0(), c0(), cf(), ci(), Cl(), cm(), D0(), dn() (+31 more)

### Community 72 - "F"
Cohesion: 0.09
Nodes (4): F, I, k(), q

### Community 73 - "_0"
Cohesion: 0.17
Nodes (24): _0(), ai(), Cl(), cm(), D0(), dn(), Ei(), fe() (+16 more)

### Community 74 - "grocery-view.tsx"
Cohesion: 0.24
Nodes (17): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), GroceryPage(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps (+9 more)

### Community 75 - "n"
Cohesion: 0.22
Nodes (11): bc(), n(), Ct(), ef, ic(), nf(), oe(), qc() (+3 more)

### Community 76 - "lf"
Cohesion: 0.23
Nodes (16): ao(), fs(), gi(), ja(), ji(), lf(), ms(), no() (+8 more)

### Community 77 - "lf"
Cohesion: 0.33
Nodes (12): ao(), fs(), gi(), lf(), ms(), os(), Rl(), rs() (+4 more)

### Community 78 - "vc"
Cohesion: 0.11
Nodes (18): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+10 more)

### Community 79 - "r"
Cohesion: 0.07
Nodes (55): A0(), ai(), as(), b0(), bc(), Cl(), cm(), D() (+47 more)

### Community 80 - "uc"
Cohesion: 0.16
Nodes (21): er(), Fn(), ft(), gr(), ir(), Kn(), l0(), lr() (+13 more)

### Community 81 - "sf"
Cohesion: 0.09
Nodes (41): _0(), ao(), bc(), Bl(), cd(), ci(), Dd(), dn() (+33 more)

### Community 82 - "Hi"
Cohesion: 0.15
Nodes (19): Dl(), ds(), G0(), Jr(), jt(), kr(), Pu(), _s() (+11 more)

### Community 83 - "i"
Cohesion: 0.29
Nodes (8): Fa(), go(), ld(), qo(), i(), rn(), ti(), yo()

### Community 84 - "rf"
Cohesion: 0.14
Nodes (27): af(), ao(), ch(), cn(), fs(), Kl(), lf(), ls() (+19 more)

### Community 85 - "Ye"
Cohesion: 0.10
Nodes (43): ar(), bu(), Da(), dh(), dt(), ea(), er(), fh() (+35 more)

### Community 86 - "sf"
Cohesion: 0.11
Nodes (21): ad(), Bt(), ed(), Fu(), Je(), Jn(), ke(), la() (+13 more)

### Community 87 - "uc"
Cohesion: 0.07
Nodes (52): _a(), a0(), bd(), bh(), D(), dh(), dt(), er() (+44 more)

### Community 88 - "rf"
Cohesion: 0.09
Nodes (44): as(), At(), c0(), cf(), ci(), dn(), ds(), ee() (+36 more)

### Community 89 - "D0"
Cohesion: 0.21
Nodes (19): D0(), da(), dn(), Ei(), fe(), ff(), Fl(), Gn() (+11 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.05
Nodes (44): toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), updateRemindersAction(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS (+36 more)

### Community 91 - "Le"
Cohesion: 0.13
Nodes (19): A0(), Cl(), cm(), Es(), ff(), fl(), Gc(), Hr() (+11 more)

### Community 92 - "users-table-client.tsx"
Cohesion: 0.18
Nodes (16): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), PaymentHistoryModal(), PaymentHistoryModalProps, SendMailModal() (+8 more)

### Community 93 - "a"
Cohesion: 0.13
Nodes (13): a(), El(), u(), nc(), _o(), a(), po(), _s() (+5 more)

### Community 94 - "Ih"
Cohesion: 0.05
Nodes (67): Ih(), A0(), ad(), an(), bc(), cd(), cn(), co() (+59 more)

### Community 95 - "l"
Cohesion: 0.08
Nodes (61): ar(), bi(), bo(), ch(), co(), cs(), Ct(), dd() (+53 more)

### Community 96 - "st"
Cohesion: 0.27
Nodes (17): Do(), qo(), rn(), T0(), v0(), E0(), E0(), T0() (+9 more)

### Community 97 - "l"
Cohesion: 0.06
Nodes (56): At(), b0(), bi(), ch(), co(), cs(), gd(), e() (+48 more)

### Community 98 - "E"
Cohesion: 0.31
Nodes (11): r(), mx(), ic(), Il(), nc(), ud(), w(), z() (+3 more)

### Community 99 - "Ph"
Cohesion: 0.04
Nodes (98): Ph(), A0(), ai(), bc(), bf(), bm(), cd(), Cl() (+90 more)

### Community 100 - "bt"
Cohesion: 0.13
Nodes (30): af(), ao(), da(), fs(), gd(), Hr(), Kl(), lf() (+22 more)

### Community 101 - "r"
Cohesion: 0.13
Nodes (41): S, af(), an(), b0(), bh(), bu(), di(), Do() (+33 more)

### Community 102 - "app/package.json"
Cohesion: 0.04
Nodes (46): config, updateSession(), config, middleware(), config, filteredRuntimeCaching, nextConfig, framer-motion (+38 more)

### Community 103 - "ee"
Cohesion: 0.19
Nodes (18): c0(), cf(), ci(), Dl(), ee(), ef(), hc(), hi() (+10 more)

### Community 104 - "yf"
Cohesion: 0.15
Nodes (10): df(), hc, hf(), kc(), lc, mf(), pf(), ro (+2 more)

### Community 105 - "tt"
Cohesion: 0.20
Nodes (23): bm(), $f(), G0(), Ga(), If(), of(), ui(), Vn() (+15 more)

### Community 106 - "_0"
Cohesion: 0.14
Nodes (31): _0(), ao(), c0(), ci(), D0(), df(), ee(), ef() (+23 more)

### Community 107 - "wf"
Cohesion: 0.14
Nodes (15): aa(), Bt(), Ei(), hd(), ke(), Ln(), Mi(), Qc() (+7 more)

### Community 108 - "Ih"
Cohesion: 0.05
Nodes (74): Ih(), bc(), bm(), dc(), ds(), er(), $f(), Fa() (+66 more)

### Community 109 - "n"
Cohesion: 0.12
Nodes (47): $h(), ct(), el(), g(), m(), ot(), Re(), zt() (+39 more)

### Community 110 - "y0"
Cohesion: 0.13
Nodes (21): bm(), ds(), $f(), G0(), Ga(), Gf(), If(), Jr() (+13 more)

### Community 111 - "_0"
Cohesion: 0.13
Nodes (28): _0(), ai(), Cl(), cm(), D0(), dn(), Ei(), Fa() (+20 more)

### Community 112 - "af"
Cohesion: 0.22
Nodes (17): af(), fs(), G0(), go(), gs(), io(), _o(), os() (+9 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "_0"
Cohesion: 0.26
Nodes (17): _0(), D0(), Ei(), fe(), ff(), Gl(), Gn(), Hr() (+9 more)

### Community 115 - "r"
Cohesion: 0.15
Nodes (46): bu(), dd(), di(), ea(), fi(), Fr(), gs(), Gt() (+38 more)

### Community 116 - "test_nutrition_engine.mjs"
Cohesion: 0.17
Nodes (4): NutritionValidationEngine, TEST_PROFILES, ref_node_assert, ref_node_crypto

### Community 117 - "Vo"
Cohesion: 0.16
Nodes (14): bs(), re(), tn(), Vo(), G(), I(), K(), N() (+6 more)

### Community 118 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+8 more)

### Community 119 - "next"
Cohesion: 0.02
Nodes (121): completeExerciseSetsAction(), discardWorkoutSessionAction(), endWorkoutAction(), reopenWorkoutAction(), resetWorkoutTimerAction(), FIELD_CONFIGS, FieldConfig, LogMeasurementsPage() (+113 more)

### Community 120 - "l"
Cohesion: 0.08
Nodes (50): At(), Ba(), t(), bf(), bi(), ch(), co(), cs() (+42 more)

### Community 121 - "use-auth.ts"
Cohesion: 0.04
Nodes (63): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem (+55 more)

### Community 122 - "nu"
Cohesion: 0.08
Nodes (14): dl(), eu(), gf, ir(), jf(), nu, pl, qi (+6 more)

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "Rs"
Cohesion: 0.07
Nodes (14): ar(), en(), H(), ja(), ls(), nn(), Oi(), ol() (+6 more)

### Community 125 - "swap-meal/route.ts"
Cohesion: 0.29
Nodes (10): ALLOWED_MEAL_TYPES, GET(), isDietCompatible(), isFoodAvailable(), isFoodBlocked(), matchesTerm(), normalize(), POST() (+2 more)

### Community 126 - "sf"
Cohesion: 0.20
Nodes (11): Fu(), Je(), ke(), la(), lh(), md(), Mi(), sf() (+3 more)

### Community 127 - "log-food/route.ts"
Cohesion: 0.31
Nodes (7): DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES, POST(), isFitnessPro(), requireFitnessPro()

### Community 128 - ".add"
Cohesion: 0.08
Nodes (14): af, Cn(), Gn, Gu(), kl(), ks(), _l(), me() (+6 more)

### Community 129 - "plan-setup/page.tsx"
Cohesion: 0.27
Nodes (11): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+3 more)

### Community 130 - "l"
Cohesion: 0.09
Nodes (54): ar(), Ba(), t(), bi(), bo(), ch(), Ct(), dd() (+46 more)

### Community 131 - "wf"
Cohesion: 0.22
Nodes (10): aa(), Ei(), hd(), ke(), Mi(), Qc(), wd(), wf() (+2 more)

### Community 132 - "r"
Cohesion: 0.08
Nodes (58): ai(), ao(), as(), c0(), ci(), Dd(), dn(), ee() (+50 more)

### Community 133 - "ue"
Cohesion: 0.28
Nodes (9): ar(), Bt(), la(), Ln(), nr(), sc(), ue(), wm() (+1 more)

### Community 134 - "one-rm.ts"
Cohesion: 0.36
Nodes (5): bestEstimated1RM(), epley1RM(), estimated1RM(), format1RM(), ONE_RM_REP_CAP

### Community 135 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 136 - "r"
Cohesion: 0.11
Nodes (48): ai(), b0(), bu(), di(), Do(), eh(), fi(), ft() (+40 more)

### Community 137 - "zf"
Cohesion: 0.38
Nodes (7): mn(), Na(), Pa(), qs(), vs(), xn(), zf()

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 139 - "rf"
Cohesion: 0.08
Nodes (47): bs(), bs(), bs(), _0(), as(), At(), bs(), c0() (+39 more)

### Community 140 - "le"
Cohesion: 0.14
Nodes (26): bf(), ch(), dc(), df(), gu(), hf(), hn(), jf() (+18 more)

### Community 142 - "Ih"
Cohesion: 0.05
Nodes (62): $h(), Ih(), bf(), bh(), bm(), cn(), dc(), Dl() (+54 more)

### Community 143 - "Key Architectural Patterns"
Cohesion: 0.22
Nodes (8): 1. Parallel Batching vs. Sequential Waterfalls, 2. In-Memory Calendar & Status Math, 3. Immediate Suspense Streaming, 4. Router Caching & Optimistic Tab Transitions, 5. Theme Architecture (Dark & White), Architectural Overview, Architecture & Data Flow — GrindLog, Key Architectural Patterns

### Community 144 - "Technology Stack — GrindLog"
Cohesion: 0.22
Nodes (8): AI & LLM Integrations, Core Runtime & Framework, Data Layer & State, Mobile & PWA, Payments & Subscriptions, Styling & Design System, Technology Stack — GrindLog, Utilities & Validation

### Community 145 - "Critical Test Flows"
Cohesion: 0.22
Nodes (8): 1. Tab Navigation & Instant Switching, 2. Dual-Theme Verification (Dark vs. White), 3. Workout Logging & State Persistence, 4. Nutrition & Calorie Tracking, 5. Authentication & Subscription Guard Rails, Critical Test Flows, Testing & Verification Guide — GrindLog, Verification Commands

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

### Community 155 - "admin-login/page.tsx"
Cohesion: 0.70
Nodes (3): loginAdminAction(), AdminLogin(), handleSubmit()

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 158 - "sf"
Cohesion: 0.09
Nodes (33): ah(), Ct(), df(), Dl(), eo(), hf(), hn(), Ii() (+25 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 164 - "nutrition-service.ts"
Cohesion: 0.08
Nodes (37): GET(), POST(), dynamic, GET(), dynamic, GET(), dynamic, GET() (+29 more)

### Community 170 - "l"
Cohesion: 0.09
Nodes (50): ar(), bf(), ch(), Ct(), dd(), df(), Dl(), ea() (+42 more)

### Community 175 - "createServerSupabase"
Cohesion: 0.03
Nodes (76): exportUserData(), exportWorkoutHistoryCSV(), quickCompleteWorkoutAction(), getUserSupportMessages(), submitSupportMessage(), dynamic, POST(), POST() (+68 more)

### Community 177 - "D0"
Cohesion: 0.16
Nodes (25): ai(), Cl(), D0(), dn(), Ei(), fe(), ff(), Fl() (+17 more)

## Knowledge Gaps
- **557 isolated node(s):** `ActiveWorkoutResumeCardProps`, `AiCoachNoteProps`, `StartingReport`, `StartingReportInput`, `DietPlanCardProps` (+552 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 923 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `.add`, `l`, `Ot`, `index-x6K-DhKZ.js`, `r`, `Ph`, `index-BM9U1lvA.js`, `index-Buds9Sm1.js`, `Ph`, `uc`, `rf`, `le`, `rf`, `index-CqdT1wea.js`, `Ih`, `of`, `uf`, `il`, `ff`, `of`, `fu`, `index-B23vSfwu.js`, `zn`, `r`, `index-DtLkR01C.js`, `uc`, `hl`, `et`, `he`, `Q`, `index-CoRpx3FC.js`, `Ih`, `uc`, `ve`, `_0`, `n`, `vc`, `r`, `uc`, `sf`, `Hi`, `uc`, `a`, `l`, `st`, `Ph`, `bt`, `yf`, `tt`, `_0`, `Ih`, `n`, `Vo`, `nu`, `Rs`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `ue`, `index-BM9U1lvA.js`, `Ph`, `rf`, `uf`, `sf`, `index-B23vSfwu.js`, `e`, `index-DtLkR01C.js`, `et`, `D0`, `B`, `c0`, `n`, `vc`, `rf`, `uc`, `st`, `tt`, `Ih`, `r`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `index-x6K-DhKZ.js`, `index-BM9U1lvA.js`, `Ph`, `rf`, `rf`, `uf`, `n`, `fu`, `r`, `index-DtLkR01C.js`, `Ye`, `l`, `et`, `Q`, `B`, `ee`, `i`, `_0`, `n`, `vc`, `sf`, `st`, `tt`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._