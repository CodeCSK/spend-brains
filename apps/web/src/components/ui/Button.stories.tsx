import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { Send } from 'lucide-react'

import { Icon } from '../Icon'
import { Button } from './Button'

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="flex flex-wrap gap-3">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'Primary action',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary action',
    variant: 'secondary',
  },
}

export const Ghost: Story = {
  args: {
    children: 'Ghost action',
    variant: 'ghost',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Icon icon={Send} size={20} aria-hidden />
        Send OTP
      </>
    ),
    variant: 'primary',
  },
}

export const Loading: Story = {
  args: {
    children: 'Saving…',
    variant: 'primary',
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    variant: 'primary',
    disabled: true,
  },
}

export const AsLink: Story = {
  args: {
    as: 'link',
    to: '/app/events',
    children: 'Go to events',
    variant: 'primary',
  },
}

export const FullWidth: Story = {
  args: {
    children: 'Full width',
    variant: 'primary',
    className: 'w-full',
  },
}
