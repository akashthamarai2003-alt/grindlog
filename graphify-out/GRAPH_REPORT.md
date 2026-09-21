# Graph Report - web  (2026-09-21)

## Corpus Check
- 403 files · ~3,420,023 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6301 nodes · 22390 edges · 175 communities (162 shown, 13 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `927fc237`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- uc
- _
- react
- index-B23vSfwu.js
- prompts.ts
- createServerSupabase
- Ph
- uc
- index-Buds9Sm1.js
- Ph
- profile-content.tsx
- wf
- lucide-react
- index-LDG-1p68.js
- constants.ts
- Ot
- Ih
- Bi
- analyze/route.ts
- wf
- payment.ts
- grocery-view.tsx
- index-DtLkR01C.js
- Ih
- il
- r
- r
- .add
- uc
- Ye
- M0
- n
- l
- uc
- groq/client.ts
- l
- dx
- lf
- n
- dx
- r
- _c
- pr
- fl
- generate-draft/route.ts
- rf
- l
- jn
- dependencies
- fitness-plan-profile.ts
- Ih
- au
- et
- of
- Hi
- admin-login/page.tsx
- B
- Ye
- st
- l
- We
- app/package.json
- rf
- yf
- lf
- r
- schemas.ts
- onboarding-flow.tsx
- le
- fitness-dashboard.tsx
- y0
- We
- F
- AIPlanAnimation.tsx
- Ih
- .get
- fitness-notifications.ts
- Wo
- vc
- r
- ee
- Wh
- subscription/types.ts
- Ph
- Ye
- Ye
- l
- Ye
- l
- r
- reminders-client.tsx
- uf
- bt
- devDependencies
- _0
- Rs
- types/index.ts
- af
- import-usda-foundation-foods.mjs
- rf
- sf
- l
- Ih
- _0
- C
- Wh
- rf
- D0
- c0
- l
- Ph
- r
- zn
- compilerOptions
- pc
- r
- _0
- E
- D0
- mi
- _0
- users-table-client.tsx
- nu
- manifest.json
- ve
- yf
- af
- sf
- Wh
- lf
- ee
- fitness-reminders/route.ts
- l
- Wh
- hl
- coupons/page.tsx
- r
- _0
- grocery-tab.tsx
- wf
- nutrition-view.tsx
- $h
- tt
- Key Architectural Patterns
- Technology Stack — GrindLog
- Critical Test Flows
- af
- dx
- of
- Concerns, Technical Debt & Watch-Outs — GrindLog
- External Integrations & Services — GrindLog
- Product & Technical Requirements — GrindLog
- scripts
- zf
- progression.ts
- ff
- Onboarding Summary — GrindLog
- Project Charter — GrindLog
- Coding Conventions & Standards — GrindLog
- coach.ts
- package.json
- Product Roadmap — GrindLog
- firebase-messaging-sw.js
- Data import scripts
- nutrition-service.ts
- rules/graphify.md
- workflows/graphify.md
- next-pwa.d.ts
- next-env.d.ts
- kt
- ai-insight-card.tsx

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
- `1. Performance Standards (Mobile 60fps Target)` --references--> `BottomNav()`  [INFERRED]
  .planning/codebase/CONVENTIONS.md → app/components/fitness/dashboard/bottom-nav.tsx
- `Phase 1: Core Performance & Tab Optimization [COMPLETED]` --references--> `BottomNav()`  [INFERRED]
  .planning/ROADMAP.md → app/components/fitness/dashboard/bottom-nav.tsx
- `3. Workout Logging & State Persistence` --references--> `WorkoutHeader()`  [INFERRED]
  .planning/codebase/TESTING.md → app/components/fitness/workout/workout-header.tsx
- `Recent Decisions` --references--> `FitnessLayout()`  [INFERRED]
  .planning/STATE.md → app/app/(fitness)/layout.tsx
- `Recent Decisions` --references--> `FitnessShell()`  [INFERRED]
  .planning/STATE.md → app/components/fitness/fitness-shell.tsx

## Import Cycles
- None detected.

## Communities (175 total, 13 thin omitted)

### Community 0 - "uc"
Cohesion: 0.07
Nodes (52): _a(), Bt(), bu(), dt(), er(), Fn(), ft(), gc() (+44 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (124): _, ac(), ao(), As, at, Be(), bf(), bn (+116 more)

### Community 2 - "react"
Cohesion: 0.03
Nodes (104): completeExerciseSetsAction(), completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction(), pauseWorkoutSessionAction(), quickCompleteWorkoutAction(), reopenWorkoutAction() (+96 more)

### Community 3 - "index-B23vSfwu.js"
Cohesion: 0.07
Nodes (77): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+69 more)

### Community 4 - "prompts.ts"
Cohesion: 0.14
Nodes (25): POST(), POST(), buildFitnessCoachContext(), addUnique(), budgetPlanningReference(), buildCompactPlanProfile(), buildFitnessCoachPrompt(), buildFitnessPlanPrompt() (+17 more)

### Community 5 - "createServerSupabase"
Cohesion: 0.02
Nodes (133): exportUserData(), exportWorkoutHistoryCSV(), approveFitnessPlanAdjustmentAction(), getUserSupportMessages(), submitSupportMessage(), AdminDashboard(), formatDate(), POST() (+125 more)

### Community 6 - "Ph"
Cohesion: 0.05
Nodes (77): Ph(), as(), Bd(), Bl(), bm(), br(), cd(), cf() (+69 more)

### Community 7 - "uc"
Cohesion: 0.09
Nodes (34): Cn(), er(), Fn(), ft(), gr(), hd(), I(), Ic() (+26 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.05
Nodes (95): $, A, b, c(), D, e(), f, g (+87 more)

### Community 9 - "Ph"
Cohesion: 0.04
Nodes (90): Ph(), A0(), as(), Bd(), Bl(), bm(), br(), cd() (+82 more)

### Community 10 - "profile-content.tsx"
Cohesion: 0.04
Nodes (61): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem (+53 more)

### Community 11 - "wf"
Cohesion: 0.10
Nodes (23): aa(), ai(), Cl(), cm(), Ei(), ff(), fl(), Gc() (+15 more)

### Community 12 - "lucide-react"
Cohesion: 0.03
Nodes (52): FitnessTableClient(), FitnessUserDetails, formatDate(), dynamic, FitnessAdminDashboard(), DietPlanCardProps, FitnessHeaderProps, HorizontalWorkoutListProps (+44 more)

### Community 13 - "index-LDG-1p68.js"
Cohesion: 0.04
Nodes (114): $, A, b, c(), D, e(), f, g (+106 more)

### Community 14 - "constants.ts"
Cohesion: 0.06
Nodes (78): GroceryPage(), ACTIVITY_MULTIPLIERS, AUTHENTIC_INDIAN_RECIPES, AuthenticMealRecipe, BANNED_FOOD_PATTERNS, calculateWaterTarget(), CATEGORY_RETAIL_UNITS, CORE_MEAL_TYPES (+70 more)

### Community 15 - "Ot"
Cohesion: 0.11
Nodes (40): Xx(), Yx(), Xx(), Yx(), Xx(), Yx(), ap(), ep() (+32 more)

### Community 16 - "Ih"
Cohesion: 0.04
Nodes (74): Ih(), ad(), ah(), ar(), b0(), bf(), bm(), Bt() (+66 more)

### Community 17 - "Bi"
Cohesion: 0.09
Nodes (29): z0(), z0(), a0(), Fn(), gr(), i0(), ju(), l0() (+21 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.09
Nodes (29): POST(), stableStringify(), stripImagePayload(), POST(), BODY_SCAN_RESPONSE_INSTRUCTIONS, BodyScanAnalysis, BodyScanAnalysisSchema, parseBodyScanAnalysis() (+21 more)

### Community 19 - "wf"
Cohesion: 0.15
Nodes (15): aa(), hd(), Ii(), ke(), Ln(), Sm(), Ua(), t() (+7 more)

### Community 20 - "payment.ts"
Cohesion: 0.07
Nodes (45): getPlanPricesAction(), updatePlanPricesAction(), checkUserPremiumStatusAction(), claimSpinDiscountAction(), createMessageTopUpOrder(), createRazorpayOrder(), getSpinSecret(), getUserPremiumDetailsAction() (+37 more)

### Community 21 - "grocery-view.tsx"
Cohesion: 0.27
Nodes (15): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps, getScaledPrice() (+7 more)

### Community 22 - "index-DtLkR01C.js"
Cohesion: 0.09
Nodes (58): am(), ap(), ax(), Bn(), Bx, Cc(), cx(), de() (+50 more)

### Community 23 - "Ih"
Cohesion: 0.05
Nodes (67): Ih(), ai(), b0(), bf(), bh(), bm(), Cl(), cm() (+59 more)

### Community 24 - "il"
Cohesion: 0.05
Nodes (20): n(), a(), Fn(), hu(), ic(), il, jr, ma() (+12 more)

### Community 25 - "r"
Cohesion: 0.09
Nodes (43): $h(), ct(), el(), m(), ot(), r(), Re(), y() (+35 more)

### Community 26 - "r"
Cohesion: 0.14
Nodes (42): ai(), b0(), bh(), di(), Do(), eh(), fi(), Fr() (+34 more)

### Community 27 - ".add"
Cohesion: 0.08
Nodes (18): af, Cn(), Gn, Gu(), kl(), _l(), me(), _o() (+10 more)

### Community 28 - "uc"
Cohesion: 0.11
Nodes (30): bu(), er(), Fn(), ft(), gr(), Ic(), ir(), ju() (+22 more)

### Community 29 - "Ye"
Cohesion: 0.11
Nodes (37): hx(), C(), E(), _a(), ad(), ar(), bd(), Bt() (+29 more)

### Community 30 - "M0"
Cohesion: 0.18
Nodes (18): A0(), an(), bc(), cd(), D(), Hl(), hu(), Ko() (+10 more)

### Community 31 - "n"
Cohesion: 0.11
Nodes (49): $h(), ct(), el(), g(), m(), ot(), Re(), zt() (+41 more)

### Community 32 - "l"
Cohesion: 0.09
Nodes (49): bf(), bi(), ch(), co(), cs(), Ct(), eo(), gd() (+41 more)

### Community 33 - "uc"
Cohesion: 0.11
Nodes (26): a0(), Fn(), gr(), I(), i0(), Ic(), jc(), ju() (+18 more)

### Community 34 - "groq/client.ts"
Cohesion: 0.20
Nodes (12): POST(), GET(), AiWorkoutCoachService, generateAIResponse(), generateAIResponseJSON(), getGroqApiKeys(), getGroqClient(), getGroqClientForKey() (+4 more)

### Community 35 - "l"
Cohesion: 0.07
Nodes (68): ar(), bi(), bo(), ch(), co(), cs(), Ct(), dd() (+60 more)

### Community 36 - "dx"
Cohesion: 0.08
Nodes (47): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+39 more)

### Community 37 - "lf"
Cohesion: 0.13
Nodes (24): ao(), Es(), fs(), K0(), Kf(), Le(), t(), lf() (+16 more)

### Community 38 - "n"
Cohesion: 0.13
Nodes (44): ad(), an(), bh(), bo(), di(), eh(), fi(), go() (+36 more)

### Community 39 - "dx"
Cohesion: 0.09
Nodes (30): e(), Ml(), Ol(), tr(), de(), Dn(), dx(), El() (+22 more)

### Community 40 - "r"
Cohesion: 0.15
Nodes (40): af(), ai(), bu(), di(), Do(), fi(), ft(), gs() (+32 more)

### Community 41 - "_c"
Cohesion: 0.08
Nodes (48): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+40 more)

### Community 42 - "pr"
Cohesion: 0.04
Nodes (26): r0(), r0(), r0(), r0(), r0(), r0(), r0(), Ae() (+18 more)

### Community 43 - "fl"
Cohesion: 0.11
Nodes (28): an(), bc(), cd(), D(), E0(), ed(), Es(), Hl() (+20 more)

### Community 44 - "generate-draft/route.ts"
Cohesion: 0.15
Nodes (39): maxDuration, POST(), maxDuration, POST(), POST(), POST(), getProfileContext(), maxDuration (+31 more)

### Community 45 - "rf"
Cohesion: 0.14
Nodes (27): ad(), af(), ao(), At(), fs(), gd(), gi(), Kl() (+19 more)

### Community 46 - "l"
Cohesion: 0.09
Nodes (61): ad(), bf(), bi(), bo(), ch(), co(), cs(), eo() (+53 more)

### Community 47 - "jn"
Cohesion: 0.12
Nodes (31): ao(), bi(), bo(), fo(), fs(), gi(), hs(), io() (+23 more)

### Community 48 - "dependencies"
Cohesion: 0.05
Nodes (44): dependencies, @aws-sdk/client-s3, canvas-confetti, clsx, date-fns, dotenv, @ducanh2912/next-pwa, firebase (+36 more)

### Community 49 - "fitness-plan-profile.ts"
Cohesion: 0.12
Nodes (30): GenerateGroceryResponseSchema, POST(), GeneratedGroceryItemSchema, AVAILABLE_FOOD_ALIASES, buildGoalCalorieTarget(), cleanText(), expectedMealCount(), FILLER_WORDS (+22 more)

### Community 50 - "Ih"
Cohesion: 0.04
Nodes (90): Ih(), A0(), an(), as(), bc(), bm(), cd(), Cl() (+82 more)

### Community 51 - "au"
Cohesion: 0.05
Nodes (81): am(), ap(), ax(), Bn, cm(), de(), Dn(), dx() (+73 more)

### Community 52 - "et"
Cohesion: 0.08
Nodes (13): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), rr(), rr() (+5 more)

