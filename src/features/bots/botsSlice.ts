import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import type { Bot, AttachedFile, CreateBotApiPayload } from '@/types'
import { botsApi, type BackendBotResponse } from '@/services/api'

export const createBotWithDocuments = createAsyncThunk<
  Bot,
  CreateBotApiPayload,
  { rejectValue: string }
>('bots/createBotWithDocuments', async (payload, { rejectWithValue }) => {
  try {
    const res = await botsApi.createBotWithDocuments(payload)
    const version = res.versions?.[0]
    const knowledgeFiles: AttachedFile[] =
      res.documents && res.documents.length > 0
        ? res.documents.map((doc) => ({
            id: doc.id,
            name: doc.original_name,
            size: doc.file_size,
            type: 'application/octet-stream',
          }))
        : payload.files?.map((f) => ({
            id: `f-${Date.now()}-${f.name}`,
            name: f.name,
            size: f.size,
            type: f.type,
          })) || []

    const newBot: Bot = {
      id: res.id,
      name: res.name,
      role: res.description
        ? res.description.length > 40
          ? res.description.slice(0, 37) + '...'
          : res.description
        : 'Custom AI Bot',
      department: 'Custom',
      description: res.description || payload.description || 'Custom AI Bot',
      systemInstruction: version?.system_instruction || payload.system_instruction,
      welcomeMessage: version?.welcome_message || payload.welcome_message,
      visibility: res.visibility || payload.visibility || 'private',
      avatar: 'Bot',
      category: 'Custom',
      badge: res.visibility === 'private' ? 'Private Bot' : 'Custom Bot',
      knowledgeFiles,
      suggestedPrompts:
        version?.conversation_starters && version.conversation_starters.length > 0
          ? version.conversation_starters
          : payload.conversation_starters && payload.conversation_starters.length > 0
          ? payload.conversation_starters
          : [
              `Summarize what knowledge you have in your files`,
              `Help me with a task based on your instructions`,
            ],
      isCustom: true,
      createdAt: res.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    }

    return newBot
  } catch (err: unknown) {
    let msg = 'Failed to create bot'
    if (axios.isAxiosError(err)) {
      msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message ||
        msg
    } else if (err instanceof Error) {
      msg = err.message
    }
    return rejectWithValue(msg)
  }
})

export function mapBackendBotToBot(remote: BackendBotResponse): Bot {
  const version = remote.versions?.[0]
  const department =
    (remote.metadata && typeof remote.metadata === 'object' && 'department' in remote.metadata
      ? String(remote.metadata.department)
      : null) || 'Custom AI'

  return {
    id: remote.id,
    name: remote.name,
    role: remote.description
      ? remote.description.length > 50
        ? remote.description.slice(0, 47) + '...'
        : remote.description
      : 'AI Assistant',
    department,
    description: remote.description || 'Custom AI Bot',
    systemInstruction:
      version?.system_instruction || 'You are an intelligent enterprise AI assistant.',
    welcomeMessage:
      version?.welcome_message || `Hello! I am ${remote.name}. How can I assist you today?`,
    visibility: remote.visibility || 'private',
    avatar: remote.avatar_url || 'Bot',
    category: 'Custom',
    badge:
      remote.visibility === 'private'
        ? 'Private'
        : remote.visibility === 'public'
        ? 'Public'
        : 'Organization',
    knowledgeFiles:
      remote.documents?.map((d) => ({
        id: d.id,
        name: d.original_name,
        size: d.file_size,
        type: 'application/octet-stream',
      })) || [],
    suggestedPrompts:
      version?.conversation_starters && version.conversation_starters.length > 0
        ? version.conversation_starters
        : [
            `What can you help me with?`,
            `Summarize your knowledge sources`,
          ],
    isCustom: true,
    createdAt: remote.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
  }
}

export const fetchRemoteBots = createAsyncThunk<Bot[]>('bots/fetchRemoteBots', async () => {
  try {
    const items = await botsApi.getBots()
    return items.map(mapBackendBotToBot)
  } catch (err) {
    console.warn('Failed to load remote bots:', err)
    return []
  }
})

