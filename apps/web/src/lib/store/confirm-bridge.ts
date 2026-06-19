export type ConfirmOptions = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

let resolveConfirm: ((confirmed: boolean) => void) | null = null

export function completeConfirm(confirmed: boolean) {
  resolveConfirm?.(confirmed)
  resolveConfirm = null
}

export function waitForConfirm(): Promise<boolean> {
  return new Promise((resolve) => {
    resolveConfirm = resolve
  })
}

export type { ConfirmOptions as ConfirmDialogOptions }
