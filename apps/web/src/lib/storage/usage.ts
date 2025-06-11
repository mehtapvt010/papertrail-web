'use client';

// Just constants here, no more Supabase calls directly in this file
export const ONE_GIB = 1024 ** 3;
export const QUOTA_SOFT_LIMIT = Math.floor(0.9 * ONE_GIB);
