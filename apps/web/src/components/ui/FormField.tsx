import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

import { cn } from '../../lib/cn'

type FormFieldProps = {
  id: string
  label: ReactNode
  hint?: string
  error?: string
  className?: string
  children: ReactNode
}

export function FormField({ id, label, hint, error, className, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })
    : children

  return (
    <div className={cn(className)}>
      <label htmlFor={id} className="xp-label">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-text-muted">
          {hint}
        </p>
      )}
      {control}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
