'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ProgressBar } from './progress-bar'
import { IntentStep } from './intent-step'
import { IdentityStep } from './identity-step'
import { SpaceStep } from './space-step'
import { ConditionsStep } from './conditions-step'
import { SignupStep } from './signup-step'
import { ShareStep } from './share-step'
import { useOnboardingState } from '../hooks/use-onboarding-state'
import { createProfileFromOnboarding } from '../lib/actions'
import { clearOnboardingData } from '../lib/persist'
import type { IdentityForm } from '../lib/schemas'
import type { PaymentType, Presence, AccommodationType } from '@/types/database'

interface OnboardingWizardProps {
  initialFrom?: string | null
}

export function OnboardingWizard({ initialFrom }: OnboardingWizardProps) {
  const router = useRouter()
  const { data, update, hydrated } = useOnboardingState(initialFrom)
  const [saving, setSaving] = useState(false)

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const intent = data.intent
  // Host: 0=intent, 1=identity, 2=space, 3=conditions, 4=signup, 5=share
  // Guest: 0=intent, 1=identity, 2=signup
  const totalSteps = intent === 'host' ? 6 : 3
  const signupStep = intent === 'host' ? 4 : 2
  const shareStep = 5 // host only

  function goTo(step: number) {
    update({ currentStep: step })
  }

  function handleIntent(selectedIntent: 'host' | 'guest') {
    update({ intent: selectedIntent, currentStep: 1 })
  }

  function handleIdentity(identityData: IdentityForm & { avatarPreview: string | null }) {
    update({
      username: identityData.username,
      displayName: identityData.display_name,
      city: identityData.city,
      country: identityData.country,
      avatarPreview: identityData.avatarPreview,
      currentStep: intent === 'guest' ? 2 : 2, // next step
    })
  }

  function handleSpace(spaceData: { accommodationType: AccommodationType; bio?: string; spacePhotosPreviews: string[] }) {
    update({
      accommodationType: spaceData.accommodationType,
      bio: spaceData.bio || '',
      spacePhotosPreviews: spaceData.spacePhotosPreviews,
      currentStep: 3,
    })
  }

  function handleSpaceSkip() {
    update({ currentStep: 3 })
  }

  function handleConditions(condData: {
    default_payment_type: PaymentType
    default_price?: number | null
    default_favor_text?: string | null
    default_presence?: Presence | null
  }) {
    update({
      defaultPaymentType: condData.default_payment_type,
      defaultPrice: condData.default_price ?? null,
      defaultFavorText: condData.default_favor_text || '',
      defaultPresence: condData.default_presence ?? null,
      currentStep: 4,
    })
  }

  async function handleSignupComplete(userId: string) {
    setSaving(true)
    try {
      await createProfileFromOnboarding(userId, data)
      clearOnboardingData()

      if (intent === 'host') {
        goTo(shareStep)
      } else if (data.referralUsername) {
        router.push(`/${data.referralUsername}`)
      } else {
        router.push('/dashboard')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al crear perfil'
      if (msg.includes('23505') || msg.includes('unique')) {
        toast.error('Ese username ya fue tomado. Volvé al paso anterior y elegí otro.')
      } else {
        toast.error(msg)
      }
    }
    setSaving(false)
  }

  function renderStep() {
    switch (data.currentStep) {
      case 0:
        return (
          <IntentStep
            initialIntent={data.intent}
            referralUsername={data.referralUsername}
            onNext={handleIntent}
          />
        )
      case 1:
        return (
          <IdentityStep
            existingData={{
              username: data.username,
              display_name: data.displayName,
              city: data.city,
              country: data.country,
              avatarPreview: data.avatarPreview,
            }}
            onNext={handleIdentity}
          />
        )
      case 2:
        if (intent === 'guest') {
          // Guest signup step
          return <SignupStep wizardData={data} onSignupComplete={handleSignupComplete} />
        }
        return (
          <SpaceStep
            existingData={{
              accommodationType: data.accommodationType,
              bio: data.bio,
              spacePhotosPreviews: data.spacePhotosPreviews,
            }}
            onNext={handleSpace}
            onSkip={handleSpaceSkip}
          />
        )
      case 3:
        return (
          <ConditionsStep
            existingData={{
              default_payment_type: data.defaultPaymentType as PaymentType,
              default_price: data.defaultPrice,
              default_favor_text: data.defaultFavorText,
              default_presence: data.defaultPresence as Presence | null,
            }}
            onNext={handleConditions}
          />
        )
      case 4:
        // Host signup step
        return <SignupStep wizardData={data} onSignupComplete={handleSignupComplete} />
      case 5:
        // Host share step (post-auth)
        return (
          <ShareStep
            username={data.username}
            displayName={data.displayName}
            avatarUrl={data.avatarPreview}
            city={data.city}
          />
        )
      default:
        return null
    }
  }

  // Don't show progress bar on share step
  const showProgressBar = data.currentStep < totalSteps - (intent === 'host' ? 1 : 0)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-accent/40 via-background to-background">
      <div className="w-full max-w-[480px] space-y-6">
        {showProgressBar && (
          <ProgressBar currentStep={data.currentStep} totalSteps={totalSteps} />
        )}

        {saving ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Creando tu perfil...</p>
          </div>
        ) : (
          <div aria-live="polite">
            {renderStep()}
          </div>
        )}
      </div>
    </div>
  )
}
