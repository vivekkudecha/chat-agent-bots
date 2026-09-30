import React from 'react'
import { Menu, MessageSquare, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  toggleMobileSidebar,
  openCreateBotModal,
} from '@/features/ui/uiSlice'
import { startNewChatWithBot } from '@/features/chat/chatSlice'
import { Button } from '@/components/ui/button'

export const AppNavbar: React.FC = () => {
  const dispatch = useAppDispatch()
  const { activeConversationId, conversations } = useAppSelector((state) => state.chat)
  const { organizationBots, customBots } = useAppSelector((state) => state.bots)

  const activeConv = conversations.find((c) => c.id === activeConversationId)
  const allBots = [...organizationBots, ...customBots]
  const activeBot = activeConv ? allBots.find((b) => b.id === activeConv.botId) : null

  return (
    <header className="h-14 border-b border-zinc-200 bg-white/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
      {/* Left: Mobile Sidebar Toggle + Breadcrumb / Active Screen title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => dispatch(toggleMobileSidebar())}
          className="p-2 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 md:hidden transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs sm:text-sm text-zinc-900 tracking-tight">
            TataTel AI
          </span>
          <span className="text-zinc-300">/</span>
          <span className="text-xs sm:text-sm font-medium text-zinc-600 truncate max-w-[200px]">
            {activeBot?.name || 'Chat Session'}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            dispatch(
              startNewChatWithBot({
                botId: organizationBots[0]?.id || 'bot-org-1',
                botName: organizationBots[0]?.name || 'Customer Success Copilot',
              })
            )
          }}
          className="gap-1.5 text-xs font-semibold"
        >
          <MessageSquare className="h-3.5 w-3.5 text-zinc-700" />
          <span>New Chat</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => dispatch(openCreateBotModal())}
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Custom Bot</span>
        </Button>
      </div>
    </header>
  )
}
