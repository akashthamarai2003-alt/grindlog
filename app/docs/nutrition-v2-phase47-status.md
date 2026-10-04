# Nutrition V2 Phase 4.7 status

Updated 2026-10-04. Phase 4.7 is **not complete**. V2 remains disabled.

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

## Executed checks after these fixes

- TypeScript: zero errors.
- Phase 3: 20 assertions passed.
- Phase 4: 365 assertions passed, including successful module loading.
- Phase 4.5: 12 read-only assertions passed. Its old direct-write suites remain
  disabled and were not counted as executed.
- Phase 4.7: seven tests / 29 assertion calls passed.
- Nutrition safety: five tests passed.

## Remaining blockers

- The designated account's saved profile fails the existing planner quality
  gate and exceeds its correctly mapped budget. No plan was persisted.
- A temporary three-meal development setup passes the dry run at 95/100 and
  721 weekly cost against 1,125. Changing body and living details requires the
  account owner's approval, with original fields restored after testing. The
  earlier four-meal proposal exceeds the corrected budget and is superseded.
- Recipe/template image URLs use an unresolvable host, and the inspected
  recipe/template storage prefixes contain no assets. Metadata presence is not
  proof that images resolve.
- Actual plan persistence/reload, Day 1 service output, lunch swap, planned and
  different-actual-food logging, adaptive macros, and grocery persistence still
  need the real designated-account flow. Passing isolated tests does not prove
  these steps.

No further production migration or general rollout is authorized by this file.
