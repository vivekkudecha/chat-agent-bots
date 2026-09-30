import React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'busy'
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  status,
  className,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false)

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-14 w-14 text-lg',
  }

  const statusSize = {
    sm: 'h-2 w-2 ring-1',
    md: 'h-2.5 w-2.5 ring-2',
    lg: 'h-3 w-3 ring-2',
    xl: 'h-3.5 w-3.5 ring-2',
  }

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-amber-500',
  }

  const getInitials = (text?: string) => {
    if (!text) return 'AI'
    const parts = text.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return text.slice(0, 2).toUpperCase()
  }

  return (
    <div className={cn('relative inline-block select-none shrink-0', className)} {...props}>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl overflow-hidden font-semibold border border-zinc-200 bg-gradient-to-br from-zinc-800 to-zinc-950 text-zinc-50 shadow-xs',
          sizeClasses[size]
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{fallback || getInitials(alt)}</span>
        )}
      </div>
      {status ? (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-white',
            statusColors[status],
            statusSize[size]
          )}
        />
      ) : null}
    </div>
  )
}
