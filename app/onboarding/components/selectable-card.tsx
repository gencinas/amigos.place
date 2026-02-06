'use client'

import { cn } from '@/lib/utils'

interface SelectableCardProps {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

export function SelectableCard({
  selected,
  onClick,
  icon,
  title,
  description,
  className,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 min-h-[44px] w-full cursor-pointer',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50',
        className
      )}
    >
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}
