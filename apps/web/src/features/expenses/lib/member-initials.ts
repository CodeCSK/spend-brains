export function getMemberInitials(label: string): string {
  const trimmed = label.trim()
  if (!trimmed) return '?'

  if (/^\+?\d[\d\s-]*$/.test(trimmed)) {
    const digits = trimmed.replace(/\D/g, '')
    return digits.slice(-2) || '?'
  }

  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }

  return trimmed.slice(0, 2).toUpperCase()
}

export const MEMBER_INITIAL_COLORS = [
  { bg: '#ede9fe', fg: '#5b21b6' },
  { bg: '#dbeafe', fg: '#1d4ed8' },
  { bg: '#dcfce7', fg: '#15803d' },
  { bg: '#ffedd5', fg: '#c2410c' },
  { bg: '#fce7f3', fg: '#be185d' },
  { bg: '#e0e7ff', fg: '#4338ca' },
] as const

export function memberInitialColor(index: number): (typeof MEMBER_INITIAL_COLORS)[number] {
  return MEMBER_INITIAL_COLORS[index % MEMBER_INITIAL_COLORS.length]!
}
