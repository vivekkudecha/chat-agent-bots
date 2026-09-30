import React from 'react'
import { Sun, Moon, Palette } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setThemePreset, toggleDarkMode } from '@/features/ui/uiSlice'
import type { ThemePreset } from '@/types'

export const ThemeSelector: React.FC = () => {
  const dispatch = useAppDispatch()
  const { themePreset, isDarkMode } = useAppSelector((state) => state.ui)
  const [isOpen, setIsOpen] = React.useState(false)

  const presets: { id: ThemePreset; name: string; color: string }[] = [
    { id: 'royal', name: 'Royal Blue (Default)', color: 'bg-blue-600' },
    { id: 'navy', name: 'Deep Navy', color: 'bg-blue-900' },
    { id: 'cobalt', name: 'Cobalt Indigo', color: 'bg-indigo-600' },
  ]

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        {/* Theme presets toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Change Theme Palette"
        >
          <Palette className="h-3.5 w-3.5 text-blue-600" />
          <span className="capitalize hidden sm:inline">{themePreset}</span>
        </button>

        {/* Dark/Light toggle */}
        <button
          type="button"
          onClick={() => dispatch(toggleDarkMode())}
          className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 bottom-full mb-2 w-48 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
              Select Palette
            </p>
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  dispatch(setThemePreset(preset.id))
                  setIsOpen(false)
                }}
                className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  themePreset === preset.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${preset.color}`} />
                  <span>{preset.name}</span>
                </div>
                {themePreset === preset.id ? (
                  <span className="text-blue-600 font-bold">✓</span>
                ) : null}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
