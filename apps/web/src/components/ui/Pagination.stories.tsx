import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { DEFAULT_PAGE_SIZE_OPTIONS, Pagination } from './Pagination'

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  tags: ['autodocs'],
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function PaginationStory() {
    const [page, setPage] = useState(2)
    const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE_OPTIONS[1])

    return (
      <Pagination
        page={page}
        totalPages={10}
        totalItems={187}
        pageSize={pageSize}
        itemLabel="expense"
        alwaysShowSummary
        aria-label="Expenses pagination"
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize)
          setPage(1)
        }}
      />
    )
  },
}

export const FirstPage: Story = {
  args: {
    page: 1,
    totalPages: 3,
    totalItems: 12,
    pageSize: 20,
    itemLabel: 'expense',
    alwaysShowSummary: true,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
}

export const SinglePage: Story = {
  args: {
    page: 1,
    totalPages: 1,
    totalItems: 8,
    pageSize: 20,
    itemLabel: 'member',
    alwaysShowSummary: true,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
}

export const Toolbar: Story = {
  args: {
    page: 2,
    totalPages: 10,
    totalItems: 187,
    pageSize: 20,
    itemLabel: 'expense',
    variant: 'toolbar',
    alwaysShowSummary: true,
    onPageChange: () => {},
  },
}

export const Loading: Story = {
  args: {
    page: 2,
    totalPages: 5,
    totalItems: 87,
    pageSize: 20,
    itemLabel: 'expense',
    loading: true,
    alwaysShowSummary: true,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
}
