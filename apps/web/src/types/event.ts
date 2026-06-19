export const EVENT_TYPES = [
  'general',
  'vacation',
  'corporate',
  'ritual',
  'roommate',
  'travel',
  'party',
] as const

export type EventType = (typeof EVENT_TYPES)[number]

export const EVENT_VISIBILITIES = ['private', 'public'] as const

export type EventVisibility = (typeof EVENT_VISIBILITIES)[number]

export const MEMBER_ROLES = ['captain', 'vice_captain', 'member'] as const

export type MemberRole = (typeof MEMBER_ROLES)[number]

export type Event = {
  id: string
  publicId: string
  name: string
  description: string | null
  location: string | null
  startDate: string
  endDate: string
  eventType: EventType
  coverImageUrl: string | null
  visibility: EventVisibility
  isArchived: boolean
  captainId: string
  myRole: MemberRole
  memberCount: number
  createdAt: string
}

export type EventLookup = {
  publicId: string
  name: string
  eventType: EventType
  coverImageUrl: string | null
  visibility: EventVisibility
  startDate: string
  endDate: string
  memberCount: number
}

export type JoinEventResult = {
  status: 'joined' | 'requested'
  message: string
  eventId: string | null
}
