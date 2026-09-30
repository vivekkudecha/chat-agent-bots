import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Conversation, AttachedFile } from '@/types'

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  isTyping: boolean
}

const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    botId: 'bot-org-2',
    title: 'Customer Portal Auth Architecture Review',
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30m ago
    isPinned: true,
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        text: 'Review our proposed OAuth 2.1 PKCE authorization flow for the customer-facing portal.',
        timestamp: '10:15 AM',
      },
      {
        id: 'msg-2',
        sender: 'assistant',
        text: 'Here is an architectural review of your OAuth 2.1 PKCE proposal:\n\n1. **Security Posture**: PKCE is strongly recommended for Single Page Apps (SPAs) as it mitigates authorization code injection attacks.\n2. **Token Storage**: Ensure access tokens are kept in memory or secure HTTP-only cookies, not in `localStorage` where XSS attacks can extract them.\n3. **Token Refresh Strategy**: Use rotating refresh tokens with detection of token replay to instantly invalidate compromised session trees.',
        timestamp: '10:16 AM',
      },
    ],
  },
  {
    id: 'conv-2',
    botId: 'bot-custom-1',
    title: 'TataTel VPN Setup & Hardware Upgrade FAQ',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    isPinned: false,
    messages: [
      {
        id: 'msg-3',
        sender: 'user',
        text: 'How do I configure WireGuard VPN for remote staging environment access?',
        timestamp: '08:42 AM',
      },
      {
        id: 'msg-4',
        sender: 'assistant',
        text: 'Based on the uploaded **tatatel_employee_handbook.pdf**:\n\n1. Download the official WireGuard client from the TataTel IT portal.\n2. Request your client config file from the IT Slack channel `#it-helpdesk`.\n3. Import the `.conf` file and connect using your TataTel SSO credentials.\n4. Ensure split-tunneling is active so your standard web browsing is not routed through staging.',
        timestamp: '08:43 AM',
      },
    ],
  },
  {
    id: 'conv-3',
    botId: 'bot-org-1',
    title: 'Q3 Enterprise SLA Outage Mitigation Brief',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // Yesterday
    isPinned: false,
    messages: [
      {
        id: 'msg-5',
        sender: 'user',
        text: 'Draft an executive resolution email for the 14-minute DNS blip on Monday.',
        timestamp: 'Yesterday',
      },
      {
        id: 'msg-6',
        sender: 'assistant',
        text: 'Subject: Executive Briefing & Post-Incident Resolution - September 28 DNS Latency\n\nDear Leadership Team,\n\nWe have concluded our root cause investigation into the 14-minute DNS resolution delay on Monday morning. Secondary anycast DNS fallback has been established across 3 regions to guarantee zero single point of failure going forward. Full RCA details and SLA credit options are attached.',
        timestamp: 'Yesterday',
      },
    ],
  },
]

const initialState: ChatState = {
  conversations: initialConversations,
  activeConversationId: 'conv-1',
  isTyping: false,
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload
    },
    startNewChatWithBot: (
      state,
      action: PayloadAction<{ botId: string; botName: string; initialMessage?: string }>
    ) => {
      const newId = `conv-${Date.now()}`
      const newConversation: Conversation = {
        id: newId,
        botId: action.payload.botId,
        title: action.payload.initialMessage
          ? action.payload.initialMessage.slice(0, 38) + (action.payload.initialMessage.length > 38 ? '...' : '')
          : `Chat with ${action.payload.botName}`,
        updatedAt: new Date().toISOString(),
        isPinned: false,
        messages: action.payload.initialMessage
          ? [
              {
                id: `msg-${Date.now()}`,
                sender: 'user',
                text: action.payload.initialMessage,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]
          : [],
      }
      state.conversations.unshift(newConversation)
      state.activeConversationId = newId
      if (action.payload.initialMessage) {
        state.isTyping = true
      }
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
        // update title if it's the first message
        if (conv.messages.length === 1) {
          conv.title = action.payload.text.slice(0, 38) + (action.payload.text.length > 38 ? '...' : '')
        }
        state.isTyping = true
      }
    },
    addAssistantMessage: (
      state,
      action: PayloadAction<{ conversationId: string; text: string }>
    ) => {
      const conv = state.conversations.find((c) => c.id === action.payload.conversationId)
      if (conv) {
        conv.messages.push({
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: action.payload.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
        conv.updatedAt = new Date().toISOString()
      }
      state.isTyping = false
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload
    },
    deleteConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter((c) => c.id !== action.payload)
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = state.conversations.length > 0 ? state.conversations[0].id : null
      }
    },
    togglePinConversation: (state, action: PayloadAction<string>) => {
      const conv = state.conversations.find((c) => c.id === action.payload)
      if (conv) {
        conv.isPinned = !conv.isPinned
      }
    },
  },
})

export const {
  setActiveConversation,
  startNewChatWithBot,
  addUserMessage,
  addAssistantMessage,
  setIsTyping,
  deleteConversation,
  togglePinConversation,
} = chatSlice.actions

export default chatSlice.reducer
