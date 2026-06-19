import type { Meta, StoryObj } from '@storybook/react'

import { Chip } from './Chip'

const meta = {
  title: 'UI/Chip',
  component: Chip,
  tags: ['autodocs'],
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Trip',
  },
}

export const Mono: Story = {
  args: {
    children: 'AB23CD45',
    mono: true,
  },
}

export const Group: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Chip>General</Chip>
      <Chip mono>AB23CD45</Chip>
      <Chip>3 members</Chip>
    </div>
  ),
}
