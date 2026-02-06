'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/NotificationBell'
import type { Profile } from '@/types/database'

export function Header({ profile, pendingCount }: { profile: Profile; pendingCount: number }) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg">
          amigos.place
        </Link>
        <div className="flex items-center gap-3">
          <NotificationBell count={pendingCount} />
          <span className="text-sm text-muted-foreground hidden sm:block">
            {profile.display_name}
          </span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
