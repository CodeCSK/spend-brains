import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../auth-storage'
import type { TokenResponse } from '../../types/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (body && typeof body === 'object' && 'message' in body) {
      const message = (body as { message: unknown }).message
      if (typeof message === 'string') return message
      if (Array.isArray(message)) return message.join(', ')
    }
  } catch {
    // ignore JSON parse errors
  }

  return response.statusText || 'Request failed'
}

function redirectToLogin(): void {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response))
  }

  return response.json() as Promise<TokenResponse>
}

export type ApiFetchOptions = RequestInit & {
  auth?: boolean
  _retried?: boolean
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = false, _retried = false, headers, ...rest } = options
  const requestHeaders = new Headers(headers)
  requestHeaders.set('Content-Type', 'application/json')

  if (auth) {
    const token = getAccessToken()
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  })

  if (response.status === 401 && auth && !_retried) {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        const tokens = await refreshAccessToken(refreshToken)
        setTokens(tokens.accessToken, tokens.refreshToken)
        return apiFetch<T>(path, { ...options, _retried: true })
      } catch {
        clearTokens()
        redirectToLogin()
        throw new ApiError(401, 'Session expired')
      }
    }

    clearTokens()
    redirectToLogin()
    throw new ApiError(401, await parseErrorMessage(response))
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function apiFetchBlob(path: string, options: ApiFetchOptions = {}): Promise<Blob> {
  const { auth = false, _retried = false, headers, ...rest } = options
  const requestHeaders = new Headers(headers)

  if (auth) {
    const token = getAccessToken()
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  })

  if (response.status === 401 && auth && !_retried) {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        const tokens = await refreshAccessToken(refreshToken)
        setTokens(tokens.accessToken, tokens.refreshToken)
        return apiFetchBlob(path, { ...options, _retried: true })
      } catch {
        clearTokens()
        redirectToLogin()
        throw new ApiError(401, 'Session expired')
      }
    }

    clearTokens()
    redirectToLogin()
    throw new ApiError(401, await parseErrorMessage(response))
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response))
  }

  return response.blob()
}

export type ApiBlobResponse = {
  blob: Blob
  filename?: string
  contentType?: string
}

function parseContentDisposition(value: string | null): string | undefined {
  if (!value) return undefined

  const match =
    /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(value)
  const raw = match?.[1] ?? match?.[2] ?? match?.[3]
  if (!raw) return undefined

  try {
    return decodeURIComponent(raw.trim())
  } catch {
    return raw.trim()
  }
}

export async function apiFetchBlobResponse(
  path: string,
  options: ApiFetchOptions = {},
): Promise<ApiBlobResponse> {
  const { auth = false, _retried = false, headers, ...rest } = options
  const requestHeaders = new Headers(headers)

  if (auth) {
    const token = getAccessToken()
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  })

  if (response.status === 401 && auth && !_retried) {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        const tokens = await refreshAccessToken(refreshToken)
        setTokens(tokens.accessToken, tokens.refreshToken)
        return apiFetchBlobResponse(path, { ...options, _retried: true })
      } catch {
        clearTokens()
        redirectToLogin()
        throw new ApiError(401, 'Session expired')
      }
    }

    clearTokens()
    redirectToLogin()
    throw new ApiError(401, await parseErrorMessage(response))
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response))
  }

  return {
    blob: await response.blob(),
    filename: parseContentDisposition(response.headers.get('Content-Disposition')),
    contentType: response.headers.get('Content-Type') ?? undefined,
  }
}
