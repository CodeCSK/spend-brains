import {
  Camera,
  Crown,
  Flame,
  Gem,
  Music2,
  Palette,
  Rocket,
  Sparkles,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react'

/** Fixed picker set — keys are storage IDs, not category names. */
export const CATEGORY_ICON_KEYS = [
  'sparkles',
  'rocket',
  'flame',
  'crown',
  'gem',
  'music',
  'camera',
  'palette',
  'trophy',
  'zap',
] as const

export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number]

/** Screen-reader labels only — not shown in the picker UI. */
export const CATEGORY_ICON_ARIA_LABELS: Record<CategoryIconKey, string> = {
  sparkles: 'Sparkles icon',
  rocket: 'Rocket icon',
  flame: 'Flame icon',
  crown: 'Crown icon',
  gem: 'Gem icon',
  music: 'Music icon',
  camera: 'Camera icon',
  palette: 'Palette icon',
  trophy: 'Trophy icon',
  zap: 'Lightning icon',
}

const ICON_BY_KEY: Record<CategoryIconKey, LucideIcon> = {
  sparkles: Sparkles,
  rocket: Rocket,
  flame: Flame,
  crown: Crown,
  gem: Gem,
  music: Music2,
  camera: Camera,
  palette: Palette,
  trophy: Trophy,
  zap: Zap,
}

/** Maps legacy seeded / old icon keys to the new picker set for display. */
const LEGACY_ICON_KEY_MAP: Record<string, CategoryIconKey> = {
  food: 'flame',
  travel: 'rocket',
  stay: 'crown',
  shopping: 'gem',
  entertainment: 'music',
  transport: 'zap',
  health: 'sparkles',
  drinks: 'trophy',
  gifts: 'gem',
  other: 'palette',
}

export function isCategoryIconKey(value: string): value is CategoryIconKey {
  return (CATEGORY_ICON_KEYS as readonly string[]).includes(value)
}

export function normalizeCategoryIconKey(value: string): CategoryIconKey {
  if (isCategoryIconKey(value)) {
    return value
  }
  return LEGACY_ICON_KEY_MAP[value] ?? 'sparkles'
}

export function getCategoryLucideIcon(iconKey: string): LucideIcon {
  if (isCategoryIconKey(iconKey)) {
    return ICON_BY_KEY[iconKey]
  }
  const legacyKey = LEGACY_ICON_KEY_MAP[iconKey]
  if (legacyKey) {
    return ICON_BY_KEY[legacyKey]
  }
  return Sparkles
}
