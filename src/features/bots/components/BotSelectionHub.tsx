import React, { useState, useMemo } from 'react'
import {
  Bot as BotIcon,
  Plus,
  Search,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Lock,
  Building2,
  Globe,
  Loader2,
} from 'lucide-react'
import type { Bot } from '@/types'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useAppDispatch } from '@/app/hooks'
import { openCreateBotModal } from '@/features/ui/uiSlice'

interface BotSelectionHubProps {
  bots: Bot[]
  isLoading?: boolean
  onSelectBot: (bot: Bot) => void
}

export const BotSelectionHub: React.FC<BotSelectionHubProps> = ({
  bots,
  isLoading = false,
  onSelectBot,
}) => {
  const dispatch = useAppDispatch()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredBots = useMemo(() => {
    if (!searchTerm.trim()) return bots
    const q = searchTerm.toLowerCase()
    return bots.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q)) ||
        (b.department && b.department.toLowerCase().includes(q))
    )
  }, [bots, searchTerm])

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50/50 p-6 sm:p-10 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        {/* Hero Section */}
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[11px] font-semibold text-zinc-800 mb-2.5">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-900" />
              <span>TataTel Enterprise Agent Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              Select an AI Agent
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-xl">
              Choose an AI bot below to begin a conversation. Each bot is trained on specialized enterprise documents and instructions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 justify-center sm:justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => dispatch(openCreateBotModal())}
              className="gap-2 font-semibold shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Create Bot</span>
            </Button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search bots by name or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white text-zinc-900 border border-zinc-200 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 shadow-2xs transition-colors"
            />
          </div>

          <span className="text-xs text-zinc-400 font-medium">
            {bots.length} {bots.length === 1 ? 'bot available' : 'bots available'}
          </span>
        </div>

        {/* Loading state */}
        {isLoading && bots.length === 0 && (
          <div className="py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mx-auto mb-3" />
            <p className="text-xs font-semibold text-zinc-700">Loading your AI bots...</p>
          </div>
        )}

        {/* Bot Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create New Bot Quick Card */}
          <div
            onClick={() => dispatch(openCreateBotModal())}
            className="group flex flex-col justify-between rounded-xl border-2 border-dashed border-zinc-200 hover:border-zinc-950 bg-white/70 hover:bg-zinc-50/60 p-5 transition-all cursor-pointer shadow-2xs hover:shadow-xs min-h-[190px]"
          >
            <div>
              <div className="h-10 w-10 rounded-lg bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white text-zinc-900 flex items-center justify-center transition-colors mb-3">
                <Plus className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-zinc-900 text-sm group-hover:text-zinc-950">
                Deploy New Custom Bot
              </h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Add system persona instructions and upload PDF or TXT documents to index in Qdrant.
              </p>
            </div>

            <div className="pt-3 flex items-center gap-1 text-xs font-semibold text-zinc-900 group-hover:translate-x-0.5 transition-transform">
              <Sparkles className="h-3.5 w-3.5 text-zinc-700" />
              <span>Configure Bot</span>
            </div>
          </div>

          {/* Actual Bots from API */}
          {filteredBots.map((bot) => (
            <div
              key={bot.id}
              onClick={() => onSelectBot(bot)}
              className="group flex flex-col justify-between rounded-xl border border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm p-5 transition-all cursor-pointer shadow-2xs relative min-h-[190px]"
            >
              <div>
                {/* Header: Avatar, Name, Visibility */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar fallback={bot.avatar || 'Bot'} size="md" status="online" />
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-zinc-900 truncate group-hover:text-zinc-950">
                        {bot.name}
                      </h3>
                      <p className="text-[11px] font-medium text-zinc-400 truncate">
                        {bot.department || 'AI Specialist'}
                      </p>
                    </div>
                  </div>

                  {/* Visibility Pill */}
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/80 shrink-0">
                    {bot.visibility === 'public' ? (
                      <>
                        <Globe className="h-2.5 w-2.5" />
                        <span>Public</span>
                      </>
                    ) : bot.visibility === 'organization' ? (
                      <>
                        <Building2 className="h-2.5 w-2.5" />
                        <span>Org</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-2.5 w-2.5" />
                        <span>Private</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed mt-1">
                  {bot.description || 'Custom tailored AI agent with document knowledge base.'}
                </p>
              </div>

              {/* Footer action button */}
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between mt-3">
                <span className="text-[11px] text-zinc-400">
                  {bot.knowledgeFiles && bot.knowledgeFiles.length > 0
                    ? `${bot.knowledgeFiles.length} file(s) indexed`
                    : 'Ready to chat'}
                </span>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-950 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Start Chat</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty search results */}
        {!isLoading && filteredBots.length === 0 && bots.length > 0 && (
          <div className="py-12 text-center max-w-sm mx-auto">
            <Search className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-zinc-700">No agents match "{searchTerm}"</h4>
            <p className="text-[11px] text-zinc-400 mt-1">Try searching for a different keyword or role.</p>
          </div>
        )}

        {/* Completely empty state if no bots exist in API */}
        {!isLoading && bots.length === 0 && (
          <div className="py-12 text-center max-w-md mx-auto mt-4 bg-white border border-zinc-200 rounded-2xl p-8 shadow-xs">
            <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-800 border border-zinc-200">
              <BotIcon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">No AI Bots Created Yet</h3>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              You do not have any bots deployed in your workspace. Click the button below to upload your documents and deploy your first agent.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => dispatch(openCreateBotModal())}
              className="mt-5 gap-2 font-semibold shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Bot</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
