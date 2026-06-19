/** Normalize user input to an 8-char join code (alphanumeric, uppercase). */
export function normalizeJoinCode(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)
}

export function isLikelyEventUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value.trim(),
  )
}
