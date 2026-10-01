import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { Conversation, ChatMessage, AttachedFile } from '@/types'
import { conversationsApi, chatApi } from '@/services/api'
import {
  getConversationIdFromUrl,
  getSavedConversationId,
  saveActiveConversationId,
  removeSavedConversationId,
} from '@/utils/routing'

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  totalConversations: number
  currentPage: number
  isLoadingConversations: boolean
  isLoadingMore: boolean
  isLoadingMessages: boolean
  isTyping: boolean
  error: string | null
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  totalConversations: 0,
  currentPage: 1,
  isLoadingConversations: false,
  isLoadingMore: false,
  isLoadingMessages: false,
  isTyping: false,
  error: null,
}

// 1. Fetch conversations for a specific bot (with pagination & lazy-loading, auto-creates on empty)
export const fetchBotConversations = createAsyncThunk<
  {
    items: Conversation[]
    total: number
    page: number
    append: boolean
    activeConversationId?: string
  },
  {
    botId: string
    botName?: string
    page?: number
    append?: boolean
    targetConversationId?: string
  }
>(
  'chat/fetchBotConversations',
  async ({ botId, botName, page = 1, append = false, targetConversationId }, { dispatch }) => {
    const res = await conversationsApi.list(botId, page, 20)

    // Determine target conversation ID from param, URL, or localStorage
    const desiredConvId =
      targetConversationId ||
      getConversationIdFromUrl() ||
      getSavedConversationId(botId) ||
      undefined

    // Requirement: if no conversation and nothing received, create first conversation object
    if (res.items.length === 0 && page === 1) {
      const created = await conversationsApi.create({
        bot_id: botId,
        title: botName ? `Chat with ${botName}` : 'Vivek Kudecha',
        metadata: {
          channel: 'web_chat',
          user_locale: 'en-US',
        },
      })

      const newConv: Conversation = {
        id: created.id,
        botId: created.bot_id,
        title: created.title || (botName ? `Chat with ${botName}` : 'New Conversation'),
        messages: [],
        updatedAt: created.updated_at || created.created_at,
      }

      saveActiveConversationId(botId, newConv.id)

      return {
        items: [newConv],
        total: 1,
        page: 1,
        append: false,
        activeConversationId: newConv.id,
      }
    }

    const items: Conversation[] = res.items.map((item) => ({
      id: item.id,
      botId: item.bot_id,
      title: item.title || (botName ? `Chat with ${botName}` : 'Conversation'),
      updatedAt: item.updated_at || item.created_at,
      messages: item.messages
        ? item.messages.map((m) => ({
            id: m.id,
            sender: m.role,
            text: m.content,
            timestamp: new Date(m.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }))
        : [],
    }))

    let activeId: string | undefined = undefined

    // Resolve active conversation without blindly forcing items[0]
    if (items.length > 0 && !append) {
      const matched = desiredConvId ? items.find((c) => c.id === desiredConvId) : null
      if (matched) {
        activeId = matched.id
        dispatch(fetchConversationDetails(matched.id))
      } else if (desiredConvId) {
        try {
          const detailed = await dispatch(fetchConversationDetails(desiredConvId)).unwrap()
          if (detailed) {
            activeId = detailed.id
            if (!items.some((c) => c.id === detailed.id)) {
              items.unshift(detailed)
            }
          }
        } catch {
          activeId = items[0].id
          dispatch(fetchConversationDetails(items[0].id))
        }
      } else {
        activeId = items[0].id
        dispatch(fetchConversationDetails(items[0].id))
      }

      if (activeId) {
        saveActiveConversationId(botId, activeId)
      }
    }

    return {
      items,
      total: res.total,
      page,
      append,
      activeConversationId: activeId,
    }
  }
)

// 2. Load the chats/messages for a single conversation: GET /api/v1/conversations/:conversation_id
export const fetchConversationDetails = createAsyncThunk<Conversation, string>(
  'chat/fetchConversationDetails',
  async (conversationId) => {
    const res = await conversationsApi.get(conversationId)
    return {
      id: res.id,
      botId: res.bot_id,
      title: res.title || 'Conversation',
      updatedAt: res.updated_at || res.created_at,
      messages: (res.messages || []).map((m) => ({
        id: m.id,
        sender: m.role,
        text: m.content,
        timestamp: new Date(m.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })),
    }
  }
)

// 3. Create a new conversation explicitly for a bot
export const createConversationThunk = createAsyncThunk<
  Conversation,
  { botId: string; title?: string }
>('chat/createConversationThunk', async ({ botId, title }) => {
  const created = await conversationsApi.create({
    bot_id: botId,
    title: title || 'New Conversation',
    metadata: {
      channel: 'web_chat',
      user_locale: 'en-US',
    },
  })
  return {
    id: created.id,
    botId: created.bot_id,
    title: created.title || 'New Conversation',
    messages: [],
    updatedAt: created.updated_at || created.created_at,
  }
})

// 4. Send chat message to backend: POST /api/v1/chat
export const sendChatMessageThunk = createAsyncThunk<
  { assistantMessage: ChatMessage; conversationId: string },
  { botId: string; conversationId: string; message: string }
>('chat/sendChatMessageThunk', async ({ botId, conversationId, message }) => {
  const res = await chatApi.send({
    bot_id: botId,
    conversation_id: conversationId,
    message,
  })

  const assistantMessage: ChatMessage = {
    id: res.message_id || `msg-${Date.now()}`,
    sender: 'assistant',
    text: res.content,
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    sources: res.sources?.map((s) => ({
      documentId: s.document_id,
      fileName: s.file_name,
      page: s.page,
      score: s.score,
    })),
    usage: res.usage
      ? {
          ...res.usage,
          latency_ms: res.latency_ms,
          model: res.model,
        }
      : res.latency_ms || res.model
      ? {
          latency_ms: res.latency_ms,
          model: res.model,
        }
      : undefined,
  }

  return { assistantMessage, conversationId }
})

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload
      if (action.payload) {
        const conv = state.conversations.find((c) => c.id === action.payload)
        if (conv) {
          saveActiveConversationId(conv.botId, conv.id)
        }
      }
    },
    clearConversations: (state) => {
      state.conversations = []
      state.activeConversationId = null
      state.totalConversations = 0
      state.currentPage = 1
    },
    addUserMessage: (
      state,
      action: PayloadAction<{ conversationId: string; text: string; files?: AttachedFile[] }>
    ) => {
      const conv = state.conversations.find((c) => c.id === action.payload.conversationId)
      if (conv) {
        conv.messages.push({
          id: `msg-${Date.now()}`,
          sender: 'user',
          text: action.payload.text,
          files: action.payload.files,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
        conv.updatedAt = new Date().toISOString()
        state.isTyping = true
      }
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload
    },
    deleteConversation: (state, action: PayloadAction<string>) => {
      const deletedConv = state.conversations.find((c) => c.id === action.payload)
      state.conversations = state.conversations.filter((c) => c.id !== action.payload)
      if (state.activeConversationId === action.payload) {
        const nextId = state.conversations.length > 0 ? state.conversations[0].id : null
        state.activeConversationId = nextId
        if (deletedConv) {
          if (nextId) {
            saveActiveConversationId(deletedConv.botId, nextId)
          } else {
            removeSavedConversationId(deletedConv.botId)
          }
        }
      }
    },
    togglePinConversation: (state, action: PayloadAction<string>) => {
      const conv = state.conversations.find((c) => c.id === action.payload)
      if (conv) {
        conv.isPinned = !conv.isPinned
      }
    },
  },
  extraReducers: (builder) => {
    // fetchBotConversations
    builder
      .addCase(fetchBotConversations.pending, (state, action) => {
        if (action.meta.arg.append) {
          state.isLoadingMore = true
        } else {
          state.isLoadingConversations = true
        }
        state.error = null
      })
      .addCase(fetchBotConversations.fulfilled, (state, action) => {
        state.isLoadingConversations = false
        state.isLoadingMore = false
        state.totalConversations = action.payload.total
        state.currentPage = action.payload.page

        if (action.payload.append) {
          // Avoid duplicate items
          const existingIds = new Set(state.conversations.map((c) => c.id))
          const newItems = action.payload.items.filter((item) => !existingIds.has(item.id))
          state.conversations.push(...newItems)
        } else {
          state.conversations = action.payload.items
          if (action.payload.activeConversationId) {
            state.activeConversationId = action.payload.activeConversationId
          } else if (action.payload.items.length > 0) {
            state.activeConversationId = action.payload.items[0].id
          } else {
            state.activeConversationId = null
          }
        }
      })
      .addCase(fetchBotConversations.rejected, (state, action) => {
        state.isLoadingConversations = false
        state.isLoadingMore = false
        state.error = action.error.message || 'Failed to fetch conversations'
      })

    // fetchConversationDetails
    builder
      .addCase(fetchConversationDetails.pending, (state) => {
        state.isLoadingMessages = true
      })
      .addCase(fetchConversationDetails.fulfilled, (state, action) => {
        state.isLoadingMessages = false
        const idx = state.conversations.findIndex((c) => c.id === action.payload.id)
        if (idx >= 0) {
          state.conversations[idx] = action.payload
        } else {
          state.conversations.unshift(action.payload)
        }
        state.activeConversationId = action.payload.id
        saveActiveConversationId(action.payload.botId, action.payload.id)
      })
      .addCase(fetchConversationDetails.rejected, (state) => {
        state.isLoadingMessages = false
      })

    // createConversationThunk
    builder.addCase(createConversationThunk.fulfilled, (state, action) => {
      state.conversations.unshift(action.payload)
      state.activeConversationId = action.payload.id
      state.totalConversations += 1
      saveActiveConversationId(action.payload.botId, action.payload.id)
    })

    // sendChatMessageThunk
    builder
      .addCase(sendChatMessageThunk.pending, (state) => {
        state.isTyping = true
      })
      .addCase(sendChatMessageThunk.fulfilled, (state, action) => {
        state.isTyping = false
        const conv = state.conversations.find((c) => c.id === action.payload.conversationId)
        if (conv) {
          conv.messages.push(action.payload.assistantMessage)
          conv.updatedAt = new Date().toISOString()
        }
      })
      .addCase(sendChatMessageThunk.rejected, (state, action) => {
        state.isTyping = false
        if (state.activeConversationId) {
          const conv = state.conversations.find((c) => c.id === state.activeConversationId)
          if (conv) {
            conv.messages.push({
              id: `err-${Date.now()}`,
              sender: 'assistant',
              text: `⚠️ Error: ${action.error.message || 'Failed to generate response. Please try again.'}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })
          }
        }
      })
  },
})

export const {
  setActiveConversation,
  clearConversations,
  addUserMessage,
  setIsTyping,
  deleteConversation,
  togglePinConversation,
} = chatSlice.actions

export default chatSlice.reducer
