import { configureStore } from '@reduxjs/toolkit'
import botsReducer from '@/features/bots/botsSlice'
import chatReducer from '@/features/chat/chatSlice'
import uiReducer from '@/features/ui/uiSlice'

export const store = configureStore({
  reducer: {
    bots: botsReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