### Community 53 - "of"
Cohesion: 0.14
Nodes (36): an(), At(), bh(), di(), eh(), fi(), h0(), ir() (+28 more)

### Community 54 - "Hi"
Cohesion: 0.08
Nodes (39): A0(), ai(), Cl(), cm(), co(), cs(), ds(), Es() (+31 more)

### Community 55 - "admin-login/page.tsx"
Cohesion: 0.70
Nodes (3): loginAdminAction(), AdminLogin(), handleSubmit()

### Community 56 - "B"
Cohesion: 0.16
Nodes (26): hx(), E(), M(), _a(), bd(), dh(), dt(), fh() (+18 more)

### Community 57 - "Ye"
Cohesion: 0.10
Nodes (38): ar(), Bt(), bu(), Da(), dh(), dt(), ea(), er() (+30 more)

### Community 58 - "st"
Cohesion: 0.12
Nodes (29): T0(), E0(), E0(), T0(), E0(), E0(), E0(), E0() (+21 more)

### Community 59 - "l"
Cohesion: 0.07
Nodes (63): ar(), At(), bi(), bo(), co(), cs(), Ct(), dd() (+55 more)

### Community 60 - "We"
Cohesion: 0.10
Nodes (30): ai(), an(), bc(), cd(), Cl(), D(), E0(), Es() (+22 more)

