import type { Meta, StoryObj } from '@storybook/react'

import { Avatar } from './Avatar'

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const WithImage: Story = {
  args: {
    src: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Karthick',
    alt: 'Member avatar',
    size: 'md',
  },
}

export const Fallback: Story = {
  args: {
    size: 'md',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    src: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Trip',
  },
}
