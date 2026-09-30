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
  description: string
  systemInstruction: string
  avatar: string
  category: 'Enterprise' | 'Engineering' | 'Operations' | 'Finance & Legal' | 'Custom'
  badge?: string
  knowledgeFiles?: AttachedFile[]
  suggestedPrompts: string[]
  isCustom?: boolean
  createdAt?: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  files?: AttachedFile[]
}

export interface Conversation {
  id: string
  botId: string
  title: string
  messages: ChatMessage[]
  updatedAt: string
  isPinned?: boolean
}

export type ThemePreset = 'royal' | 'navy' | 'cobalt'
