import fs from "node:fs";
import path from "node:path";

const candidatesPath = path.resolve("artifacts/phase5b/image-candidates.json");
const batch1Path = path.resolve("artifacts/phase5b/batch-01/image-candidates-batch-01.json");

const existing = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));
const batch1 = JSON.parse(fs.readFileSync(batch1Path, "utf8"));

const merged = [...existing];
for (const b of batch1) {
  if (!merged.some(m => m.id === b.id || m.slug === b.slug)) {
    merged.push(b);
  }
}

fs.writeFileSync(candidatesPath, JSON.stringify(merged, null, 2) + "\n");
console.log(`Merged ${batch1.length} Batch 1 candidates into image-candidates.json. Total candidates: ${merged.length}`);
