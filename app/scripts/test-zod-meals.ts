import { z } from "zod";

const GeneratedMealSchema = z.object({ meal_name: z.string().optional() });
const safeArray = <T extends z.ZodTypeAny>(schema: T) => z.preprocess((val: any) => {
  if (typeof val === 'string') return [];
  if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
    return Object.values(val);
  }
  return val;
}, z.union([z.array(schema), z.null(), z.undefined()]).transform(val => val || []));

const s = z.object({ meals: safeArray(GeneratedMealSchema) });

console.log(s.safeParse({ meals: { "0": { meal_name: "a" } } }));
console.log(s.safeParse({ meals: "Not provided" }));
console.log(s.safeParse({ meals: null }));
