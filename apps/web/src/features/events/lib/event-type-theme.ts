import type { LucideIcon } from 'lucide-react'
import {
  Briefcase,
  Compass,
  Home,
  Landmark,
  PartyPopper,
  Palmtree,
} from 'lucide-react'

import type { EventType } from '../../../types/event'
import { EVENT_TYPE_LABELS } from './event-labels'

export type EventTypeTheme = {
  label: string
  Icon: LucideIcon
  gradient: string
  iconBg: string
  iconColor: string
}

export const EVENT_TYPE_THEMES: Record<EventType, EventTypeTheme> = {
  general: {
    label: EVENT_TYPE_LABELS.general,
    Icon: Compass,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    iconBg: 'rgba(255,255,255,0.18)',
    iconColor: '#ffffff',
  },
  vacation: {
    label: EVENT_TYPE_LABELS.vacation,
    Icon: Palmtree,
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    iconBg: 'rgba(255,255,255,0.18)',
    iconColor: '#ffffff',
  },
  corporate: {
    label: EVENT_TYPE_LABELS.corporate,
    Icon: Briefcase,
    gradient: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
    iconBg: 'rgba(255,255,255,0.18)',
    iconColor: '#ffffff',
  },
  ritual: {
    label: EVENT_TYPE_LABELS.ritual,
    Icon: Landmark,
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    iconBg: 'rgba(255,255,255,0.18)',
    iconColor: '#ffffff',
  },
  roommate: {
    label: EVENT_TYPE_LABELS.roommate,
    Icon: Home,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    iconBg: 'rgba(255,255,255,0.18)',
    iconColor: '#ffffff',
  },
  travel: {
    label: EVENT_TYPE_LABELS.travel,
    Icon: Compass,
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
    iconBg: 'rgba(255,255,255,0.18)',
    iconColor: '#ffffff',
  },
  party: {
    label: EVENT_TYPE_LABELS.party,
    Icon: PartyPopper,
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    iconBg: 'rgba(255,255,255,0.18)',
    iconColor: '#ffffff',
  },
}

/** Decorative banner — no external cover images (avoids broken/half-cropped photos). */
export function getEventTypeTheme(eventType: EventType): EventTypeTheme {
  return EVENT_TYPE_THEMES[eventType]
}
