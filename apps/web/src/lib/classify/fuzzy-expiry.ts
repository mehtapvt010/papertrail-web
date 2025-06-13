// apps/web/src/lib/classify/fuzzy-expiry.ts

import { parse, isValid } from 'date-fns';

/**
 * Handles 2-digit years, assuming years < 50 are 21st century.
 * e.g., '95' -> 1995; '34' -> 2034.
 */
const parseTwoDigitYear = (yy: string): number => {
    const year = parseInt(yy, 10);
    return year + (year < 50 ? 2000 : 1900);
};

/**
 * Extracts all possible dates from a raw text string, in various formats,
 * and returns the LATEST one found. This is crucial for finding the true
 * expiry date among other dates like date of birth.
 *
 * @param rawText The raw string output from OCR.
 * @returns The latest valid Date object found, or null if no dates are found.
 */
export function extractExpiry(rawText: string): Date | null {
    const foundDates: Date[] = [];
    
    // Normalize text: replace newlines with spaces for easier regex matching.
    const text = rawText.replace(/[\n\r]/g, ' ').replace(/\s+/g, ' ');

    // Pattern 1: DD MMM YYYY (e.g., 14 APR 2034)
    const p1 = /\b(\d{1,2})\s+([A-Z]{3})\s+(\d{4})\b/gi;
    for (const match of text.matchAll(p1)) {
        const [, d, m, y] = match;
        const parsed = parse(`${d} ${m} ${y}`, 'd MMM yyyy', new Date());
        if (isValid(parsed)) foundDates.push(parsed);
    }

    // Pattern 2: MM/DD/YYYY or DD.MM.YYYY etc. (handles ambiguity)
    const p2 = /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/g;
    for (const match of text.matchAll(p2)) {
        const [, d1, d2, y] = match;
        // Try parsing as MM/DD/YYYY
        let parsed = parse(`${y}-${d1}-${d2}`, 'yyyy-MM-dd', new Date());
        if (isValid(parsed)) foundDates.push(parsed);
        // Try parsing as DD/MM/YYYY
        parsed = parse(`${y}-${d2}-${d1}`, 'yyyy-MM-dd', new Date());
        if (isValid(parsed)) foundDates.push(parsed);
    }

    // Pattern 3: YYYY-MM-DD (ISO)
    const p3 = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g;
     for (const match of text.matchAll(p3)) {
        const [, y, m, d] = match;
        const parsed = parse(`${y}-${m}-${d}`, 'yyyy-MM-dd', new Date());
        if (isValid(parsed)) foundDates.push(parsed);
    }
    
    // Pattern 4: YYMMDD (MRZ style), ensuring it's not part of a longer number.
    const p4 = /(?<!\d)(\d{2})(\d{2})(\d{2})(?!\d)/g;
    for (const match of text.matchAll(p4)) {
        const [, yy, mm, dd] = match;
        // Basic sanity check to avoid parsing random 6-digit numbers as dates.
        const monthNum = parseInt(mm, 10);
        const dayNum = parseInt(dd, 10);
        if (monthNum > 0 && monthNum <= 12 && dayNum > 0 && dayNum <= 31) {
            const year = parseTwoDigitYear(yy);
            const parsed = parse(`${year}-${mm}-${dd}`, 'yyyy-MM-dd', new Date());
            if (isValid(parsed)) foundDates.push(parsed);
        }
    }

    if (foundDates.length === 0) {
        return null;
    }

    // Sort dates in descending order (latest first)
    foundDates.sort((a, b) => b.getTime() - a.getTime());

    // Return the most recent (latest) date from all found dates.
    return foundDates[0];
}