'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, X, Upload } from 'lucide-react'
import { identitySchema, type IdentityForm } from '../lib/schemas'

const COUNTRIES = [
  'Argentina', 'Austria', 'Belgium', 'Brazil', 'Chile', 'Colombia',
  'Czech Republic', 'Denmark', 'Finland', 'France', 'Germany', 'Greece',
  'Hungary', 'Ireland', 'Italy', 'Mexico', 'Netherlands', 'Norway',
  'Poland', 'Portugal', 'Romania', 'Spain', 'Sweden', 'Switzerland',
  'United Kingdom', 'United States', 'Uruguay',
]

interface IdentityStepProps {
  existingData?: {
    username?: string
    display_name?: string
    city?: string
    country?: string
    avatarPreview?: string | null
  }
  onNext: (data: IdentityForm & { avatarPreview: string | null }) => void
}

export function IdentityStep({ existingData, onNext }: IdentityStepProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(existingData?.avatarPreview ?? null)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<IdentityForm>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      username: existingData?.username ?? '',
      display_name: existingData?.display_name ?? '',
      city: existingData?.city ?? '',
      country: existingData?.country ?? '',
    },
  })

  const username = watch('username')

  const checkUsername = useCallback(
    async (value: string) => {
      if (value.length < 3 || !/^[a-z0-9_-]+$/.test(value)) {
        setUsernameStatus('idle')
        return
      }
      setUsernameStatus('checking')
      try {
        const res = await fetch(`/api/username/check?username=${encodeURIComponent(value)}`)
        const data = await res.json()
        if (data.available) {
          setUsernameStatus('available')
        } else {
          setUsernameStatus('taken')
          setError('username', { message: 'Username ya en uso' })
        }
      } catch {
        setUsernameStatus('idle')
      }
    },
    [setError]
  )

  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle')
      return
    }
    const timer = setTimeout(() => checkUsername(username), 500)
    return () => clearTimeout(timer)
  }, [username, checkUsername])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  function onSubmit(data: IdentityForm) {
    if (usernameStatus === 'taken') return
    onNext({ ...data, avatarPreview })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Tu perfil</h1>
        <p className="text-muted-foreground">
          Así te van a encontrar tus amigos
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Avatar upload (local only) */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors cursor-pointer bg-muted flex items-center justify-center"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-muted-foreground" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? 'Cambiar foto' : 'Subir foto'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">amigos.place/</span>
            <div className="relative flex-1">
              <Input
                id="username"
                placeholder="thomas"
                {...register('username')}
              />
              {usernameStatus === 'checking' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {usernameStatus === 'available' && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              )}
              {usernameStatus === 'taken' && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
              )}
            </div>
          </div>
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          )}
          {username && username.length >= 3 && !errors.username && (
            <p className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
              Tu link: amigos.place/{username}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_name">Nombre</Label>
          <Input
            id="display_name"
            placeholder="Thomas"
            {...register('display_name')}
          />
          {errors.display_name && (
            <p className="text-sm text-destructive">{errors.display_name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              placeholder="Berlin"
              {...register('city')}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>País</Label>
            <Select
              defaultValue={existingData?.country ?? undefined}
              onValueChange={(value) => setValue('country', value, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting || usernameStatus === 'taken' || usernameStatus === 'checking'}
        >
          Continuar
        </Button>
      </form>
    </div>
  )
}
