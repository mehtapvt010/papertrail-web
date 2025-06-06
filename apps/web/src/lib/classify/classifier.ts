// src/lib/classify/classifier.ts
import { parse, isValid } from 'date-fns';

export interface Classification {
  type_enum: string | null;
  title: string | null;
  expiry_date: Date | null;
  confidence: number; // 0–100
}

/**
 * If it’s a passport, we’ll look for these “country signals” in the OCR’d text.
 * As soon as one matches, we set the title to e.g. “USA Passport” or “UK Passport”.
 */
const PASSPORT_COUNTRIES = [
  { pattern: /united states|usa/i, label: 'USA Passport' },
  { pattern: /united kingdom|uk|great britain|british/i, label: 'UK Passport' },
];

/**
 * Keyword buckets for “voting” on document type.
 */
const KEYWORDS: Record<string, string[]> = {
  passport: [
    'passport', 'p<', 'mrz', 'icao', 'united', 'usa',
    'nationality', 'surname', 'given', 'birth', 'expiry', 'expires'
  ],
  receipt: ['receipt', 'total', 'subtotal', 'tax', 'change', 'cash', 'store'],
  warranty: ['warranty', 'serial', 'coverage', 'model'],
  license: ['driver', 'license', 'dmv', 'class', 'endorsement'],
  insurance: ['policy', 'insurance', 'claim', 'insurer'],
};

/**
 * Normalize whitespace + lowercase, so substring checks are easy.
 */
const norm = (str: string) => str.replace(/\s+/g, ' ').toLowerCase();

/**
 * Try to parse either:
 *   (1) “17 Sep 2014”  (DD MMM YYYY)
 *   (2) “01 Jan / Jan 28” (DD MMM / MMM YY)
 *
 * For two‐digit years, we assume:
 *    YY < 50 → 20YY, otherwise → 19YY.
 */
function parseDateFromLine(line: string): Date | null {
  // Pattern #1: DD MMM YYYY  (e.g. “17 Sep 2014”)
  const fourDigit = line.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (fourDigit) {
    const [_, d, m, y4] = fourDigit;
    const iso = `${d} ${m} ${y4}`;
    const parsed = parse(iso, 'd MMM yyyy', new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }

  // Pattern #2: DD MMM / MMM YY  (e.g. “01 Jan / Jan 28”)
  const twoDigit = line.match(/(\d{1,2})\s+([A-Za-z]{3})\s*\/\s*([A-Za-z]{3})\s*(\d{2})/);
  if (twoDigit) {
    const [_, d, _mL, mR, y2] = twoDigit;
    let numYear = parseInt(y2, 10);
    // 00–49 → 2000–2049; 50–99 → 1950–1999. Tweak as you like.
    const fullYear = numYear < 50 ? 2000 + numYear : 1900 + numYear;
    const iso = `${d} ${mR} ${fullYear}`;
    const parsed = parse(iso, 'd MMM yyyy', new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }

  return null;
}

/**
 * Find an “expiration” date. If none, fall back to “issue” date.
 * We only parse lines that actually contain “expire” or “issue” keywords.
 */
function findExpiryOrIssue(raw: string): Date | null {
  let issueDate: Date | null = null;
  let expireDate: Date | null = null;

  for (const line of raw.split('\n')) {
    const lower = line.toLowerCase();
    //console.log(lower);

    // 1️⃣  If the line hints at “expiration/expiry,” try to parse that first.
    if (
      lower.includes('date of expiry') ||
      lower.includes("date d'expiration") ||
      lower.includes('date of expiration') ||
      lower.includes('expiration') ||
      lower.includes('expiry')
    ) {
      const candidate = parseDateFromLine(line);
      if (candidate) {
        expireDate = candidate;
        break; // no need to keep looking if we found a true expiry
      }
    }

    // 2️⃣  Otherwise, if it hints at “issue,” store it in case we need a fallback.
    if (
      lower.includes('date of issue') ||
      lower.includes("date de délivrance") ||
      lower.includes('date of délivrance') ||
      lower.includes('date of délivrance'.replace('é','e')) // just in case accent got stripped
    ) {
      const candidate = parseDateFromLine(line);
      if (candidate && !issueDate) {
        issueDate = candidate;
        // do NOT break here, because there might still be a later “expiry” line
      }
    }
  }

  // If we found a real expiry, return that. Otherwise return the issue date as fallback.
  return expireDate ?? issueDate;
}

/**
 * Main “classify” function.
 *   - raw: the OCR’d text (ASCII, any newline)
 *   - fileName: optional hint (e.g. “sample-usa-passport.jpg”)
 */
export function classify(
  raw: string,
  fileName?: string
): Classification {
  console.log('raw', { raw });
  const txt = norm(raw);
  console.log('txt', txt);
  const fname = fileName ? norm(fileName) : '';

  // 1️⃣  Keyword voting for document type.
  let best: { type: string; hits: number } = { type: 'unknown', hits: 0 };
  for (const [type, words] of Object.entries(KEYWORDS)) {
    const hits = words.reduce((count, w) => (txt.includes(w) ? count + 1 : count), 0);
    if (hits > best.hits) {
      best = { type, hits };
    }
  }

  // 1a) If no keyword hits at all, fallback to filename if it contains the word.
  if (best.hits === 0) {
    for (const type of Object.keys(KEYWORDS)) {
      if (fname.includes(type)) {
        best = { type, hits: 1 };
        break;
      }
    }
  }

  // 2️⃣  Decide “title”:
  //     • If passport → look for country signals (USA/UK). Otherwise “Passport” alone.
  //     • If not passport → take first nonblank line with ≥3 letters (up to 60 chars).
  let title: string | null = null;
  if (best.type === 'passport') {
    for (const countryInfo of PASSPORT_COUNTRIES) {
      if (countryInfo.pattern.test(raw)) {
        title = countryInfo.label;
        break;
      }
    }
    if (!title) {
      title = 'Passport';
    }
  } else {
    // Generic fallback title for non-passport docs
    title =
      raw
        .split('\n')
        .map((l) => l.trim())
        .find((l) => /[A-Za-z]{3,}/.test(l))
        ?.slice(0, 60) ?? 'Untitled Document';
  }

  // 3️⃣  Find expiry (or fallback to issue date)
  const expiry = findExpiryOrIssue(raw);
  console.log('🧠 expiry', expiry);

  // 4️⃣  Compute confidence = (# hits)/(# possible keywords for that type) × 100
  const hitsPossible = KEYWORDS[best.type as keyof typeof KEYWORDS]?.length ?? 1;
  const confidence = Math.round((best.hits / hitsPossible) * 100);

  // Debug logging (only in dev)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧠 classify →', { best, title, expiry, confidence });
  }

  return {
    type_enum: best.type === 'unknown' ? null : best.type,
    title,
    expiry_date: expiry,
    confidence,
  };
}
