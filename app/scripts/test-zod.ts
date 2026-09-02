import { z } from "zod";

const s = z.object({ title: z.coerce.string() });
console.log(s.safeParse({}));
