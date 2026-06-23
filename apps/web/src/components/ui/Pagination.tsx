import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { Icon } from '../Icon'

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50] as const

export type PaginationProps = {
  page: number
  totalPages: number
  /** Total record count across all pages. */
  totalItems?: number
  /** @deprecated Prefer `totalItems`. */
  total?: number
  pageSize?: number
  /** @deprecated Prefer `pageSize`. */
  limit?: number
  pageSizeOptions?: readonly number[]
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  loading?: boolean
  disabled?: boolean
  itemLabel?: string
  className?: string
  summary?: ReactNode
  /** Show summary and page-size controls even when there is only one page. */
  alwaysShowSummary?: boolean
  /** `toolbar` — compact nav above lists; `footer` — full controls below lists. */
  variant?: 'footer' | 'toolbar'
  'aria-label'?: string
}

function formatShowingRange(page: number, pageSize: number, totalItems: number): string {
  if (totalItems <= 0) {
    return `Showing 0 of 0`
  }

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  if (start > totalItems) {
    return `Showing 0 of ${totalItems}`
  }

  return `Showing ${start}–${end} of ${totalItems}`
}

type PaginationNavButtonProps = {
  direction: 'previous' | 'next'
  disabled?: boolean
  onClick: () => void
}

function PaginationNavButton({ direction, disabled, onClick }: PaginationNavButtonProps) {
  const isPrevious = direction === 'previous'
  const label = isPrevious ? 'Previous page' : 'Next page'

  return (
    <button
      type="button"
      className="xp-pagination-btn"
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
    >
      {isPrevious ? (
        <>
          <Icon icon={ChevronLeft} size={16} aria-hidden />
          <span>Previous</span>
        </>
      ) : (
        <>
          <span>Next</span>
          <Icon icon={ChevronRight} size={16} aria-hidden />
        </>
      )}
    </button>
  )
}

type PageSizeSelectorProps = {
  pageSize: number
  options: readonly number[]
  disabled?: boolean
  onChange: (pageSize: number) => void
}

function PageSizeSelector({ pageSize, options, disabled, onChange }: PageSizeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-text-secondary" id="pagination-page-size-label">
        Rows per page
      </span>
      <div
        role="radiogroup"
        aria-labelledby="pagination-page-size-label"
        className="inline-flex items-center gap-1 rounded-xp-sm border border-border bg-surface-subtle/60 p-0.5"
      >
        {options.map((option) => {
          const active = option === pageSize

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              className={cn(
                'xp-pagination-page-size-btn',
                active && 'xp-pagination-page-size-btn-active',
              )}
              onClick={() => {
                if (!active) {
                  onChange(option)
                }
              }}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  total,
  pageSize: pageSizeProp,
  limit,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
  loading = false,
  disabled = false,
  itemLabel = 'item',
  className,
  summary,
  alwaysShowSummary = false,
  variant = 'footer',
  'aria-label': ariaLabel = 'Pagination',
}: PaginationProps) {
  const resolvedTotal = totalItems ?? total
  const pageSize = pageSizeProp ?? limit ?? pageSizeOptions[1] ?? 20
  const isDisabled = disabled || loading
  const hasMultiplePages = totalPages > 1
  const isToolbar = variant === 'toolbar'
  const showFooter =
    !isToolbar &&
    (alwaysShowSummary ||
      hasMultiplePages ||
      (onPageSizeChange !== undefined && resolvedTotal !== undefined && resolvedTotal > 0))

  if (isToolbar && !hasMultiplePages) {
    return null
  }

  if (!showFooter && !isToolbar) {
    return null
  }

  const pluralLabel = resolvedTotal === 1 ? itemLabel : `${itemLabel}s`
  const defaultSummary =
    resolvedTotal !== undefined ? (
      <>
        {formatShowingRange(page, pageSize, resolvedTotal)}{' '}
        <span className="text-text-primary">{pluralLabel}</span>
      </>
    ) : (
      <>Page {page} of {totalPages}</>
    )

  const canGoPrevious = page > 1 && !isDisabled
  const canGoNext = page < totalPages && !isDisabled

  return (
    <nav
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      className={cn(
        'xp-pagination',
        isToolbar ? 'xp-pagination-toolbar' : 'xp-pagination-footer',
        loading && 'xp-pagination-loading',
        className,
      )}
    >
      {isToolbar ? (
        <div className="xp-pagination-nav xp-pagination-nav-inline xp-pagination-nav-toolbar">
          <PaginationNavButton
            direction="previous"
            disabled={!canGoPrevious}
            onClick={() => onPageChange(page - 1)}
          />

          <div
            className="xp-pagination-page-pill"
            aria-current="page"
            aria-label={`Page ${page} of ${totalPages}`}
          >
            Page {page} of {totalPages}
          </div>

          <PaginationNavButton
            direction="next"
            disabled={!canGoNext}
            onClick={() => onPageChange(page + 1)}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="xp-pagination-summary text-center sm:text-left" aria-live="polite">
              {summary ?? defaultSummary}
            </p>

            {onPageSizeChange && (
              <PageSizeSelector
                pageSize={pageSize}
                options={pageSizeOptions}
                disabled={isDisabled}
                onChange={onPageSizeChange}
              />
            )}
          </div>

          {hasMultiplePages && (
            <div className="xp-pagination-nav">
              <PaginationNavButton
                direction="previous"
                disabled={!canGoPrevious}
                onClick={() => onPageChange(page - 1)}
              />

              <div
                className="xp-pagination-page-pill"
                aria-current="page"
                aria-label={`Page ${page} of ${totalPages}`}
              >
                Page {page} of {totalPages}
              </div>

              <PaginationNavButton
                direction="next"
                disabled={!canGoNext}
                onClick={() => onPageChange(page + 1)}
              />
            </div>
          )}
        </>
      )}

      {hasMultiplePages && (
        <p className="sr-only" aria-live="polite">
          Page {page} of {totalPages}
          {resolvedTotal !== undefined ? `, ${resolvedTotal} ${pluralLabel} total` : ''}
        </p>
      )}
    </nav>
  )
}

type PaginatedContentProps = {
  children: ReactNode
  loading?: boolean
  fetching?: boolean
  className?: string
}

/** Fade list content during page transitions without layout shift. */
export function PaginatedContent({
  children,
  loading = false,
  fetching = false,
  className,
}: PaginatedContentProps) {
  const isTransitioning = fetching && !loading

  return (
    <div
      className={cn(
        'xp-paginated-content',
        isTransitioning && 'xp-paginated-content-fetching',
        className,
      )}
      aria-busy={loading || fetching || undefined}
    >
      {children}
    </div>
  )
}
