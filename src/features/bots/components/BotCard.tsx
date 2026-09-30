import React from 'react'
import { MessageSquare, Check } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Bot } from '@/types'
import { useAppDispatch } from '@/app/hooks'
import { startNewChatWithBot } from '@/features/chat/chatSlice'
import { setActiveTab } from '@/features/ui/uiSlice'

interface BotCardProps {
  bot: Bot
  isActive?: boolean
  onChat?: (bot: Bot) => void
  layout?: 'grid' | 'row'
}

export const BotCard: React.FC<BotCardProps> = ({
  bot,
  isActive = false,
  onChat,
  layout = 'grid',
}) => {
  const dispatch = useAppDispatch()
  const department = bot.department || bot.category || 'General'

  const handleStartChat = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (onChat) {
      onChat(bot)
    } else {
      dispatch(
        startNewChatWithBot({
          botId: bot.id,
          botName: bot.name,
        })
      )
      dispatch(setActiveTab('chat'))
    }
  }

  return (
    <div
      onClick={handleStartChat}
      className={`group relative flex items-center justify-between gap-3 rounded-xl border p-2.5 sm:p-3 transition-all cursor-pointer ${
        isActive
          ? 'border-zinc-950 bg-zinc-50/90 shadow-2xs ring-1 ring-zinc-950/20'
          : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/70 shadow-2xs hover:shadow-xs'
      } ${layout === 'row' ? 'min-w-[210px] max-w-[250px] shrink-0' : 'w-full'}`}
    >
      {/* Bot Icon & Details (Name, Department) */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <Avatar
          fallback={bot.avatar}
          size="sm"
          status={isActive ? 'online' : undefined}
          className="shrink-0"
        />
        <div className="min-w-0 flex-1 text-left">
          <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 truncate leading-snug group-hover:text-zinc-950">
            {bot.name}
          </h4>
          <p className="text-[11px] font-medium text-zinc-500 truncate mt-0.5">
            {department}
          </p>
        </div>
      </div>

      {/* Button to chat */}
      <div className="shrink-0">
        <Button
          variant={isActive ? 'primary' : 'secondary'}
          size="sm"
          onClick={handleStartChat}
          className={`h-7 px-2.5 text-xs font-medium gap-1 transition-all ${
            isActive
              ? 'bg-zinc-900 text-zinc-50 shadow-2xs'
              : 'hover:bg-zinc-900 hover:text-white'
          }`}
        >
          {isActive ? (
            <>
              <Check className="h-3 w-3 stroke-[2.5]" />
              <span className="hidden xs:inline">Active</span>
            </>
          ) : (
            <>
              <MessageSquare className="h-3 w-3" />
              <span>Chat</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

