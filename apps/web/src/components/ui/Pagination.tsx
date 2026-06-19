import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { Button } from './Button'

type PaginationProps = {
  page: number
  totalPages: number
  total?: number
  onPageChange: (page: number) => void
  'aria-label'?: string
  itemLabel?: string
  className?: string
  summary?: ReactNode
}

export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  'aria-label': ariaLabel = 'Pagination',
  itemLabel = 'item',
  className,
  summary,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const defaultSummary =
    total !== undefined ? (
      <>
        Page {page} of {totalPages} · {total} {itemLabel}
        {total === 1 ? '' : 's'}
      </>
    ) : (
      <>
        Page {page} of {totalPages}
      </>
    )

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-sm text-text-secondary">{summary ?? defaultSummary}</p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  )
}
