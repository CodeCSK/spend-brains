import { cn } from '../../lib/cn'

export type SkeletonVariant = 'text' | 'avatar' | 'card' | 'rect'

const variantClass: Record<SkeletonVariant, string> = {
  text: 'xp-skeleton-text',
  avatar: 'xp-skeleton-avatar',
  card: 'xp-skeleton-card',
  rect: 'xp-skeleton',
}

type SkeletonProps = {
  variant?: SkeletonVariant
  className?: string
}

export function Skeleton({ variant = 'rect', className }: SkeletonProps) {
  return <div className={cn(variantClass[variant], className)} aria-hidden />
}
