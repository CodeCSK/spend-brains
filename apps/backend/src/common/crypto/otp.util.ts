/**
 * Beta / staging OTP derived from the phone number (last 6 digits).
 * +919876543210 → 543210
 */
export function otpFromPhoneSuffix(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) {
    throw new Error('Phone number too short for suffix OTP');
  }
  return digits.slice(-6);
}
