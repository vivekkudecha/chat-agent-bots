import React from 'react'
import { BotCard } from '@/features/bots/components/BotCard'
import type { Bot } from '@/types'
import { ShieldCheck, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/app/hooks'
import { openCreateBotModal } from '@/features/ui/uiSlice'

interface OrgBotBarProps {
  bots: Bot[]
  activeBotId?: string
  onSelectBot: (bot: Bot) => void
  isCompact?: boolean
  isLoading?: boolean
}

export const OrgBotBar: React.FC<OrgBotBarProps> = ({
  bots,
  activeBotId,
  onSelectBot,
  isCompact = false,
  isLoading = false,
}) => {
  const dispatch = useAppDispatch()

  if (isLoading && (!bots || bots.length === 0)) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 mb-3 shrink-0">
        <div className="h-12 rounded-xl border border-zinc-200/80 bg-white/70 animate-pulse flex items-center justify-center text-xs text-zinc-400">
          Loading AI agents from API...
        </div>
      </div>
    )
  }

  // If no bots from API, show create bot button
  if (!bots || bots.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 mb-3 shrink-0 flex items-center justify-center py-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(openCreateBotModal())}
          className="gap-2 text-xs font-semibold py-2 px-4 border-dashed border-zinc-300 hover:border-zinc-950 bg-white shadow-2xs hover:bg-zinc-50 transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 text-zinc-900" />
          <span>Create Bot</span>
        </Button>
      </div>
    )
  }

  if (isCompact) {
    return (
      <div className="w-full border-t border-zinc-200/60 bg-zinc-50/70 py-2 shrink-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-700" />
              <span>AI Agents ({bots.length})</span>
            </div>
            <span className="text-[11px] text-zinc-400">
              Click to switch agent
            </span>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {bots.map((bot) => (
              <BotCard
                key={bot.id}
                bot={bot}
                isActive={activeBotId === bot.id}
                onChat={onSelectBot}
                layout="row"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 mb-3 shrink-0">
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-700" />
          <span className="text-xs font-semibold text-zinc-800 tracking-tight">
            Active AI Agents & Bots
          </span>
          <span className="text-[10px] font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full border border-zinc-200">
            {bots.length} Active
          </span>
        </div>
        <span className="text-[11px] text-zinc-400">
          Select an agent to chat
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {bots.map((bot) => (
          <BotCard
            key={bot.id}
            bot={bot}
            isActive={activeBotId === bot.id}
            onChat={onSelectBot}
            layout="grid"
          />
        ))}
      </div>
    </div>
  )
}
