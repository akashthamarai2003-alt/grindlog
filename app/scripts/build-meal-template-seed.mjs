import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const seedDir = path.resolve(process.cwd(), "supabase/seed/nutrition_v2");
const foods = JSON.parse(fs.readFileSync(path.join(seedDir, "foods.json"), "utf8"));
const foodByName = new Map(foods.map((food) => [food.name, food]));

function deterministicUuid(namespace, key) {
  const hash = crypto.createHash("md5").update(`${namespace}:${key}`).digest("hex");
  return [hash.slice(0, 8), hash.slice(8, 12), `4${hash.slice(13, 16)}`,
    ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0") + hash.slice(18, 20),
    hash.slice(20, 32)].join("-");
}

const diets = ["vegan", "vegetarian", "eggetarian", "non-veg"];
const compatibleDiets = {
  vegan: diets,
  vegetarian: diets.slice(1),
  eggetarian: diets.slice(2),
  "non-veg": diets.slice(3),
};

const groups = [
  { prefix: "PG_MESS", environment: "PG", provided: true },
  { prefix: "HOSTEL_MESS", environment: "Hostel", provided: true },
  { prefix: "OFFICE_CANTEEN_MESS", environment: "Office/Canteen", provided: true },
  { prefix: "HOSTEL_NO_MESS", environment: "Hostel", provided: false },
  { prefix: "HOME_NO_MESS", environment: "Home", provided: false },
];
const mealSlots = ["breakfast", "lunch", "dinner"];

const messSlots = [
  { name: "STAPLE", role: "STAPLE_CARB", provided: true, foods: [["Chapati / Phulka", 2, "piece"], ["White Rice (Steamed)", 150, "g"]] },
  { name: "DAL", role: "PRIMARY_PROTEIN", provided: true, foods: [["Yellow Moong Dal", 150, "g"], ["Dal Tadka", 150, "g"]] },
  { name: "VEGGIE", role: "VEGGIE", provided: true, foods: [["Mixed Vegetable Sabzi", 100, "g"], ["Green Salad with Lemon", 100, "g"]] },
  { name: "PROTEIN_ADDON", role: "PRIMARY_PROTEIN", provided: false, foods: [["Moong Sprouts Salad", 100, "g"], ["Roasted Chana (Dry Chickpeas)", 40, "g"], ["Low Fat Paneer", 75, "g"], ["Low Fat Curd / Dahi", 150, "g"], ["Boiled Egg (Whole)", 2, "piece"], ["Boiled Egg White", 3, "piece"]] },
];
const homeSlots = [
  { name: "STAPLE", role: "STAPLE_CARB", provided: false, foods: [["Chapati / Phulka", 2, "piece"], ["White Rice (Steamed)", 150, "g"]] },
  { name: "PROTEIN", role: "PRIMARY_PROTEIN", provided: false, foods: [["Yellow Moong Dal", 150, "g"], ["Tofu (Firm)", 100, "g"], ["Low Fat Paneer", 75, "g"], ["Boiled Egg (Whole)", 2, "piece"]] },
  { name: "VEGGIE", role: "VEGGIE", provided: false, foods: [["Mixed Vegetable Sabzi", 100, "g"], ["Green Salad with Lemon", 100, "g"]] },
];
const hostelSlots = [
  { name: "STAPLE", role: "STAPLE_CARB", provided: false, foods: [["Whole Wheat Bread", 2, "slice"], ["Banana", 2, "piece"]] },
  { name: "PROTEIN", role: "PRIMARY_PROTEIN", provided: false, foods: [["Roasted Chana (Dry Chickpeas)", 50, "g"], ["Moong Sprouts Salad", 100, "g"], ["Boiled Egg (Whole)", 2, "piece"]] },
  { name: "VEGGIE", role: "VEGGIE", provided: false, foods: [["Green Salad with Lemon", 100, "g"]] },
];

