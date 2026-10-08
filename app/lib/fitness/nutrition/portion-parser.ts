/**
 * Utility functions to parse and clean composite serving sizes and food names.
 *
 * In the database, legacy and V2 meal items/logs can store composite metadata in `serving_size`:
 * - `[slot]::[mealTitle]::[portion]` (e.g. "breakfast::Mixed Vegetable Sabzi with Phulkas & Moong Sprouts::200g")
 * - `[slot]::optb::[mealTitle]::[portion]` (e.g. "breakfast::optb::Moong Sprouts Salad::150g")
 * - `[slot]::[portion]` (e.g. "breakfast::200g")
 * - `[portion]` (e.g. "200g", "1 piece", "1 serving")
 *
 * These helpers guarantee that the UI only displays the clean portion (e.g. "200g")
 * and clean food/ingredient names without leaking slot tags or repeating parent titles.
 */

export interface ParsedCompositeServing {
  slot?: string;
  title?: string;
  portion: string;
}

const KNOWN_SLOTS = new Set([
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "pre_workout",
  "post_workout",
  "morning_snack",
  "evening_snack",
  "optb",
  "other",
]);

/**
 * Parses a composite or plain serving string into its constituent parts.
 */
export function parseCompositeServing(raw: string | null | undefined): ParsedCompositeServing {
  if (!raw || typeof raw !== "string") {
    return { portion: "1 serving" };
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return { portion: "1 serving" };
  }
  if (!trimmed.includes("::")) {
    return { portion: trimmed };
  }

  const parts = trimmed.split("::").map((p) => p.trim());
  if (parts.length >= 4 && parts[1]?.toLowerCase() === "optb") {
    return {
      slot: parts[0],
      title: parts[2] || undefined,
      portion: parts.slice(3).join("::").trim() || "1 serving",
    };
  }
  if (parts.length >= 3) {
    return {
      slot: parts[0],
      title: parts[1] || undefined,
      portion: parts.slice(2).join("::").trim() || "1 serving",
    };
  }
  if (parts.length === 2) {
    const firstLower = parts[0]?.toLowerCase() || "";
    if (KNOWN_SLOTS.has(firstLower)) {
      return {
        slot: parts[0],
        portion: parts[1] || "1 serving",
      };
    }
    return {
      title: parts[0],
      portion: parts[1] || "1 serving",
    };
  }

  return { portion: parts[0] || trimmed };
}

/**
 * Returns a human-friendly portion string (e.g. "200g", "1 piece") from any raw string.
 * Strips slot prefixes and meal titles completely.
 */
export function cleanServing(raw: string | null | undefined): string {
  if (!raw || typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const parsed = parseCompositeServing(trimmed);
  return parsed.portion || trimmed;
}

/**
 * Strips slot prefixes ("breakfast::", "lunch::", "optb::") and extracts clean food/recipe names.
 */
export function cleanFoodName(raw: string | null | undefined, fallback?: string | null): string {
  let val = (raw || fallback || "").trim();
  if (!val) return fallback?.trim() || "Food";

  // Recursively remove composite prefixes
  while (val.includes("::")) {
    const parts = val.split("::").map((p) => p.trim());
    if (parts.length >= 3) {
      val = parts[1]?.toLowerCase() === "optb" ? (parts[2] || parts[0]) : parts[1];
    } else if (parts.length === 2) {
      const firstLower = parts[0]?.toLowerCase() || "";
      if (KNOWN_SLOTS.has(firstLower)) {
        val = parts[1];
      } else {
        val = parts[0];
      }
    } else {
      val = parts[0];
    }
  }

  // Strip single-colon slot tags (e.g. "breakfast: Mixed Veg" or "snack - Nuts")
  val = val.replace(/^(breakfast|lunch|dinner|snack|pre_workout|post_workout|morning_snack|evening_snack|optb)\s*[:\-]\s*/i, "");

  return val.trim() || fallback?.trim() || "Food";
}
