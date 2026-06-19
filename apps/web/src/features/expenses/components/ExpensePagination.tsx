import { Pagination } from '../../../components/ui'
import type { PaginationMeta } from '../../../types/common'

type ExpensePaginationProps = {
  meta: PaginationMeta
  onPageChange: (page: number) => void
  className?: string
}

export function ExpensePagination({ meta, onPageChange, className }: ExpensePaginationProps) {
  return (
    <Pagination
      page={meta.page}
      totalPages={meta.totalPages}
      total={meta.total}
      limit={meta.limit}
      itemLabel="expense"
      alwaysShowSummary
      aria-label="Expenses pagination"
      className={className}
      onPageChange={onPageChange}
    />
  )
}
