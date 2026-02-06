'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { loadOnboardingData, clearOnboardingData } from '../lib/persist'
import { createProfileFromOnboarding } from '../lib/actions'

export default function FinalizePage() {
  const router = useRouter()
  const [status, setStatus] = useState('Creando tu perfil...')

  useEffect(() => {
    async function finalize() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setStatus('Error de autenticación')
        setTimeout(() => router.push('/onboarding'), 2000)
        return
      }

      const onboardingData = loadOnboardingData()
      if (!onboardingData || !onboardingData.username) {
        // No onboarding data — user might already have a profile or data was lost
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (profile) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
        return
      }

      try {
        await createProfileFromOnboarding(user.id, onboardingData)
        clearOnboardingData()

        if (onboardingData.intent === 'host') {
          // Redirect to share step in the wizard — but since we cleared data,
          // we'll redirect with share info in URL
          router.push(`/onboarding/share?username=${onboardingData.username}&name=${encodeURIComponent(onboardingData.displayName)}&city=${encodeURIComponent(onboardingData.city)}`)
        } else if (onboardingData.referralUsername) {
          router.push(`/${onboardingData.referralUsername}`)
        } else {
          router.push('/dashboard')
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error'
        setStatus(`Error: ${msg}`)
        setTimeout(() => router.push('/dashboard'), 3000)
      }
    }

    finalize()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground">{status}</p>
    </div>
  )
}
