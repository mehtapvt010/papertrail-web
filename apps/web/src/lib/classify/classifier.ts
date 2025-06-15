/* apps/web/src/lib/classify/classifier.ts
   — Document classifier & title generator                                 */

   import { parse as parseDate, isValid } from 'date-fns';
   import { extractExpiry } from './fuzzy-expiry';
   import type { MRZFields } from '../ocr/ocr';
   
   /* ------------------------------------------------------------------ */
   /* Types                                                               */
   /* ------------------------------------------------------------------ */
   export interface Classification {
     type_enum: string | null;      // e.g. 'passport', 'license', 'insurance'
     title: string | null;          // e.g. 'USA Passport', 'Driver License'
     expiry_date: Date | null;
     confidence: number;            // 0-100
   }
   
   /* ------------------------------------------------------------------ */
   /* Country → label helpers (passports)                                 */
   /* ------------------------------------------------------------------ */
   const COUNTRY_HINTS: { pattern: RegExp; label: string; code?: string }[] = [
     { pattern: /united states/i,          label: 'USA Passport',      code: 'USA' },
     { pattern: /united kingdom/i,         label: 'UK Passport',       code: 'GBR' },
     { pattern: /canada/i,                 label: 'Canadian Passport', code: 'CAN' },
     { pattern: /australia/i,              label: 'Australian Passport', code: 'AUS' },
   ];
   
   /* ------------------------------------------------------------------ */
   /* Keyword pools                                                       */
   /* ------------------------------------------------------------------ */
   const KEYWORDS: Record<string, (string | RegExp)[]> = {
     passport:  [/passport/i, 'P<', 'MRZ', /icao/i, /nationality/i, /surname/i, /expiry/i],
     receipt:   ['receipt', 'total', 'subtotal', 'tax', 'cash', 'store', 'transaction'],
     warranty:  ['warranty', 'serial', 'coverage', 'model', 'guarantee'],
     license:   [/driver.?licen[cs]e/i, /dmv/i, 'class', 'endorsement', /driving permit/i],
     insurance: ['insurance', /policy/i, 'claim', 'insurer', 'coverage', 'premium', /vehicle/i],
     id_card:   [/id\s?card/i, /identity\s?card/i, /driver.?id/i, /national\s?id/i],
   };
   
   const SIMPLE_TITLES: Record<string, string> = {
     passport : 'Passport',
     license  : 'Driver License',
     id_card  : 'ID Card',
     insurance: 'Insurance Document',
     warranty : 'Warranty Document',
     receipt  : 'Receipt',
   };
   
   const norm = (s: string) => s.replace(/\s+/g, ' ').toLowerCase();
   
   /* ------------------------------------------------------------------ */
   /* Main classify()                                                     */
   /* ------------------------------------------------------------------ */
   export function classify(
     raw: string,
     fileName?: string,
     mrz?: MRZFields
   ): Classification {
     /* ---------- 1. EXPIRY DATE DETECTION ---------- */
     let finalExpiry: Date | null = null;
   
     if (mrz?.expirationDate) {
       const mrzDate = parseDate(mrz.expirationDate, 'yyMMdd', new Date());
       if (isValid(mrzDate)) finalExpiry = mrzDate;
     }
   
     const dateFromText = extractExpiry(raw);
     if (dateFromText && (!finalExpiry || dateFromText > finalExpiry)) finalExpiry = dateFromText;
   
     /* ---------- 2. TYPE DETECTION ---------- */
     const txt = norm(raw);
     let bestType: string | null = null;
     let bestHits = 0;
   
     for (const [type, tests] of Object.entries(KEYWORDS)) {
       const hits = tests.reduce((c, t) => {
         if (typeof t === 'string') return txt.includes(t.toLowerCase()) ? c + 1 : c;
         return (t as RegExp).test(raw) ? c + 1 : c;
       }, 0);
       if (hits > bestHits) {
         bestHits = hits;
         bestType = type;
       }
     }
   
     /* ---------- 3. TITLE GENERATION ---------- */
     let title: string | null = 'Untitled Document';
     let confidence = Math.min(90, Math.round((bestHits / ((KEYWORDS[bestType!] ?? []).length || 1)) * 100));
   
     if (bestType === 'passport') {
       // refine passport title by country
       const byCode  = COUNTRY_HINTS.find(c => c.code  === mrz?.issuingState);
       const byText  = COUNTRY_HINTS.find(c => c.pattern.test(raw));
   
       if (byCode)      { title = byCode.label; confidence = 95; }
       else if (byText) { title = byText.label; confidence = 85; }
       else             { title = 'Passport'; }
     } else if (bestType && bestType !== 'unknown') {
       title = SIMPLE_TITLES[bestType] ?? SIMPLE_TITLES.unknown;
   
       // special case: insurance (try to prefix with context word, e.g. "Car Insurance")
       if (bestType === 'insurance') {
         const vehicleMatch = /car|vehicle|auto/i.exec(raw);
         if (vehicleMatch) title = `${vehicleMatch[0][0].toUpperCase()}${vehicleMatch[0].slice(1)} Insurance`;
       }
     }
   
     return {
       type_enum: bestType,
       title,
       expiry_date: finalExpiry,
       confidence,
     };
   }
   