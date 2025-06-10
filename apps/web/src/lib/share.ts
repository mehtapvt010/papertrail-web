// apps/web/src/lib/share.ts
import bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';

export function generatePin(): string {
  // 6-digit, allows leading zeros
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export async function hashPin(pin: string): Promise<string> {
  // cost 10 = safe & fast
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}
