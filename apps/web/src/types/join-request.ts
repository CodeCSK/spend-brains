export const JOIN_REQUEST_STATUSES = ['pending', 'approved', 'rejected'] as const

export type JoinRequestStatus = (typeof JOIN_REQUEST_STATUSES)[number]

export type JoinRequestUser = {
  id: string
  displayName: string | null
  avatarUrl: string | null
  phone: string
}

export type JoinRequest = {
  id: string
  status: JoinRequestStatus
  user: JoinRequestUser
  createdAt: string
}
