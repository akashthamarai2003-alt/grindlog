# Data import scripts

## USDA Foundation Foods

This import is intentionally controlled. It reads a locally downloaded USDA
FoodData Central Foundation Foods JSON file, validates a small allowlist of
FDC record IDs, and upserts by `source_record_id`. It never deletes existing
foods and imported rows are not eligible for AI plan generation until local
serving prices are reviewed.

Run from the `app` directory:

```powershell
node scripts/import-usda-foundation-foods.mjs --dry-run
node scripts/import-usda-foundation-foods.mjs
```

Before the real import, run
`supabase/migrations/20260902_verified_food_library.sql` in the Supabase SQL
Editor. The script loads `app/.env.local` and requires
`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

The USDA FoodData Central data is public domain under CC0 1.0. Nutrition
verification does not verify local Indian prices, serving conventions, or
medical suitability.
