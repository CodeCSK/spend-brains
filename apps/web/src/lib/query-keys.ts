export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters?: { archived?: boolean }) =>
    [...eventKeys.lists(), filters ?? {}] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (eventId: string) => [...eventKeys.details(), eventId] as const,
  lookup: (publicId: string) => [...eventKeys.all, 'lookup', publicId] as const,
  joinRequests: (eventId: string) =>
    [...eventKeys.all, 'join-requests', eventId] as const,
}

export const memberKeys = {
  all: ['members'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (eventId: string) => [...memberKeys.lists(), eventId] as const,
}

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (eventId: string) => [...categoryKeys.lists(), eventId] as const,
}

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (eventId: string, params?: Record<string, unknown>) =>
    [...expenseKeys.lists(), eventId, params ?? {}] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (eventId: string, expenseId: string) =>
    [...expenseKeys.details(), eventId, expenseId] as const,
}

export const settlementKeys = {
  all: ['settlements'] as const,
  summaries: (eventId: string) =>
    [...settlementKeys.all, 'summaries', eventId] as const,
  summary: (eventId: string) =>
    [...settlementKeys.all, 'summary', eventId] as const,
}

export const profileKeys = {
  me: ['me'] as const,
}
