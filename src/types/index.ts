export interface AttachedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

export interface Bot {
  id: string
  name: string
  slug?: string
  role: string
  department?: string
  description: string
  systemInstruction: string
  avatar: string
  category: 'Enterprise' | 'Engineering' | 'Operations' | 'Finance & Legal' | 'Custom'
  welcomeMessage?: string
  visibility?: 'private' | 'organization' | 'public'
  badge?: string
  knowledgeFiles?: AttachedFile[]
  suggestedPrompts: string[]
  isCustom?: boolean
  createdAt?: string
}

export interface CreateBotApiPayload {
  name: string
  description?: string
  system_instruction: string
  welcome_message?: string
  conversation_starters?: string[]
  visibility?: 'private' | 'organization' | 'public'
  files?: File[]
}

export interface ChatSource {
  documentId: string
  fileName: string
  page?: number
  score?: number
  knowledgeBaseId?: string
}

export interface TokenUsage {
  prompt_tokens?: number
  completion_tokens?: number
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  latency_ms?: number
  model?: string
  source_count?: number
  finish_reason?: string
  [key: string]: unknown
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  files?: AttachedFile[]
  sources?: ChatSource[]
  usage?: TokenUsage
}

export interface Conversation {
  id: string
  botId: string
  title: string
  messages: ChatMessage[]
  updatedAt: string
  isPinned?: boolean
}

export type ThemePreset = 'minimal' | 'royal' | 'navy' | 'cobalt'
