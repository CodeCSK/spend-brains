import type { LucideIcon } from 'lucide-react'
import {
  Cat,
  Crown,
  Gamepad2,
  Ghost,
  Pizza,
  Rocket,
  Star,
  Zap,
} from 'lucide-react'

export type AvatarPresetId =
  | 'spark'
  | 'rocket'
  | 'panda'
  | 'crown'
  | 'pizza'
  | 'ghost'
  | 'star'
  | 'gamer'

export type AvatarPreset = {
  id: AvatarPresetId
  label: string
  Icon: LucideIcon
  bg: string
  fg: string
}

/** Netflix-style profile icons — stored as `preset:<id>` in the API. */
export const AVATAR_PRESETS: readonly AvatarPreset[] = [
  { id: 'spark', label: 'Spark', Icon: Zap, bg: '#f59e0b', fg: '#451a03' },
  { id: 'rocket', label: 'Rocket', Icon: Rocket, bg: '#3b82f6', fg: '#1e3a8a' },
  { id: 'panda', label: 'Panda', Icon: Cat, bg: '#10b981', fg: '#064e3b' },
  { id: 'crown', label: 'Crown', Icon: Crown, bg: '#8b5cf6', fg: '#4c1d95' },
  { id: 'pizza', label: 'Pizza', Icon: Pizza, bg: '#f97316', fg: '#7c2d12' },
  { id: 'ghost', label: 'Ghost', Icon: Ghost, bg: '#64748b', fg: '#0f172a' },
  { id: 'star', label: 'Star', Icon: Star, bg: '#ec4899', fg: '#831843' },
  { id: 'gamer', label: 'Gamer', Icon: Gamepad2, bg: '#6366f1', fg: '#312e81' },
] as const

export const AVATAR_PRESET_IDS = AVATAR_PRESETS.map((preset) => preset.id)

export const DEFAULT_AVATAR_PRESET_ID: AvatarPresetId = 'spark'

const PRESET_BY_ID = new Map(AVATAR_PRESETS.map((preset) => [preset.id, preset]))

export function getAvatarPreset(id: AvatarPresetId): AvatarPreset {
  const preset = PRESET_BY_ID.get(id)
  if (!preset) throw new Error(`Unknown avatar preset: ${id}`)
  return preset
}

export function presetStorageValue(id: AvatarPresetId): string {
  return `preset:${id}`
}

export function parsePresetId(value: string | null | undefined): AvatarPresetId | null {
  if (!value?.startsWith('preset:')) return null
  const id = value.slice('preset:'.length) as AvatarPresetId
  return PRESET_BY_ID.has(id) ? id : null
}

export function resolveAvatarPresetId(value: string | null | undefined): AvatarPresetId {
  return parsePresetId(value) ?? DEFAULT_AVATAR_PRESET_ID
}

export function isAvatarPresetValue(value: string | null | undefined): boolean {
  return parsePresetId(value) != null
}

/** Legacy dicebear / external URLs from older builds. */
export function isLegacyAvatarUrl(value: string | null | undefined): boolean {
  return Boolean(value && !value.startsWith('preset:'))
}

export function resolveAvatarPreset(value: string | null | undefined): AvatarPreset {
  return getAvatarPreset(resolveAvatarPresetId(value))
}
