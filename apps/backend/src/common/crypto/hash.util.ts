import { createHash, randomBytes, randomInt } from 'crypto';

export function hashToken(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString('base64url');
}

export function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}
