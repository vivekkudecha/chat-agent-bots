import React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            'flex min-h-[90px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
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

Textarea.displayName = 'Textarea'
