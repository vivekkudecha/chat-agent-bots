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
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
      {/* Left: Mobile Sidebar Toggle + Breadcrumb / Active Screen title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => dispatch(toggleMobileSidebar())}
          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          {activeTab === 'home' ? (
            <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
              Organization AI Agents
            </span>
          ) : (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => dispatch(setActiveTab('home'))}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                Bots
              </button>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {activeBot?.name || 'Active Chat'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Tab Navigation Switchers and Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => dispatch(setActiveTab('home'))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Explore Bots</span>
          </button>
          <button
            type="button"
            onClick={() => dispatch(setActiveTab('chat'))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
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
          className="gap-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Custom Bot</span>
        </Button>
      </div>
    </header>
  )
}
