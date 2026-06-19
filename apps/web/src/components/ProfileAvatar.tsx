import { Icon } from './Icon'
import {
  resolveAvatarPreset,
  type AvatarPreset,
  type AvatarPresetId,
} from '../lib/avatar-presets'
import { cn } from '../lib/cn'
import type { AvatarSize } from './ui/Avatar'

const sizeClass: Record<AvatarSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

const iconSize: Record<AvatarSize, 16 | 20 | 24> = {
  sm: 16,
  md: 20,
  lg: 24,
}

type ProfileAvatarProps = {
  avatarUrl?: string | null
  alt?: string
  size?: AvatarSize
  className?: string
}

export function ProfileAvatar({
  avatarUrl,
  alt = '',
  size = 'md',
  className,
}: ProfileAvatarProps) {
  if (avatarUrl && !avatarUrl.startsWith('preset:')) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-xp-md border border-border bg-surface-subtle',
          sizeClass[size],
          className,
        )}
      >
        <img src={avatarUrl} alt={alt} className="h-full w-full object-cover" />
      </div>
    )
  }

  const preset = resolveAvatarPreset(avatarUrl)
  return (
    <PresetAvatarTile preset={preset} size={size} className={className} title={alt || preset.label} />
  )
}

type PresetAvatarTileProps = {
  preset: AvatarPreset
  size?: AvatarSize
  selected?: boolean
  className?: string
  title?: string
  onClick?: () => void
}

export function PresetAvatarTile({
  preset,
  size = 'md',
  selected = false,
  className,
  title,
  onClick,
}: PresetAvatarTileProps) {
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      title={title ?? preset.label}
      aria-label={title ?? preset.label}
      aria-pressed={onClick ? selected : undefined}
      onClick={onClick}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xp-md border-2 transition-transform',
        sizeClass[size],
        selected
          ? 'border-white ring-2 ring-primary ring-offset-1 scale-105'
          : 'border-transparent hover:scale-105',
        onClick && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
      style={{ backgroundColor: preset.bg, color: preset.fg }}
    >
      <Icon icon={preset.Icon} size={iconSize[size]} aria-hidden />
    </Tag>
  )
}

export type { AvatarPresetId }
