'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="flex gap-1.5 w-full">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 rounded-full flex-1 transition-all duration-300',
            i < currentStep
              ? 'bg-primary'
              : i === currentStep
                ? 'bg-primary'
                : 'bg-muted'
          )}
        />
      ))}
    </div>
  )
}
