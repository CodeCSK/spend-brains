import type { Meta, StoryObj } from '@storybook/react'

import { Button } from './Button'
import { ConfirmDialog } from './ConfirmDialog'
import { withReduxProvider } from './storybook-decorators'
import { useConfirm } from '../../lib/store/useConfirm'

function ConfirmDemo() {
  const confirm = useConfirm()

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        onClick={async () => {
          const confirmed = await confirm({
            title: 'Delete event',
            message: 'Delete this event permanently? This cannot be undone.',
            confirmLabel: 'Delete event',
            destructive: true,
          })
          if (confirmed) {
            // Storybook demo only
          }
        }}
      >
        Delete event
      </Button>
      <ConfirmDialog />
    </>
  )
}

const meta = {
  title: 'UI/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  decorators: [withReduxProvider],
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const DestructiveConfirm: Story = {
  render: () => <ConfirmDemo />,
}
