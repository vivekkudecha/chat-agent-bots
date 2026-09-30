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
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    royal: 'bg-blue-50 text-blue-700 border-blue-200/80 font-medium',
    secondary: 'bg-slate-100 text-slate-600 border-transparent',
    outline: 'border border-slate-200 text-slate-700 bg-white',
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
