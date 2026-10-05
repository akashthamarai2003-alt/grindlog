# Phase 5B — recipe image coverage

Updated 2026-10-05. Image delivery safeguards and the first six reviewed assets are implemented. **Full recipe photo coverage remains incomplete: 214 recipes use the GrindLog fallback.** No Phase 5C rollout was started.

## Live audit

Source: the intended Supabase project `saoesvkicojsvuytcfid`, including live recipe/version/image rows, paginated Storage listings, public image downloads, decoded bytes and SHA-256 comparisons. Latest successful audit: `2026-10-05T04:37:42.320Z`.

| Measurement | Result |
| --- | ---: |
| Published canonical recipes / current recipe versions | 220 / 220 |
| Image database rows | 226 |
| APPROVED / DRAFT / REJECTED rows | 6 / 220 / 0 |
| Actual Storage objects | 46: 40 legacy food objects and 6 recipe photos |
| Recipes with verified approved photo | 6 |
| Recipes needing a photo / using fallback | 214 |
| Missing objects referenced by retained DRAFT rows | 220 |
| Unreachable URLs on those retained DRAFT rows | 220 |
| Missing or broken APPROVED assets | 0 |
| Ownership mismatches / duplicate approved primaries | 0 / 0 |
| Enabled V2 profiles in final read-only audit | 0 |

The initial audit found 220 APPROVED metadata rows with no corresponding recipe objects and unreachable `images.grindlog.in` URLs. Their exact values were snapshotted, then their status was changed to DRAFT with identity and timestamp guards. These rows were retained for historical references. Six new immutable asset rows were inserted as DRAFT and approved only after file, ownership and visual checks. Thus 220 historical missing objects does **not** mean 220 current recipes lack photos: six have replacement approved assets.

An intermediate delivery audit encountered three connection timeouts. All six approved URLs subsequently passed decoding and checksum verification. The observation is retained in [transient-delivery-observation.json](../artifacts/phase5b/transient-delivery-observation.json); it is not counted as a persistent broken asset.

## Published photos

- Tandoori Chicken Breast with Hot Phulkas
- Homestyle Palak Paneer with Hot Phulkas
- Indian Egg Bhurji with Hot Phulkas
- Tofu Stir Fry with Steamed Quinoa & Broccoli
- Tangy Chana Chaat with Fresh Cucumber & Lemon
- Punjabi Rajma with Steamed White Rice

These are actual stored files generated with imagegen, not camera photographs. Each was visually inspected against its recipe components. The review ledger records the reviewer, timestamp, exact asset/version identity, checksum, ingredient match and absence of text/watermarks. Where sides vary between portion tiers, the canonical photo shows shared components; the manifest records omitted variant-specific sides. Composite prepared foods such as chana chaat retain the catalog's ingredient granularity.

Assets are square 1024×1024 WebP, 166,598–244,556 bytes, with central food subjects and dark neutral styling. Paths are immutable:

`food-photos/recipe-images/{slug}/v1/{sha256}.webp`

Uploads use `upsert: false`. Publicly delivered bytes were decoded and matched to the reviewed local file. The approved-primary uniqueness check passed.

## Manifest and image specifications

[recipe-image-manifest.json](../artifacts/phase5b/recipe-image-manifest.json) contains all 220 canonical recipe IDs, current version IDs, names, diets, live food IDs, primary protein, visible ingredients, variant ingredient sets, image identities/status, file checks, production delivery decision and ingredient-specific photography briefs.

The database has no recipe meal-slot field. `meal_slots` is explicitly null with a source explanation; planner eligibility is profile-dependent. The manifest does not invent stored meal-slot assignments.

[recipes-without-images.md](../artifacts/phase5b/recipes-without-images.md) lists all 214 remaining recipes. [publication.json](../artifacts/phase5b/publication.json) records the six published objects and the 220 status corrections. [image-reviews.json](../artifacts/phase5b/image-reviews.json) contains the review evidence.

## Minimal integration changes

