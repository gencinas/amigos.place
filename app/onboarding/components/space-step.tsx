'use client'

import { useState, useRef } from 'react'
import { Bed, Sofa, Tent, Sparkles, Plus, X as XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SelectableCard } from './selectable-card'
import type { AccommodationType } from '@/types/database'

const ACCOMMODATION_OPTIONS: {
  value: AccommodationType
  label: string
  description: string
  icon: React.ReactNode
}[] = [
  { value: 'room', label: 'Habitación privada', description: 'Habitación privada', icon: <Bed className="w-5 h-5 text-primary" /> },
  { value: 'sofa', label: 'Sofá', description: 'Sofá cama', icon: <Sofa className="w-5 h-5 text-primary" /> },
  { value: 'airbed', label: 'Colchón inflable', description: 'Colchón inflable', icon: <Tent className="w-5 h-5 text-primary" /> },
  { value: 'other', label: 'Otro', description: 'Otro tipo de espacio', icon: <Sparkles className="w-5 h-5 text-primary" /> },
]

interface SpaceStepProps {
  existingData?: {
    accommodationType?: AccommodationType | null
    bio?: string
    spacePhotosPreviews?: string[]
  }
  onNext: (data: { accommodationType: AccommodationType; bio?: string; spacePhotosPreviews: string[] }) => void
  onSkip: () => void
}

export function SpaceStep({ existingData, onNext, onSkip }: SpaceStepProps) {
  const [type, setType] = useState<AccommodationType>(existingData?.accommodationType ?? 'room')
  const [bio, setBio] = useState(existingData?.bio ?? '')
  const [photoPreviews, setPhotoPreviews] = useState<string[]>(existingData?.spacePhotosPreviews ?? [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const remaining = 5 - photoPreviews.length
    const toProcess = Array.from(files).slice(0, remaining)

    toProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        setPhotoPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePhoto(index: number) {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Tu espacio</h1>
        <p className="text-muted-foreground">
          ¿Qué tipo de alojamiento ofrecés?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de alojamiento">
        {ACCOMMODATION_OPTIONS.map((opt) => (
          <SelectableCard
            key={opt.value}
            selected={type === opt.value}
            onClick={() => setType(opt.value)}
            icon={opt.icon}
            title={opt.label}
            description={opt.description}
          />
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Descripción (opcional)</Label>
        <Textarea
          id="bio"
          placeholder="Contale a tus amigos sobre tu espacio, el barrio, etc."
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
      </div>

      <div className="space-y-2">
        <Label>Fotos de tu espacio</Label>
        <div className="grid grid-cols-3 gap-2">
          {photoPreviews.map((src, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden border aspect-[4/3]">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
          {photoPreviews.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/3] border-2 border-dashed border-muted-foreground/30 hover:border-primary rounded-lg flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Agregar</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handlePhotos}
        />
        <p className="text-xs text-muted-foreground">
          Tus amigos ya conocen tu depto — las fotos pueden esperar
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={onSkip}>
          Saltar por ahora
        </Button>
        <Button
          className="flex-1"
          size="lg"
          onClick={() => onNext({ accommodationType: type, bio: bio || undefined, spacePhotosPreviews: photoPreviews })}
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
