import type { Meta, StoryObj } from '@storybook/react'

import { FormField } from './FormField'
import { Textarea } from './Textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <FormField id="textarea-default" label="Description">
      <Textarea rows={3} placeholder="What is this event about?" />
    </FormField>
  ),
}

export const WithError: Story = {
  render: () => (
    <FormField
      id="textarea-error"
      label="Notes"
      error="Notes must be at most 2000 characters."
    >
      <Textarea rows={2} defaultValue="Too long…" />
    </FormField>
  ),
}

export const Disabled: Story = {
  render: () => (
    <FormField id="textarea-disabled" label="Description">
      <Textarea rows={3} disabled defaultValue="Archived event notes." />
    </FormField>
  ),
}
