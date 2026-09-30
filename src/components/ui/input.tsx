import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-zinc-900 shadow-xs transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          {...props}
        />
        {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
