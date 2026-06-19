import { apiFetch } from './client'
import type { UserProfile } from '../../types/auth'

export type UpdateMePayload = {
  displayName?: string | null
  avatarUrl?: string | null
}

export function getMe(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/v1/users/me', {
    method: 'GET',
    auth: true,
  })
}

export function updateMe(payload: UpdateMePayload): Promise<UserProfile> {
  return apiFetch<UserProfile>('/v1/users/me', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(payload),
  })
}
