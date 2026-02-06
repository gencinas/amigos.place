import { createClient } from '@/lib/supabase/client'
import { uploadAvatar, uploadAccommodationPhoto } from '@/lib/supabase/storage'
import type { OnboardingData } from './persist'

function dataURLtoFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/webp'
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new File([arr], filename, { type: mime })
}

export async function createProfileFromOnboarding(
  userId: string,
  data: OnboardingData
) {
  const supabase = createClient()

  // Upload avatar if present
  let avatarUrl: string | null = null
  if (data.avatarPreview) {
    try {
      const file = dataURLtoFile(data.avatarPreview, 'avatar.webp')
      avatarUrl = await uploadAvatar(userId, file)
    } catch {
      // Avatar upload failed, continue without it
    }
  }

  // Create the profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    username: data.username,
    display_name: data.displayName,
    city: data.city,
    country: data.country,
    avatar_url: avatarUrl,
    intent: data.intent,
    accommodation_type: data.accommodationType || 'room',
    bio: data.bio || null,
    default_payment_type: data.defaultPaymentType || null,
    default_price: data.defaultPrice,
    default_favor_text: data.defaultFavorText || null,
    default_presence: data.defaultPresence,
    onboarding_step: 99, // completed
  } as Record<string, unknown>)

  if (profileError) throw profileError

  // Upload space photos if present
  for (let i = 0; i < data.spacePhotosPreviews.length; i++) {
    try {
      const file = dataURLtoFile(data.spacePhotosPreviews[i], `space_${i}.webp`)
      const url = await uploadAccommodationPhoto(userId, file, i)
      await supabase.from('accommodation_photos').insert({
        user_id: userId,
        photo_url: url,
        display_order: i,
      })
    } catch {
      // Photo upload failed, continue
    }
  }

  // Update avatar_url in profile if it was uploaded
  if (avatarUrl) {
    await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId)
  }
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const res = await fetch(`/api/username/check?username=${encodeURIComponent(username)}`)
  const data = await res.json()
  return data.available
}
