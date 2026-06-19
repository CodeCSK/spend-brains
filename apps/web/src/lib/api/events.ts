import type { Event, EventLookup, EventType, EventVisibility, JoinEventResult } from '../../types/event'
import type { JoinRequest } from '../../types/join-request'
import { apiFetch } from './client'

export type ListEventsOptions = {
  archived?: boolean
}

export type CreateEventPayload = {
  name: string
  startDate: string
  endDate: string
  description?: string | null
  location?: string | null
  eventType?: EventType
  visibility?: EventVisibility
}

export type UpdateEventPayload = {
  name?: string
  startDate?: string
  endDate?: string
  description?: string | null
  location?: string | null
  eventType?: EventType
  visibility?: EventVisibility
}

export function listEvents(options?: ListEventsOptions): Promise<Event[]> {
  const params = new URLSearchParams()
  if (options?.archived !== undefined) {
    params.set('archived', String(options.archived))
  }
  const query = params.toString()
  const path = query ? `/v1/events?${query}` : '/v1/events'

  return apiFetch<Event[]>(path, {
    method: 'GET',
    auth: true,
  })
}

export function createEvent(payload: CreateEventPayload): Promise<Event> {
  return apiFetch<Event>('/v1/events', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  })
}

export function lookupEvent(publicId: string): Promise<EventLookup> {
  const code = publicId.trim().toUpperCase()
  return apiFetch<EventLookup>(`/v1/events/lookup/${encodeURIComponent(code)}`, {
    method: 'GET',
    auth: true,
  })
}

export function joinEvent(publicId: string): Promise<JoinEventResult> {
  const code = publicId.trim().toUpperCase()
  return apiFetch<JoinEventResult>(`/v1/events/join/${encodeURIComponent(code)}`, {
    method: 'POST',
    auth: true,
  })
}

export function getEvent(id: string): Promise<Event> {
  return apiFetch<Event>(`/v1/events/${encodeURIComponent(id)}`, {
    method: 'GET',
    auth: true,
  })
}

export function updateEvent(id: string, payload: UpdateEventPayload): Promise<Event> {
  return apiFetch<Event>(`/v1/events/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(payload),
  })
}

export function archiveEvent(id: string): Promise<Event> {
  return apiFetch<Event>(`/v1/events/${encodeURIComponent(id)}/archive`, {
    method: 'POST',
    auth: true,
  })
}

export function unarchiveEvent(id: string): Promise<Event> {
  return apiFetch<Event>(`/v1/events/${encodeURIComponent(id)}/unarchive`, {
    method: 'POST',
    auth: true,
  })
}

export function deleteEvent(id: string): Promise<void> {
  return apiFetch<void>(`/v1/events/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
  })
}

export type JoinRequestActionResult = {
  message: string
}

export function listJoinRequests(eventId: string): Promise<JoinRequest[]> {
  return apiFetch<JoinRequest[]>(
    `/v1/events/${encodeURIComponent(eventId)}/join-requests`,
    {
      method: 'GET',
      auth: true,
    },
  )
}

export function approveJoinRequest(
  eventId: string,
  requestId: string,
): Promise<JoinRequestActionResult> {
  return apiFetch<JoinRequestActionResult>(
    `/v1/events/${encodeURIComponent(eventId)}/join-requests/${encodeURIComponent(requestId)}/approve`,
    {
      method: 'POST',
      auth: true,
    },
  )
}

export function rejectJoinRequest(
  eventId: string,
  requestId: string,
): Promise<JoinRequestActionResult> {
  return apiFetch<JoinRequestActionResult>(
    `/v1/events/${encodeURIComponent(eventId)}/join-requests/${encodeURIComponent(requestId)}/reject`,
    {
      method: 'POST',
      auth: true,
    },
  )
}
