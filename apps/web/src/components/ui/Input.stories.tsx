import type { Meta, StoryObj } from '@storybook/react'

import { FormField } from './FormField'
import { Input } from './Input'

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <FormField id="input-default" label="Display name">
      <Input placeholder="Your name" />
    </FormField>
  ),
}

export const WithError: Story = {
  render: () => (
    <FormField id="input-error" label="Phone" error="Enter a valid Indian mobile number.">
      <Input type="tel" defaultValue="invalid" />
    </FormField>
  ),
}

export const Disabled: Story = {
  render: () => (
    <FormField id="input-disabled" label="Amount (₹)">
      <Input type="number" disabled defaultValue="1200" />
    </FormField>
  ),
}