const templates = [], slots = [], options = [];
for (const group of groups) {
  for (const mealSlot of mealSlots) {
    const code = `${group.prefix}_${mealSlot.toUpperCase()}`;
    const templateId = deterministicUuid("meal_template", code);
    templates.push({ id: templateId, code, name: `${group.environment} ${group.provided ? "provided" : "self supplied"} ${mealSlot}`, environment: group.environment, mealSlot });
    const definitions = group.provided ? messSlots : group.environment === "Home" ? homeSlots : hostelSlots;
    for (const definition of definitions) {
      const slotId = deterministicUuid("meal_template_slot", `${code}:${definition.name}`);
      slots.push({ id: slotId, templateId, ...definition });
      for (const [index, [foodName, portion, unit]] of definition.foods.entries()) {
        const food = foodByName.get(foodName);
        if (!food) throw new Error(`Template food missing from local catalog: ${foodName}`);
        options.push({ id: deterministicUuid("meal_template_option", `${code}:${definition.name}:${foodName}`), slotId, foodName, portion, unit, priority: index + 1, diet: food.diet_type, compatible: compatibleDiets[food.diet_type] });
      }
    }
  }
}

const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const sqlArray = (values) => `ARRAY[${values.map(quote).join(", ")}]::TEXT[]`;
const tuple = (values) => `(${values.join(", ")})`;
const lines = [
  "-- Additive V2 templates. IDs for MESS templates match unified-7day-planner.ts.",
  "-- Food references resolve by canonical name to the existing live foods.id.",
  "BEGIN;",
  "LOCK TABLE public.meal_templates, public.meal_template_slots, public.meal_template_slot_options IN SHARE ROW EXCLUSIVE MODE;",
  "DO $$ BEGIN",
  "  IF EXISTS (SELECT 1 FROM (VALUES",
  templates.map((t) => `    ${tuple([quote(t.code), quote(t.id)])}`).join(",\n"),
  "  ) AS seed(code, id) JOIN public.meal_templates t ON t.code = seed.code WHERE t.id <> seed.id::uuid) THEN",
  "    RAISE EXCEPTION 'TEMPLATE_ID_CONFLICT: existing template code has a different ID';",
  "  END IF;",
  "  IF EXISTS (SELECT 1 FROM (VALUES",
  [...new Set(options.map((o) => o.foodName))].map((name) => `    ${tuple([quote(name)])}`).join(",\n"),
  "  ) AS seed(name) LEFT JOIN public.foods f ON f.name = seed.name WHERE f.id IS NULL) THEN",
  "    RAISE EXCEPTION 'TEMPLATE_FOOD_MISSING: a required food name is absent';",
  "  END IF;",
  "END $$;",
  "INSERT INTO public.meal_templates (id, name, code, environment, meal_slot, description) VALUES",
  templates.map((t) => `  ${tuple([quote(t.id), quote(t.name), quote(t.code), quote(t.environment), quote(t.mealSlot), quote("V2 catalog meal composition with real food options")])}`).join(",\n") + "\nON CONFLICT (id) DO NOTHING;",
  "INSERT INTO public.meal_template_slots (id, template_id, slot_name, role, is_provided, is_mandatory) VALUES",
  slots.map((s) => `  ${tuple([quote(s.id), quote(s.templateId), quote(s.name), quote(s.role), String(s.provided), "true"])}`).join(",\n") + "\nON CONFLICT (id) DO NOTHING;",
  "INSERT INTO public.meal_template_slot_options (id, template_slot_id, food_id, default_portion, unit, priority, diet_category, compatible_diets, required_equipment, is_active)",
  "SELECT seed.id::uuid, seed.slot_id::uuid, f.id, seed.portion::numeric, seed.unit, seed.priority::integer, seed.diet, seed.compatible, '{}'::TEXT[], true",
  "FROM (VALUES",
  options.map((o) => `  ${tuple([quote(o.id), quote(o.slotId), quote(o.foodName), String(o.portion), quote(o.unit), String(o.priority), quote(o.diet), sqlArray(o.compatible)])}`).join(",\n"),
  ") AS seed(id, slot_id, food_name, portion, unit, priority, diet, compatible)",
  "JOIN public.foods f ON f.name = seed.food_name",
  "ON CONFLICT (id) DO NOTHING;",
  "COMMIT;",
];

export { templates, slots, options };

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const outputPath = path.resolve(process.cwd(), "supabase/migrations/20261003_02_seed_meal_templates.sql");
  fs.writeFileSync(outputPath, lines.join("\n") + "\n");
  console.log(JSON.stringify({ file: outputPath, templates: templates.length, slots: slots.length, options: options.length }));
}
