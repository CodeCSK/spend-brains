import { Pagination } from '../../../components/ui'
import type { PaginationMeta } from '../../../types/common'

type ExpensePaginationProps = {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function ExpensePagination({ meta, onPageChange }: ExpensePaginationProps) {
  return (
    <Pagination
      page={meta.page}
      totalPages={meta.totalPages}
      total={meta.total}
      itemLabel="expense"
      aria-label="Expenses pagination"
      onPageChange={onPageChange}
    />
  )
}
