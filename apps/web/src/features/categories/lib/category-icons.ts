import {
  BedDouble,
  CircleEllipsis,
  Plane,
  ShoppingBag,
  Utensils,
  type LucideIcon,
  PartyPopper,
} from 'lucide-react'

export const CATEGORY_ICON_KEYS = [
  'food',
  'travel',
  'stay',
  'shopping',
  'entertainment',
  'other',
] as const

export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number]

export const CATEGORY_ICON_LABELS: Record<CategoryIconKey, string> = {
  food: 'Food',
  travel: 'Travel',
  stay: 'Stay',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  other: 'Other',
}

const ICON_BY_KEY: Record<CategoryIconKey, LucideIcon> = {
  food: Utensils,
  travel: Plane,
  stay: BedDouble,
  shopping: ShoppingBag,
  entertainment: PartyPopper,
  other: CircleEllipsis,
}

export function isCategoryIconKey(value: string): value is CategoryIconKey {
  return (CATEGORY_ICON_KEYS as readonly string[]).includes(value)
}

export function getCategoryLucideIcon(iconKey: string): LucideIcon {
  if (isCategoryIconKey(iconKey)) {
    return ICON_BY_KEY[iconKey]
  }
  return CircleEllipsis
}