### Community 61 - "app/package.json"
Cohesion: 0.04
Nodes (46): deleteR2File(), isR2Configured, POST(), config, updateSession(), config, middleware(), config (+38 more)

### Community 62 - "rf"
Cohesion: 0.13
Nodes (29): ad(), af(), ao(), At(), fs(), gi(), ja(), Kl() (+21 more)

### Community 63 - "yf"
Cohesion: 0.33
Nodes (11): hf(), hn(), jf(), Kt(), mn(), Na(), pf(), qi() (+3 more)

### Community 64 - "lf"
Cohesion: 0.27
Nodes (14): ao(), fs(), gi(), lf(), ms(), _o(), os(), qt() (+6 more)

### Community 65 - "r"
Cohesion: 0.12
Nodes (51): af(), as(), di(), eh(), fi(), Fr(), Fu(), gd() (+43 more)

### Community 66 - "schemas.ts"
Cohesion: 0.10
Nodes (22): GET(), CoachMessage(), CoachMessageProps, generateProNutritionLayer(), getProfileNutritionContext(), FITNESS_PLAN_SYSTEM_PROMPT, CoachResponseData, FITNESS_PLAN_JSON_SCHEMA (+14 more)

### Community 67 - "onboarding-flow.tsx"
Cohesion: 0.08
Nodes (22): saveFitnessOnboardingAction(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_goal (+14 more)

### Community 68 - "le"
Cohesion: 0.12
Nodes (33): bf(), ch(), dc(), dd(), df(), Fu(), gu(), hf() (+25 more)

### Community 69 - "fitness-dashboard.tsx"
Cohesion: 0.04
Nodes (48): fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), AdminSupportInbox(), NutritionLoading(), ProfileLoading(), ProgressLoading(), FitnessChatbot() (+40 more)

