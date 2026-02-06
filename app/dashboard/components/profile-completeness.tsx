'use client'

import type { Profile, AccommodationPhoto, Availability } from '@/types/database'

interface ProfileCompletenessProps {
  profile: Profile
  photos: AccommodationPhoto[]
  availabilities: Availability[]
}

export function ProfileCompleteness({ profile, photos, availabilities }: ProfileCompletenessProps) {
  const checks = [
    { label: 'Username', done: !!profile.username, weight: 20 },
    { label: 'Foto de perfil', done: !!profile.avatar_url, weight: 20 },
    { label: 'Fotos del espacio', done: photos.length > 0, weight: 20 },
    { label: 'Bio', done: !!profile.bio, weight: 10 },
    { label: 'Disponibilidad', done: availabilities.length > 0, weight: 30 },
  ]

  const percentage = checks.reduce((sum, c) => sum + (c.done ? c.weight : 0), 0)
  const missing = checks.filter((c) => !c.done)

  if (percentage === 100) return null

  return (
    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Perfil completado</p>
        <p className="text-sm font-bold">{percentage}%</p>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {missing.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Te falta: {missing.map((m) => m.label.toLowerCase()).join(', ')}
        </p>
      )}
    </div>
  )
}
