import { BATCH_4_RECIPES } from './batch4-config.mjs';
import { processBatchItem } from './publish-batch4-images.mjs';
import path from 'node:path';
import fs from 'node:fs';

const dir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\d3977cfc-ae06-48f3-82a7-b104e88ebcec';

async function run() {
  const files = fs.readdirSync(dir);
  for (const r of BATCH_4_RECIPES) {
    const base = r.slug.replace(/-/g, '_');
    const matched = files.find(f => f.startsWith(base + '_') && f.endsWith('.jpg'));
    if (matched) {
      await processBatchItem(r, path.join(dir, matched));
    } else {
      console.log(`Skipping ${r.slug}`);
    }
  }
}

run();
