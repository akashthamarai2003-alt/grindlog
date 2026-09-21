# generate-draft/route.ts

> 49 nodes

## Key Concepts

- **generate-draft/route.ts** (45 connections) — `app/app/api/fitness-ai/generate-draft/route.ts`
- **fitness-ai/generate-plan/route.ts** (43 connections) — `app/app/api/fitness-ai/generate-plan/route.ts`
- **upgrade-nutrition/route.ts** (35 connections) — `app/app/api/fitness-ai/upgrade-nutrition/route.ts`
- **POST()** (22 connections) — `app/app/api/fitness-ai/generate-plan/route.ts`
- **POST()** (20 connections) — `app/app/api/fitness-ai/generate-draft/route.ts`
- **POST()** (17 connections) — `app/app/api/fitness-ai/upgrade-nutrition/route.ts`
- **save-plan/route.ts** (16 connections) — `app/app/api/fitness-ai/save-plan/route.ts`
- **runFitnessAISafetyCheck()** (14 connections) — `app/lib/fitness/safety/fitness-ai-safety.ts`
- **fitness-ai-safety.ts** (14 connections) — `app/lib/fitness/safety/fitness-ai-safety.ts`
- **fitness-food-library.ts** (14 connections) — `app/lib/fitness/validation/fitness-food-library.ts`
- **enrichPlanWithFoodLibrary()** (13 connections) — `app/lib/fitness/validation/fitness-food-library.ts`
- **getPlanNutritionTargets()** (12 connections) — `app/lib/fitness/validation/fitness-plan-profile.ts`
- **getGenerationRetryAfterSeconds()** (11 connections) — `app/lib/services/fitness-ai-generation-guard.ts`
- **recordGenerationAttempt()** (11 connections) — `app/lib/services/fitness-ai-generation-guard.ts`
- **hybrid-merger.ts** (11 connections) — `app/lib/fitness/nutrition/hybrid-merger.ts`
- **fitness-ai-generation-guard.ts** (10 connections) — `app/lib/services/fitness-ai-generation-guard.ts`
- **convertToAIPlanFormat()** (9 connections) — `app/lib/fitness/nutrition/nutrition-engine.ts`
- **sync-akash-nutrition.ts** (9 connections) — `app/scripts/sync-akash-nutrition.ts`
- **GeneratedPlanData** (8 connections) — `app/lib/fitness/ai/schemas.ts`
- **mergeHybridNutrition()** (8 connections) — `app/lib/fitness/nutrition/hybrid-merger.ts`
- **plan-entitlements.ts** (8 connections) — `app/lib/fitness/subscription/plan-entitlements.ts`
- **POST()** (7 connections) — `app/app/api/fitness-ai/save-plan/route.ts`
- **autoRepairPlanSafety()** (7 connections) — `app/lib/fitness/safety/fitness-ai-safety.ts`
- **applyFitnessPlanEntitlements()** (7 connections) — `app/lib/fitness/subscription/plan-entitlements.ts`
- **buildHybridNutritionPrompt()** (6 connections) — `app/lib/fitness/nutrition/hybrid-merger.ts`
- *... and 24 more nodes in this community*

## Relationships

- [createServerSupabase](createServerSupabase.md) (48 shared connections)
- [schemas.ts](schemas.ts.md) (32 shared connections)
- [fitness-plan-profile.ts](fitness-plan-profile.ts.md) (19 shared connections)
- [constants.ts](constants.ts.md) (16 shared connections)
- [fitness-dashboard.tsx](fitness-dashboard.tsx.md) (12 shared connections)
- [prompts.ts](prompts.ts.md) (10 shared connections)
- [subscription/types.ts](subscription-types.ts.md) (2 shared connections)
- [import-usda-foundation-foods.mjs](import-usda-foundation-foods.mjs.md) (1 shared connections)

## Source Files

- `app/app/api/fitness-ai/generate-draft/route.ts`
- `app/app/api/fitness-ai/generate-plan/route.ts`
- `app/app/api/fitness-ai/save-plan/route.ts`
- `app/app/api/fitness-ai/upgrade-nutrition/route.ts`
- `app/lib/fitness/ai/nutrition-generator.ts`
- `app/lib/fitness/ai/prompts.ts`
- `app/lib/fitness/ai/schemas.ts`
- `app/lib/fitness/nutrition/hybrid-merger.ts`
- `app/lib/fitness/nutrition/nutrition-engine.ts`
- `app/lib/fitness/nutrition/types.ts`
- `app/lib/fitness/safety/fitness-ai-safety.ts`
- `app/lib/fitness/subscription/plan-entitlements.ts`
- `app/lib/fitness/validation/fitness-food-library.ts`
- `app/lib/fitness/validation/fitness-plan-profile.ts`
- `app/lib/services/fitness-ai-generation-guard.ts`
- `app/scripts/sync-akash-nutrition.ts`

## Audit Trail

- EXTRACTED: 293 (99%)
- INFERRED: 2 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*