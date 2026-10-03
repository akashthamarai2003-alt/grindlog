/** Resolve an offline catalog food to the UUID preserved by the deployed foods table. */
export function createLiveFoodIdResolver(
  liveFoods: ReadonlyArray<{ id: string; name: string }>,
  catalogFoodsById: ReadonlyMap<string, { name: string }>
): (catalogFoodId: string) => string {
  const byId = new Set(liveFoods.map((food) => food.id));
  const byName = new Map<string, string>();
  for (const food of liveFoods) {
    const name = food.name.trim().toLowerCase();
    if (byName.has(name) && byName.get(name) !== food.id) {
      throw new Error(`AMBIGUOUS_LIVE_FOOD: ${food.name}`);
    }
    byName.set(name, food.id);
  }

  return (catalogFoodId: string): string => {
    const catalogFood = catalogFoodsById.get(catalogFoodId);
    if (catalogFood) {
      const liveId = byName.get(catalogFood.name.trim().toLowerCase());
      if (liveId) return liveId;
      throw new Error(`FOOD_NOT_FOUND: ${catalogFood.name}`);
    }
    if (byId.has(catalogFoodId)) return catalogFoodId;
    throw new Error(`FOOD_NOT_FOUND: ${catalogFoodId}`);
  };
}