interface BotsState {
  actualBots: Bot[]
  organizationBots: Bot[]
  customBots: Bot[]
  selectedBotId: string | null
  activeCategory: string
  searchQuery: string
  isLoadingBots: boolean
  isCreating: boolean
  createError: string | null
  fetchError: string | null
}

const initialState: BotsState = {
  actualBots: [],
  organizationBots: [],
  customBots: [],
  selectedBotId: null,
  activeCategory: 'All',
  searchQuery: '',
  isLoadingBots: false,
  isCreating: false,
  createError: null,
  fetchError: null,
}

export const botsSlice = createSlice({
  name: 'bots',
  initialState,
  reducers: {
    createCustomBot: (
      state,
      action: PayloadAction<{
        name: string
        role?: string
        description?: string
        systemInstruction: string
        welcomeMessage?: string
        visibility?: 'private' | 'organization' | 'public'
        avatar?: string
        files?: AttachedFile[]
        suggestedPrompts?: string[]
      }>
    ) => {
      const newBot: Bot = {
        id: `bot-custom-${Date.now()}`,
        name: action.payload.name,
        role: action.payload.role || 'Custom Specialist',
        description: action.payload.description || 'Custom tailored AI Assistant',
        systemInstruction: action.payload.systemInstruction,
        welcomeMessage: action.payload.welcomeMessage,
        visibility: action.payload.visibility || 'private',
        avatar: action.payload.avatar || 'Bot',
        category: 'Custom',
        badge: action.payload.visibility === 'private' ? 'Private Bot' : 'Custom Bot',
        knowledgeFiles: action.payload.files || [],
        suggestedPrompts: action.payload.suggestedPrompts || [
          `Summarize what knowledge you have in your files`,
          `Help me with a task based on your instructions`,
        ],
        isCustom: true,
        createdAt: new Date().toISOString().split('T')[0],
      }
      state.customBots.unshift(newBot)
      state.selectedBotId = newBot.id
    },
    deleteCustomBot: (state, action: PayloadAction<string>) => {
      state.customBots = state.customBots.filter((bot) => bot.id !== action.payload)
      if (state.selectedBotId === action.payload) {
        state.selectedBotId = null
      }
    },
    setSelectedBot: (state, action: PayloadAction<string | null>) => {
      state.selectedBotId = action.payload
    },
    setActiveCategory: (state, action: PayloadAction<string>) => {
      state.activeCategory = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    clearCreateError: (state) => {
      state.createError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBotWithDocuments.pending, (state) => {
        state.isCreating = true
        state.createError = null
      })
      .addCase(createBotWithDocuments.fulfilled, (state, action) => {
        state.isCreating = false
        state.createError = null

        // Add to actualBots
        const actualIdx = state.actualBots.findIndex((b) => b.id === action.payload.id)
        if (actualIdx >= 0) {
          state.actualBots[actualIdx] = action.payload
        } else {
          state.actualBots.unshift(action.payload)
        }

        // Add to customBots
        const customIdx = state.customBots.findIndex((b) => b.id === action.payload.id)
        if (customIdx >= 0) {
          state.customBots[customIdx] = action.payload
        } else {
          state.customBots.unshift(action.payload)
        }

        state.selectedBotId = action.payload.id
      })
      .addCase(createBotWithDocuments.rejected, (state, action) => {
        state.isCreating = false
        state.createError = action.payload || action.error.message || 'Failed to create bot'
      })
      .addCase(fetchRemoteBots.pending, (state) => {
        state.isLoadingBots = true
        state.fetchError = null
      })
      .addCase(fetchRemoteBots.fulfilled, (state, action: PayloadAction<Bot[]>) => {
        state.isLoadingBots = false
        state.actualBots = action.payload
        state.customBots = action.payload
        state.organizationBots = action.payload
        // Keep selectedBotId as null by default so user starts on Bot Selection Hub
      })
      .addCase(fetchRemoteBots.rejected, (state, action) => {
        state.isLoadingBots = false
        state.fetchError = action.error.message || 'Failed to load bots'
      })
  },
})

export const {
  createCustomBot,
  deleteCustomBot,
  setSelectedBot,
  setActiveCategory,
  setSearchQuery,
  clearCreateError,
} = botsSlice.actions

export default botsSlice.reducer
