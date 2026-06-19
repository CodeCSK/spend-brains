export type AuthUser = {
  id: string
  phone: string
  displayName: string | null
  avatarUrl: string | null
}

export type TokenResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: AuthUser
}

export type MessageResponse = {
  message: string
}

export type UserProfile = AuthUser & {
  phoneVerifiedAt: string | null
  createdAt: string
  isSuperAdmin: boolean
}
