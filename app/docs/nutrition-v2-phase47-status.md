# Nutrition V2 Phase 4.7 status

Updated 2026-10-04. The real designated-account smoke flow ran. Phase 4.7 is
**not complete**. V2 is back to disabled for the test profile.

## Database evidence

- Read-only integrity verification executed 4,999 assertions. Canonical names
  resolve catalog foods to live UUIDs. Food orphan counts are zero for recipe
  ingredients, portion rules, prices, and template options.
- The prepared seed matches 15 templates, 54 slots, and 150 options in the live
  database. Catalog image metadata matches; asset delivery does not.
- Supabase SQL Editor results confirm the timestamp column, corrected logging
  function, ownership-consistent policies, and explicit RPC execution grants.
  The normalized body hashes match the reviewed repository versions:
  persist `b8018a4bf66ca3bf6e76eab8c34d147c`,
  swap `f0afa01b9412010c1091e373795a8fbf`,
  log `0afea0e58dcd0f2d323725ee8c5a4483`.
- The migration history table is absent. Deployment effects are verified; exact
  migration file history cannot be claimed. Do not rerun `20261002_05`, which
  would replace the corrected logging body. No migration was applied by this
  review runner.
- Real authenticated two-user RLS checks executed 81 assertions covering own
  access, foreign SELECT/INSERT/UPDATE/DELETE, mixed parent references, RPC
  ownership, legacy plan-only items, and anonymous execution denial. Access
  requests used authenticated anon-key clients. Admin access was limited to
  test-user setup, fixture survival checks, and exact-ID cleanup. Temporary
  fixtures and the temporary second user were removed. No V2 flag was changed.

## Small backend fixes

- Reload uses detailed V2 portion snapshots, whole-meal totals, and persisted meal slots in meal
  sequence, including snack. Compatibility rows remain available for legacy
  slots. Saved V2 rows do not receive synthesized legacy alternative meals or
  recipe-name substitutions.
- V2 budget mapping reuses the existing tier parser. The 2,000–5,000 tier is
  4,500 monthly / 1,125 weekly, rather than the premium 7,500 / 1,875 tier.
  Numeric budgets remain exact and the lowest tier no longer gains a 100-unit
  artificial increase. The Phase 4 fixture now uses the actual saved UI tier;
  its former custom range depended on the old incorrect 4,500 fallback.
- Missing catalog URLs on the unreachable `images.grindlog.in` host now store
  GrindLog's existing offline badge in the V2 plan and swap snapshots. Recipe
  and template asset identity remains intact. Actual asset coverage remains
  a separate rollout blocker.
- The service refuses regeneration over an already logged meal. The deployed
  persistence RPC still uses a different advisory key from logging and swap
  and deletes existing planned meals for the same dates. The staged
  `20261003_06` SQL uses the shared lock and refuses replacement of logged
  history under that lock. It has **not** been applied or verified live.

## Executed checks after these fixes

- TypeScript: zero errors.
- Phase 3: 20 assertions passed.
- Phase 4: 365 assertions passed, including successful module loading.
- Phase 4.5: 12 read-only assertions passed. Its old direct-write suites remain
  disabled and were not counted as executed.
- Phase 4.7: eight tests / 31 assertion calls passed.
- Nutrition safety: five tests passed.

## Real designated-account smoke result

- The exact original 81-field profile, four target rows, one workout plan,
  four grocery rows, and empty meal plan/log state were saved in a private
  temporary snapshot before any write. Only one approved test profile changed.
- Today's validated three-meal Hostel plan scored 89, costing 812 against the
  1,125 weekly budget. PostgreSQL persistence and reload showed 7 daily
  containers, 21 planned meals, 84 detailed items, and 84 compatibility items.
  All 21 meals used live templates; Day 1 displayed breakfast/lunch/dinner
  from V2. Their five food UUIDs, three template IDs, UTC timezone, and badge
  fallbacks resolved. No legacy meal generator produced the stored plan.
- Lunch changed from a template to a live recipe and variant. Its calories
  changed 902 to 744, cost 41 to 135, and three new ingredient rows persisted.
- Logging breakfast created four frozen V2 item logs totaling 650 kcal and
  marked that planned meal logged. Logging a different actual dinner food
  created one manual log of 195 kcal with no planned meal link; dinner stayed
  planned. Adaptive intake counted 845 kcal and left 1,260 kcal. Logged
  breakfast was unchanged after rejected swap and regeneration attempts.
- Grocery data persisted in both the workout plan and row table. The mess
  supplied three foods. A temporary pantry item reduced four purchase rows
  to three and retail estimate from 680 to 330. The original four grocery
  rows, workout plan data, four targets, and empty plan/log state were
  restored after the test and compared.

## Remaining blockers

- All original functional profile fields and the disabled V2 flag were restored
  and compared. The profile's `updated_at` trigger changed its timestamp again
  during restoration. Its old value was `2026-10-01T09:24:55.791454+00:00`;
  the live value after cleanup was `2026-10-04T10:04:05.124437+00:00`. An
  exact private snapshot and guarded SQL Editor restoration script are saved
  outside the Git repository. Exact profile restoration is **not yet proved**.
- `20261003_06` must be reviewed, applied, and verified before direct RPC
  callers can safely regenerate over logged history. The service guard alone
  does not close the concurrent RPC race. The staged persist function's
  normalized body hash is `46e3693967bb49a76c33c32083f9eb2e`; verify it
  with `nutrition_v2_phase47_post_history_guard_readonly.sql` after deployment.
- Actual recipe and template image assets are missing. Badge fallback passes
  the backend smoke test but is not production image coverage.

No further production migration or general rollout is authorized by this file.
