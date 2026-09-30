import React from 'react'
import { Menu, Compass, MessageSquare, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  toggleMobileSidebar,
  setActiveTab,
  openCreateBotModal,
} from '@/features/ui/uiSlice'
import { Button } from '@/components/ui/button'

export const AppNavbar: React.FC = () => {
  const dispatch = useAppDispatch()
  const { activeTab } = useAppSelector((state) => state.ui)
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
          {activeTab === 'home' ? (
            <span className="font-semibold text-xs sm:text-sm text-zinc-900 tracking-tight">
              Organization AI Agents
            </span>
          ) : (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => dispatch(setActiveTab('home'))}
                className="text-zinc-500 hover:text-zinc-900 font-medium cursor-pointer"
              >
                Bots
              </button>
              <span className="text-zinc-300">/</span>
              <span className="font-semibold text-zinc-900 tracking-tight">
                {activeBot?.name || 'Active Chat'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Tab Navigation Switchers and Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center p-1 rounded-lg bg-zinc-100 border border-zinc-200">
          <button
            type="button"
            onClick={() => dispatch(setActiveTab('home'))}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Explore Bots</span>
          </button>
          <button
            type="button"
            onClick={() => dispatch(setActiveTab('chat'))}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat Session</span>
          </button>
        </div>

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
