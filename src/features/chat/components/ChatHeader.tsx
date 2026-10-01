import React, { useState, useMemo } from 'react'
import { FileText, Info, PlusCircle, ArrowLeft, History, Search, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  createConversationThunk,
  setActiveConversation,
  fetchConversationDetails,
  fetchBotConversations,
} from '@/features/chat/chatSlice'
import { updateActiveConversationUrl } from '@/utils/routing'
import type { Bot, Conversation } from '@/types'

interface ChatHeaderProps {
  bot?: Bot
  conversation?: Conversation
  onBackToHub?: () => void
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ bot, onBackToHub }) => {
  const dispatch = useAppDispatch()
  const {
    conversations,
    activeConversationId,
    totalConversations,
    currentPage,
    isLoadingMore,
  } = useAppSelector((state) => state.chat)

  const [showPromptModal, setShowPromptModal] = useState(false)
  const [showFilesModal, setShowFilesModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historySearch, setHistorySearch] = useState('')

  const botName = bot?.name || 'AI Assistant'
  const botRole = bot?.role || 'Enterprise Specialist'

  const filteredConversations = useMemo(() => {
    if (!historySearch.trim()) return conversations
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(historySearch.toLowerCase())
    )
  }, [conversations, historySearch])

  const handleNewChat = () => {
    if (bot) {
      dispatch(createConversationThunk({ botId: bot.id, title: `Chat with ${bot.name}` }))
      setShowHistoryModal(false)
    }
  }

  const handleSelectConv = (convId: string) => {
    dispatch(setActiveConversation(convId))
    dispatch(fetchConversationDetails(convId))
    if (bot) {
      updateActiveConversationUrl(bot, convId)
    }
    setShowHistoryModal(false)
  }

  const handleLoadMore = () => {
    if (bot && !isLoadingMore) {
      dispatch(
        fetchBotConversations({
          botId: bot.id,
          botName: bot.name,
          page: currentPage + 1,
          append: true,
        })
      )
    }
  }

  return (
    <>
      <div className="h-14 px-4 sm:px-6 bg-white border-b border-zinc-200 flex items-center justify-between shrink-0">
        {/* Left: Back button + Bot identity */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onBackToHub && (
            <button
              type="button"
              onClick={onBackToHub}
              className="p-1.5 -ml-1 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Back to Bot Selection Hub"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Agents</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar fallback={bot?.avatar || 'AI'} size="md" status="online" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-xs sm:text-sm text-zinc-900 truncate tracking-tight">
                  {botName}
                </h2>
                <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/80">
                  {bot?.department || bot?.category || 'Agent'}
                </span>
                {bot?.badge ? (
                  <Badge variant="royal" className="hidden md:inline-flex text-[10px]">
                    {bot.badge}
                  </Badge>
                ) : null}
              </div>
              <p className="text-[11px] text-zinc-500 truncate">{botRole}</p>
            </div>
          </div>
        </div>

        {/* Right: History button, Knowledge attachments, prompt details, and actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Button to view & switch bot-related conversations */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistoryModal(true)}
            className="gap-1.5 text-xs font-semibold"
            title="View previous conversations with this bot"
          >
            <History className="h-3.5 w-3.5 text-zinc-700" />
            <span className="hidden sm:inline">Chat History</span>
            {conversations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-bold">
                {conversations.length}
              </span>
            )}
          </Button>

          {bot?.knowledgeFiles && bot.knowledgeFiles.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowFilesModal(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-md hover:border-zinc-400 transition-colors cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-zinc-800" />
              <span>{bot.knowledgeFiles.length} File(s)</span>
            </button>
          ) : null}

          {bot?.systemInstruction ? (
            <button
              type="button"
              onClick={() => setShowPromptModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 rounded-md transition-colors cursor-pointer"
              title="View System Instructions"
            >
              <Info className="h-3.5 w-3.5 text-zinc-800" />
              <span className="hidden sm:inline">Instructions</span>
            </button>
          ) : null}

          <Button
            variant="primary"
            size="sm"
            onClick={handleNewChat}
            className="gap-1.5 shadow-xs"
            title="Start fresh conversation with this bot"
          >
            <PlusCircle className="h-3.5 w-3.5 text-zinc-100" />
            <span className="hidden sm:inline">New Session</span>
          </Button>
        </div>
      </div>

      {/* System Instructions Modal */}
      <Dialog
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        title={`${botName} • System Persona & Instructions`}
        description="The underlying directives configured for this AI agent."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
            <p className="text-xs sm:text-sm font-mono text-zinc-800 leading-relaxed whitespace-pre-wrap">
              {bot?.systemInstruction || 'No custom instruction configured.'}
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setShowPromptModal(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Trained Files Modal */}
      <Dialog
        isOpen={showFilesModal}
        onClose={() => setShowFilesModal(false)}
        title="Attached Knowledge Documents"
        description="Documents provided as grounded context for this agent."
        maxWidth="md"
      >
        <div className="space-y-2">
          {bot?.knowledgeFiles?.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs"
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="h-4 w-4 text-zinc-800 shrink-0" />
                <span className="font-medium text-zinc-800 truncate">
                  {file.name}
                </span>
              </div>
              <span className="text-zinc-400 shrink-0">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ))}
          <div className="flex justify-end pt-3">
            <Button variant="primary" size="sm" onClick={() => setShowFilesModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Bot Chat History Modal */}
      <Dialog
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title={`${botName} • Chat History`}
        description={`Switch between previous conversations or start a new chat with ${botName}.`}
        maxWidth="md"
      >
        <div className="space-y-3">
          {/* Actions & Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:bg-white"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleNewChat}
              className="gap-1.5 shrink-0 text-xs shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>New Chat</span>
            </Button>
          </div>

          {/* Conversations List */}
          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isActive = activeConversationId === conv.id

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConv(conv.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'border-zinc-950 bg-zinc-50 ring-1 ring-zinc-950/20 shadow-2xs font-semibold'
                        : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/70 shadow-2xs'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-zinc-900 font-medium">
                          {conv.title}
                        </span>
                        {isActive && (
                          <span className="text-[10px] bg-zinc-900 text-white px-1.5 py-0.2 rounded font-semibold shrink-0">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {conv.updatedAt ? new Date(conv.updatedAt).toLocaleString() : 'Recent'}
                      </p>
                    </div>

                    <span className="text-[11px] text-zinc-500 font-medium shrink-0 ml-2">
                      {conv.messages.length} msg{conv.messages.length === 1 ? '' : 's'}
                    </span>
                  </div>
                )
              })
            ) : (
              <div className="py-8 text-center text-xs text-zinc-400">
                {historySearch ? 'No matching conversations' : 'No previous conversations with this bot'}
              </div>
            )}
          </div>

          {/* Load More Pagination */}
          {totalConversations > conversations.length && (
            <div className="pt-2 border-t border-zinc-100">
              <button
                type="button"
                disabled={isLoadingMore}
                onClick={handleLoadMore}
                className="w-full py-1.5 px-3 text-xs font-medium text-zinc-600 hover:text-zinc-950 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-600" />
                    <span>Loading more conversations...</span>
                  </>
                ) : (
                  <span>Load more ({conversations.length} of {totalConversations})</span>
                )}
              </button>
            </div>
          )}
        </div>
      </Dialog>
    </>
  )
}
