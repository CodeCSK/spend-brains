import type { EventType, EventVisibility, MemberRole } from '../../../types/event'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  general: 'General',
  vacation: 'Vacation',
  corporate: 'Corporate',
  ritual: 'Ritual',
  roommate: 'Roommate',
  travel: 'Travel',
  party: 'Party',
}

export const EVENT_VISIBILITY_LABELS: Record<EventVisibility, string> = {
  private: 'Private',
  public: 'Public',
}

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  captain: 'Captain',
  vice_captain: 'Vice captain',
  member: 'Member',
}

export function formatEventDateRange(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  const full: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }

  if (startDate === endDate) {
    return start.toLocaleDateString('en-IN', full)
  }

  const sameYear = start.getFullYear() === end.getFullYear()
  if (sameYear) {
    const startShort = start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    return `${startShort} – ${end.toLocaleDateString('en-IN', full)}`
  }

  return `${start.toLocaleDateString('en-IN', full)} – ${end.toLocaleDateString('en-IN', full)}`
}
