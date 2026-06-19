import { useAppDispatch, useAppSelector } from '../../lib/store/hooks'
import { removeToast } from '../../lib/store'
import { Toast } from './Toast'

export function ToastContainer() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.toast.items)

  if (items.length === 0) {
    return null
  }

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-sm"
    >
      {items.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            variant={toast.variant}
            message={toast.message}
            onDismiss={() => dispatch(removeToast(toast.id))}
          />
        </div>
      ))}
    </div>
  )
}
