import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Button } from './Button'
import { Dialog } from './Dialog'

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function DialogStory() {
    const [open, setOpen] = useState(true)

    return (
      <>
        <Button type="button" onClick={() => setOpen(true)}>
          Open dialog
        </Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Example dialog"
          footer={
            <>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => setOpen(false)}>
                Continue
              </Button>
            </>
          }
        >
          This is a modal with focus management and Escape to close.
        </Dialog>
      </>
    )
  },
}
