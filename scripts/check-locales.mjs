import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const localesDir = path.resolve(__dirname, '..', 'src', 'locales');

const files = ['en.json', 'ru.json', 'kg.json'];

function loadJson(file) {
  const p = path.join(localesDir, file);
  const raw = fs.readFileSync(p, 'utf-8');
  return JSON.parse(raw);
}

function flatten(obj, prefix = '', out = new Set()) {
  if (obj === null || obj === undefined) return out;
  if (typeof obj !== 'object') {
    if (prefix) out.add(prefix);
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null) {
      flatten(v, key, out);
    } else {
      out.add(key);
    }
  }
  return out;
}

const data = {};
for (const f of files) {
  data[f] = loadJson(f);
}

const sets = {};
for (const f of files) {
  sets[f] = flatten(data[f]);
}

function diff(aSet, bSet) {
  const missing = [];
  for (const k of aSet) {
    if (!bSet.has(k)) missing.push(k);
  }
  return missing.sort();
}

function printSection(title, arr) {
  console.log(`\n${title}: ${arr.length}`);
  if (arr.length) {
    for (const k of arr) console.log(' -', k);
  }
}

const en = sets['en.json'];
const ru = sets['ru.json'];
const kg = sets['kg.json'];

console.log('Locale keys parity report:');

printSection('Missing in kg vs en', diff(en, kg));
printSection('Missing in kg vs ru', diff(ru, kg));
printSection('Missing in en vs kg', diff(kg, en));
printSection('Missing in ru vs kg', diff(kg, ru));

const allKeys = new Set([...en, ...ru, ...kg]);
const perFileCounts = Object.fromEntries(files.map(f => [f, sets[f].size]));
console.log('\nTotals:');
console.log(' All unique keys:', allKeys.size);
for (const f of files) {
  console.log(` ${f}: ${perFileCounts[f]} keys`);
}

// Show keys that exist in one or two locales only (not all three)
const localeHas = {};
for (const key of allKeys) {
  localeHas[key] = {
    en: en.has(key),
    ru: ru.has(key),
    kg: kg.has(key),
  };
}
const notInAllThree = Object.entries(localeHas).filter(([, v]) => (v.en + v.ru + v.kg) !== 3);
if (notInAllThree.length) {
  console.log('\nKeys not present in all three locales:', notInAllThree.length);
  for (const [k, v] of notInAllThree) {
    const present = Object.entries(v).filter(([, has]) => has).map(([loc]) => loc).join(',');
    console.log(` - ${k} [${present}]`);
  }
} else {
  console.log('\nAll keys present across en/ru/kg.');
}
