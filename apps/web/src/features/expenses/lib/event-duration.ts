export function getEventDurationDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  const diffMs = end.getTime() - start.getTime()
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, days)
}

export function formatEventDurationLabel(days: number): string {
  return days === 1 ? '1 day' : `${days} days`
}
