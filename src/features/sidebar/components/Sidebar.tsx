import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Pin,
  Trash2,
  X,
  Compass,
  Cpu,
  LogOut,
  Loader2,
  LayoutGrid,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  setActiveConversation,
  deleteConversation,
  togglePinConversation,
  fetchBotConversations,
  fetchConversationDetails,
  createConversationThunk,
} from '@/features/chat/chatSlice'
import {
  setSelectedBot,
} from '@/features/bots/botsSlice'
import {
  openCreateBotModal,
  setMobileSidebarOpen,
} from '@/features/ui/uiSlice'
import { logout } from '@/features/auth/authSlice'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Bot } from '@/types'

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch()
  const {
    conversations,
    activeConversationId,
    totalConversations,
    currentPage,
    isLoadingMore,
    isLoadingConversations,
  } = useAppSelector((state) => state.chat)
  const { actualBots, selectedBotId } = useAppSelector((state) => state.bots)
  const { isMobileSidebarOpen } = useAppSelector((state) => state.ui)
  const userEmail = useAppSelector((state) => state.auth.email)

  const [searchQuery, setSearchQuery] = useState('')

  const activeBot = useMemo(
    () => actualBots.find((b) => b.id === selectedBotId),
    [actualBots, selectedBotId]
  )

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
    dispatch(fetchConversationDetails(id))
    dispatch(setMobileSidebarOpen(false))
  }

  const handleSelectBot = (bot: Bot) => {
    dispatch(setSelectedBot(bot.id))
    dispatch(fetchBotConversations({ botId: bot.id, botName: bot.name, page: 1 }))
    dispatch(setMobileSidebarOpen(false))
  }

  const handleGoHome = () => {
    dispatch(setSelectedBot(null))
    dispatch(setMobileSidebarOpen(false))
  }

  const handleNewChat = () => {
    if (activeBot) {
      dispatch(
        createConversationThunk({
          botId: activeBot.id,
          title: `Chat with ${activeBot.name}`,
        })
      )
    } else if (actualBots.length > 0) {
      handleSelectBot(actualBots[0])
    } else {
      dispatch(openCreateBotModal())
    }
    dispatch(setMobileSidebarOpen(false))
  }

  const handleLoadMore = () => {
    if (activeBot && !isLoadingMore) {
      dispatch(
        fetchBotConversations({
          botId: activeBot.id,
          botName: activeBot.name,
          page: currentPage + 1,
          append: true,
        })
      )
    }
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
          className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-xs md:hidden"
          onClick={() => dispatch(setMobileSidebarOpen(false))}
        />
      ) : null}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-zinc-200 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* App Branding Header - Clicking takes to Home Bot Selection */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-200 shrink-0">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={handleGoHome}
            title="Return to Bot Selection Hub"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs group-hover:bg-zinc-800 transition-colors">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-zinc-900 text-sm tracking-tight flex items-center gap-1.5">
                TataTel <span className="text-zinc-500 font-medium">AI</span>
              </span>
              <p className="text-[10px] text-zinc-400 font-medium">Agent Workspace</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(setMobileSidebarOpen(false))}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 md:hidden rounded-lg cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="p-3 space-y-1.5 border-b border-zinc-100">
          {/* Return to Bot Selection Hub Button */}
          <button
            type="button"
            onClick={handleGoHome}
            className={`w-full flex items-center justify-start gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !selectedBotId
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-700 hover:bg-zinc-100 bg-zinc-50/70 border border-zinc-200/80'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>All AI Agents (Hub)</span>
          </button>

          {/* New Chat Button (Active when bot is selected) */}
          {selectedBotId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              className="w-full justify-start gap-2 font-medium border-zinc-200"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Conversation</span>
            </Button>
          )}

          {/* Create Custom Bot Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch(openCreateBotModal())}
            className="w-full justify-start gap-2 font-medium"
          >
            <Compass className="h-3.5 w-3.5 text-zinc-900" />
            <span>Create Custom Bot</span>
          </Button>
        </div>

        {/* AI Bots Quick Selection Switcher */}
        <div className="px-3 py-2 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              AI Bots {actualBots.length > 0 ? `(${actualBots.length})` : ''}
            </span>
            <button
              type="button"
              onClick={() => dispatch(openCreateBotModal())}
              className="text-[11px] font-medium text-zinc-600 hover:text-zinc-950 flex items-center gap-1 transition-colors cursor-pointer"
              title="Create new bot"
            >
              <Plus className="h-3 w-3" />
              <span>New</span>
            </button>
          </div>

          {actualBots.length > 0 ? (
            <div className="space-y-1 max-h-40 overflow-y-auto pr-0.5 scrollbar-thin">
              {actualBots.map((bot) => {
                const isSelected = selectedBotId === bot.id

                return (
                  <div
                    key={bot.id}
                    onClick={() => handleSelectBot(bot)}
                    className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-100 text-zinc-950 font-semibold border border-zinc-200/80 shadow-2xs'
                        : 'text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Avatar fallback={bot.avatar || 'Bot'} size="sm" className="h-5 w-5 text-[9px]" />
                      <span className="truncate">{bot.name}</span>
                    </div>
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => dispatch(openCreateBotModal())}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-zinc-300 hover:border-zinc-900 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 hover:text-zinc-950 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Bot</span>
            </button>
          )}
        </div>

        {/* Search Conversations */}
        <div className="px-3 py-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-zinc-50/70 py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:bg-white"
            />
          </div>
        </div>

        {/* Conversation History Feed */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
          {!selectedBotId ? (
            <div className="px-3 py-10 text-center">
              <Cpu className="h-7 w-7 text-zinc-300 mx-auto mb-2.5" />
              <p className="text-xs font-semibold text-zinc-700">Select an AI Agent</p>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Choose an agent from the hub to load its chat sessions.
              </p>
            </div>
          ) : isLoadingConversations ? (
            <div className="py-10 text-center">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-medium">Loading conversations...</p>
            </div>
          ) : (
            <>
              {/* Pinned Section */}
              {pinnedConversations.length > 0 ? (
                <div>
                  <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <Pin className="h-2.5 w-2.5" />
                    <span>Pinned</span>
                  </p>
                  <div className="space-y-0.5">
                    {pinnedConversations.map((conv) => {
                      const isActive = activeConversationId === conv.id
                      return (
                        <div
                          key={conv.id}
                          onClick={() => handleSelectConv(conv.id)}
                          className={`group relative flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-all cursor-pointer ${
                            isActive
                              ? 'bg-zinc-100 text-zinc-950 font-semibold border border-zinc-200/80 shadow-2xs'
                              : 'text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Avatar fallback={activeBot?.avatar || 'AI'} size="sm" className="h-5 w-5 text-[9px]" />
                            <span className="truncate">{conv.title}</span>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              type="button"
                              onClick={(e) => handleTogglePin(e, conv.id)}
                              className="p-1 hover:text-zinc-900 rounded"
                              title="Unpin"
                            >
                              <Pin className="h-3 w-3 fill-current text-zinc-900" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteConv(e, conv.id)}
                              className="p-1 hover:text-red-600 rounded text-zinc-400"
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
                <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  {activeBot ? `${activeBot.name}'s Chats` : 'Conversations'}
                </p>
                {unpinnedConversations.length > 0 ? (
                  <div className="space-y-0.5">
                    {unpinnedConversations.map((conv) => {
                      const isActive = activeConversationId === conv.id
                      return (
                        <div
                          key={conv.id}
                          onClick={() => handleSelectConv(conv.id)}
                          className={`group relative flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-all cursor-pointer ${
                            isActive
                              ? 'bg-zinc-100 text-zinc-950 font-semibold border border-zinc-200/80 shadow-2xs'
                              : 'text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Avatar fallback={activeBot?.avatar || 'AI'} size="sm" className="h-5 w-5 text-[9px]" />
                            <span className="truncate">{conv.title}</span>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              type="button"
                              onClick={(e) => handleTogglePin(e, conv.id)}
                              className="p-1 hover:text-zinc-900 rounded text-zinc-400"
                              title="Pin conversation"
                            >
                              <Pin className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteConv(e, conv.id)}
                              className="p-1 hover:text-red-600 rounded text-zinc-400"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )
                    })}

                    {/* Pagination Lazy-Loading */}
                    {totalConversations > conversations.length && (
                      <div className="pt-2 px-1">
                        <button
                          type="button"
                          disabled={isLoadingMore}
                          onClick={handleLoadMore}
                          className="w-full py-1.5 px-3 text-xs font-medium text-zinc-600 hover:text-zinc-950 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isLoadingMore ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin text-zinc-600" />
                              <span>Loading...</span>
                            </>
                          ) : (
                            <span>Load more ({conversations.length} of {totalConversations})</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-2 py-4 text-center text-xs text-zinc-400">
                    {searchQuery ? 'No matching history' : 'No previous conversations'}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-md bg-zinc-950 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
              {userEmail ? userEmail.slice(0, 2).toUpperCase() : 'TT'}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-semibold text-zinc-800 leading-tight truncate">
                {userEmail || 'admin@example.com'}
              </p>
              <p className="text-[10px] text-zinc-400">Authenticated Session</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(logout())}
            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  )
}
