import { useAppDispatch, useAppSelector } from '../../lib/store/hooks'
import { closeConfirmDialog } from '../../lib/store'
import { completeConfirm } from '../../lib/store/confirm-bridge'
import { Button } from './Button'
import { Dialog } from './Dialog'

export function ConfirmDialog() {
  const dispatch = useAppDispatch()
  const dialog = useAppSelector((state) => state.ui.confirmDialog)

  function handleClose(confirmed: boolean) {
    completeConfirm(confirmed)
    dispatch(closeConfirmDialog())
  }

  return (
    <Dialog
      open={dialog.open}
      onClose={() => handleClose(false)}
      title={dialog.title}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => handleClose(false)}>
            {dialog.cancelLabel}
          </Button>
          <Button
            type="button"
            variant={dialog.destructive ? 'destructive' : 'primary'}
            onClick={() => handleClose(true)}
          >
            {dialog.confirmLabel}
          </Button>
        </>
      }
    >
      {dialog.message}
    </Dialog>
  )
}
