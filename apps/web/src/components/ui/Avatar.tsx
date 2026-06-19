import type { ReactNode } from 'react'

import { ProfileAvatar } from '../ProfileAvatar'
import { cn } from '../../lib/cn'

export type AvatarSize = 'sm' | 'md' | 'lg'

type AvatarProps = {
  src?: string | null
  alt?: string
  size?: AvatarSize
  fallback?: ReactNode
  className?: string
}

export function Avatar({ src, alt = '', size = 'md', className }: AvatarProps) {
  return (
    <ProfileAvatar
      avatarUrl={src}
      alt={alt}
      size={size}
      className={cn(className)}
    />
  )
}
