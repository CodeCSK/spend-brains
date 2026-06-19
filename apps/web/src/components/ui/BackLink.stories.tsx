import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { BackLink } from './BackLink'

const meta = {
  title: 'UI/BackLink',
  component: BackLink,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof BackLink>

export default meta
type Story = StoryObj<typeof meta>

export const Ghost: Story = {
  args: {
    to: '/app/events',
    children: 'All events',
  },
}

export const Secondary: Story = {
  args: {
    to: '/app/events/1/expenses',
    children: 'Back to expenses',
    variant: 'secondary',
    className: 'mb-0 mt-6',
  },
}
