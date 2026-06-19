import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ThemePreference = 'light' | 'system'

export type ThemeState = {
  preference: ThemePreference
}

export const themeInitialState: ThemeState = {
  preference: 'light',
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState: themeInitialState,
  reducers: {
    setThemePreference(state, action: PayloadAction<ThemePreference>) {
      state.preference = action.payload
    },
  },
})

export const { setThemePreference } = themeSlice.actions
