import { useCallback } from 'react'

import { completeConfirm, waitForConfirm, type ConfirmOptions } from './confirm-bridge'
import { useAppDispatch } from './hooks'
import { openConfirmDialog } from './index'

export function useConfirm() {
  const dispatch = useAppDispatch()

  return useCallback(
    (options: ConfirmOptions) => {
      dispatch(openConfirmDialog(options))
      return waitForConfirm()
    },
    [dispatch],
  )
}

export { completeConfirm }
