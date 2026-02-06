'use client'

import { useState } from 'react'
import { Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CalendarPromptProps {
  onScrollToCalendar: () => void
}

export function CalendarPrompt({ onScrollToCalendar }: CalendarPromptProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="relative border-2 border-dashed border-border bg-accent/50 rounded-xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Calendar className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium">Marcá tus primeras fechas disponibles</p>
        <p className="text-sm text-muted-foreground">
          Así tus amigos van a saber cuándo pueden visitarte
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
          Lo hago después
        </Button>
        <Button size="sm" onClick={onScrollToCalendar}>
          Agregar
        </Button>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
