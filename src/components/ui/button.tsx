import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98] cursor-pointer'

    const variantStyles = {
      primary:
        'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 shadow-sm focus-visible:ring-zinc-950 border border-zinc-900/10',
      secondary:
        'bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 border border-zinc-200/80 focus-visible:ring-zinc-950',
      outline:
        'border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:ring-zinc-950',
      ghost:
        'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-zinc-950',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-600',
    }

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
      md: 'h-9 px-4 text-xs font-semibold rounded-md gap-2',
      lg: 'h-11 px-5 text-sm font-semibold rounded-md gap-2.5',
      icon: 'h-9 w-9 rounded-md p-0',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
