// apps/web/src/lib/classify/classifier.ts

import { parse as dateFnsParse, isValid } from 'date-fns';
import { extractExpiry } from './fuzzy-expiry'; // This now points to our new function
import type { MRZFields } from '../ocr/ocr';

export interface Classification {
  type_enum: string | null;
  title: string | null;
  expiry_date: Date | null;
  confidence: number;
}

const COUNTRY_PATTERNS: { pattern: RegExp, label: string, code?: string }[] = [
    { pattern: /united states of america/i, label: 'USA Passport', code: 'USA' },
    { pattern: /united kingdom/i, label: 'UK Passport', code: 'GBR' },
    { pattern: /canada/i, label: 'Canadian Passport', code: 'CAN' },
    { pattern: /australia/i, label: 'Australian Passport', code: 'AUS' },
];

const KEYWORDS: Record<string, string[]> = {
  passport: ['passport', 'p<', 'mrz', 'icao', 'nationality', 'surname', 'expiry'],
  receipt: ['receipt', 'total', 'subtotal', 'tax', 'cash', 'store', 'transaction'],
  warranty: ['warranty', 'serial', 'coverage', 'model', 'guarantee'],
  license: ['driver', 'license', 'dmv', 'class', 'endorsement', 'driving permit'],
  insurance: ['policy', 'insurance', 'claim', 'insurer', 'coverage', 'premium'],
};

const norm = (str: string) => str.replace(/\s+/g, ' ').toLowerCase();

export function classify(raw: string, fileName?: string, mrz?: MRZFields): Classification {
  let finalExpiryDate: Date | null = null;
  
  // --- Step 1: Get all possible expiry dates ---

  // First, get the date from the MRZ if it exists and is valid.
  if (mrz && mrz.expirationDate) {
    const parsedMrzExpiry = dateFnsParse(mrz.expirationDate, 'yyMMdd', new Date());
    if (isValid(parsedMrzExpiry)) {
      finalExpiryDate = parsedMrzExpiry;
    }
  }

  // Second, run our robust text-scanning function to find the latest visible date.
  const latestDateFromText = extractExpiry(raw);
  
  // Now, determine the true expiry date by choosing the latest one found.
  if (latestDateFromText) {
    // If we have a date from the text and it's later than the MRZ date, prefer it.
    // If no MRZ date was found, this automatically becomes the date.
    if (!finalExpiryDate || latestDateFromText > finalExpiryDate) {
      finalExpiryDate = latestDateFromText;
    }
  }

  // --- Step 2: Determine Title and Type ---
  const txt = norm(raw);
  let best = { type: 'unknown', hits: 0 };
  for (const [type, words] of Object.entries(KEYWORDS)) {
    const hits = words.reduce((count, w) => (txt.includes(w) ? count + 1 : count), 0);
    if (hits > best.hits) best = { type, hits };
  }

  let title: string | null = 'Untitled Document';
  let confidence = 0;

  if (best.type === 'passport') {
    const countryCode = mrz?.issuingState;
    const countryMatchByCode = COUNTRY_PATTERNS.find(c => c.code === countryCode);
    const countryMatchByText = COUNTRY_PATTERNS.find(c => c.pattern.test(raw));
    
    if (countryMatchByCode) {
        title = countryMatchByCode.label;
        confidence = 95; // Highest confidence from MRZ code
    } else if (countryMatchByText) {
        title = countryMatchByText.label;
        confidence = 85; // High confidence from text match
    } else {
        title = 'Passport';
        confidence = 75; // Lower confidence, but still a passport
    }
  } else if (best.type !== 'unknown') {
    title = raw.split('\n').map(l => l.trim()).find(l => l.length > 5 && /[A-Za-z]/.test(l))?.slice(0, 80) ?? 'Untitled Document';
  }
  
  const keywordPoolSize = KEYWORDS[best.type as keyof typeof KEYWORDS]?.length ?? 1;
  confidence = Math.max(confidence, Math.min(90, Math.round((best.hits / keywordPoolSize) * 100)));

  return {
    type_enum: best.type === 'unknown' ? null : best.type,
    title,
    expiry_date: finalExpiryDate, // Use the determined latest date
    confidence,
  };
}