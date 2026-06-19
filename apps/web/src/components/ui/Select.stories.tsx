import type { Meta, StoryObj } from '@storybook/react'

import { FormField } from './FormField'
import { Select } from './Select'

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <FormField id="select-default" label="Event type">
      <Select defaultValue="general">
        <option value="general">General</option>
        <option value="trip">Trip</option>
        <option value="wedding">Wedding</option>
      </Select>
    </FormField>
  ),
}

export const WithError: Story = {
  render: () => (
    <FormField id="select-error" label="Category" error="Category is required.">
      <Select defaultValue="">
        <option value="">Select…</option>
        <option value="food">Food</option>
      </Select>
    </FormField>
  ),
}

export const Disabled: Story = {
  render: () => (
    <FormField id="select-disabled" label="Paid by">
      <Select disabled defaultValue="user-1">
        <option value="user-1">Karthick</option>
      </Select>
    </FormField>
  ),
}
