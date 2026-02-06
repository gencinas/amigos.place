'use client'

import { useState, useRef } from 'react'
import { uploadAvatar, deleteAvatar } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  userId: string
  currentUrl: string | null
  onUploaded: (url: string | null) => void
}

export function AvatarUpload({ userId, currentUrl, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const url = await uploadAvatar(userId, file)
      await createClient()
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', userId)
      setPreview(url)
      onUploaded(url)
      toast.success('Avatar updated!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    }
    setUploading(false)
  }

  async function handleDelete() {
    setUploading(true)
    try {
      await deleteAvatar(userId)
      await createClient()
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId)
      setPreview(null)
      onUploaded(null)
      toast.success('Avatar removed')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not remove avatar')
    }
    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        disabled={uploading}
        className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors cursor-pointer bg-muted flex items-center justify-center"
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {preview ? 'Change' : 'Upload photo'}
        </Button>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={handleDelete}
            disabled={uploading}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}
