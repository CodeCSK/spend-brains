import type { Meta, StoryObj } from '@storybook/react'

import { Badge } from './Badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    children: 'General',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Settled',
  },
}

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Pending',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Attention',
  },
}

export const RoleCaptain: Story = {
  args: {
    variant: 'role',
    role: 'captain',
    children: 'Captain',
  },
}

export const RoleViceCaptain: Story = {
  args: {
    variant: 'role',
    role: 'vice_captain',
    children: 'Vice captain',
  },
}

export const RoleMember: Story = {
  args: {
    variant: 'role',
    role: 'member',
    children: 'Member',
  },
}
