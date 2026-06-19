import type { Meta, StoryObj } from '@storybook/react'

import { Progress } from './Progress'

const meta = {
  title: 'UI/Progress',
  component: Progress,
  tags: ['autodocs'],
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 65,
    label: 'Settlement progress',
    caption: '65% settled by line count',
  },
}

export const Empty: Story = {
  args: {
    value: 0,
    caption: '0% settled by line count',
  },
}

export const Complete: Story = {
  args: {
    value: 100,
    caption: '100% settled by line count',
  },
}

export const WithoutCaption: Story = {
  args: {
    value: 40,
    caption: undefined,
  },
}
