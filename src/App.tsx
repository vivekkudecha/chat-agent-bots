import { useMemo, useEffect } from 'react'
import { Sidebar } from '@/features/sidebar/components/Sidebar'
import { AppNavbar } from '@/components/common/AppNavbar'
import { ChatHeader } from '@/features/chat/components/ChatHeader'
import { ChatMessages } from '@/features/chat/components/ChatMessages'
import { ChatInput } from '@/features/chat/components/ChatInput'
import { OrgBotBar } from '@/features/chat/components/OrgBotBar'
import { BotSelectionHub } from '@/features/bots/components/BotSelectionHub'
import { CreateBotModal } from '@/features/bots/components/CreateBotModal'
import { LoginScreen } from '@/features/auth/components/LoginScreen'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchBotConversations } from '@/features/chat/chatSlice'
import { fetchRemoteBots, setSelectedBot } from '@/features/bots/botsSlice'
import type { Bot } from '@/types'

export function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchRemoteBots())
    }
  }, [dispatch, isAuthenticated])

  const { conversations, activeConversationId, isTyping } = useAppSelector(
    (state) => state.chat
  )
  const { actualBots, selectedBotId, isLoadingBots } = useAppSelector((state) => state.bots)

  const activeBot = useMemo(() => {
    if (!selectedBotId) return undefined
    return actualBots.find((b) => b.id === selectedBotId)
  }, [actualBots, selectedBotId])

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  )

  const hasMessages = Boolean(activeConversation && activeConversation.messages.length > 0)

  const handleSelectBot = (bot: Bot) => {
    dispatch(setSelectedBot(bot.id))
    dispatch(
      fetchBotConversations({
        botId: bot.id,
        botName: bot.name,
        page: 1,
      })
    )
  }

  const handleBackToHub = () => {
    dispatch(setSelectedBot(null))
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50/60 font-sans antialiased text-zinc-900">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AppNavbar />

        <main className="flex-1 flex flex-col overflow-hidden relative bg-zinc-50/40">
          {!selectedBotId ? (
            /* Home Screen by default: ONLY Bot Selection, chat is NOT allowed until bot is selected */
            <BotSelectionHub
              bots={actualBots}
              isLoading={isLoadingBots}
              onSelectBot={handleSelectBot}
            />
          ) : (
            /* Bot Selected: Show full active conversation & chat workspace */
            <>
              {/* Active Bot Identity & Quick Controls */}
              <ChatHeader
                bot={activeBot}
                conversation={activeConversation}
                onBackToHub={handleBackToHub}
              />

              {/* Conversation messages stream or welcome state */}
              <ChatMessages
                conversation={activeConversation}
                bot={activeBot}
                isTyping={isTyping}
              />

              {/* Bot Switcher Bar: Placed directly above the chat box */}
              <OrgBotBar
                bots={actualBots}
                activeBotId={activeBot?.id}
                onSelectBot={handleSelectBot}
                isCompact={hasMessages}
                isLoading={isLoadingBots}
              />

              {/* Chat Input Box */}
              <ChatInput
                conversation={activeConversation}
                bot={activeBot}
                disabled={isTyping}
              />
            </>
          )}
        </main>
      </div>

      {/* Create Custom AI Bot Modal */}
      <CreateBotModal />
    </div>
  )
}

export default App
