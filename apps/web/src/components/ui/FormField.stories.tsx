import type { Meta, StoryObj } from '@storybook/react'

import { FormField } from './FormField'
import { Input } from './Input'

const meta = {
  title: 'UI/FormField',
  component: FormField,
  tags: ['autodocs'],
} satisfies Meta<typeof FormField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 'field-default',
    label: 'Event name',
    children: <Input placeholder="Goa trip 2026" />,
  },
}

export const WithHint: Story = {
  args: {
    id: 'field-hint',
    label: 'Join code',
    hint: 'Share this code so others can join your event.',
    children: <Input readOnly defaultValue="AB12CD34" />,
  },
}

export const WithError: Story = {
  args: {
    id: 'field-error',
    label: 'Start date',
    error: 'Start date is required.',
    children: <Input type="date" />,
  },
}
