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
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3 border border-blue-200/60 dark:border-blue-800">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>TataTel Enterprise AI Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Organization AI Agents & Bots
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Select a verified organization agent to begin collaborating, or create your own custom AI
            bot with personalized instructions and document grounding.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={() => dispatch(openCreateBotModal())}
            className="shadow-sm gap-2"
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'Custom' ? 'My Custom Bots' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search agents by role, skill..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="h-10 w-full pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Bots Grid */}
      {filteredBots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBots.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}

          {/* Quick Create Card Spotlight */}
          <div
            onClick={() => dispatch(openCreateBotModal())}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center transition-all hover:border-blue-400 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 cursor-pointer group min-h-[260px]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 group-hover:scale-110 transition-transform mb-3">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              Deploy Custom Bot
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-[220px]">
              Add custom persona instructions and upload context documents.
            </p>
            <span className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Configure Bot
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center max-w-md mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 mb-3">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">No agents matched</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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
