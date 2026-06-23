import { Pagination } from '../../../components/ui'
import type { PaginationMeta } from '../../../types/common'

type ExpensePaginationProps = {
  meta: PaginationMeta
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  loading?: boolean
  disabled?: boolean
  variant?: 'footer' | 'toolbar'
  className?: string
}

export function ExpensePagination({
  meta,
  onPageChange,
  onPageSizeChange,
  loading,
  disabled,
  variant = 'footer',
  className,
}: ExpensePaginationProps) {
  return (
    <Pagination
      page={meta.page}
      totalPages={meta.totalPages}
      totalItems={meta.total}
      pageSize={meta.limit}
      itemLabel="expense"
      alwaysShowSummary={variant === 'footer'}
      variant={variant}
      aria-label={variant === 'toolbar' ? 'Expenses pagination toolbar' : 'Expenses pagination'}
      className={className}
      loading={loading}
      disabled={disabled}
      onPageChange={onPageChange}
      onPageSizeChange={variant === 'footer' ? onPageSizeChange : undefined}
    />
  )
}
