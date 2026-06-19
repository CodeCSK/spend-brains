import { configureStore } from '@reduxjs/toolkit'

import { themeSlice } from './slices/themeSlice'
import { toastSlice } from './slices/toastSlice'
import { uiSlice } from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    toast: toastSlice.reducer,
    theme: themeSlice.reducer,
  },
})

export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export { setThemePreference } from './slices/themeSlice'
export { addToast, removeToast, type Toast, type ToastVariant } from './slices/toastSlice'
export {
  closeConfirmDialog,
  openConfirmDialog,
  type ConfirmDialogState,
  type OpenConfirmDialogPayload,
  type UiState,
} from './slices/uiSlice'
export { useConfirm } from './useConfirm'
export { useToast } from './useToast'
