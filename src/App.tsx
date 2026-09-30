import { useMemo } from 'react'
import { Sidebar } from '@/features/sidebar/components/Sidebar'
import { AppNavbar } from '@/components/common/AppNavbar'
import { ChatHeader } from '@/features/chat/components/ChatHeader'
import { ChatMessages } from '@/features/chat/components/ChatMessages'
import { ChatInput } from '@/features/chat/components/ChatInput'
import { OrgBotBar } from '@/features/chat/components/OrgBotBar'
import { CreateBotModal } from '@/features/bots/components/CreateBotModal'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { startNewChatWithBot, switchBotForConversation } from '@/features/chat/chatSlice'
import type { Bot } from '@/types'

export function App() {
  const dispatch = useAppDispatch()
  const { conversations, activeConversationId, isTyping } = useAppSelector(
    (state) => state.chat
  )
  const { organizationBots, customBots } = useAppSelector((state) => state.bots)

  const allBots = useMemo(
    () => [...organizationBots, ...customBots],
    [organizationBots, customBots]
  )

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  )

  const activeBot = useMemo(() => {
    if (!activeConversation) return organizationBots[0]
    return allBots.find((b) => b.id === activeConversation.botId) || organizationBots[0]
  }, [activeConversation, allBots, organizationBots])

  const hasMessages = Boolean(activeConversation && activeConversation.messages.length > 0)

  const handleSelectBot = (bot: Bot) => {
    if (activeConversation && activeConversation.messages.length === 0) {
      dispatch(
        switchBotForConversation({
          conversationId: activeConversation.id,
          botId: bot.id,
          botName: bot.name,
        })
      )
    } else {
      dispatch(
        startNewChatWithBot({
          botId: bot.id,
          botName: bot.name,
        })
      )
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50/60 font-sans antialiased text-zinc-900">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area: Merged Home & Chat in ChatGPT style */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AppNavbar />

        <main className="flex-1 flex flex-col overflow-hidden relative bg-zinc-50/40">
          {/* Active Bot Identity & Quick Controls */}
          <ChatHeader bot={activeBot} conversation={activeConversation} />

          {/* Conversation messages stream or ChatGPT welcome state */}
          <ChatMessages
            conversation={activeConversation}
            bot={activeBot}
            isTyping={isTyping}
          />

          {/* Organization Chat-Bot Options: Placed directly above the chat box */}
          <OrgBotBar
            bots={organizationBots}
            activeBotId={activeBot?.id}
            onSelectBot={handleSelectBot}
            isCompact={hasMessages}
          />

          {/* Chat Input Box */}
          <ChatInput
            conversation={activeConversation}
            bot={activeBot}
            disabled={isTyping}
          />
        </main>
      </div>

      {/* Create Custom AI Bot Modal */}
      <CreateBotModal />
    </div>
  )
}

export default App
