# Graph Report - web  (2026-09-22)

## Corpus Check
- 402 files · ~3,419,066 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 6, (none) 5, .example 1)

## Summary
- 6301 nodes · 22374 edges · 162 communities (149 shown, 13 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 2685 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1c2b39ee`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- uc
- _
- next
- index-B23vSfwu.js
- index-LDG-1p68.js
- (fitness)/support/page.tsx
- Ph
- dx
- index-Buds9Sm1.js
- Ph
- types/index.ts
- st
- progress-view.tsx
- index-DtLkR01C.js
- constants.ts
- pr
- Ih
- Bi
- analyze/route.ts
- sf
- createAdminClient
- af
- dl
- Ih
- il
- he
- r
- ku
- ie
- one-rm.ts
- We
- n
- wf
- uc
- uc
- l
- Ot
- rf
- n
- dx
- r
- ai-insight-card.tsx
- Q
- fu
- generate-draft/route.ts
- rf
- l
- jn
- dependencies
- sf
- Ih
- dx
- et
- of
- Hl
- Rs
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
- next-pwa.d.ts
- onboarding-flow.tsx
- le
- supabase/server.ts
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
- of
- _0
- r0
- uc
- r
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
- nu
- manifest.json
- _0
- yf
- ee
- sf
- fitness-reminders/route.ts
- l
- Ye
- ue
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
- fitness-dashboard.tsx
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
- `Phase 1: Core Performance & Tab Optimization [COMPLETED]` --references--> `BottomNav()`  [INFERRED]
  .planning/ROADMAP.md → app/components/fitness/dashboard/bottom-nav.tsx
- `Recent Decisions` --references--> `FitnessShell()`  [INFERRED]
  .planning/STATE.md → app/components/fitness/fitness-shell.tsx

## Import Cycles
- None detected.

## Communities (162 total, 13 thin omitted)

### Community 0 - "uc"
Cohesion: 0.07
Nodes (52): _a(), Bt(), bu(), dt(), er(), Fn(), ft(), gc() (+44 more)

### Community 1 - "_"
Cohesion: 0.02
Nodes (127): _, aa, ac(), al(), ao(), As, at, Be() (+119 more)

### Community 2 - "next"
Cohesion: 0.02
Nodes (122): loginAdminAction(), exportUserData(), exportWorkoutHistoryCSV(), completeExerciseSetsAction(), completeSetAction(), discardWorkoutSessionAction(), endWorkoutAction(), finishWorkoutSessionAction() (+114 more)

### Community 3 - "index-B23vSfwu.js"
Cohesion: 0.06
Nodes (89): app_public_assets_gsap_c8iefbvz_g, app_public_assets_gsap_c8iefbvz_s, $, A, b, c(), D, e() (+81 more)

### Community 4 - "index-LDG-1p68.js"
Cohesion: 0.08
Nodes (41): e(), Ml(), Ol(), tr(), am(), ax(), Bx, Cc() (+33 more)

### Community 5 - "(fitness)/support/page.tsx"
Cohesion: 0.26
Nodes (9): getUserSupportMessages(), submitSupportMessage(), dynamic, FitnessSupportPage(), revalidate, SUPPORT_CATEGORIES, SupportClient(), SupportClientProps (+1 more)

### Community 6 - "Ph"
Cohesion: 0.04
Nodes (85): Ph(), as(), Bd(), bh(), Bl(), bm(), br(), cd() (+77 more)

### Community 7 - "dx"
Cohesion: 0.08
Nodes (49): am(), ap(), ax(), Bn, de(), Dn(), dx(), El() (+41 more)

### Community 8 - "index-Buds9Sm1.js"
Cohesion: 0.05
Nodes (95): $, A, b, c(), D, e(), f, g (+87 more)

### Community 9 - "Ph"
Cohesion: 0.04
Nodes (105): Ih(), Ph(), A0(), ai(), ar(), bh(), cd(), Cl() (+97 more)

### Community 10 - "types/index.ts"
Cohesion: 0.04
Nodes (53): bottomSheetVariants, cardHover, fadeUpVariants, pageVariants, scaleInVariants, springs, staggerContainer, staggerItem (+45 more)

### Community 11 - "st"
Cohesion: 0.15
Nodes (22): T0(), E0(), E0(), T0(), E0(), E0(), E0(), b0() (+14 more)

### Community 12 - "progress-view.tsx"
Cohesion: 0.05
Nodes (59): GET(), POST(), POST(), GET(), AchievementsShowcase(), ActivityRecoveryAnalyticsCard(), AIProgressReviewCard(), BodyMeasurementsList() (+51 more)

### Community 13 - "index-DtLkR01C.js"
Cohesion: 0.04
Nodes (140): $, A, b, c(), D, e(), f, g (+132 more)

### Community 14 - "constants.ts"
Cohesion: 0.05
Nodes (89): resetGroceryItemsAction(), toggleGroceryItemPurchasedAction(), GroceryPage(), metadata, GroceryItemCard, GroceryItemCardProps, GroceryView(), GroceryViewProps (+81 more)

### Community 15 - "pr"
Cohesion: 0.09
Nodes (10): du(), Hn(), lr(), lu(), _n, or(), pr, pu() (+2 more)

### Community 16 - "Ih"
Cohesion: 0.04
Nodes (85): $h(), Ih(), ad(), ai(), an(), as(), bc(), c0() (+77 more)

### Community 17 - "Bi"
Cohesion: 0.15
Nodes (20): a0(), Fn(), gr(), i0(), ju(), l0(), ld(), oh() (+12 more)

### Community 18 - "analyze/route.ts"
Cohesion: 0.08
Nodes (36): POST(), POST(), stableStringify(), stripImagePayload(), POST(), AIStartingReportPage(), displayValue(), dynamic (+28 more)

### Community 19 - "sf"
Cohesion: 0.13
Nodes (25): bc(), Bd(), Bl(), bm(), D(), Dd(), dn(), fh() (+17 more)

### Community 20 - "createAdminClient"
Cohesion: 0.04
Nodes (88): createCouponAction(), toggleCouponStatusAction(), getPlanPricesAction(), updatePlanPricesAction(), fetchSupportMessages(), updateMessageStatus(), verifyAdmin(), deleteUserAdminAction() (+80 more)

### Community 21 - "af"
Cohesion: 0.21
Nodes (17): af(), co(), cs(), fs(), hn(), io(), ll(), ms() (+9 more)

### Community 22 - "dl"
Cohesion: 0.18
Nodes (6): dl(), ir(), pl, qi, Rn(), sn()

### Community 23 - "Ih"
Cohesion: 0.04
Nodes (87): Ih(), bf(), bh(), bm(), Cl(), cm(), cn(), dc() (+79 more)

### Community 24 - "il"
Cohesion: 0.06
Nodes (18): n(), Fn(), hu(), ic(), il, jr, ma(), mu() (+10 more)

### Community 25 - "he"
Cohesion: 0.12
Nodes (27): bs(), bs(), bs(), bs(), $h(), ct(), el(), m() (+19 more)

### Community 26 - "r"
Cohesion: 0.14
Nodes (42): ai(), b0(), bh(), di(), Do(), eh(), fi(), Fr() (+34 more)

### Community 27 - "ku"
Cohesion: 0.06
Nodes (23): af, Cn(), a(), Gn, Gu(), kl(), ku(), _l() (+15 more)

### Community 28 - "ie"
Cohesion: 0.10
Nodes (31): ao(), At(), bi(), bo(), co(), cs(), fo(), go() (+23 more)

### Community 29 - "one-rm.ts"
Cohesion: 0.36
Nodes (5): bestEstimated1RM(), epley1RM(), estimated1RM(), format1RM(), ONE_RM_REP_CAP

### Community 30 - "We"
Cohesion: 0.09
Nodes (32): A0(), an(), as(), bc(), cd(), da(), Es(), Hl() (+24 more)

### Community 31 - "n"
Cohesion: 0.15
Nodes (39): $h(), ct(), el(), g(), m(), ot(), Re(), zt() (+31 more)

### Community 32 - "wf"
Cohesion: 0.18
Nodes (13): aa(), Ba(), t(), Ei(), hd(), Ii(), ke(), Mi() (+5 more)

### Community 33 - "uc"
Cohesion: 0.10
Nodes (32): a0(), er(), Fa(), Fn(), ft(), gr(), i0(), Ic() (+24 more)

### Community 34 - "uc"
Cohesion: 0.11
Nodes (28): r(), mx(), as(), br(), cr(), Fn(), gr(), ic() (+20 more)

### Community 35 - "l"
Cohesion: 0.09
Nodes (48): ar(), ch(), co(), cs(), Ct(), dd(), df(), eo() (+40 more)

### Community 36 - "Ot"
Cohesion: 0.06
Nodes (97): Xx(), Yx(), ap(), ax(), Bn, cm(), ep(), Fx() (+89 more)

### Community 37 - "rf"
Cohesion: 0.15
Nodes (27): ad(), af(), fs(), gi(), Kl(), lf(), ls(), ms() (+19 more)

### Community 38 - "n"
Cohesion: 0.21
Nodes (31): ot(), ad(), an(), bu(), di(), eh(), fi(), Gt() (+23 more)

### Community 39 - "dx"
Cohesion: 0.11
Nodes (30): am(), de(), Dn(), dx(), El(), Ex(), $h(), Ha() (+22 more)

### Community 40 - "r"
Cohesion: 0.15
Nodes (40): af(), ai(), bu(), di(), Do(), fi(), ft(), gs() (+32 more)

### Community 41 - "ai-insight-card.tsx"
Cohesion: 0.40
Nodes (3): PlanAdjustment, ProgressReview, WeeklyWorkoutStats

### Community 42 - "Q"
Cohesion: 0.05
Nodes (21): r0(), r0(), r0(), r0(), r0(), r0(), r0(), Ae() (+13 more)

### Community 43 - "fu"
Cohesion: 0.08
Nodes (32): z0(), z0(), ah(), bm(), Dl(), ea(), $f(), G0() (+24 more)

### Community 44 - "generate-draft/route.ts"
Cohesion: 0.04
Nodes (129): GET(), approveFitnessPlanAdjustmentAction(), dynamic, GET(), POST(), revalidate, POST(), maxDuration (+121 more)

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

### Community 51 - "dx"
Cohesion: 0.08
Nodes (49): am(), ap(), ax(), Bn, cm(), de(), Dn(), dx() (+41 more)

### Community 52 - "et"
Cohesion: 0.07
Nodes (14): Bl(), Bl(), Bl(), Bl(), rr(), Bl(), rr(), rr() (+6 more)

### Community 53 - "of"
Cohesion: 0.10
Nodes (50): af(), an(), At(), bh(), di(), eh(), fi(), fs() (+42 more)

### Community 54 - "Hl"
Cohesion: 0.11
Nodes (27): A0(), ai(), b0(), Cl(), cm(), co(), cs(), Es() (+19 more)

### Community 55 - "Rs"
Cohesion: 0.13
Nodes (6): H(), ls(), Rs(), ru, uc(), vs()

### Community 56 - "Ye"
Cohesion: 0.17
Nodes (25): hx(), E(), M(), _a(), bd(), dh(), dt(), fh() (+17 more)

### Community 57 - "r"
Cohesion: 0.12
Nodes (38): aa(), ar(), Bt(), Da(), dh(), dt(), ea(), ft() (+30 more)

### Community 58 - "Vo"
Cohesion: 0.14
Nodes (19): bn, dc(), Fo, ks(), li, Lt(), so(), tn() (+11 more)

### Community 59 - "l"
Cohesion: 0.09
Nodes (51): At(), bi(), bo(), Ct(), dd(), df(), eo(), fo() (+43 more)

### Community 60 - "Ye"
Cohesion: 0.18
Nodes (24): hx(), E(), M(), _a(), bd(), bh(), dh(), dt() (+16 more)

### Community 61 - "app/package.json"
Cohesion: 0.03
Nodes (66): deleteR2File(), deleteScanPhotosFromR2(), isR2Configured, POST(), deleteR2File(), isR2Configured, POST(), config (+58 more)

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

### Community 67 - "onboarding-flow.tsx"
Cohesion: 0.08
Nodes (22): saveFitnessOnboardingAction(), app_assets_images_placeholder_back, app_assets_images_placeholder_back_female, app_assets_images_placeholder_back_male_fat, app_assets_images_placeholder_front, app_assets_images_placeholder_front_female, app_assets_images_placeholder_front_male_fat, app_assets_images_placeholder_goal (+14 more)

### Community 68 - "le"
Cohesion: 0.12
Nodes (33): bf(), ch(), dc(), dd(), df(), Fu(), gu(), hf() (+25 more)

### Community 69 - "supabase/server.ts"
Cohesion: 0.03
Nodes (68): quickCompleteWorkoutAction(), GET(), POST(), generateSlug(), POST(), POST(), PATCH(), POST() (+60 more)

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
Cohesion: 0.07
Nodes (26): zh(), wh(), zh(), wh(), zh(), zh(), wh(), zh() (+18 more)

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
Cohesion: 0.05
Nodes (47): toggleRemindersEnabledAction(), updateFitnessProfilePartialAction(), updateRemindersAction(), metadata, RemindersPage(), formatDaysSummary(), getEmojiForType(), ReminderItem (+39 more)

### Community 91 - "bt"
Cohesion: 0.07
Nodes (57): c0(), cf(), ci(), dn(), ee(), ef(), Fr(), Fu() (+49 more)

### Community 92 - "of"
Cohesion: 0.12
Nodes (30): ao(), At(), c0(), cf(), ci(), ee(), ef(), Fu() (+22 more)

### Community 94 - "_0"
Cohesion: 0.22
Nodes (19): _0(), D0(), dn(), Ei(), fe(), ff(), Fl(), Gl() (+11 more)

### Community 95 - "r0"
Cohesion: 0.13
Nodes (21): bm(), Dl(), ea(), $f(), G0(), Ga(), Gf(), If() (+13 more)

### Community 96 - "uc"
Cohesion: 0.17
Nodes (18): as(), Fn(), gr(), ju(), l0(), ld(), n0(), pr() (+10 more)

### Community 97 - "r"
Cohesion: 0.09
Nodes (54): bf(), bi(), ch(), Ct(), eo(), gd(), e(), l() (+46 more)

### Community 98 - "import-usda-foundation-foods.mjs"
Cohesion: 0.11
Nodes (17): buildRow(), DEFAULT_JSON_PATH, dryRun, findRecord(), IMPORT_MAP, missing, nutrient(), payload (+9 more)

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
Cohesion: 0.16
Nodes (29): Bt(), Da(), dh(), dt(), ea(), gh(), hh(), jd() (+21 more)

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

### Community 122 - "nu"
Cohesion: 0.10
Nodes (7): eu(), gf, jf(), Mn, nu, qu(), Ss()

### Community 123 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, dir, display, icons, lang, name (+9 more)

### Community 124 - "_0"
Cohesion: 0.30
Nodes (15): _0(), D0(), Ei(), fe(), ff(), Gn(), Lu(), mn() (+7 more)

### Community 125 - "yf"
Cohesion: 0.15
Nodes (10): df(), hc, hf(), kc(), lc, mf(), pf(), ro (+2 more)

### Community 126 - "ee"
Cohesion: 0.23
Nodes (16): c0(), cf(), ci(), ee(), ef(), Fu(), is(), lo() (+8 more)

### Community 127 - "sf"
Cohesion: 0.09
Nodes (40): _0(), ao(), bc(), Bl(), cd(), ci(), Dd(), Dl() (+32 more)

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

### Community 136 - "r"
Cohesion: 0.16
Nodes (39): ai(), b0(), bu(), di(), Do(), eh(), fi(), Fr() (+31 more)

### Community 137 - "_0"
Cohesion: 0.37
Nodes (13): _0(), D0(), df(), fe(), Gn(), Lu(), mn(), nt() (+5 more)

### Community 138 - "grocery-tab.tsx"
Cohesion: 0.32
Nodes (11): dailyQuantityLabel(), foodKey(), formatMoney(), formatQuantity(), getBudgetReference(), GroceryItem, GroceryTab(), isCoreMeal() (+3 more)

### Community 140 - "nutrition-view.tsx"
Cohesion: 0.07
Nodes (36): TodaysGoalsCard(), TodaysGoalsCardProps, FoodAvatar(), FoodAvatarProps, Food, FOOD_CATEGORIES, formatMealType(), LogFoodModal() (+28 more)

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

### Community 158 - "fitness-dashboard.tsx"
Cohesion: 0.04
Nodes (51): NutritionLoading(), dynamic, ProfileLoading(), ProgressLoading(), FitnessChatbot(), Message, BottomNav(), DailyActivityCard() (+43 more)

### Community 159 - "coach.ts"
Cohesion: 0.50
Nodes (3): CoachMessage, CoachResponse, CoachSession

### Community 160 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, framer-motion, framer-motion

### Community 164 - "createServerSupabase"
Cohesion: 0.04
Nodes (79): dynamic, POST(), POST(), POST(), GET(), POST(), GET(), MEASUREMENT_LIMITS (+71 more)

## Knowledge Gaps
- **526 isolated node(s):** `pageVariants`, `fadeUpVariants`, `scaleInVariants`, `staggerContainer`, `staggerItem` (+521 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 875 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `uc`, `index-B23vSfwu.js`, `index-LDG-1p68.js`, `Ye`, `Ph`, `index-Buds9Sm1.js`, `ff`, `st`, `index-DtLkR01C.js`, `tt`, `pr`, `Bi`, `Wo`, `of`, `dl`, `Ih`, `il`, `he`, `ku`, `ie`, `uc`, `uc`, `Ot`, `Q`, `fu`, `jn`, `et`, `of`, `Rs`, `Vo`, `Ta`, `r`, `le`, `Hi`, `Ih`, `.get`, `uc`, `vc`, `Ph`, `bt`, `uc`, `rf`, `l`, `Ih`, `_0`, `hl`, `zn`, `pc`, `ve`, `nu`, `yf`, `sf`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `index-B23vSfwu.js`, `st`, `tt`, `Bi`, `il`, `he`, `Ot`, `dx`, `r`, `fu`, `et`, `l`, `Ye`, `lf`, `vc`, `bf`, `Ph`, `sf`, `B`, `rf`, `D0`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `Ih()` connect `Ih` to `_`, `index-B23vSfwu.js`, `r`, `st`, `tt`, `Bi`, `dx`, `il`, `he`, `l`, `Q`, `fu`, `et`, `Ye`, `i`, `Hi`, `Ih`, `vc`, `M0`, `Ph`, `B`, `rf`, `ve`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `Ph()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ph()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Ih()` (e.g. with `bi()` and `bo()`) actually correct?**
  _`Ih()` has 28 INFERRED edges - model-reasoned connections that need verification._