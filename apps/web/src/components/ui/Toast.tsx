import { useEffect } from 'react'
import { X } from 'lucide-react'

import { cn } from '../../lib/cn'
import type { ToastVariant } from '../../lib/store'
import { Icon } from '../Icon'

const AUTO_DISMISS_MS = 5000

const variantClass: Record<ToastVariant, string> = {
  success: 'bg-success-bg text-success-text',
  error: 'bg-error-bg text-error-text',
  warning: 'bg-warning-bg text-warning-text',
  info: 'bg-info-bg text-info-text',
}

type ToastProps = {
  variant: ToastVariant
  message: string
  onDismiss: () => void
}

export function Toast({ variant, message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-xp-lg px-3 py-2 text-sm shadow-xp-md',
        variantClass[variant],
      )}
    >
      <p className="min-w-0 flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-xp-md p-1 hover:bg-surface-inverse/10"
        aria-label="Dismiss notification"
      >
        <Icon icon={X} size={16} aria-hidden />
      </button>
    </div>
  )
}
