import type { MemberRole } from './event'

export type Member = {
  userId: string
  role: MemberRole
  displayName: string | null
  avatarUrl: string | null
  phone: string
  joinedAt: string
}
