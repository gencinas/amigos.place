'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, MessageCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareStepProps {
  username: string
  displayName: string
  avatarUrl: string | null
  city: string
}

export function ShareStep({ username, displayName, avatarUrl, city }: ShareStepProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const profileUrl = `https://amigos.place/${username}`
  const whatsappMessage = `Te invito a quedarte en mi casa cuando visites ${city}. Mirá mi perfil en amigos.place: ${profileUrl}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`

  function handleCopy() {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">¡Listo!</h1>
        <p className="text-muted-foreground">
          Compartí tu perfil con amigos
        </p>
      </div>

      {/* Mini profile card */}
      <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-medium">{displayName}</p>
          <p className="text-sm text-muted-foreground">{city}</p>
        </div>
      </div>

      {/* Copyable link */}
      <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
        <code className="text-sm flex-1 truncate">{profileUrl}</code>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copiar
            </>
          )}
        </Button>
      </div>

      {/* WhatsApp share */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#25D366] text-white font-medium hover:bg-[#20BD5A] transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
        Compartir por WhatsApp
      </a>

      {/* Preview message */}
      <div className="bg-muted/30 border rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-1">Vista previa del mensaje:</p>
        <p className="text-sm">{whatsappMessage}</p>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={() => router.push('/dashboard')}
      >
        Ir a mi dashboard
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}
