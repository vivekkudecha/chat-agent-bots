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
    <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-zinc-400 hover:shadow-md">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar fallback={bot.avatar} size="lg" status="online" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-zinc-900 group-hover:text-zinc-950 transition-colors text-sm sm:text-base">
                  {bot.name}
                </h3>
              </div>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">
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
                className="p-1.5 text-zinc-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                title="Delete Custom Bot"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs sm:text-sm text-zinc-600 line-clamp-2 leading-relaxed">
          {bot.description}
        </p>

        {/* Knowledge Base attachment badge */}
        {bot.knowledgeFiles && bot.knowledgeFiles.length > 0 ? (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-50 px-2.5 py-1.5 rounded-md border border-zinc-200/80">
            <FileText className="h-3.5 w-3.5 text-zinc-800" />
            <span className="font-semibold text-zinc-800">
              {bot.knowledgeFiles.length} file{bot.knowledgeFiles.length > 1 ? 's' : ''} trained
            </span>
            <span className="text-zinc-300">•</span>
            <span className="truncate max-w-[140px] text-zinc-500">{bot.knowledgeFiles[0].name}</span>
          </div>
        ) : null}

        {/* Starter Prompts */}
        {bot.suggestedPrompts && bot.suggestedPrompts.length > 0 ? (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-zinc-600" />
              <span>Suggested starters</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {bot.suggestedPrompts.slice(0, 2).map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleStartChat(prompt)}
                  className="text-left text-xs text-zinc-600 hover:text-zinc-950 bg-zinc-50 hover:bg-zinc-100 px-3 py-1.5 rounded-md transition-colors border border-zinc-200/60 hover:border-zinc-300 truncate cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-zinc-100 flex items-center justify-between">
        <span className="text-xs text-zinc-400 font-medium">
          {bot.category}
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleStartChat()}
          className="group/btn gap-1.5 text-xs"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Chat with Bot</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </Button>
      </div>
    </div>
  )
}
