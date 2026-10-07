import fs from "node:fs";
import path from "node:path";

const candidatesPath = path.resolve("artifacts/phase5b/image-candidates.json");
const candidates = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));

const batch1Candidates = candidates.filter(c => c.status !== "APPROVED");
const approvedCandidates = candidates.filter(c => c.status === "APPROVED");

const batch01Dir = path.resolve("artifacts/phase5b/batch-01");
fs.mkdirSync(batch01Dir, { recursive: true });

fs.writeFileSync(path.join(batch01Dir, "image-candidates-batch-01.json"), JSON.stringify(batch1Candidates, null, 2) + "\n");
fs.writeFileSync(candidatesPath, JSON.stringify(approvedCandidates, null, 2) + "\n");

console.log(`Saved ${batch1Candidates.length} Batch 1 candidates to batch-01/image-candidates-batch-01.json`);
console.log(`Restored ${approvedCandidates.length} approved candidates to image-candidates.json`);
