import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { SegmentedControl } from './SegmentedControl'

const meta = {
  title: 'UI/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

export const ActiveArchived: Story = {
  render: function ActiveArchivedStory() {
    const [value, setValue] = useState<'active' | 'archived'>('active')

    return (
      <SegmentedControl
        aria-label="Event list filter"
        value={value}
        onChange={setValue}
        stretch
        options={[
          { value: 'active', label: 'Active' },
          { value: 'archived', label: 'Archived' },
        ]}
      />
    )
  },
}

export const SettlementFilter: Story = {
  render: function SettlementFilterStory() {
    const [value, setValue] = useState<'all' | 'unsettled'>('all')

    return (
      <SegmentedControl
        aria-label="Settlement line filter"
        value={value}
        onChange={setValue}
        size="compact"
        options={[
          { value: 'all', label: 'All' },
          { value: 'unsettled', label: 'Unsettled only' },
        ]}
      />
    )
  },
}
