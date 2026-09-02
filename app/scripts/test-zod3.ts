import { z } from "zod";

const safeNumber = z.preprocess((val) => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val.replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}, z.number());

const s = z.object({ sets: safeNumber.optional() });
console.log(s.safeParse({ sets: "3 sets" }));
console.log(s.safeParse({ sets: null }));
console.log(s.safeParse({}));
