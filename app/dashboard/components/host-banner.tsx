'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const DISMISS_KEY = 'host_banner_dismissed'

export function HostBanner() {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(true) // Start hidden to avoid flash

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === 'true')
  }, [])

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, 'true')
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div className="relative bg-gradient-to-r from-muted to-accent/30 rounded-xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Home className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium">¿Tenés un lugar para ofrecer?</p>
        <p className="text-sm text-muted-foreground">
          Configurá tu espacio y empezá a recibir amigos
        </p>
      </div>
      <Button size="sm" onClick={() => router.push('/onboarding?skip_to=space')}>
        Configurar mi espacio
      </Button>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
