import type { Category } from '../../types/category'
import { apiFetch } from './client'

export type CreateCategoryPayload = {
  name: string
  icon: string
}

export type UpdateCategoryPayload = {
  name?: string
  icon?: string
}

export function listCategories(eventId: string): Promise<Category[]> {
  return apiFetch<Category[]>(
    `/v1/events/${encodeURIComponent(eventId)}/categories`,
    {
      method: 'GET',
      auth: true,
    },
  )
}

export function createCategory(
  eventId: string,
  payload: CreateCategoryPayload,
): Promise<Category> {
  return apiFetch<Category>(`/v1/events/${encodeURIComponent(eventId)}/categories`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  })
}

export function updateCategory(
  eventId: string,
  categoryId: string,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  return apiFetch<Category>(
    `/v1/events/${encodeURIComponent(eventId)}/categories/${encodeURIComponent(categoryId)}`,
    {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(payload),
    },
  )
}

export function deleteCategory(eventId: string, categoryId: string): Promise<void> {
  return apiFetch<void>(
    `/v1/events/${encodeURIComponent(eventId)}/categories/${encodeURIComponent(categoryId)}`,
    {
      method: 'DELETE',
      auth: true,
    },
  )
}