### Community 70 - "y0"
Cohesion: 0.11
Nodes (26): bm(), Dl(), ds(), ea(), $f(), G0(), Ga(), Gf() (+18 more)

### Community 71 - "We"
Cohesion: 0.11
Nodes (29): A0(), bc(), cd(), D(), Es(), fl(), go(), Hl() (+21 more)

### Community 72 - "F"
Cohesion: 0.09
Nodes (4): F, I, k(), q

### Community 73 - "AIPlanAnimation.tsx"
Cohesion: 0.09
Nodes (36): DietShowcasePreview(), foodRoutineLabel(), getPlanGenerationErrorType(), GroceryShowcasePreview(), planAnchorDate(), PlanGenerationError, PlanSetupPage(), requestPlanDraft() (+28 more)

### Community 74 - "Ih"
Cohesion: 0.04
Nodes (71): Ih(), b0(), bf(), bm(), Cl(), cn(), da(), dc() (+63 more)

### Community 75 - ".get"
Cohesion: 0.19
Nodes (8): Ct(), ef, oe(), qc(), rf, rl(), sf(), ul()

### Community 76 - "fitness-notifications.ts"
Cohesion: 0.17
Nodes (19): clearAllNotificationsAction(), deriveLinkFromType(), FitnessNotificationItem, formatDateReadable(), getIstDateString(), getOrSyncFitnessNotifications(), getUnreadNotificationsCountAction(), markAllNotificationsAsReadAction() (+11 more)

