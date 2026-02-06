'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const COUNTRIES = [
  'Argentina', 'Austria', 'Belgium', 'Brazil', 'Chile', 'Colombia',
  'Czech Republic', 'Denmark', 'Finland', 'France', 'Germany', 'Greece',
  'Hungary', 'Ireland', 'Italy', 'Mexico', 'Netherlands', 'Norway',
  'Poland', 'Portugal', 'Romania', 'Spain', 'Sweden', 'Switzerland',
  'United Kingdom', 'United States', 'Uruguay',
]

const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(30, 'Max 30 characters')
    .regex(/^[a-z0-9_-]+$/, 'Only lowercase letters, numbers, hyphens, and underscores'),
  display_name: z.string().min(1, 'Enter your name').max(50),
  city: z.string().min(1, 'Enter your city'),
  country: z.string().min(1, 'Select a country'),
  accommodation_type: z.enum(['room', 'sofa', 'other']),
  bio: z.string().max(300).optional(),
})

type OnboardingForm = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      accommodation_type: 'room',
    },
  })

  async function checkUsername(username: string) {
    if (username.length < 3) return
    setCheckingUsername(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (data) {
      setFieldError('username', { message: 'Username already taken' })
    }
    setCheckingUsername(false)
  }

  async function onSubmit(data: OnboardingForm) {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      username: data.username,
      display_name: data.display_name,
      city: data.city,
      country: data.country,
      accommodation_type: data.accommodation_type,
      bio: data.bio || null,
    })

    if (insertError) {
      if (insertError.code === '23505') {
        setFieldError('username', { message: 'Username already taken' })
      } else {
        setError(insertError.message)
      }
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Set up your profile</CardTitle>
          <CardDescription>
            This is how your friends will find you on amigos.place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">amigos.place/</span>
                <Input
                  id="username"
                  placeholder="thomas"
                  {...register('username', {
                    onBlur: (e) => checkUsername(e.target.value),
                  })}
                />
              </div>
              {checkingUsername && (
                <p className="text-sm text-muted-foreground">Checking...</p>
              )}
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Display name</Label>
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
                <Label htmlFor="city">City</Label>
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
                <Label htmlFor="country">Country</Label>
                <select
                  id="country"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register('country')}
                  defaultValue=""
                >
                  <option value="" disabled>Select...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>What can you offer?</Label>
              <div className="flex gap-3">
                {[
                  { value: 'room', label: 'Private room' },
                  { value: 'sofa', label: 'Sofa' },
                  { value: 'other', label: 'Other' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register('accommodation_type')}
                      className="accent-primary"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell your friends about your place, neighborhood, etc."
                rows={3}
                {...register('bio')}
              />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating profile...' : 'Create my profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
