import type { Meta, StoryObj } from '@storybook/react'

import { Checkbox } from './Checkbox'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <label className="flex items-start gap-2 text-sm text-text-label">
      <Checkbox className="mt-1" defaultChecked />
      <span>Split equally among selected members.</span>
    </label>
  ),
}

export const WithError: Story = {
  render: () => (
    <div>
      <label className="flex items-start gap-2 text-sm text-text-label">
        <Checkbox className="mt-1" aria-invalid />
        <span>I consent to receive OTP via SMS.</span>
      </label>
      <p className="mt-1 text-sm text-error-text" role="alert">
        You must consent to receive OTP via SMS.
      </p>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <label className="flex items-start gap-2 text-sm text-text-label">
      <Checkbox className="mt-1" disabled />
      <span>Unavailable option</span>
    </label>
  ),
}
