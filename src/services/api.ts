import axios from 'axios'
import type { CreateBotApiPayload } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

let isLoggingIn = false
let loginPromise: Promise<string | null> | null = null

export async function getValidAuthToken(): Promise<string | null> {
  const existingToken = localStorage.getItem('chat_agent_auth_token')
  if (existingToken) {
    return existingToken
  }

  if (isLoggingIn && loginPromise) {
    return loginPromise
  }

  isLoggingIn = true
  loginPromise = (async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@example.com',
        password: 'Admin@123!',
      })
      const token = response.data?.access_token
      if (token) {
        localStorage.setItem('chat_agent_auth_token', token)
        if (response.data?.refresh_token) {
          localStorage.setItem('chat_agent_refresh_token', response.data.refresh_token)
        }
        return token
      }
      return null
    } catch (err) {
      console.error('Failed to authenticate with Chat Agent API:', err)
      return null
    } finally {
      isLoggingIn = false
      loginPromise = null
    }
  })()

  return loginPromise
}

// Request interceptor: attach bearer token
apiClient.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('chat_agent_auth_token')
  if (!token) {
    token = await getValidAuthToken()
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      localStorage.removeItem('chat_agent_auth_token')
      const newToken = await getValidAuthToken()
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await axios.post<{
      access_token: string
      refresh_token: string
      token_type: string
    }>(`${API_BASE_URL}/auth/login`, credentials)
    return response.data
  },
}

export interface BackendBotResponse {
  id: string
  user_id?: string
  name: string
  slug?: string
  description?: string
  status?: string
  visibility: 'private' | 'organization' | 'public'
  avatar_url?: string | null
  metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
  versions?: Array<{
    id: string
    bot_id: string
    version: number
    system_instruction: string
    welcome_message?: string
    conversation_starters?: string[]
    config?: Record<string, unknown>
    created_at?: string
  }>
  knowledge_base_id?: string
  knowledge_base_name?: string
  documents?: Array<{
    id: string
    original_name: string
    file_size: number
    status: string
    chunk_count?: number
    error_message?: string | null
    created_at?: string
  }>
  summary?: {
    total_files: number
    processed_files: number
    failed_files: number
    total_chunks: number
  }
}

export const botsApi = {
  createBotWithDocuments: async (payload: CreateBotApiPayload): Promise<BackendBotResponse> => {
    const formData = new FormData()
    formData.append('name', payload.name.trim())

    if (payload.description) {
      formData.append('description', payload.description.trim())
    }

    formData.append('system_instruction', payload.system_instruction.trim())

    if (payload.welcome_message) {
      formData.append('welcome_message', payload.welcome_message.trim())
    }

    if (payload.conversation_starters && payload.conversation_starters.length > 0) {
      formData.append('conversation_starters', JSON.stringify(payload.conversation_starters))
    } else {
      formData.append('conversation_starters', '')
    }

    formData.append('visibility', payload.visibility || 'private')

    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append('files', file)
      })
    }

    const response = await apiClient.post<BackendBotResponse>('/bots/with-documents', formData, {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  },

  getBots: async (): Promise<BackendBotResponse[]> => {
    const response = await apiClient.get<{ items: BackendBotResponse[] }>('/bots')
    return response.data?.items || []
  },

  getBotById: async (id: string): Promise<BackendBotResponse> => {
    const response = await apiClient.get<BackendBotResponse>(`/bots/${id}`)
    return response.data
  },
}

export interface BackendMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface BackendConversationItem {
  id: string
  user_id: string
  bot_id: string
  title: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  messages?: BackendMessage[]
}

export interface ConversationsListResponse {
  total: number
  items: BackendConversationItem[]
  page: number
  page_size: number
}

export const conversationsApi = {
  list: async (botId: string, page = 1, pageSize = 20): Promise<ConversationsListResponse> => {
    const response = await apiClient.get<ConversationsListResponse>('/conversations', {
      params: {
        bot_id: botId,
        page,
        page_size: pageSize,
      },
    })
    return response.data
  },

  create: async (data: {
    bot_id: string
    title: string
    metadata?: Record<string, unknown>
  }): Promise<BackendConversationItem> => {
    const response = await apiClient.post<BackendConversationItem>('/conversations', {
      bot_id: data.bot_id,
      title: data.title,
      metadata: data.metadata || {
        channel: 'web_chat',
        user_locale: 'en-US',
      },
    })
    return response.data
  },

  get: async (conversationId: string): Promise<BackendConversationItem> => {
    const response = await apiClient.get<BackendConversationItem>(`/conversations/${conversationId}`)
    return response.data
  },
}

export interface ChatApiResult {
  conversation_id: string
  message_id: string
  content: string
  model?: string
  latency_ms?: number
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
    [key: string]: unknown
  }
  sources?: Array<{
    document_id: string
    knowledge_base_id?: string
    file_name: string
    page?: number
    score?: number
  }>
}

export const chatApi = {
  send: async (data: {
    bot_id: string
    conversation_id: string
    message: string
  }): Promise<ChatApiResult> => {
    const response = await apiClient.post<ChatApiResult>('/chat', data)
    return response.data
  },
}

