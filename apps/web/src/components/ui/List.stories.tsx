import type { Meta, StoryObj } from '@storybook/react'

import { Avatar } from './Avatar'
import { List, ListItem } from './List'

const meta = {
  title: 'UI/List',
  component: List,
  tags: ['autodocs'],
} satisfies Meta<typeof List>

export default meta
type Story = StoryObj<typeof meta>

export const CardRows: Story = {
  render: () => (
    <List className="max-w-lg">
      <ListItem className="xp-card flex items-center gap-3 p-4">
        <Avatar size="md" />
        <div>
          <p className="font-medium">Karthick</p>
          <p className="text-sm text-text-secondary">Captain</p>
        </div>
      </ListItem>
      <ListItem className="xp-card flex items-center gap-3 p-4">
        <Avatar size="md" />
        <div>
          <p className="font-medium">Priya</p>
          <p className="text-sm text-text-secondary">Member</p>
        </div>
      </ListItem>
    </List>
  ),
}

export const CompactRows: Story = {
  render: () => (
    <List className="max-w-lg space-y-2">
      <ListItem className="flex items-center gap-3 rounded-xp-lg border border-border px-3 py-3">
        <Avatar size="sm" />
        <p className="font-medium">Balance row</p>
      </ListItem>
    </List>
  ),
}
