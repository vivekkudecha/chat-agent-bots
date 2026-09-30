import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ThemePreset } from '@/types'

interface UIState {
  activeTab: 'home' | 'chat'
  isCreateBotModalOpen: boolean
  isMobileSidebarOpen: boolean
  themePreset: ThemePreset
  isDarkMode: boolean
}

const initialState: UIState = {
  activeTab: 'home',
  isCreateBotModalOpen: false,
  isMobileSidebarOpen: false,
  themePreset: 'minimal',
  isDarkMode: false,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'home' | 'chat'>) => {
      state.activeTab = action.payload
    },
    openCreateBotModal: (state) => {
      state.isCreateBotModalOpen = true
    },
    closeCreateBotModal: (state) => {
      state.isCreateBotModalOpen = false
    },
    toggleMobileSidebar: (state) => {
      state.isMobileSidebarOpen = !state.isMobileSidebarOpen
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileSidebarOpen = action.payload
    },
    setThemePreset: (state, action: PayloadAction<ThemePreset>) => {
      state.themePreset = action.payload
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark')
        if (action.payload === 'minimal' || action.payload === 'royal') {
          document.documentElement.removeAttribute('data-theme')
        } else {
          document.documentElement.setAttribute('data-theme', action.payload)
        }
      }
    },
    toggleDarkMode: (state) => {
      // Light mode only requirement - enforce false
      state.isDarkMode = false
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark')
      }
    },
  },
})

export const {
  setActiveTab,
  openCreateBotModal,
  closeCreateBotModal,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  setThemePreset,
  toggleDarkMode,
} = uiSlice.actions

export default uiSlice.reducer
