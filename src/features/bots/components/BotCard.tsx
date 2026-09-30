import React from 'react'
import { MessageSquare, FileText, Sparkles, Trash2, ArrowRight } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Bot } from '@/types'
import { useAppDispatch } from '@/app/hooks'
import { startNewChatWithBot } from '@/features/chat/chatSlice'
import { setActiveTab } from '@/features/ui/uiSlice'
import { deleteCustomBot } from '@/features/bots/botsSlice'

interface BotCardProps {
  bot: Bot
}

export const BotCard: React.FC<BotCardProps> = ({ bot }) => {
  const dispatch = useAppDispatch()

  const handleStartChat = (prompt?: string) => {
    dispatch(
      startNewChatWithBot({
        botId: bot.id,
        botName: bot.name,
        initialMessage: prompt,
      })
    )
    dispatch(setActiveTab('chat'))
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${bot.name}"?`)) {
      dispatch(deleteCustomBot(bot.id))
    }
  }

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-blue-600/50">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar fallback={bot.avatar} size="lg" status="online" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {bot.name}
                </h3>
              </div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                {bot.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {bot.badge ? (
              <Badge variant={bot.isCustom ? 'royal' : 'secondary'}>{bot.badge}</Badge>
            ) : null}
            {bot.isCustom ? (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                title="Delete Custom Bot"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Description */}
        <p className="mt-3.5 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {bot.description}
        </p>

        {/* Knowledge Base attachment badge */}
        {bot.knowledgeFiles && bot.knowledgeFiles.length > 0 ? (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {bot.knowledgeFiles.length} file{bot.knowledgeFiles.length > 1 ? 's' : ''} trained
            </span>
            <span className="text-slate-400">•</span>
            <span className="truncate max-w-[150px]">{bot.knowledgeFiles[0].name}</span>
          </div>
        ) : null}

        {/* Starter Prompts */}
        {bot.suggestedPrompts && bot.suggestedPrompts.length > 0 ? (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-blue-500" />
              <span>Suggested starters</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {bot.suggestedPrompts.slice(0, 2).map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleStartChat(prompt)}
                  className="text-left text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-900 truncate cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          {bot.category}
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleStartChat()}
          className="group/btn gap-1.5"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Chat with Bot</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </Button>
      </div>
    </div>
  )
}