### Community 77 - "Wo"
Cohesion: 0.10
Nodes (26): A0(), ai(), as(), cm(), Ct(), Es(), ff(), fl() (+18 more)

### Community 78 - "vc"
Cohesion: 0.07
Nodes (26): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+18 more)

### Community 79 - "r"
Cohesion: 0.10
Nodes (43): ao(), b0(), c0(), ci(), dn(), ee(), ef(), ge() (+35 more)

### Community 80 - "ee"
Cohesion: 0.29
Nodes (14): c0(), cf(), ci(), ee(), ef(), is(), lo(), ml() (+6 more)

### Community 81 - "Wh"
Cohesion: 0.22
Nodes (16): $h(), D(), hu(), w(), X(), Zc(), r(), rx() (+8 more)

### Community 82 - "subscription/types.ts"
Cohesion: 0.16
Nodes (14): ProfileSubscriptionProps, PricingCard(), PricingCardProps, ProPageClient(), ProPageClientProps, CORE_PLAN, FREE_PLAN, PRO_PLAN (+6 more)

### Community 83 - "Ph"
Cohesion: 0.04
Nodes (82): Ph(), b0(), bm(), Bt(), bu(), cf(), Cl(), dc() (+74 more)

### Community 84 - "Ye"
Cohesion: 0.09
Nodes (43): hx(), E(), M(), _a(), ad(), ah(), bd(), bh() (+35 more)

### Community 85 - "Ye"
Cohesion: 0.24
Nodes (21): Da(), dh(), dt(), ea(), fh(), gh(), hh(), jd() (+13 more)

### Community 86 - "l"
Cohesion: 0.07
Nodes (52): At(), bi(), bo(), ch(), co(), cs(), df(), eo() (+44 more)

### Community 87 - "Ye"
Cohesion: 0.18
Nodes (24): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+16 more)

### Community 88 - "l"
Cohesion: 0.09
Nodes (52): ar(), bi(), bo(), co(), cs(), Ct(), eo(), Fa() (+44 more)

### Community 89 - "r"
Cohesion: 0.15
Nodes (42): S, ot(), af(), ai(), an(), b0(), bu(), di() (+34 more)

### Community 90 - "reminders-client.tsx"
Cohesion: 0.18
Nodes (15): updateRemindersAction(), formatDaysSummary(), getEmojiForType(), ReminderItem, RemindersClient(), WEEK_DAYS, REMINDER_TYPES, ReminderTypeSheet() (+7 more)

### Community 91 - "uf"
Cohesion: 0.10
Nodes (29): as(), dn(), Fr(), Fu(), ha(), hc(), hi(), ht() (+21 more)

### Community 92 - "bt"
Cohesion: 0.08
Nodes (51): ao(), At(), bc(), bo(), c0(), cf(), ci(), Dd() (+43 more)

### Community 93 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, @tailwindcss/typography, @types/canvas-confetti, @types/node (+2 more)

### Community 94 - "_0"
Cohesion: 0.22
Nodes (19): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), Gl() (+11 more)

### Community 95 - "Rs"
Cohesion: 0.08
Nodes (13): ar(), en(), H(), ja(), ls(), nn(), Oi(), ol() (+5 more)

### Community 96 - "types/index.ts"
Cohesion: 0.12
Nodes (16): Achievement, AchievementCategory, AIHabitPlan, AIHabitPlanItem, AISession, AISessionType, Habit, HabitCategory (+8 more)

### Community 97 - "af"
Cohesion: 0.23
Nodes (17): af(), fs(), hn(), io(), ll(), ms(), no(), _o() (+9 more)

