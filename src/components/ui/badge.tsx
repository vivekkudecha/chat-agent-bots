import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'royal' | 'secondary' | 'outline' | 'success' | 'amber'
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-zinc-100 text-zinc-800 border-zinc-200',
    royal: 'bg-zinc-900 text-zinc-50 border-zinc-900 font-medium',
    secondary: 'bg-zinc-100 text-zinc-700 border-zinc-200/80',
    outline: 'border border-zinc-200 text-zinc-700 bg-white',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
