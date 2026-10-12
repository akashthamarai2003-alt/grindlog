import { BATCH_6_RECIPES } from './batch6-config.mjs';
import { processBatchItem } from './publish-batch6-images.mjs';
import path from 'node:path';
import fs from 'node:fs';

const dir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\d3977cfc-ae06-48f3-82a7-b104e88ebcec';

async function run() {
  const files = fs.readdirSync(dir);
  // Items 13 through 20 (indices 12 to 19)
  const remaining = BATCH_6_RECIPES.slice(12);
  console.log(`Processing remaining ${remaining.length} items (13-20) of Batch 6...`);

  for (const r of remaining) {
    const base = r.slug.replace(/-/g, '_');
    const matchedFiles = files.filter(f => f.startsWith(base + '_') && f.endsWith('.jpg'));
    if (matchedFiles.length > 0) {
      matchedFiles.sort();
      const latest = matchedFiles[matchedFiles.length - 1];
      console.log(`Matched ${r.slug} -> ${latest}`);
      await processBatchItem(r, path.join(dir, latest));
    } else {
      console.log(`⏳ Waiting for image: ${r.slug}`);
    }
  }
}

run();