### Community 98 - "import-usda-foundation-foods.mjs"
Cohesion: 0.08
Nodes (24): main(), supabase, buildRow(), DEFAULT_JSON_PATH, dryRun, findRecord(), IMPORT_MAP, missing (+16 more)

### Community 99 - "rf"
Cohesion: 0.10
Nodes (40): _0(), as(), c0(), cf(), ch(), ci(), ds(), ee() (+32 more)

### Community 100 - "sf"
Cohesion: 0.15
Nodes (16): Bt(), ke(), la(), lh(), Ln(), md(), Mi(), sc() (+8 more)

### Community 101 - "l"
Cohesion: 0.07
Nodes (52): At(), Ba(), t(), ch(), co(), cs(), Ct(), dd() (+44 more)

### Community 102 - "Ih"
Cohesion: 0.04
Nodes (82): Ih(), A0(), an(), as(), bc(), bh(), cd(), Cl() (+74 more)

### Community 103 - "_0"
Cohesion: 0.12
Nodes (34): _0(), c0(), cf(), ci(), D0(), dn(), ee(), ef() (+26 more)

### Community 104 - "C"
Cohesion: 0.14
Nodes (8): bf(), dc(), gu(), Kr(), O0(), Pu(), Ut(), C

### Community 105 - "Wh"
Cohesion: 0.15
Nodes (25): $h(), hx(), C(), E(), bd(), D(), dh(), fh() (+17 more)

### Community 106 - "rf"
Cohesion: 0.07
Nodes (50): _0(), as(), bu(), c0(), cf(), ch(), ds(), er() (+42 more)

### Community 107 - "D0"
Cohesion: 0.24
Nodes (18): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gl() (+10 more)

### Community 108 - "c0"
Cohesion: 0.12
Nodes (28): bs(), bs(), bs(), bs(), c0(), D0(), df(), fe() (+20 more)

### Community 109 - "l"
Cohesion: 0.08
Nodes (53): At(), Ba(), t(), bf(), bi(), ch(), Ct(), eo() (+45 more)

### Community 110 - "Ph"
Cohesion: 0.05
Nodes (64): Ph(), aa(), ad(), ar(), bf(), bh(), bm(), Bt() (+56 more)

### Community 111 - "r"
Cohesion: 0.10
Nodes (29): ar(), b0(), Ba(), t(), Cn(), dc(), ft(), ge() (+21 more)

### Community 112 - "zn"
Cohesion: 0.17
Nodes (27): Bt(), Da(), dh(), dt(), ea(), fh(), gh(), hh() (+19 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 114 - "pc"
Cohesion: 0.17
Nodes (29): bd(), Da(), dh(), dt(), ea(), fh(), gc(), gh() (+21 more)

### Community 115 - "r"
Cohesion: 0.21
Nodes (31): af(), di(), Do(), fi(), gs(), Gt(), js(), mo() (+23 more)

### Community 116 - "_0"
Cohesion: 0.28
Nodes (16): _0(), D0(), df(), fe(), Gl(), Gn(), Lu(), mn() (+8 more)

### Community 117 - "E"
Cohesion: 0.31
Nodes (11): r(), mx(), ic(), Il(), nc(), ud(), w(), z() (+3 more)

### Community 118 - "D0"
Cohesion: 0.25
Nodes (17): D0(), dn(), Ei(), fe(), ff(), Fl(), gd(), Gn() (+9 more)

### Community 119 - "mi"
Cohesion: 0.30
Nodes (12): ci(), Dl(), ee(), ef(), is(), jt(), lo(), ml() (+4 more)

### Community 120 - "_0"
Cohesion: 0.24
Nodes (18): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), gd() (+10 more)

### Community 121 - "users-table-client.tsx"
Cohesion: 0.14
Nodes (18): deleteUserAdminAction(), extendUserSubscriptionAdminAction(), sendBulkUserEmailAdminAction(), sendUserEmailAdminAction(), DeleteUserButton(), AdminUsersPage(), PaymentHistoryModal(), PaymentHistoryModalProps (+10 more)

### Community 122 - "nu"
Cohesion: 0.11
Nodes (7): eu(), gf, jf(), Mn, nu, qu(), Ss()

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "ve"
Cohesion: 0.12
Nodes (39): _0(), c0(), cf(), ci(), D0(), ee(), ef(), Ei() (+31 more)

### Community 125 - "yf"
Cohesion: 0.14
Nodes (10): df(), hc, hf(), kc(), lc, mf(), pf(), ro (+2 more)

