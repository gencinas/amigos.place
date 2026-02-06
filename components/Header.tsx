'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/NotificationBell'
import { LogOut } from 'lucide-react'
import type { Profile } from '@/types/database'

export function Header({ profile, pendingCount }: { profile: Profile; pendingCount: number }) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg text-gradient-warm">
          amigos.place
        </Link>
        <div className="flex items-center gap-3">
          <NotificationBell count={pendingCount} />
          <div className="flex items-center gap-2">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium ring-2 ring-primary/20">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile.display_name}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
