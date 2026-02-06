'use client'

import { useState, useEffect } from 'react'
import { Home, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SelectableCard } from './selectable-card'

interface IntentStepProps {
  initialIntent?: 'host' | 'guest' | null
  referralUsername?: string | null
  referralProfile?: { display_name: string; avatar_url: string | null } | null
  onNext: (intent: 'host' | 'guest') => void
}

export function IntentStep({ initialIntent, referralUsername, referralProfile, onNext }: IntentStepProps) {
  const [intent, setIntent] = useState<'host' | 'guest' | null>(initialIntent ?? null)
  const [profile, setProfile] = useState(referralProfile ?? null)

  // Fetch referral profile if username provided
  useEffect(() => {
    if (referralUsername && !referralProfile) {
      fetch(`/api/username/check?username=${referralUsername}`)
        .catch(() => null)
    }
  }, [referralUsername, referralProfile])

  return (
    <div className="space-y-6">
      {referralUsername && profile && (
        <div className="bg-muted rounded-lg p-3 flex items-center gap-3 text-sm">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          <span>Viniste desde el perfil de <strong>{profile.display_name}</strong></span>
        </div>
      )}

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">¿Qué querés hacer?</h1>
        <p className="text-muted-foreground">
          Podés cambiar esto en cualquier momento
        </p>
      </div>

      <div className="space-y-3" role="radiogroup" aria-label="Tipo de usuario">
        <SelectableCard
          selected={intent === 'host'}
          onClick={() => setIntent('host')}
          icon={<Home className="w-6 h-6 text-primary" />}
          title="Quiero ofrecer mi casa"
          description="Compartí tu espacio con amigos cuando viajan a tu ciudad"
        />
        <SelectableCard
          selected={intent === 'guest'}
          onClick={() => setIntent('guest')}
          icon={<Plane className="w-6 h-6 text-primary" />}
          title="Busco donde quedarme"
          description="Un amigo te compartió su link y querés pedirle alojamiento"
        />
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={!intent}
        onClick={() => intent && onNext(intent)}
      >
        Continuar
      </Button>
    </div>
  )
}
