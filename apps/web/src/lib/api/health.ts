const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type HealthResponse = {
  status: string
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Health check failed (${response.status})`)
  }

  return response.json() as Promise<HealthResponse>
}

export function getApiBaseUrl(): string {
  return API_URL
}
