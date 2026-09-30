import { useMemo } from 'react'
import { Sidebar } from '@/features/sidebar/components/Sidebar'
import { AppNavbar } from '@/components/common/AppNavbar'
import { BotListGrid } from '@/features/bots/components/BotListGrid'
import { ChatHeader } from '@/features/chat/components/ChatHeader'
import { ChatMessages } from '@/features/chat/components/ChatMessages'
import { ChatInput } from '@/features/chat/components/ChatInput'
import { CreateBotModal } from '@/features/bots/components/CreateBotModal'
import { useAppSelector } from '@/app/hooks'

export function App() {
  const { activeTab } = useAppSelector((state) => state.ui)
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AppNavbar />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'home' ? (
            /* Screen 4: Main screen showing organization-defined AI bots */
            <BotListGrid />
          ) : (
            /* Screen 1: AI Chat Screen */
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-950">
              <ChatHeader bot={activeBot} conversation={activeConversation} />
              <ChatMessages
                conversation={activeConversation}
                bot={activeBot}
                isTyping={isTyping}
              />
              <ChatInput
                conversation={activeConversation}
                bot={activeBot}
                disabled={isTyping}
              />
            </div>
          )}
        </main>
      </div>

      {/* Screen 3: Create Custom AI Bot with instructions & file upload modal */}
      <CreateBotModal />
    </div>
  )
}

export default App
