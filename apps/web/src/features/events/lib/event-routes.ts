import { isLikelyEventUuid, normalizeJoinCode } from './join-code'

/** Normalize URL segment: join code (uppercase) or legacy UUID. */
export function normalizeEventCode(raw: string): string {
  const trimmed = raw.trim()
  if (isLikelyEventUuid(trimmed)) {
    return trimmed
  }
  return normalizeJoinCode(trimmed)
}

/** Build `/app/events/:code/...` paths using join code in the URL. */
export function eventPath(code: string, ...segments: string[]): string {
  const normalized = normalizeEventCode(code)
  const base = `/app/events/${encodeURIComponent(normalized)}`
  if (segments.length === 0) {
    return base
  }
  return `${base}/${segments.join('/')}`
}

export function eventExpensesPath(code: string): string {
  return eventPath(code, 'expenses')
}
