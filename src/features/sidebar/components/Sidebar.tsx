import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Pin,
  Trash2,
  X,
  Compass,
  Cpu,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  setActiveConversation,
  deleteConversation,
  togglePinConversation,
} from '@/features/chat/chatSlice'
import {
  setActiveTab,
  openCreateBotModal,
  setMobileSidebarOpen,
} from '@/features/ui/uiSlice'
import { ThemeSelector } from '@/components/common/ThemeSelector'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch()
  const { conversations, activeConversationId } = useAppSelector((state) => state.chat)
  const { organizationBots, customBots } = useAppSelector((state) => state.bots)
  const { activeTab, isMobileSidebarOpen } = useAppSelector((state) => state.ui)

  const [searchQuery, setSearchQuery] = useState('')

  const allBots = useMemo(
    () => [...organizationBots, ...customBots],
    [organizationBots, customBots]
  )

  const getBotForConv = (botId: string) => {
    return allBots.find((b) => b.id === botId)
  }

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [conversations, searchQuery])

  const pinnedConversations = useMemo(
    () => filteredConversations.filter((c) => c.isPinned),
    [filteredConversations]
  )

  const unpinnedConversations = useMemo(
    () => filteredConversations.filter((c) => !c.isPinned),
    [filteredConversations]
  )

  const handleSelectConv = (id: string) => {
    dispatch(setActiveConversation(id))
    dispatch(setActiveTab('chat'))
    dispatch(setMobileSidebarOpen(false))
  }

  const handleDeleteConv = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Delete this conversation history?')) {
      dispatch(deleteConversation(id))
    }
  }

  const handleTogglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    dispatch(togglePinConversation(id))
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => dispatch(setMobileSidebarOpen(false))}
        />
      ) : null}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex w-72 flex-col bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* App Branding Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => dispatch(setActiveTab('home'))}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                TataTel <span className="text-blue-600">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Enterprise Agent Hub</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(setMobileSidebarOpen(false))}
            className="p-1.5 text-slate-400 hover:text-slate-700 md:hidden rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="p-3.5 space-y-2 border-b border-slate-100 dark:border-slate-800/80">
          {/* Explore Organization Bots Tab Trigger */}
          <Button
            variant={activeTab === 'home' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              dispatch(setActiveTab('home'))
              dispatch(setMobileSidebarOpen(false))
            }}
            className="w-full justify-start gap-2 shadow-none font-medium"
          >
            <Compass className="h-4 w-4" />
            <span>Explore AI Agents</span>
          </Button>

          {/* Create Custom Bot Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch(openCreateBotModal())}
            className="w-full justify-start gap-2 font-medium"
          >
            <Plus className="h-4 w-4 text-blue-600" />
            <span>Create Custom Bot</span>
          </Button>
        </div>

        {/* Search Conversations */}
        <div className="px-3.5 py-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Conversation History Feed */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
          {/* Pinned Section */}
          {pinnedConversations.length > 0 ? (
            <div>
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Pin className="h-2.5 w-2.5" />
                <span>Pinned Conversations</span>
              </p>
              <div className="space-y-0.5">
                {pinnedConversations.map((conv) => {
                  const bot = getBotForConv(conv.botId)
                  const isActive = activeConversationId === conv.id && activeTab === 'chat'
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConv(conv.id)}
                      className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-800 font-semibold dark:bg-blue-950/60 dark:text-blue-300'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Avatar fallback={bot?.avatar || 'AI'} size="sm" className="h-6 w-6 text-[10px]" />
                        <span className="truncate">{conv.title}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleTogglePin(e, conv.id)}
                          className="p-1 hover:text-blue-600 rounded"
                          title="Unpin"
                        >
                          <Pin className="h-3 w-3 fill-current text-blue-600" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteConv(e, conv.id)}
                          className="p-1 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          {/* Recent History Section */}
          <div>
            <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Previous Conversations
            </p>
            {unpinnedConversations.length > 0 ? (
              <div className="space-y-0.5">
                {unpinnedConversations.map((conv) => {
                  const bot = getBotForConv(conv.botId)
                  const isActive = activeConversationId === conv.id && activeTab === 'chat'
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConv(conv.id)}
                      className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-800 font-semibold dark:bg-blue-950/60 dark:text-blue-300'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Avatar fallback={bot?.avatar || 'AI'} size="sm" className="h-6 w-6 text-[10px]" />
                        <span className="truncate">{conv.title}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleTogglePin(e, conv.id)}
                          className="p-1 hover:text-blue-600 rounded text-slate-400"
                          title="Pin conversation"
                        >
                          <Pin className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteConv(e, conv.id)}
                          className="p-1 hover:text-red-600 rounded text-slate-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-2 py-4 text-center text-xs text-slate-400">
                {searchQuery ? 'No matching history' : 'No previous conversations'}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
              TT
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                Enterprise User
              </p>
              <p className="text-[10px] text-slate-400">TataTel Organization</p>
            </div>
          </div>

          {/* Theme Palette Switcher */}
          <ThemeSelector />
        </div>
      </aside>
    </>
  )
}
