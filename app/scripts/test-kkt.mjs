const targetCal = 632;
const targetP = 29;
const fixedCal = 225; // 20g PB + 1 banana
const fixedP = 6.3;

const neededCal = targetCal - fixedCal; // 407
const neededP = targetP - fixedP; // 22.7

const cp = 140 / 150; // 0.933
const pp = 4 / 150;   // 0.0267
const cc = 140;       // 140 kcal/slice
const pc = 6;         // 6g P/slice

const det = pp * cc - cp * pc;
let idealP = (neededP * cc - neededCal * pc) / det;
let idealC = (neededCal * pp - neededP * cp) / det;

console.log("Unconstrained -> idealP:", idealP.toFixed(1), "idealC:", idealC.toFixed(2));

const minP = 50, maxP = 250;
const minC = 1, maxC = 8;

// KKT boundary projection
if (idealP < minP) {
  idealP = minP;
  idealC = Math.max(minC, Math.min(maxC, (neededCal - cp * idealP) / cc));
} else if (idealP > maxP) {
  idealP = maxP;
  idealC = Math.max(minC, Math.min(maxC, (neededCal - cp * idealP) / cc));
}

console.log("KKT Constrained -> idealP:", idealP.toFixed(1), "idealC:", idealC.toFixed(2));

const cVals = [Math.floor(idealC), Math.ceil(idealC)];
for (const c of cVals) {
  const totCal = fixedCal + idealP * cp + c * cc;
  const totP = fixedP + idealP * pp + c * pc;
  console.log(`With ${c} slices bread + ${idealP}ml chai -> Cal: ${Math.round(totCal)} (${((totCal - targetCal)/targetCal*100).toFixed(1)}%), P: ${totP.toFixed(1)}g`);
}