### Community 126 - "af"
Cohesion: 0.26
Nodes (15): af(), fs(), hn(), io(), ll(), ms(), no(), _o() (+7 more)

### Community 127 - "sf"
Cohesion: 0.11
Nodes (35): _0(), ao(), bc(), Bl(), cd(), ci(), Dd(), dn() (+27 more)

### Community 128 - "Wh"
Cohesion: 0.27
Nodes (14): $h(), w(), X(), r(), rx(), Wh(), ct(), el() (+6 more)

### Community 129 - "lf"
Cohesion: 0.32
Nodes (12): ao(), fs(), gi(), lf(), ms(), no(), os(), Rl() (+4 more)

### Community 130 - "ee"
Cohesion: 0.19
Nodes (19): c0(), cf(), ci(), ee(), ef(), Fu(), is(), ji() (+11 more)

### Community 131 - "fitness-reminders/route.ts"
Cohesion: 0.20
Nodes (12): dynamic, formatTo12Hour(), GET(), getIstDateInfo(), getServiceSupabase(), ReminderNotification, revalidate, uniqueByTag() (+4 more)

### Community 132 - "l"
Cohesion: 0.06
Nodes (66): At(), bi(), bo(), cn(), co(), cs(), Ct(), dd() (+58 more)

### Community 133 - "Wh"
Cohesion: 0.27
Nodes (14): $h(), w(), X(), r(), rx(), Wh(), ct(), el() (+6 more)

### Community 134 - "hl"
Cohesion: 0.16
Nodes (20): Ct(), dd(), Ii(), Je(), Jl(), lh(), md(), mf() (+12 more)

### Community 135 - "coupons/page.tsx"
Cohesion: 0.33
Nodes (6): createCouponAction(), toggleCouponStatusAction(), ClientCouponForm(), CopyButton(), AdminCouponsPage(), ToggleCouponButton()

### Community 136 - "r"
Cohesion: 0.13
Nodes (45): ai(), b0(), bu(), di(), Do(), eh(), fi(), Fr() (+37 more)

