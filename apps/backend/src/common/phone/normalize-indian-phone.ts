/**
 * Normalizes Indian mobile input to E.164 (+91XXXXXXXXXX).
 * Accepts: +919876543210, 919876543210, 9876543210
 */
export function normalizeIndianPhone(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  if (trimmed.startsWith('+91') && /^\+91[6-9]\d{9}$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}

export const INDIAN_PHONE_E164_REGEX = /^\+91[6-9]\d{9}$/;
