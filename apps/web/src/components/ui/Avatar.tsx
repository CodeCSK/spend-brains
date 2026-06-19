import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type AvatarSize = 'sm' | 'md' | 'lg'

const sizeClass: Record<AvatarSize, string> = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
}

type AvatarProps = {
  src?: string | null
  alt?: string
  size?: AvatarSize
  fallback?: ReactNode
  className?: string
}

export function Avatar({
  src,
  alt = '',
  size = 'md',
  fallback = '—',
  className,
}: AvatarProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-xp-full border border-border bg-surface-page',
        sizeClass[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs text-text-muted">{fallback}</span>
      )}
    </div>
  )
}
