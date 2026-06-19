import type { Meta, StoryObj } from '@storybook/react'

import { Skeleton } from './Skeleton'

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {
  args: { variant: 'text' },
}

export const Avatar: Story = {
  args: { variant: 'avatar' },
}

export const Card: Story = {
  args: { variant: 'card' },
}

export const Rect: Story = {
  args: { variant: 'rect', className: 'h-48 rounded-xp-xl' },
}

export const EventLoading: Story = {
  render: () => (
    <div className="max-w-3xl">
      <Skeleton variant="rect" className="h-48 rounded-xp-xl" />
      <Skeleton variant="text" className="mt-6" />
      <Skeleton variant="text" className="mt-2 w-1/2" />
    </div>
  ),
}
