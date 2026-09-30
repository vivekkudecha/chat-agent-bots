import React from 'react'
import { cn } from '@/lib/utils'
import {
  Headphones,
  Code2,
  BarChart3,
  Scale,
  Layers,
  Bot as BotIcon,
  Cpu,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'

export const BOT_ICON_MAP: Record<string, LucideIcon> = {
  Headphones,
  Code2,
  BarChart3,
  Scale,
  Layers,
  Bot: BotIcon,
  Cpu,
  Sparkles,
  Users,
  CS: Headphones,
  AR: Code2,
  DA: BarChart3,
  LC: Scale,
  PM: Layers,
  TT: Cpu,
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  icon?: LucideIcon
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'busy'
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback,
  icon: IconProp,
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

  const iconSizes = {
    sm: 15,
    md: 18,
    lg: 22,
    xl: 26,
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

  // Determine if fallback or icon is a Lucide icon
  const ResolvedIcon = IconProp || (fallback && BOT_ICON_MAP[fallback]) || (alt && BOT_ICON_MAP[alt])

  const hasValidImageSrc =
    src &&
    !imageError &&
    (src.startsWith('http://') ||
      src.startsWith('https://') ||
      src.startsWith('data:') ||
      src.startsWith('blob:') ||
      src.startsWith('/'))

  return (
    <div className={cn('relative inline-block select-none shrink-0', className)} {...props}>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl overflow-hidden font-semibold border border-zinc-200/80 bg-zinc-100 text-zinc-800 shadow-2xs transition-colors',
          sizeClasses[size]
        )}
      >
        {hasValidImageSrc ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : ResolvedIcon ? (
          <ResolvedIcon size={iconSizes[size]} className="stroke-[1.9] text-zinc-900" />
        ) : fallback ? (
          <span>{fallback}</span>
        ) : (
          <BotIcon size={iconSizes[size]} className="stroke-[1.9] text-zinc-900" />
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

