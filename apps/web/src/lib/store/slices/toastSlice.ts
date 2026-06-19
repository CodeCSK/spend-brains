import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export type Toast = {
  id: string
  variant: ToastVariant
  message: string
}

export type ToastState = {
  items: Toast[]
}

export const toastInitialState: ToastState = {
  items: [],
}

type AddToastPayload = {
  variant: ToastVariant
  message: string
  id?: string
}

export const toastSlice = createSlice({
  name: 'toast',
  initialState: toastInitialState,
  reducers: {
    addToast(state, action: PayloadAction<AddToastPayload>) {
      state.items.push({
        id: action.payload.id ?? crypto.randomUUID(),
        variant: action.payload.variant,
        message: action.payload.message,
      })
    },
    removeToast(state, action: PayloadAction<string>) {
      state.items = state.items.filter((toast) => toast.id !== action.payload)
    },
  },
})

export const { addToast, removeToast } = toastSlice.actions
