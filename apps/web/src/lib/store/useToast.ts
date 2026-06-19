import { useCallback } from 'react'

import { addToast, type ToastVariant } from './index'
import { useAppDispatch } from './hooks'

export function useToast() {
  const dispatch = useAppDispatch()

  const show = useCallback(
    (variant: ToastVariant, message: string) => {
      dispatch(addToast({ variant, message }))
    },
    [dispatch],
  )

  return {
    show,
    success: useCallback((message: string) => show('success', message), [show]),
    error: useCallback((message: string) => show('error', message), [show]),
    warning: useCallback((message: string) => show('warning', message), [show]),
    info: useCallback((message: string) => show('info', message), [show]),
  }
}
