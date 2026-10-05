export interface RecipeImageRow {
  id: string;
  recipe_version_id: string;
  storage_path: string;
  url: string;
  status: string;
  is_primary: boolean;
}

export interface RecipeImageReference {
  imageAssetId: string | null;
  recipeVersionId: string | null;
  storagePath: string | null;
  url: string | null;
}

/** Validate approval and immutable ownership without replacing a historical image. */
export function approvedImageForReference(
  reference: RecipeImageReference,
  images: readonly RecipeImageRow[]
): RecipeImageRow | null {
  if (!reference.imageAssetId || !reference.recipeVersionId || !reference.storagePath || !reference.url) return null;
  return images.find((image) => image.id === reference.imageAssetId &&
    image.recipe_version_id === reference.recipeVersionId && image.status === "APPROVED" && image.is_primary &&
    image.storage_path === reference.storagePath && image.url === reference.url) || null;
}