### Community 137 - "_0"
Cohesion: 0.22
Nodes (19): _0(), D0(), df(), Do(), en(), fe(), Gl(), Gn() (+11 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 139 - "wf"
Cohesion: 0.22
Nodes (10): aa(), Ei(), hd(), ke(), Mi(), Qc(), wd(), wf() (+2 more)

### Community 140 - "nutrition-view.tsx"
Cohesion: 0.06
Nodes (39): TodaysGoalsCard(), TodaysGoalsCardProps, formatFoodItem(), TodaysNutritionCard(), TodaysNutritionCardProps, FoodAvatar(), FoodAvatarProps, Food (+31 more)

### Community 141 - "$h"
Cohesion: 0.15
Nodes (26): $h(), ct(), el(), g(), m(), ot(), r(), Re() (+18 more)

### Community 142 - "tt"
Cohesion: 0.34
Nodes (15): ui(), ui(), of(), q0(), ui(), ui(), ui(), ui() (+7 more)

### Community 143 - "Key Architectural Patterns"
Cohesion: 0.22
Nodes (8): 1. Parallel Batching vs. Sequential Waterfalls, 2. In-Memory Calendar & Status Math, 3. Immediate Suspense Streaming, 4. Router Caching & Optimistic Tab Transitions, 5. Theme Architecture (Dark & White), Architectural Overview, Architecture & Data Flow — GrindLog, Key Architectural Patterns

### Community 144 - "Technology Stack — GrindLog"
Cohesion: 0.22
Nodes (8): AI & LLM Integrations, Core Runtime & Framework, Data Layer & State, Mobile & PWA, Payments & Subscriptions, Styling & Design System, Technology Stack — GrindLog, Utilities & Validation

### Community 145 - "Critical Test Flows"
Cohesion: 0.22
Nodes (8): 1. Tab Navigation & Instant Switching, 2. Dual-Theme Verification (Dark vs. White), 3. Workout Logging & State Persistence, 4. Nutrition & Calorie Tracking, 5. Authentication & Subscription Guard Rails, Critical Test Flows, Testing & Verification Guide — GrindLog, Verification Commands

### Community 146 - "af"
Cohesion: 0.13
Nodes (26): _a(), af(), Dl(), ds(), fs(), G0(), hn(), io() (+18 more)

### Community 147 - "dx"
Cohesion: 0.07
Nodes (54): am(), ap(), ax(), Bn, cx(), de(), Dn(), dx() (+46 more)

### Community 149 - "Concerns, Technical Debt & Watch-Outs — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Database Waterfall Regressions, 2. White Theme CSS Overrides, 3. PWA Service Worker Cache Invalidation, 4. Mobile Keyboard & Viewport Layout Shifts, 5. Razorpay Webhook Idempotency & Webhook Retries, Concerns, Technical Debt & Watch-Outs — GrindLog

### Community 150 - "External Integrations & Services — GrindLog"
Cohesion: 0.25
Nodes (7): 1. Supabase (Database, Auth, Storage), 2. Razorpay (Payment Gateway), 3. Google Gemini AI (@google/genai), 4. PWA Service Worker (Next-PWA & Workbox), 5. Resend (Email Service), 6. Developer Tooling & Agent Workflow Suite, External Integrations & Services — GrindLog

### Community 151 - "Product & Technical Requirements — GrindLog"
Cohesion: 0.29
Nodes (6): 1. Performance & Latency Requirements, 2. Workout & Fitness Requirements, 3. Nutrition & Diet Requirements, 4. Design & Mobile Experience Requirements, 5. Security & Billing Requirements, Product & Technical Requirements — GrindLog

### Community 152 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, import:usda, lint, start, type-check

### Community 153 - "zf"
Cohesion: 0.38
Nodes (7): mn(), Na(), Pa(), qs(), vs(), xn(), zf()

### Community 156 - "Onboarding Summary — GrindLog"
Cohesion: 0.40
Nodes (4): Artifacts Created:, Next Steps, Onboarding Complete, Onboarding Summary — GrindLog

### Community 157 - "Project Charter — GrindLog"
Cohesion: 0.40
Nodes (4): Core Modules, Project Charter — GrindLog, Success Metrics, Vision & Purpose

### Community 158 - "Coding Conventions & Standards — GrindLog"
Cohesion: 0.33
Nodes (5): 1. Performance Standards (Mobile 60fps Target), 2. Design System & Theming, 3. Server vs. Client Boundary Rules, 4. TypeScript & Error Handling, Coding Conventions & Standards — GrindLog

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 161 - "Product Roadmap — GrindLog"
Cohesion: 0.33
Nodes (5): Phase 1: Core Performance & Tab Optimization [COMPLETED], Phase 2: Nutrition & Food Logging Enhancements [UPCOMING], Phase 3: Workout Audio, Haptics & Offline Sync [PLANNED], Phase 4: Social, Leaderboards & Gamification [PLANNED], Product Roadmap — GrindLog

### Community 164 - "nutrition-service.ts"
Cohesion: 0.06
Nodes (48): GET(), POST(), DELETE(), normalizeMealType(), POST(), VALID_MEAL_TYPES, GET(), GET() (+40 more)

### Community 175 - "kt"
Cohesion: 0.12
Nodes (12): aa, dl(), eo(), ir(), kt(), pi(), pl, qi (+4 more)

### Community 176 - "ai-insight-card.tsx"
Cohesion: 0.40
Nodes (3): PlanAdjustment, ProgressReview, WeeklyWorkoutStats

## Knowledge Gaps
- **520 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+515 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 869 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `uc`, `index-B23vSfwu.js`, `l`, `Ph`, `uc`, `index-Buds9Sm1.js`, `Ph`, `hl`, `index-LDG-1p68.js`, `tt`, `Ot`, `Ih`, `Bi`, `dx`, `of`, `index-DtLkR01C.js`, `il`, `r`, `.add`, `uc`, `ff`, `uc`, `_c`, `pr`, `fl`, `kt`, `jn`, `au`, `et`, `Hi`, `st`, `le`, `.get`, `Wo`, `vc`, `Ph`, `l`, `uf`, `bt`, `Rs`, `af`, `l`, `Ih`, `_0`, `rf`, `c0`, `r`, `zn`, `pc`, `mi`, `nu`, `ve`, `yf`, `sf`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `index-B23vSfwu.js`, `tt`, `Bi`, `il`, `zf`, `dx`, `r`, `fl`, `au`, `et`, `B`, `st`, `l`, `lf`, `vc`, `Ye`, `rf`, `D0`, `c0`, `r`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `ee`, `index-B23vSfwu.js`, `r`, `tt`, `Bi`, `dx`, `il`, `l`, `pr`, `fl`, `et`, `B`, `st`, `rf`, `y0`, `vc`, `Wh`, `sf`, `C`, `c0`, `r`, `_0`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._