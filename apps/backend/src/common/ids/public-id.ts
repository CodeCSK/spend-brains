import { randomInt } from 'crypto';

/**
 * Characters for event join codes. Excludes ambiguous glyphs
 * (0/O, 1/I/L) to keep codes easy to read and type.
 */
const PUBLIC_ID_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const PUBLIC_ID_LENGTH = 8;

export function generatePublicId(): string {
  let id = '';
  for (let i = 0; i < PUBLIC_ID_LENGTH; i += 1) {
    id += PUBLIC_ID_ALPHABET[randomInt(0, PUBLIC_ID_ALPHABET.length)];
  }
  return id;
}
