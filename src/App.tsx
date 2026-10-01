import { useMemo, useEffect } from 'react'
import { Sidebar } from '@/features/sidebar/components/Sidebar'
import { AppNavbar } from '@/components/common/AppNavbar'
import { ChatHeader } from '@/features/chat/components/ChatHeader'
import { ChatMessages } from '@/features/chat/components/ChatMessages'
import { ChatInput } from '@/features/chat/components/ChatInput'
import { BotSelectionHub } from '@/features/bots/components/BotSelectionHub'
import { CreateBotModal } from '@/features/bots/components/CreateBotModal'
import { LoginScreen } from '@/features/auth/components/LoginScreen'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchBotConversations } from '@/features/chat/chatSlice'
import { fetchRemoteBots, setSelectedBot } from '@/features/bots/botsSlice'
import {
  getBotSlugFromUrl,
  getConversationIdFromUrl,
  getSavedConversationId,
  navigateToBot,
  updateActiveConversationUrl,
  navigateToHome,
} from '@/utils/routing'
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

  // 1. Sync bot & active conversation from URL or localStorage on page load and refresh
  useEffect(() => {
    if (actualBots.length > 0) {
      const slug = getBotSlugFromUrl()
      if (slug) {
        const targetBot = actualBots.find(
          (b) =>
            (b.slug && b.slug.toLowerCase() === slug.toLowerCase()) ||
            b.id.toLowerCase() === slug.toLowerCase() ||
            b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()
        )

        if (targetBot) {
          const targetConvId = getConversationIdFromUrl() || getSavedConversationId(targetBot.id)
          if (selectedBotId !== targetBot.id) {
            dispatch(setSelectedBot(targetBot.id))
            dispatch(
              fetchBotConversations({
                botId: targetBot.id,
                botName: targetBot.name,
                page: 1,
                targetConversationId: targetConvId || undefined,
              })
            )
          }
          navigateToBot(targetBot, targetConvId)
        }
      } else if (!slug && selectedBotId) {
        // If URL is root '/', ensure selection is cleared
        dispatch(setSelectedBot(null))
      }
    }
  }, [actualBots, dispatch, selectedBotId])

  // 2. Handle Browser Back & Forward navigation buttons
  useEffect(() => {
    const handlePopState = () => {
      const slug = getBotSlugFromUrl()
      if (!slug) {
        dispatch(setSelectedBot(null))
        navigateToHome()
      } else if (actualBots.length > 0) {
        const targetBot = actualBots.find(
          (b) =>
            (b.slug && b.slug.toLowerCase() === slug.toLowerCase()) ||
            b.id.toLowerCase() === slug.toLowerCase() ||
            b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()
        )
        if (targetBot) {
          const targetConvId = getConversationIdFromUrl() || getSavedConversationId(targetBot.id)
          dispatch(setSelectedBot(targetBot.id))
          dispatch(
            fetchBotConversations({
              botId: targetBot.id,
              botName: targetBot.name,
              page: 1,
              targetConversationId: targetConvId || undefined,
            })
          )
          document.title = `${targetBot.name} — TataTel AI`
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [actualBots, dispatch])

  const activeBot = useMemo(() => {
    if (!selectedBotId) return undefined
    return actualBots.find((b) => b.id === selectedBotId)
  }, [actualBots, selectedBotId])

  // 3. Keep URL query param (?c=...) and localStorage in sync with currently active conversation
  useEffect(() => {
    if (activeBot && activeConversationId) {
      updateActiveConversationUrl(activeBot, activeConversationId)
    }
  }, [activeBot, activeConversationId])

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  )

  const handleSelectBot = (bot: Bot) => {
    const targetConvId = getSavedConversationId(bot.id)
    navigateToBot(bot, targetConvId)
    dispatch(setSelectedBot(bot.id))
    dispatch(
      fetchBotConversations({
        botId: bot.id,
        botName: bot.name,
        page: 1,
        targetConversationId: targetConvId || undefined,
      })
    )
  }

  const handleBackToHub = () => {
    navigateToHome()
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
