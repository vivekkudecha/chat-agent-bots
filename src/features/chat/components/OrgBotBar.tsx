import React from 'react'
import { BotCard } from '@/features/bots/components/BotCard'
import type { Bot } from '@/types'
import { ShieldCheck } from 'lucide-react'

interface OrgBotBarProps {
  bots: Bot[]
  activeBotId?: string
  onSelectBot: (bot: Bot) => void
  isCompact?: boolean
}

export const OrgBotBar: React.FC<OrgBotBarProps> = ({
  bots,
  activeBotId,
  onSelectBot,
  isCompact = false,
}) => {
  if (!bots || bots.length === 0) return null

  if (isCompact) {
    return (
      <div className="w-full border-t border-zinc-200/60 bg-zinc-50/70 py-2 shrink-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-700" />
              <span>Organization AI Agents</span>
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
            Organization AI Agents
          </span>
          <span className="text-[10px] font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full border border-zinc-200">
            Verified
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
