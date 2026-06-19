import type { Meta, StoryObj } from '@storybook/react'

import { Alert } from './Alert'

const meta = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: {
    variant: 'success',
    live: true,
    children: 'Profile saved.',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Something went wrong. Please try again.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    live: true,
    children: 'Add a display name so friends can recognize you.',
  },
}

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Code sent to your phone.',
  },
}
