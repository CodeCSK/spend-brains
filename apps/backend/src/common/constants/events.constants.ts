import { EventType } from '@prisma/client';

/**
 * Default cover image per event type. v1 uses a static set keyed by type;
 * custom cover uploads arrive in a later version (see app-story).
 */
export const DEFAULT_COVER_IMAGE_BY_TYPE: Record<EventType, string> = {
  [EventType.general]:
    'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=1200&q=80',
  [EventType.vacation]:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
  [EventType.corporate]:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
  [EventType.ritual]:
    'https://images.unsplash.com/photo-1567880905822-56f8e06fe630?w=1200&q=80',
  [EventType.roommate]:
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
  [EventType.travel]:
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80',
  [EventType.party]:
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80',
};

export function defaultCoverImageFor(type: EventType): string {
  return DEFAULT_COVER_IMAGE_BY_TYPE[type];
}

export interface DefaultCategorySeed {
  name: string;
  icon: string;
}

/**
 * Seeded for every new event. `icon` is an icon key the clients map to glyphs.
 */
export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategorySeed[] = [
  { name: 'Food', icon: 'food' },
  { name: 'Travel', icon: 'travel' },
  { name: 'Stay', icon: 'stay' },
  { name: 'Shopping', icon: 'shopping' },
  { name: 'Entertainment', icon: 'entertainment' },
  { name: 'Other', icon: 'other' },
];