- Planner catalog and seed builders default missing/unreviewed image metadata to DRAFT. Seed rebuilds preserve reviewed approved files only with matching ownership and local checksum.
- Plan persistence, swap choices and the V2 day read model check current database approval and exact asset/version/path/URL identity. Revoked or mismatched approval falls back without altering historical image identity.
- The existing FoodAvatar derives its source immediately from the current meal props, preventing stale images during day changes and swaps. Failed requests, including failures before hydration, resolve to the existing offline SVG.
- The existing UI, nutrition algorithms and legacy rendering path are preserved. Changes to the planner/service are limited to image selection and validation.
- `sharp` is pinned as an explicit development dependency for file decoding and optimization.

Image files and catalog status corrections are live in Storage/Supabase. The application source changes are local repository changes; this work did not deploy the application or enable V2.

## Verification

| Check | Result |
| --- | --- |
| TypeScript | 0 errors |
| Phase 3 planner | 20 assertions passed |
| Phase 4 service | 365 assertions passed |
| Phase 4.7 backend | 9 tests passed, including current approval/ownership rejection cases |
| Image manifest/files/seeds/personas | 4 tests passed |
| Recipe seed validation | 0 errors; 220 recipes, 880 variants, 902 discrete allocation checks |
| Live read-only audit with `--require-safe` | Passed; all 6 approvals backed by verified files |
| Six personas, seven days, two viewports | 84 day views; 266 meal-card image checks |
| Photo gallery on mobile and desktop | All 6 real photos load; square crops and no horizontal overflow |
| Swap/logged image/failure fallback | Checked on both viewports using mocked API responses |

Persona tests use actual local deterministic planner outputs for Non-Veg/I Cook, Vegetarian/Home, Eggetarian/PG, Vegan/Hostel, Office/Canteen and low-budget Hostel. All six pass the planner hard constraints. These are presentation tests with intercepted APIs and exact local asset bytes, **not six live-account smoke tests**. The independent live audit verifies that these bytes match deployed Storage objects. Most selected persona meals currently use fallback; the separate six-photo gallery exercises all published photos, swaps, logged-image preservation and a failed request.

The initial image UI run passed 13 of 14 cases; the mobile PG case clicked before hydration. After adding the existing readiness wait, that case passed on rerun. The main UI regression run passed 11 of 12 cases with the same readiness race in mobile day switching; both corrected day-switch tests passed on desktop and mobile (4/4, exit 0). All 14 image cases and all 12 nutrition UI cases therefore passed across the runs and targeted reruns; this was not one clean combined run. See [verification-summary.json](../artifacts/phase5b/verification-summary.json).

Automatic approval review rejected the old Phase 4.5 integration runner because its file still contains legacy account-write code. It was not run or bypassed. The dedicated read-only image audit supplied live image verification instead. No Phase 4.7 account-mutating smoke test was rerun.

Screenshots:

- [Reviewed photos — mobile](../artifacts/phase5b/reviewed-photos-mobile.png)
- [Reviewed photos — desktop](../artifacts/phase5b/reviewed-photos-desktop.png)
- [Vegan hostel — mobile](../artifacts/phase5b/vegan-hostel-mobile.png)
- Additional screenshots for all six personas are in `artifacts/phase5b/`.

The six-photo gallery is a rendering fixture, not a recommended daily meal plan; its schedule and dashboard targets are illustrative.

## Continue image production

Run commands from `app/`:

1. `node scripts/audit-recipe-image-coverage.mjs --require-safe` refreshes live read-only evidence.
2. Generate a recipe-specific image using the manifest's actual ingredient brief and shared visual style.
3. `node scripts/prepare-recipe-images.mjs <slug> <source-file>` writes an immutable optimized local file and a DRAFT candidate.
4. Visually inspect the resulting file and record a review against the exact candidate/version/checksum. A missing review must remain DRAFT.
5. `node scripts/publish-reviewed-recipe-images.mjs` performs a dry run. The audit must be fresh and match the target project.
6. Review the concrete candidate changes, then use `--apply` for scoped image publication. The script does not write profiles, plans or feature flags.
7. Rerun the live audit, local image tests and visual tests. Replacements require a new immutable path and explicit handling of the prior primary approval; do not overwrite historical objects.

## Remaining work

Produce and review real photos for the remaining 214 recipes, deploy the image integration source changes through the normal application process, and agree acceptable photo coverage before Phase 5C. The fallback is safe coverage, not evidence of full recipe photography coverage. V2 remains disabled for normal users and was not enabled for any account during Phase 5B.
