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
  startNewChatWithBot,
} from '@/features/chat/chatSlice'
import {
  setActiveTab,
  openCreateBotModal,
  setMobileSidebarOpen,
} from '@/features/ui/uiSlice'
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
          className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-xs md:hidden"
          onClick={() => dispatch(setMobileSidebarOpen(false))}
        />
      ) : null}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-zinc-200 transition-transform duration-200 ease-in-out md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* App Branding Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-200 shrink-0">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => {
              dispatch(
                startNewChatWithBot({
                  botId: organizationBots[0]?.id || 'bot-org-1',
                  botName: organizationBots[0]?.name || 'Customer Success Copilot',
                })
              )
            }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-zinc-900 text-sm tracking-tight">
                TataTel <span className="text-zinc-500 font-medium">AI</span>
              </span>
              <p className="text-[10px] text-zinc-400 font-medium">Enterprise Agent Hub</p>
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
          {/* New Chat Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              dispatch(
                startNewChatWithBot({
                  botId: organizationBots[0]?.id || 'bot-org-1',
                  botName: organizationBots[0]?.name || 'Customer Success Copilot',
                })
              )
              dispatch(setMobileSidebarOpen(false))
            }}
            className="w-full justify-start gap-2 font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Chat</span>
          </Button>

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
          {/* Pinned Section */}
          {pinnedConversations.length > 0 ? (
            <div>
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
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
                      className={`group relative flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-all cursor-pointer ${isActive
                          ? 'bg-zinc-100 text-zinc-950 font-semibold border border-zinc-200/80 shadow-2xs'
                          : 'text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900'
                        }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Avatar fallback={bot?.avatar || 'AI'} size="sm" className="h-5 w-5 text-[9px]" />
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
                      className={`group relative flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-all cursor-pointer ${isActive
                          ? 'bg-zinc-100 text-zinc-950 font-semibold border border-zinc-200/80 shadow-2xs'
                          : 'text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900'
                        }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Avatar fallback={bot?.avatar || 'AI'} size="sm" className="h-5 w-5 text-[9px]" />
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
              </div>
            ) : (
              <div className="px-2 py-4 text-center text-xs text-zinc-400">
                {searchQuery ? 'No matching history' : 'No previous conversations'}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-zinc-200 text-zinc-800 flex items-center justify-center font-bold text-[11px]">
              TT
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-zinc-800 leading-tight">
                Enterprise User
              </p>
              <p className="text-[10px] text-zinc-400">TataTel Organization</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
