const STORAGE_KEY = 'amigos_onboarding'

export interface OnboardingData {
  intent: 'host' | 'guest' | null
  referralUsername: string | null
  username: string
  displayName: string
  city: string
  country: string
  avatarPreview: string | null // base64 for persistence across OAuth
  accommodationType: 'room' | 'sofa' | 'airbed' | 'other' | null
  bio: string
  spacePhotosPreviews: string[] // base64 for persistence
  defaultPaymentType: 'free' | 'friend_price' | 'favor' | 'service'
  defaultPrice: number | null
  defaultFavorText: string
  defaultPresence: 'home' | 'empty' | 'shared' | null
  currentStep: number
}

export const DEFAULT_DATA: OnboardingData = {
  intent: null,
  referralUsername: null,
  username: '',
  displayName: '',
  city: '',
  country: '',
  avatarPreview: null,
  accommodationType: null,
  bio: '',
  spacePhotosPreviews: [],
  defaultPaymentType: 'free',
  defaultPrice: null,
  defaultFavorText: '',
  defaultPresence: null,
  currentStep: 0,
}

export function saveOnboardingData(data: OnboardingData) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // sessionStorage full or unavailable
  }
}

export function loadOnboardingData(): OnboardingData | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as OnboardingData
  } catch {
    return null
  }
}

export function clearOnboardingData() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
