import React from 'react'
import { Palette } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setThemePreset } from '@/features/ui/uiSlice'
import type { ThemePreset } from '@/types'

export const ThemeSelector: React.FC = () => {
  const dispatch = useAppDispatch()
  const { themePreset } = useAppSelector((state) => state.ui)
  const [isOpen, setIsOpen] = React.useState(false)

  const presets: { id: ThemePreset; name: string; color: string }[] = [
    { id: 'minimal', name: 'Modern Minimal', color: 'bg-zinc-900' },
    { id: 'royal', name: 'Royal Slate', color: 'bg-slate-700' },
    { id: 'navy', name: 'Deep Navy', color: 'bg-blue-900' },
    { id: 'cobalt', name: 'Cobalt Indigo', color: 'bg-indigo-600' },
  ]

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 border border-zinc-200">
        {/* Theme presets toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-800 hover:text-zinc-950 rounded-lg transition-colors cursor-pointer"
          title="Theme Palette"
        >
          <Palette className="h-3.5 w-3.5 text-zinc-900" />
          <span className="capitalize hidden sm:inline">
            {themePreset === 'minimal' ? 'Modern Minimal' : themePreset}
          </span>
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider px-1 py-0.2 bg-zinc-200/80 rounded">
            Light
          </span>
        </button>
      </div>

      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 bottom-full mb-2 w-52 rounded-xl bg-white shadow-xl border border-zinc-200 p-2 z-50 animate-in fade-in zoom-in-95">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 py-1">
              Active Theme Preset
            </p>
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  dispatch(setThemePreset(preset.id))
                  setIsOpen(false)
                }}
                className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${themePreset === preset.id
                    ? 'bg-zinc-100 text-zinc-900 font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${preset.color}`} />
                  <span>{preset.name}</span>
                </div>
                {themePreset === preset.id ? (
                  <span className="text-zinc-900 font-bold">✓</span>
                ) : null}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
