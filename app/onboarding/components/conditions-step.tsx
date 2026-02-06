'use client'

import { useState } from 'react'
import { Heart, Coins, Handshake, PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SelectableCard } from './selectable-card'
import { cn } from '@/lib/utils'
import type { PaymentType, Presence } from '@/types/database'

const PAYMENT_OPTIONS: {
  value: PaymentType
  label: string
  description: string
  icon: React.ReactNode
}[] = [
  { value: 'free', label: 'Gratis', description: 'Mi casa es tu casa', icon: <Heart className="w-5 h-5 text-primary" /> },
  { value: 'friend_price', label: 'Precio amigo', description: 'Una contribución simbólica', icon: <Coins className="w-5 h-5 text-primary" /> },
  { value: 'favor', label: 'Favor', description: 'A cambio de un favor', icon: <Handshake className="w-5 h-5 text-primary" /> },
  { value: 'service', label: 'Servicio', description: 'A cambio de un servicio', icon: <PawPrint className="w-5 h-5 text-primary" /> },
]

const PRESENCE_OPTIONS: { value: Presence; label: string }[] = [
  { value: 'home', label: 'Voy a estar' },
  { value: 'empty', label: 'Depto vacío' },
  { value: 'shared', label: 'Compartido' },
]

interface ConditionsStepProps {
  existingData?: {
    default_payment_type?: PaymentType | null
    default_price?: number | null
    default_favor_text?: string | null
    default_presence?: Presence | null
  }
  onNext: (data: {
    default_payment_type: PaymentType
    default_price?: number | null
    default_favor_text?: string | null
    default_presence?: Presence | null
  }) => void
}

export function ConditionsStep({ existingData, onNext }: ConditionsStepProps) {
  const [paymentType, setPaymentType] = useState<PaymentType>(existingData?.default_payment_type ?? 'free')
  const [price, setPrice] = useState<string>(existingData?.default_price?.toString() ?? '')
  const [favorText, setFavorText] = useState(existingData?.default_favor_text ?? '')
  const [presence, setPresence] = useState<Presence | null>(existingData?.default_presence ?? null)

  const showPrice = paymentType === 'friend_price'
  const showFavor = paymentType === 'favor' || paymentType === 'service'

  function handleSubmit() {
    onNext({
      default_payment_type: paymentType,
      default_price: showPrice && price ? Number(price) : null,
      default_favor_text: showFavor && favorText ? favorText : null,
      default_presence: presence,
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Condiciones</h1>
        <p className="text-muted-foreground">
          ¿Cómo preferís recibir a tus amigos?
        </p>
      </div>

      <div className="space-y-3" role="radiogroup" aria-label="Tipo de pago">
        {PAYMENT_OPTIONS.map((opt) => (
          <SelectableCard
            key={opt.value}
            selected={paymentType === opt.value}
            onClick={() => setPaymentType(opt.value)}
            icon={opt.icon}
            title={opt.label}
            description={opt.description}
          />
        ))}
      </div>

      {/* Conditional price input */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          showPrice ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="space-y-2 pt-1">
          <Label htmlFor="price">Precio por noche (EUR)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            placeholder="15"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Conditional favor/service text */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          showFavor ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="space-y-2 pt-1">
          <Label htmlFor="favor">¿Qué tenés en mente?</Label>
          <Textarea
            id="favor"
            placeholder={paymentType === 'favor' ? 'Ej: ayudar con la mudanza' : 'Ej: pasear al perro'}
            rows={2}
            value={favorText}
            onChange={(e) => setFavorText(e.target.value)}
            maxLength={300}
          />
        </div>
      </div>

      {/* Presence toggle */}
      <div className="space-y-2">
        <Label>¿Vas a estar en casa?</Label>
        <div className="flex gap-2">
          {PRESENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPresence(presence === opt.value ? null : opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm border transition-all duration-200',
                presence === opt.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Button className="w-full" size="lg" onClick={handleSubmit}>
        Continuar
      </Button>
    </div>
  )
}
