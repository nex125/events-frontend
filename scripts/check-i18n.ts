import en from '../src/lib/i18n/messages/en.json';
import ru from '../src/lib/i18n/messages/ru.json';

type Obj = Record<string, unknown>;

function collectMissing(base: Obj, candidate: Obj, prefix = ''): string[] {
  const missing: string[] = [];

  for (const [key, baseValue] of Object.entries(base)) {
    const nextPath = prefix ? `${prefix}.${key}` : key;
    const candidateValue = candidate[key];

    if (candidateValue === undefined) {
      missing.push(nextPath);
      continue;
    }

    const isBaseObject =
      baseValue !== null && typeof baseValue === 'object' && !Array.isArray(baseValue);
    const isCandidateObject =
      candidateValue !== null &&
      typeof candidateValue === 'object' &&
      !Array.isArray(candidateValue);

    if (isBaseObject && isCandidateObject) {
      missing.push(...collectMissing(baseValue as Obj, candidateValue as Obj, nextPath));
    }
  }

  return missing;
}

const missingInRu = collectMissing(en as Obj, ru as Obj);
const missingInEn = collectMissing(ru as Obj, en as Obj);

if (missingInRu.length === 0 && missingInEn.length === 0) {
  console.log('i18n catalogs are aligned');
  process.exit(0);
}

if (missingInRu.length > 0) {
  console.error('Missing keys in ru catalog:');
  for (const key of missingInRu) {
    console.error(`  - ${key}`);
  }
}

if (missingInEn.length > 0) {
  console.error('Missing keys in en catalog:');
  for (const key of missingInEn) {
    console.error(`  - ${key}`);
  }
}

process.exit(1);
