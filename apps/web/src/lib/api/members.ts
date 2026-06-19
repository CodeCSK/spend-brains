import type { MemberRole } from '../../types/event'
import type { Member } from '../../types/member'
import { apiFetch } from './client'

export type AddMemberPayload = {
  phone: string
}

export type UpdateMemberRolePayload = {
  role: Extract<MemberRole, 'vice_captain' | 'member'>
}

export function listMembers(eventId: string): Promise<Member[]> {
  return apiFetch<Member[]>(`/v1/events/${encodeURIComponent(eventId)}/members`, {
    method: 'GET',
    auth: true,
  })
}

export function addMember(eventId: string, payload: AddMemberPayload): Promise<Member> {
  return apiFetch<Member>(`/v1/events/${encodeURIComponent(eventId)}/members`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  })
}

export function updateMemberRole(
  eventId: string,
  userId: string,
  payload: UpdateMemberRolePayload,
): Promise<Member> {
  return apiFetch<Member>(
    `/v1/events/${encodeURIComponent(eventId)}/members/${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(payload),
    },
  )
}

export function removeMember(eventId: string, userId: string): Promise<void> {
  return apiFetch<void>(
    `/v1/events/${encodeURIComponent(eventId)}/members/${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
      auth: true,
    },
  )
}
