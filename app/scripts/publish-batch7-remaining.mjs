import { BATCH_7_RECIPES } from './batch7-config.mjs';
import { processBatchItem } from './publish-batch7-images.mjs';
import path from 'node:path';
import fs from 'node:fs';

const dir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\d3977cfc-ae06-48f3-82a7-b104e88ebcec';

async function run() {
  const files = fs.readdirSync(dir);
  console.log(`Processing Batch 7 items...`);

  for (const r of BATCH_7_RECIPES) {
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
