export const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=blake',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=casey',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=drew',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=emery',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=finley',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=gray',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=haven',
] as const

export type AvatarPreset = (typeof AVATAR_PRESETS)[number]

export function isAvatarPreset(url: string | null | undefined): url is AvatarPreset {
  return url != null && (AVATAR_PRESETS as readonly string[]).includes(url)
}
