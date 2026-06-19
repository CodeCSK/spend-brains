import type { Meta, StoryObj } from '@storybook/react'

import { Button } from './Button'
import { Toast } from './Toast'
import { ToastContainer } from './ToastContainer'
import { withReduxProvider } from './storybook-decorators'
import { useAppDispatch } from '../../lib/store/hooks'
import { addToast } from '../../lib/store'

function ToastContainerDemo() {
  const dispatch = useAppDispatch()

  return (
    <>
      <Button
        type="button"
        onClick={() =>
          dispatch(addToast({ variant: 'info', message: 'Queued toast from Redux store.' }))
        }
      >
        Push toast
      </Button>
      <ToastContainer />
    </>
  )
}

const meta = {
  title: 'UI/ToastContainer',
  component: ToastContainer,
  tags: ['autodocs'],
  decorators: [withReduxProvider],
  parameters: {
    docs: {
      description: {
        component:
          'Fixed-position stack mounted in App.tsx. Dispatches from `toastSlice` via `useToast()`. See also UI/Toast for single-toast variants.',
      },
    },
  },
} satisfies Meta<typeof ToastContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Queue: Story = {
  render: () => <ToastContainerDemo />,
}

export const SingleToast: Story = {
  render: () => (
    <Toast variant="success" message="Profile saved." onDismiss={() => undefined} />
  ),
}
