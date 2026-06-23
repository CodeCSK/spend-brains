import { cn } from '../../lib/cn'
import { Skeleton } from '../ui/Skeleton'
import { PageLayout } from './PageLayout'

type PageLoadingSkeletonProps = {
  width?: 'wide' | 'narrow'
}

export function PageLoadingSkeleton({ width = 'wide' }: PageLoadingSkeletonProps) {
  return (
    <PageLayout width={width}>
      <div className="space-y-4" aria-busy="true">
        <span className="sr-only">Loading</span>
        <Skeleton variant="text" className="h-8 w-36" />
        <Skeleton variant="text" className="h-4 w-52" />
        <Skeleton variant="card" className="min-h-40 rounded-xp-xl" />
      </div>
    </PageLayout>
  )
}

export function EventPageLoadingSkeleton() {
  return (
    <PageLayout width="wide">
      <div className="space-y-4" aria-busy="true">
        <span className="sr-only">Loading event</span>
        <Skeleton variant="text" className="h-4 w-24" />
        <Skeleton variant="card" className="min-h-36 rounded-xp-lg" />
        <Skeleton variant="rect" className="h-10 w-full rounded-xp-lg" />
        <Skeleton variant="card" className="min-h-48 rounded-xp-lg" />
      </div>
    </PageLayout>
  )
}

type ListRowsSkeletonProps = {
  rows?: number
  className?: string
}

export function ListRowsSkeleton({ rows = 3, className }: ListRowsSkeletonProps) {
  return (
    <ul className={cn('xp-compact-list mt-3', className)} aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="xp-compact-list-row">
          <div className="xp-skeleton h-8 w-8 shrink-0 rounded-xp-full" />
          <div className="xp-skeleton h-4 min-w-0 flex-1 rounded-xp-md" />
        </li>
      ))}
    </ul>
  )
}

export function FormLoadingSkeleton() {
  return (
    <div className="space-y-4 px-4 py-5 sm:px-5" aria-busy="true">
      <span className="sr-only">Loading form</span>
      <div className="space-y-2">
        <Skeleton variant="text" className="h-3 w-20" />
        <Skeleton variant="rect" className="h-10 w-full rounded-xp-md" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" className="h-3 w-16" />
        <Skeleton variant="rect" className="h-10 w-full rounded-xp-md" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" className="h-3 w-24" />
        <Skeleton variant="rect" className="h-24 w-full rounded-xp-md" />
      </div>
    </div>
  )
}
