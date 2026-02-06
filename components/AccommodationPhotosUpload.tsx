'use client'

import { useState, useRef } from 'react'
import { uploadAccommodationPhoto, deleteAccommodationPhoto } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { AccommodationPhoto } from '@/types/database'

interface Props {
  userId: string
  photos: AccommodationPhoto[]
  onUpdate: (photos: AccommodationPhoto[]) => void
}

const MAX_PHOTOS = 5

export function AccommodationPhotosUpload({ userId, photos, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_PHOTOS} photos allowed`)
      return
    }

    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)

    try {
      const supabase = createClient()
      const newPhotos: Array<AccommodationPhoto> = []

      for (let i = 0; i < toUpload.length; i++) {
        const url = await uploadAccommodationPhoto(userId, toUpload[i], i)
        const { data, error } = await supabase
          .from('accommodation_photos')
          .insert({
            user_id: userId,
            photo_url: url,
            display_order: photos.length + i,
          })
          .select()
          .single()

        if (error) throw error
        if (data) newPhotos.push(data as AccommodationPhoto)
      }

      onUpdate([...photos, ...newPhotos])
      toast.success(`${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} uploaded!`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDelete(photo: AccommodationPhoto) {
    try {
      await deleteAccommodationPhoto(photo.photo_url)
      const supabase = createClient()
      await supabase.from('accommodation_photos').delete().eq('id', photo.id)
      onUpdate(photos.filter((p) => p.id !== photo.id))
      toast.success('Photo removed')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not remove photo')
    }
  }

  async function updateCaption(photo: AccommodationPhoto, caption: string) {
    const supabase = createClient()
    await supabase
      .from('accommodation_photos')
      .update({ caption: caption || null })
      .eq('id', photo.id)
    onUpdate(photos.map((p) => (p.id === photo.id ? { ...p, caption: caption || null } : p)))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group rounded-lg overflow-hidden border">
            <img
              src={photo.photo_url}
              alt={photo.caption || 'Accommodation'}
              className="w-full aspect-[4/3] object-cover"
            />
            <button
              type="button"
              onClick={() => handleDelete(photo)}
              className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="p-1.5">
              <Input
                placeholder="Add caption..."
                defaultValue={photo.caption || ''}
                onBlur={(e) => updateCaption(photo, e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-[4/3] border-2 border-dashed border-muted-foreground/30 hover:border-primary rounded-lg flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {uploading ? (
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="text-xs text-muted-foreground">Add photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {photos.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Add photos to make your profile more trustworthy
        </p>
      )}
      <p className="text-xs text-muted-foreground text-center">
        {photos.length}/{MAX_PHOTOS} photos
      </p>
    </div>
  )
}
