import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ConfirmDialogState = {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  destructive: boolean
}

export type UiState = {
  confirmDialog: ConfirmDialogState
}

export const uiInitialState: UiState = {
  confirmDialog: {
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    destructive: false,
  },
}

export type OpenConfirmDialogPayload = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState: uiInitialState,
  reducers: {
    openConfirmDialog(state, action: PayloadAction<OpenConfirmDialogPayload>) {
      state.confirmDialog = {
        open: true,
        title: action.payload.title,
        message: action.payload.message,
        confirmLabel: action.payload.confirmLabel ?? 'Confirm',
        cancelLabel: action.payload.cancelLabel ?? 'Cancel',
        destructive: action.payload.destructive ?? false,
      }
    },
    closeConfirmDialog(state) {
      state.confirmDialog = uiInitialState.confirmDialog
    },
  },
})

export const { openConfirmDialog, closeConfirmDialog } = uiSlice.actions
