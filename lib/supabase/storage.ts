import { createClient } from './client'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WebP images are allowed')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image must be smaller than 5MB')
  }
}

async function resizeImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')

      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Could not get canvas context'))

      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Could not compress image'))
          resolve(blob)
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not load image'))
    }

    img.src = url
  })
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  validateFile(file)
  const resized = await resizeImage(file, 400, 0.85)

  const supabase = createClient()
  const path = `${userId}/avatar.webp`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, resized, {
      contentType: 'image/webp',
      upsert: true,
    })

  if (error) throw error

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  // Add cache-busting param
  return `${data.publicUrl}?t=${Date.now()}`
}

export async function deleteAvatar(userId: string) {
  const supabase = createClient()
  const { error } = await supabase.storage
    .from('avatars')
    .remove([`${userId}/avatar.webp`])
  if (error) throw error
}

export async function uploadAccommodationPhoto(
  userId: string,
  file: File,
  index: number
): Promise<string> {
  validateFile(file)
  const resized = await resizeImage(file, 1200, 0.8)

  const supabase = createClient()
  const path = `${userId}/${Date.now()}_${index}.webp`

  const { error } = await supabase.storage
    .from('accommodation-photos')
    .upload(path, resized, {
      contentType: 'image/webp',
    })

  if (error) throw error

  const { data } = supabase.storage.from('accommodation-photos').getPublicUrl(path)
  return data.publicUrl
}

export async function deleteAccommodationPhoto(photoUrl: string) {
  const supabase = createClient()
  // Extract path from URL
  const url = new URL(photoUrl.split('?')[0])
  const pathParts = url.pathname.split('/accommodation-photos/')
  if (pathParts.length < 2) throw new Error('Invalid photo URL')
  const path = decodeURIComponent(pathParts[1])

  const { error } = await supabase.storage
    .from('accommodation-photos')
    .remove([path])
  if (error) throw error
}
