import React from 'react'
import { Menu, MessageSquare, Plus, ArrowLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  toggleMobileSidebar,
  openCreateBotModal,
} from '@/features/ui/uiSlice'
import { createConversationThunk } from '@/features/chat/chatSlice'
import { setSelectedBot } from '@/features/bots/botsSlice'
import { Button } from '@/components/ui/button'

export const AppNavbar: React.FC = () => {
  const dispatch = useAppDispatch()
  const { actualBots, selectedBotId } = useAppSelector((state) => state.bots)

  const activeBot = actualBots.find((b) => b.id === selectedBotId)

  const handleNewChat = () => {
    if (activeBot) {
      dispatch(
        createConversationThunk({
          botId: activeBot.id,
          title: `Chat with ${activeBot.name}`,
        })
      )
    } else {
      dispatch(openCreateBotModal())
    }
  }

  const handleBackToHub = () => {
    dispatch(setSelectedBot(null))
  }

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
          <span
            onClick={handleBackToHub}
            className="font-semibold text-xs sm:text-sm text-zinc-900 tracking-tight hover:text-black cursor-pointer transition-colors"
          >
            TataTel AI
          </span>
          <span className="text-zinc-300">/</span>
          <span className="text-xs sm:text-sm font-medium text-zinc-600 truncate max-w-[200px]">
            {selectedBotId && activeBot ? activeBot.name : 'Agent Hub'}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {selectedBotId ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToHub}
              className="gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">All Agents</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              className="gap-1.5 text-xs font-semibold"
            >
              <MessageSquare className="h-3.5 w-3.5 text-zinc-700" />
              <span>New Chat</span>
            </Button>
          </>
        ) : null}

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

