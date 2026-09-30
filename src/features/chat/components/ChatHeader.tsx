import React, { useState } from 'react'
import { ArrowLeft, FileText, Info, PlusCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { useAppDispatch } from '@/app/hooks'
import { setActiveTab } from '@/features/ui/uiSlice'
import { startNewChatWithBot } from '@/features/chat/chatSlice'
import type { Bot, Conversation } from '@/types'

interface ChatHeaderProps {
  bot?: Bot
  conversation?: Conversation
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ bot }) => {
  const dispatch = useAppDispatch()
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [showFilesModal, setShowFilesModal] = useState(false)

  const botName = bot?.name || 'AI Assistant'
  const botRole = bot?.role || 'Enterprise Specialist'

  const handleNewChat = () => {
    if (bot) {
      dispatch(startNewChatWithBot({ botId: bot.id, botName: bot.name }))
    }
  }

  return (
    <>
      <div className="h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
        {/* Left: Back button & Bot identity */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => dispatch(setActiveTab('home'))}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Back to All Bots"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <Avatar fallback={bot?.avatar || 'AI'} size="md" status="online" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {botName}
                </h2>
                {bot?.badge ? (
                  <Badge variant="royal" className="hidden sm:inline-flex text-[10px]">
                    {bot.badge}
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{botRole}</p>
            </div>
          </div>
        </div>

        {/* Right: Knowledge attachments, prompt details, and actions */}
        <div className="flex items-center gap-2 shrink-0">
          {bot?.knowledgeFiles && bot.knowledgeFiles.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowFilesModal(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 transition-colors cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              <span>{bot.knowledgeFiles.length} File(s)</span>
            </button>
          ) : null}

          {bot?.systemInstruction ? (
            <button
              type="button"
              onClick={() => setShowPromptModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="View System Instructions"
            >
              <Info className="h-4 w-4 text-blue-600" />
              <span className="hidden sm:inline">Instructions</span>
            </button>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            className="gap-1.5"
            title="Start fresh conversation with this bot"
          >
            <PlusCircle className="h-3.5 w-3.5 text-blue-600" />
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
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <p className="text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
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
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {file.name}
                </span>
              </div>
              <span className="text-slate-400 shrink-0">
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
    </>
  )
}
