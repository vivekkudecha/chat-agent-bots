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
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  files?: AttachedFile[]
  sources?: ChatSource[]
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
