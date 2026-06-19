import { apiFetch } from './client'
import type { MessageResponse, TokenResponse } from '../../types/auth'

export function sendOtp(phone: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/v1/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({
      phone,
      otpConsent: true,
      client: 'web',
    }),
  })
}

export function verifyOtp(phone: string, otp: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/v1/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  })
}

export function refreshSession(refreshToken: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}

export function logout(refreshToken: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/v1/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}
