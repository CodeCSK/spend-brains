import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Pagination } from './Pagination'

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

    return (
      <Pagination
        page={page}
        totalPages={5}
        total={42}
        itemLabel="expense"
        aria-label="Expenses pagination"
        onPageChange={setPage}
      />
    )
  },
}

export const FirstPage: Story = {
  args: {
    page: 1,
    totalPages: 3,
    total: 12,
    itemLabel: 'expense',
    onPageChange: () => {},
  },
}
