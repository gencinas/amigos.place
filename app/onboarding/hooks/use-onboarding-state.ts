'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  type OnboardingData,
  DEFAULT_DATA,
  saveOnboardingData,
  loadOnboardingData,
} from '../lib/persist'

export function useOnboardingState(initialFrom?: string | null) {
  const [data, setData] = useState<OnboardingData>(() => {
    // Will be hydrated in useEffect from sessionStorage
    return {
      ...DEFAULT_DATA,
      referralUsername: initialFrom || null,
      intent: initialFrom ? 'guest' : null,
    }
  })
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    const saved = loadOnboardingData()
    if (saved) {
      // Preserve referral from URL if present
      if (initialFrom) {
        saved.referralUsername = initialFrom
        if (!saved.intent) saved.intent = 'guest'
      }
      setData(saved)
    }
    setHydrated(true)
  }, [initialFrom])

  // Persist to sessionStorage on every change (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveOnboardingData(data)
    }
  }, [data, hydrated])

  const update = useCallback((partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }, [])

  return { data, update, hydrated }
}
