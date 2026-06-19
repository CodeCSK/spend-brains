import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { Icon } from '../Icon'
import { Button } from './Button'

type PaginationProps = {
  page: number
  totalPages: number
  total?: number
  limit?: number
  onPageChange: (page: number) => void
  'aria-label'?: string
  itemLabel?: string
  className?: string
  summary?: ReactNode
  /** Show count/range even when there is only one page. */
  alwaysShowSummary?: boolean
}

function formatItemRange(page: number, limit: number, total: number): string {
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  return `${start}–${end} of ${total}`
}

function getVisiblePages(current: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages: (number | 'gap')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(totalPages - 1, current + 1)

  if (start > 2) {
    pages.push('gap')
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (end < totalPages - 1) {
    pages.push('gap')
  }

  pages.push(totalPages)
  return pages
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  'aria-label': ariaLabel = 'Pagination',
  itemLabel = 'item',
  className,
  summary,
  alwaysShowSummary = false,
}: PaginationProps) {
  const hasMultiplePages = totalPages > 1
  const showNav = hasMultiplePages || alwaysShowSummary

  if (!showNav) {
    return null
  }

  const defaultSummary =
    total !== undefined && limit !== undefined ? (
      <>
        {formatItemRange(page, limit, total)}{' '}
        <span className="hidden sm:inline">
          {itemLabel}
          {total === 1 ? '' : 's'}
        </span>
      </>
    ) : total !== undefined ? (
      <>
        Page {page} of {totalPages} · {total} {itemLabel}
        {total === 1 ? '' : 's'}
      </>
    ) : (
      <>
        Page {page} of {totalPages}
      </>
    )

  const pageButtons = getVisiblePages(page, totalPages)

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'flex flex-col gap-2.5 rounded-xp-lg border border-border bg-surface-raised p-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3',
        className,
      )}
    >
      <p className="text-center text-xs text-text-secondary sm:text-left sm:text-sm">
        {summary ?? defaultSummary}
        {hasMultiplePages && (
          <span className="sm:hidden">
            {' '}
            · Page {page}/{totalPages}
          </span>
        )}
      </p>

      {hasMultiplePages && (
        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
          <Button
            type="button"
            variant="secondary"
            className="h-8 min-w-8 px-2 sm:min-w-9 sm:px-2.5"
            disabled={page <= 1}
            aria-label="Previous page"
            onClick={() => onPageChange(page - 1)}
          >
            <Icon icon={ChevronLeft} size={16} aria-hidden />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="hidden items-center gap-0.5 sm:flex">
            {pageButtons.map((item, index) =>
              item === 'gap' ? (
                <span
                  key={`gap-${index}`}
                  className="px-1 text-sm text-text-muted"
                  aria-hidden
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? 'page' : undefined}
                  className={cn(
                    'inline-flex h-8 min-w-8 items-center justify-center rounded-xp-md text-sm font-medium transition-colors',
                    item === page
                      ? 'bg-primary text-primary-fg'
                      : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
                  )}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <Button
            type="button"
            variant="secondary"
            className="h-8 min-w-8 px-2 sm:min-w-9 sm:px-2.5"
            disabled={page >= totalPages}
            aria-label="Next page"
            onClick={() => onPageChange(page + 1)}
          >
            <span className="hidden sm:inline">Next</span>
            <Icon icon={ChevronRight} size={16} aria-hidden />
          </Button>
        </div>
      )}
    </nav>
  )
}
