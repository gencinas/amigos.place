'use client'

import { useState } from 'react'
import { Copy, Check, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareCardProps {
  username: string
  city: string
}

export function ShareCard({ username, city }: ShareCardProps) {
  const [copied, setCopied] = useState(false)
  const profileUrl = `https://amigos.place/${username}`
  const whatsappMessage = `Te invito a quedarte en mi casa cuando visites ${city}. Mirá mi perfil: ${profileUrl}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`

  function handleCopy() {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-primary text-primary-foreground rounded-xl p-5 space-y-3">
      <p className="font-medium">Compartí tu perfil con amigos</p>
      <div className="flex items-center gap-2">
        <code className="text-sm bg-white/20 px-3 py-1.5 rounded-lg flex-1 truncate">
          {profileUrl}
        </code>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 bg-white/20 hover:bg-white/30 text-primary-foreground border-0"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-white" />
        </a>
      </div>
    </div>
  )
}
