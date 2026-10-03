export function normalizeAllergen(a) {
  const norm = a.toLowerCase().trim();
  if (norm.includes("milk") || norm.includes("dairy") || norm.includes("lactose")) {
    return ["milk", "dairy", "lactose"];
  }
  if (norm.includes("wheat") || norm.includes("gluten")) {
    return ["wheat", "gluten"];
  }
  if (norm.includes("egg")) {
    return ["egg", "eggs"];
  }
  if (norm.includes("soy")) {
    return ["soy", "soya"];
  }
  if (norm.includes("peanut")) {
    return ["peanut", "peanuts"];
  }
  if (norm.includes("tree nut") || norm.includes("nut") || norm.includes("almond") || norm.includes("walnut")) {
    return ["tree_nuts", "tree_nut", "nuts", "nut"];
  }
  if (norm.includes("fish")) {
    return ["fish", "seafood"];
  }
  if (norm.includes("shellfish") || norm.includes("prawn") || norm.includes("shrimp")) {
    return ["shellfish", "seafood", "prawns"];
  }
  return [norm];
}

export function matchesAllergen(userAllergy, foodAllergen) {
  const userForms = normalizeAllergen(userAllergy);
  const foodForms = normalizeAllergen(foodAllergen);
  return userForms.some(u => foodForms.some(f => u === f || u.includes(f) || f.includes(u)));
}

console.log("milk vs dairy:", matchesAllergen("milk", "dairy"));
console.log("dairy vs milk:", matchesAllergen("dairy", "milk"));
console.log("wheat vs gluten:", matchesAllergen("wheat", "gluten"));
