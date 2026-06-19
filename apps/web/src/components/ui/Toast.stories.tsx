import type { Meta, StoryObj } from '@storybook/react'

import { Button } from './Button'
import { Toast } from './Toast'
import { ToastContainer } from './ToastContainer'
import { withReduxProvider } from './storybook-decorators'
import { useAppDispatch } from '../../lib/store/hooks'
import { addToast } from '../../lib/store'

function ToastDemo() {
  const dispatch = useAppDispatch()

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() =>
            dispatch(addToast({ variant: 'success', message: 'Profile saved.' }))
          }
        >
          Success toast
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            dispatch(addToast({ variant: 'error', message: 'Something went wrong.' }))
          }
        >
          Error toast
        </Button>
      </div>
      <ToastContainer />
    </>
  )
}

const meta = {
  title: 'UI/Toast',
  component: Toast,
  tags: ['autodocs'],
  decorators: [withReduxProvider],
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Notifications: Story = {
  render: () => <ToastDemo />,
}

export const Success: Story = {
  args: {
    variant: 'success',
    message: 'Profile saved.',
    onDismiss: () => undefined,
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    message: 'Something went wrong.',
    onDismiss: () => undefined,
  },
}
