import { Skeleton } from '../../../../components/ui'

type ExpenseSummarySkeletonProps = {
  variant?: 'group' | 'member'
}

export function ExpenseSummarySkeleton({ variant = 'group' }: ExpenseSummarySkeletonProps) {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="xp-summary-panel">
        <Skeleton variant="text" className="h-5 w-28" />
        <div className="mt-4 grid grid-cols-1 items-center gap-5 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-8">
          <div className="space-y-4">
            {variant === 'member' && (
              <>
                <Skeleton variant="text" className="h-3 w-16" />
                <Skeleton variant="rect" className="h-11 w-full rounded-xp-lg" />
              </>
            )}
            <Skeleton variant="rect" className="min-h-24 w-full rounded-xp-xl" />
          </div>
          <div className="flex justify-center lg:justify-end">
            <Skeleton variant="rect" className="h-56 w-56 max-w-full rounded-full" />
          </div>
        </div>
        <div className="mt-5 border-t border-border pt-5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} variant="rect" className="h-11 rounded-xp-lg" />
            ))}
          </div>
        </div>
      </div>

      {variant === 'group' && (
        <div className="xp-summary-panel">
          <Skeleton variant="text" className="h-5 w-32" />
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} variant="rect" className="h-11 rounded-xp-lg" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
