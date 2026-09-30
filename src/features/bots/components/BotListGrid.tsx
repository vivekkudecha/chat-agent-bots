import React, { useMemo } from 'react'
import { Plus, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { BotCard } from './BotCard'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { openCreateBotModal } from '@/features/ui/uiSlice'
import { setActiveCategory, setSearchQuery } from '@/features/bots/botsSlice'

export const BotListGrid: React.FC = () => {
  const dispatch = useAppDispatch()
  const { organizationBots, customBots, activeCategory, searchQuery } = useAppSelector(
    (state) => state.bots
  )

  const categories = [
    'All',
    'Enterprise',
    'Engineering',
    'Operations',
    'Finance & Legal',
    'Custom',
  ]

  const allBots = useMemo(() => {
    return [...organizationBots, ...customBots]
  }, [organizationBots, customBots])

  const filteredBots = useMemo(() => {
    return allBots.filter((bot) => {
      const matchesCategory =
        activeCategory === 'All'
          ? true
          : activeCategory === 'Custom'
          ? bot.isCustom
          : bot.category === activeCategory

      const matchesSearch =
        searchQuery.trim() === '' ||
        bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.description.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [allBots, activeCategory, searchQuery])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Hero / Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-semibold mb-3 border border-zinc-200">
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-900" />
            <span>TataTel Enterprise AI Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            Organization AI Agents & Bots
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
            Select a verified organization agent to begin collaborating, or create your own custom AI
            bot with personalized instructions and document grounding.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={() => dispatch(openCreateBotModal())}
            className="shadow-xs gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Custom Bot</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => dispatch(setActiveCategory(cat))}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-zinc-900 text-zinc-50 shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
              }`}
            >
              {cat === 'Custom' ? 'My Custom Bots' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search agents by role, skill..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="h-9 w-full pl-8 pr-3 rounded-md border border-zinc-200 bg-white text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 shadow-2xs"
          />
        </div>
      </div>

      {/* Bots Grid */}
      {filteredBots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBots.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}

          {/* Quick Create Card Spotlight */}
          <div
            onClick={() => dispatch(openCreateBotModal())}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white/60 p-6 text-center transition-all hover:border-zinc-400 hover:bg-zinc-50/50 cursor-pointer group min-h-[250px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 group-hover:scale-105 transition-transform mb-3">
              <Plus className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-zinc-900 text-sm group-hover:text-zinc-950 transition-colors">
              Deploy Custom Bot
            </h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-[210px]">
              Add custom persona instructions and upload context documents.
            </p>
            <span className="mt-3.5 text-xs font-semibold text-zinc-900 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-zinc-700" />
              Configure Bot
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center max-w-md mx-auto">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 mb-3">
            <Search className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-zinc-900 text-sm">No agents matched</h3>
          <p className="mt-1 text-xs text-zinc-500">
            No AI bots found for "{searchQuery}". Try adjusting your filters or create a new custom
            bot.
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                dispatch(setSearchQuery(''))
                dispatch(setActiveCategory('All'))
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
