import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import { lockBodyScroll, unlockBodyScroll } from '../../lib/body-scroll-lock'
import { cn } from '../../lib/cn'
import { Icon } from '../Icon'

const sizeClass = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-[var(--content-max-width)]',
} as const

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  bodyClassName?: string
  /** `form` — scrollable body, no secondary text wrapper (expense/profile forms). */
  variant?: 'default' | 'form'
  size?: keyof typeof sizeClass
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  bodyClassName,
  variant = 'default',
  size = 'sm',
}: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const previousFocus = document.activeElement as HTMLElement | null

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    lockBodyScroll()

    const focusable =
      panelRef.current?.querySelector<HTMLElement>(
        'input:not([type="hidden"]), select, textarea',
      ) ??
      panelRef.current?.querySelector<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      )
    focusable?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      unlockBodyScroll()
      previousFocus?.focus()
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  const isForm = variant === 'form'

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 md:p-6 xl:items-center xl:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-surface-inverse/50 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'relative z-10 flex w-full flex-col overflow-hidden border border-border bg-surface-raised shadow-xp-md',
          isForm
            ? 'max-h-[min(calc(100dvh-2rem),92dvh)] rounded-t-xp-xl md:max-h-[min(88dvh,calc(100dvh-3rem))] md:rounded-xp-xl xl:rounded-xp-lg'
            : 'max-h-[calc(100dvh-2rem)] rounded-t-xp-xl p-4 md:rounded-xp-xl md:p-6 xl:rounded-xp-lg xl:p-6',
          sizeClass[size],
          className,
        )}
      >
        {isForm ? (
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 md:px-6 md:py-5">
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-lg font-bold text-text-label md:text-xl">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-text-secondary">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              className="xp-icon-btn -mr-1 shrink-0"
              aria-label="Close"
              onClick={onClose}
            >
              <Icon icon={X} size={20} aria-hidden />
            </button>
          </div>
        ) : (
          <>
            <h2 id={titleId} className="text-lg font-bold text-text-label md:text-xl">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-2 text-sm text-text-secondary">
                {description}
              </p>
            )}
          </>
        )}

        {isForm ? (
          <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden', bodyClassName)}>
            {children}
          </div>
        ) : (
          <div className={cn('mt-2 overflow-y-auto text-sm text-text-secondary', bodyClassName)}>
            {children}
          </div>
        )}

        {footer && (
          <div
            className={cn(
              'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
              isForm
                ? 'shrink-0 border-t border-border px-4 py-3 md:px-6 md:py-4'
                : 'mt-4',
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
